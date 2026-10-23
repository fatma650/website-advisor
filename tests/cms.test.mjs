// اختبارات السلوك المهم: صلاحيات الخادم، الحفظ الدائم، التعارض، ورفع الصور.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import vm from 'node:vm';
import worker, {validateItem} from '../dist/server/index.js';
const SEED=JSON.parse(fs.readFileSync('server/seed.json','utf8'));

function environment() {
  const sqlite=new DatabaseSync(':memory:');
  for(const name of fs.readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort()) sqlite.exec(fs.readFileSync('drizzle/'+name,'utf8'));
  const wrap=(sql,values=[])=>({
    bind(...args){return wrap(sql,args);},
    async first(){return sqlite.prepare(sql).get(...values)||null;},
    async all(){return {results:sqlite.prepare(sql).all(...values)};},
    async run(){const result=sqlite.prepare(sql).run(...values);return {meta:{changes:Number(result.changes)}};}
  });
  const files=new Map();
  return {DB:{prepare:wrap,async batch(statements){sqlite.exec('BEGIN');try{const results=[];for(const stmt of statements)results.push(await stmt.run());sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}},BUCKET:{async put(k,b){files.set(k,new Uint8Array(b));},async get(k){return files.has(k)?{body:files.get(k)}:null;},async delete(k){files.delete(k);}},ADMIN_BOOTSTRAP_EMAIL:'owner@example.com',ADMIN_PASSWORD_PEPPER:'local-test-pepper-not-a-production-secret',sqlite};
}
const origin='https://advisor.example';
const owner={'oai-authenticated-user-id':'trusted-site-user','oai-authenticated-user-email':'owner@example.com'};
const writeHeaders={...owner,'Content-Type':'application/json','X-Advisor-Request':'admin','Origin':origin};
const request=(path,options={})=>new Request(origin+path,options);
async function call(env,path,options={}){if(env.cookie && options.headers?.['oai-authenticated-user-id']) options={...options,headers:{Cookie:env.cookie,...options.headers}};const res=await worker.fetch(request(path,options),env);return {res,body:await res.json()};}
async function securedEnvironment(){const env=environment();const {res}=await call(env,'/api/admin/password/setup',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'A-long-test-password-2026'})});assert.equal(res.status,200);env.cookie=res.headers.get('Set-Cookie').split(';')[0];return env;}
const save=(env,kind,data,version=0,headers=writeHeaders)=>call(env,`/api/admin/${kind}/${data.id}`,{method:'PUT',headers,body:JSON.stringify({data,version})});

test('authentication, protected admin route, and owner binding fail closed',async()=>{
  const env=environment();
  let {res}=await call(env,'/api/admin/content');assert.equal(res.status,401);
  ({res}=await call(env,'/api/admin/content',{headers:{...owner,'oai-authenticated-user-email':'other@example.com'}}));assert.equal(res.status,403);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM cms_admins').get().n,0);
  ({res}=await call(env,'/api/admin/session',{headers:owner}));assert.equal(res.status,401);
  ({res}=await call(env,'/api/admin/session',{headers:{...owner,'oai-authenticated-user-id':'different-user'}}));assert.equal(res.status,403);
  const redirect=await worker.fetch(request('/admin'),env);assert.equal(redirect.status,302);assert.match(redirect.headers.get('Location'),/^\/signin-with-chatgpt/);
  const admin=await worker.fetch(request('/admin',{headers:owner}),env);assert.equal(admin.status,200);assert.match(await admin.text(),/passwordForm/);
});

test('all original content is seeded once; project changes and new logos survive independent requests',async()=>{
  const env=await securedEnvironment();let {body}=await call(env,'/api/content');assert.equal(body.projects.length,6);assert.equal(body.logos.length,15);
  const project=structuredClone(body.projects[0].data);project.title.en='Revised project';project.title.ar='مشروع معدل';
  let saved=await save(env,'projects',project,1);assert.equal(saved.res.status,200);assert.equal(saved.body.version,2);
  const logo={id:'new-logo',order:16,name:{en:'New client',ar:'عميل جديد'},industry:{en:'Design',ar:'تصميم'},logo:'/assets/brand/advisor_monogram.png'};
  saved=await save(env,'logos',logo);assert.equal(saved.res.status,201);
  ({body}=await call(env,'/api/content'));assert.equal(body.projects[0].data.title.ar,'مشروع معدل');assert.equal(body.logos.length,16);assert.equal(body.logos.at(-1).data.name.en,'New client');
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM cms_meta').get().n,2);
});

test('home page sections are seeded, validated strictly, and saved edits reach the public API',async()=>{
  const env=await securedEnvironment();let {body}=await call(env,'/api/content');
  assert.equal(body.sections.length,SEED.sections.length);
  for(const section of SEED.sections) assert.deepEqual(validateItem('sections',structuredClone(section),section.id),section);
  const hero=structuredClone(body.sections.find(r=>r.data.id==='hero').data);
  hero.lines=[{en:'NEW LINE.',ar:'سطر جديد.'}];hero.ticker.push({en:'MOTION',ar:'الحركة'});
  assert.equal((await save(env,'sections',hero,1)).res.status,200);
  const contact=structuredClone(SEED.sections.find(s=>s.id==='contact'));contact.whatsapp='+20 159 999';
  assert.equal((await save(env,'sections',contact,1)).body.error,'invalid_phone');
  const footer=structuredClone(SEED.sections.find(s=>s.id==='footer'));footer.socials[0].url='javascript:alert(1)';
  assert.equal((await save(env,'sections',footer,1)).body.error,'invalid_link');
  const brand=structuredClone(SEED.sections.find(s=>s.id==='brand'));delete brand.siteTitle;
  assert.equal((await save(env,'sections',brand,1)).res.status,400);
  brand.siteTitle={en:'T',ar:''};brand.logo='https://evil.example/logo.png';assert.equal((await save(env,'sections',brand,1)).body.error,'invalid_image');
  assert.equal((await save(env,'sections',{id:'unknown',order:99},0)).res.status,404);
  assert.equal((await save(env,'sections',structuredClone(SEED.sections[0]),0)).res.status,409);
  ({body}=await call(env,'/api/content'));const published=body.sections.find(r=>r.data.id==='hero');
  assert.equal(published.version,2);assert.deepEqual(published.data.lines,[{en:'NEW LINE.',ar:'سطر جديد.'}]);assert.equal(published.data.ticker.at(-1).en,'MOTION');
  assert.equal(body.sections.find(r=>r.data.id==='contact').data.whatsapp,'201599990398');
});

test('a site seeded before sections existed receives them once without losing earlier edits',async()=>{
  const env=await securedEnvironment();await call(env,'/api/content');
  env.sqlite.exec("DELETE FROM content_items WHERE kind = 'sections'; DELETE FROM cms_meta WHERE key = 'site-sections-v1'");
  const project=structuredClone(SEED.projects[0]);project.title.en='Kept edit';assert.equal((await save(env,'projects',project,1)).res.status,200);
  let {body}=await call(env,'/api/content');assert.equal(body.sections.length,SEED.sections.length);assert.equal(body.projects[0].data.title.en,'Kept edit');assert.equal(body.projects.length,6);
  ({body}=await call(env,'/api/content'));assert.equal(body.sections.length,SEED.sections.length);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM cms_meta').get().n,2);
});

test('stale saves and duplicate creates return conflict without overwriting',async()=>{
  const env=await securedEnvironment(),project=structuredClone(SEED.projects[0]);
  assert.equal((await save(env,'projects',project,1)).res.status,200);
  project.title.en='Stale edit';assert.equal((await save(env,'projects',project,1)).res.status,409);
  assert.equal((await save(env,'projects',project,0)).res.status,409);
  const {body}=await call(env,'/api/content');assert.notEqual(body.projects[0].data.title.en,'Stale edit');
});

test('missing identity, cross-origin writes and invalid image paths cannot mutate content',async()=>{
  const env=await securedEnvironment(),project=structuredClone(SEED.projects[0]);
  assert.equal((await save(env,'projects',project,1,{'Content-Type':'application/json'})).res.status,401);
  assert.equal((await save(env,'projects',project,1,{...writeHeaders,Origin:'https://other.example'})).res.status,403);
  assert.equal((await save(env,'projects',project,1,owner)).res.status,403);
  project.heroImage='javascript:alert(1)';assert.equal((await save(env,'projects',project,1)).res.status,400);
});

test('image upload persists bytes and metadata; unsupported and oversized payloads are rejected',async()=>{
  const env=await securedEnvironment();const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
  const data=new FormData();data.set('file',new File([bytes],'logo.png',{type:'image/png'}));
  const {res,body}=await call(env,'/api/admin/uploads',{method:'POST',headers:{...owner,'X-Advisor-Request':'admin',Origin:origin},body:data});
  assert.equal(res.status,201);assert.match(body.url,/^\/media\/[0-9a-f-]+\.png$/);
  const media=await worker.fetch(request(body.url),env);assert.equal(media.status,200);assert.equal(media.headers.get('Content-Type'),'image/png');assert.deepEqual(Buffer.from(await media.arrayBuffer()),bytes);
  assert.equal(env.sqlite.prepare('SELECT count(*) AS n FROM media_files').get().n,1);
  const bad=new FormData();bad.set('file',new File(['<svg onload="alert(1)"></svg>'],'logo.png',{type:'image/png'}));
  assert.equal((await call(env,'/api/admin/uploads',{method:'POST',headers:{...owner,'X-Advisor-Request':'admin'},body:bad})).res.status,415);
  assert.equal((await call(env,'/api/admin/uploads',{method:'POST',headers:{...owner,'X-Advisor-Request':'admin','Content-Type':'multipart/form-data; boundary=a','Content-Length':String(12*1024*1024)},body:'tiny'})).res.status,413);
});

test('public adapter supports Arabic, newly added categories and safe HTML text',async()=>{
  const data={projects:SEED.projects.map(data=>({data})),logos:SEED.logos.map(data=>({data})),sections:SEED.sections.map(data=>({data}))};
  data.projects[0].data=structuredClone(data.projects[0].data);data.projects[0].data.category={en:'New category',ar:'مجال جديد'};
  const context={window:{AdvisorI18n:{language:'ar'}},fetch:async()=>({ok:true,json:async()=>data}),AbortSignal};vm.createContext(context);
  vm.runInContext(fs.readFileSync('public/js/content-api.js','utf8'),context);await context.window.AdvisorContentReady;
  const w=context.window;assert.equal(w.ADVISOR_PROJECTS.length,6);assert.equal(w.AdvisorContent.project(w.ADVISOR_PROJECTS[0]).category,'مجال جديد');
  w.AdvisorI18n.language='en';assert.equal(w.AdvisorContent.project(w.ADVISOR_PROJECTS[0]).category,'New category');
  assert.equal(w.AdvisorContent.escape('<img src=x onerror="alert(1)">'),'&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.equal(w.AdvisorContent.hasSections(),true);assert.equal(w.AdvisorContent.section('hero').lines.length,4);
  assert.equal(w.AdvisorContent.select(w.AdvisorContent.section('about').stats[0].value,'ar'),'100%');assert.equal(w.AdvisorContent.whatsapp(),'201599990398');
});


test('password setup, login, server-side session, logout and expiry protect every admin action',async()=>{
  const env=environment();
  const state=await call(env,'/api/admin/password/state',{headers:owner});assert.equal(state.body.setupRequired,true);
  const blocked=await call(env,'/api/admin/content',{headers:owner});assert.equal(blocked.body.error,'password_required');
  const short=await call(env,'/api/admin/password/setup',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'short'})});assert.equal(short.res.status,400);
  const password='A-secure-test-password-2026';
  const setup=await call(env,'/api/admin/password/setup',{method:'POST',headers:writeHeaders,body:JSON.stringify({password})});assert.equal(setup.res.status,200);
  const cookie=setup.res.headers.get('Set-Cookie');assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Lax/);
  env.cookie=cookie.split(';')[0];
  const row=env.sqlite.prepare('SELECT password_hash,salt FROM admin_passwords').get();assert.notEqual(row.password_hash,password);assert.equal(row.salt.length,32);
  assert.equal((await call(env,'/api/admin/content',{headers:owner})).res.status,200);
  const duplicate=await call(env,'/api/admin/password/setup',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'A-different-password-2026'})});assert.equal(duplicate.res.status,409);
  assert.equal((await call(env,'/api/admin/password/logout',{method:'POST',headers:writeHeaders})).res.status,200);
  assert.equal((await call(env,'/api/admin/content',{headers:owner})).res.status,401);
  const bad=await call(env,'/api/admin/password/login',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'wrong-password-2026'})});assert.equal(bad.body.error,'password_incorrect');
  const good=await call(env,'/api/admin/password/login',{method:'POST',headers:writeHeaders,body:JSON.stringify({password})});assert.equal(good.res.status,200);env.cookie=good.res.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await call(env,'/api/admin/session',{headers:owner})).res.status,200);
  env.sqlite.exec('UPDATE admin_sessions SET expires_at = 0');assert.equal((await call(env,'/api/admin/session',{headers:owner})).res.status,401);
});

test('password attempts are bounded and a forged cookie does not unlock writes',async()=>{
  const env=await securedEnvironment();
  env.cookie='__Host-advisor-admin='+ '0'.repeat(64);
  assert.equal((await save(env,'projects',structuredClone(SEED.projects[0]),1)).res.status,401);
  for(let i=0;i<5;i++)assert.equal((await call(env,'/api/admin/password/login',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'wrong-password'})})).res.status,401);
  assert.equal((await call(env,'/api/admin/password/login',{method:'POST',headers:writeHeaders,body:JSON.stringify({password:'wrong-password'})})).res.status,429);
  assert.equal((await call(env,'/api/admin/password/setup',{method:'POST',headers:{...writeHeaders,Origin:'https://other.example'},body:JSON.stringify({password:'different-password'})})).res.status,403);
});
