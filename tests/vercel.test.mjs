import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '@libsql/client';
import {createHandler} from '../server/vercel-handler.mjs';
import {databaseAdapter,migrate,blobAdapter} from '../server/vercel-storage.mjs';
const origin='https://advisor.example';
const password='Initial-admin-password-2026';
async function fixture() {
 const client=createClient({url:':memory:'});await migrate(client);await migrate(client);
 const DB=databaseAdapter(client),files=new Map();
 const sdk={async put(key,bytes){const url='https://test.public.blob.vercel-storage.com/'+key;files.set(url,bytes);return {url}},async del(url){files.delete(url)}};
 const BUCKET=blobAdapter(DB,'test-token',sdk,async url=>files.has(String(url))?new Response(files.get(String(url))):new Response(null,{status:404}));
 const config={TURSO_DATABASE_URL:'libsql://example',TURSO_AUTH_TOKEN:'test',ADMIN_BOOTSTRAP_EMAIL:'owner@example.com',ADMIN_PASSWORD_PEPPER:'a-test-pepper-at-least-32-characters-long',ADMIN_INITIAL_PASSWORD:password};
 const storage=async()=>({DB,BUCKET});const handler=createHandler({config,storage});
 const request=async(path,method='GET',data,cookie='',extra={})=>{
  const response=await handler(new Request(origin+path,{method,headers:{Origin:origin,'X-Advisor-Request':'admin',...(data!==undefined?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{}),...extra},body:data===undefined?undefined:JSON.stringify(data)}));
  return {response,data:response.headers.get('Content-Type')?.includes('application/json')?await response.json():await response.text()};
 };
 const login=async()=>{const r=await request('/api/admin/password/login','POST',{password});assert.equal(r.response.status,200);return r.response.headers.get('Set-Cookie').split(';')[0]};
 return {client,DB,BUCKET,config,storage,handler,request,login,files};
}
test('bundled content works before storage; unconfigured admin fails closed',async()=>{
 const handler=createHandler({config:{}});const res=await handler(new Request(origin+'/api/content'));assert.equal(res.status,200);assert.ok((await res.json()).projects.length);
 const admin=await handler(new Request(origin+'/admin'));assert.equal(admin.status,503);assert.match(await admin.text(),/إكمال الإعداد/);
});
test('Turso adapter migrates once, login is server-side, and forged identity cannot authorize writes',async()=>{
 const f=await fixture();
 assert.equal((await f.request('/admin')).response.status,200);
 assert.equal((await f.request('/api/admin/password/setup','POST',{password:'attacker-password'})).response.status,403);
 assert.equal((await f.request('/api/admin/content','GET',undefined,'',{'oai-authenticated-user-id':'vercel-password-admin','oai-authenticated-user-email':'owner@example.com'})).response.status,401);
 const cookie=await f.login();const session=await f.request('/api/admin/session','GET',undefined,cookie);assert.equal(session.response.status,200);assert.equal(session.data.maxUploadBytes,3*1024*1024);
 const content=await f.request('/api/content');const logo=structuredClone(content.data.logos[0]);logo.data.name.en='Updated on Vercel';
 assert.equal((await f.request('/api/admin/logos/'+logo.data.id,'PUT',{data:logo.data,version:logo.version},cookie)).response.status,200);
 const freshHandler=createHandler({config:{...f.config,ADMIN_INITIAL_PASSWORD:undefined},storage:f.storage});
 const persisted=await freshHandler(new Request(origin+'/api/content'));assert.equal((await persisted.json()).logos[0].data.name.en,'Updated on Vercel');
 assert.equal((await f.request('/api/admin/logos/'+logo.data.id,'DELETE',undefined,cookie,{Origin:'https://evil.example'})).response.status,403);
 assert.equal((await f.request('/api/admin/trash/restore/logos/'+logo.data.id,'POST',{},cookie,{Origin:'https://evil.example'})).response.status,403);
 assert.equal((await f.request('/api/admin/password/change','POST',{oldPassword:password,newPassword:'x'.repeat(129)},cookie)).response.status,400);
 await f.request('/api/admin/password/logout','POST',{},cookie);assert.equal((await f.request('/api/admin/content','GET',undefined,cookie)).response.status,401);
 f.client.close();
});
test('persistent failed-attempt counter blocks sixth try; cookies and headers are protected',async()=>{
 const f=await fixture();
 for(let i=0;i<5;i++)assert.equal((await f.request('/api/admin/password/login','POST',{password:'wrong'})).response.status,401);
 assert.equal((await f.request('/api/admin/password/login','POST',{password:'wrong'})).response.status,429);
 await f.DB.prepare('DELETE FROM admin_login_attempts').run();
 const r=await f.request('/api/admin/password/login','POST',{password});const cookie=r.response.headers.get('Set-Cookie');
 for(const flag of ['HttpOnly','Secure','SameSite=Lax','Max-Age=28800'])assert.ok(cookie.includes(flag));
 assert.match(r.response.headers.get('Content-Security-Policy'),/frame-ancestors 'none'/);
 assert.equal((await f.request('/api/admin/password/reset/request','POST',{})).response.status,503);
 f.client.close();
});
test('image uploads persist through Blob mapping and keep /media URLs; no session cannot upload',async()=>{
 const f=await fixture();const cookie=await f.login();
 const bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=','base64');
 const form=new FormData();form.set('file',new File([bytes],'test.png',{type:'image/png'}));
 const req=c=>new Request(origin+'/api/admin/uploads',{method:'POST',headers:{Origin:origin,'X-Advisor-Request':'admin',Cookie:c},body:form});
 assert.equal((await f.handler(req(''))).status,401);
 const uploaded=await f.handler(req(cookie));assert.equal(uploaded.status,201);const {url}=await uploaded.json();
 const image=await f.handler(new Request(origin+url));assert.equal(image.status,200);assert.deepEqual(Buffer.from(await image.arrayBuffer()),bytes);
 await f.request('/api/admin/media/'+url.slice(7),'DELETE',undefined,cookie);
 assert.equal((await f.request('/api/admin/trash/permanent/media/'+url.slice(7),'DELETE',undefined,cookie)).response.status,200);assert.equal(f.files.size,0);
 f.client.close();
});
test('rewrite destination resolves admin/content and cannot bypass password auth',async()=>{
 const publicHandler=createHandler({config:{}});
 assert.equal((await publicHandler(new Request(origin+'/api/cms?advisor_route=/api/content'))).status,200);
 const f=await fixture();
 assert.equal((await f.request('/api/cms?advisor_route=/admin')).response.status,200);
 assert.equal((await f.request('/api/cms?advisor_route=/api/admin/content')).response.status,401);
 const login=await f.request('/api/cms?advisor_route=/api/admin/password/login','POST',{password});assert.equal(login.response.status,200);
 assert.equal((await f.request('/api/cms?advisor_route=//evil.example')).response.status,404);
 f.client.close();
});
