import {createClient} from '@libsql/client';
import {put, del} from '@vercel/blob';
import {readFile, readdir} from 'node:fs/promises';

export function databaseAdapter(client) {
  const statement = (sql, args=[]) => ({
    sql, args,
    bind(...values) { return statement(sql, values); },
    async first() { return (await client.execute({sql,args})).rows[0] || null; },
    async all() { return {results:(await client.execute({sql,args})).rows}; },
    async run() { return {meta:{changes:(await client.execute({sql,args})).rowsAffected}}; }
  });
  return {prepare:statement, async batch(statements) {
    const results=await client.batch(statements.map(({sql,args})=>({sql,args})), 'write');
    return results.map(r=>({meta:{changes:r.rowsAffected},results:r.rows}));
  }};
}

// A write transaction serializes cold starts and makes each schema update atomic.
export async function migrate(client) {
  const tx=await client.transaction('write');
  try {
    await tx.execute('CREATE TABLE IF NOT EXISTS advisor_schema_migrations (name TEXT PRIMARY KEY)');
    const names=(await readdir(new URL('../drizzle/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort();
    for (const name of names) {
      if ((await tx.execute({sql:'SELECT name FROM advisor_schema_migrations WHERE name=?',args:[name]})).rows.length) continue;
      const sql=await readFile(new URL('../drizzle/'+name,import.meta.url),'utf8');
      for (const part of sql.split('--> statement-breakpoint').map(s=>s.trim()).filter(Boolean)) await tx.execute(part);
      await tx.execute({sql:'INSERT INTO advisor_schema_migrations(name) VALUES (?)',args:[name]});
    }
    await tx.execute('CREATE TABLE IF NOT EXISTS advisor_blob_objects (key TEXT PRIMARY KEY, url TEXT NOT NULL)');
    await tx.commit();
  } catch(error) { await tx.rollback(); throw error; }
  finally { tx.close(); }
}

export function blobAdapter(DB, token, sdk={put,del}, fetcher=fetch) {
  return {
    async put(key,bytes,options) {
      const blob=await sdk.put('advisor/'+key,bytes,{access:'public',addRandomSuffix:false,
        contentType:options.httpMetadata.contentType,token});
      try {await DB.prepare('INSERT INTO advisor_blob_objects(key,url) VALUES (?,?)').bind(key,blob.url).run();}
      catch(error) {await sdk.del(blob.url,{token});throw error;}
    },
    async get(key) {
      const row=await DB.prepare('SELECT url FROM advisor_blob_objects WHERE key=?').bind(key).first();
      if(!row)return null;
      const url=new URL(row.url);
      if(url.protocol!=='https:' || !url.hostname.endsWith('.public.blob.vercel-storage.com')) throw new Error('Invalid blob host');
      const response=await fetcher(url,{redirect:'error'});
      if(response.status===404)return null;
      if(!response.ok)throw new Error('Blob unavailable');
      return {body:response.body};
    },
    async delete(key) {
      const row=await DB.prepare('SELECT url FROM advisor_blob_objects WHERE key=?').bind(key).first();
      if(row) await sdk.del(row.url,{token});
      await DB.prepare('DELETE FROM advisor_blob_objects WHERE key=?').bind(key).run();
    }
  };
}

let initialization;
export function getStorage(config=process.env) {
  if(!initialization) initialization=(async()=>{
    // Use a dedicated remote libSQL database. Never use /tmp or in-memory production storage.
    if(!config.TURSO_DATABASE_URL || !config.TURSO_AUTH_TOKEN)throw new Error('Database not configured');
    if(!/^libsql:\/\/|^https:\/\//.test(config.TURSO_DATABASE_URL))throw new Error('Remote database required');
    const client=createClient({url:config.TURSO_DATABASE_URL,authToken:config.TURSO_AUTH_TOKEN});
    await migrate(client);
    const DB=databaseAdapter(client);
    return {DB,BUCKET:config.BLOB_READ_WRITE_TOKEN?blobAdapter(DB,config.BLOB_READ_WRITE_TOKEN):undefined};
  })().catch(error=>{initialization=undefined;throw error;});
  return initialization;
}
