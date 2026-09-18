import worker from '../dist/server/index.js';
import seed from './seed.json' with {type:'json'};
import {getStorage} from './vercel-storage.mjs';

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const validPassword=p=>typeof p==='string' && p.length>=12 && p.length<=128 && p.trim().length>=12;
const USER_ID='vercel-password-admin';
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
export function secure(response, request) {
  const output=new Response(response.body,response);
  output.headers.set('X-Content-Type-Options','nosniff');
  output.headers.set('X-Frame-Options','DENY');
  output.headers.set('Content-Security-Policy',csp);
  output.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
  if(new URL(request.url).protocol==='https:')output.headers.set('Strict-Transport-Security','max-age=31536000');
  return output;
}

// Vercel has no Sites identity proxy. The password session is the sole credential.
// Headers below are internal routing metadata; client-supplied identity is discarded.
export function createHandler({config=process.env,storage=getStorage}={}) {
  async function handle(request) {
    const url=new URL(request.url);
    // Some runtimes expose the destination URL after a rewrite; support both forms.
    if(url.pathname==='/api/cms') {
      const route=url.searchParams.get('advisor_route')||'';
      if(!route.startsWith('/') || route.startsWith('//') || route.includes('?') || route.includes('#'))return json({error:'not_found'},404);
      url.pathname=route;url.searchParams.delete('advisor_route');
      request=new Request(url,request);
    }
    const path=url.pathname;
    if(path==='/api/content' && request.method==='GET' && !config.TURSO_DATABASE_URL && !config.TURSO_AUTH_TOKEN) {
      // Explicit initial read-only mode: serve the real bundled content until storage is connected.
      return json(Object.fromEntries(['projects','logos','sections'].map(kind=>[kind,(seed[kind]||[]).map(data=>({data,version:1,updatedAt:null}))])));
    }
    const isAdmin=path==='/admin'||path==='/admin/'||path.startsWith('/api/admin/');
    if(path==='/signin-with-chatgpt'||path==='/signout-with-chatgpt')return new Response(null,{status:303,headers:{Location:'/admin','Cache-Control':'no-store'}});
    if(!isAdmin && path!=='/api/content' && !path.startsWith('/media/'))return json({error:'not_found'},404);
    if(isAdmin && (!config.ADMIN_BOOTSTRAP_EMAIL || (config.ADMIN_PASSWORD_PEPPER||'').length<32))return unavailable(path);
    let stores;
    try {stores=await storage(config);} catch {return unavailable(path);}
    const env={...stores,ADMIN_BOOTSTRAP_EMAIL:config.ADMIN_BOOTSTRAP_EMAIL,
      ADMIN_PASSWORD_PEPPER:config.ADMIN_PASSWORD_PEPPER,
      PASSWORD_ITERATIONS:600000,MAX_UPLOAD_BYTES:3*1024*1024,
      PASSWORD_ONLY:true,RESEND_API_KEY:config.RESEND_API_KEY,RESEND_FROM:config.RESEND_FROM};
    if(isAdmin) {
      // Initial setup is a deployment secret, never a public "first visitor wins" page.
      if(path==='/api/admin/password/setup')return json({error:'setup_disabled'},403);
      const existing=await stores.DB.prepare('SELECT user_id FROM admin_passwords WHERE user_id=?').bind(USER_ID).first();
      if(!existing) {
        if(!validPassword(config.ADMIN_INITIAL_PASSWORD))return unavailable(path);
        const setup=await worker.fetch(new Request(new URL('/api/admin/password/setup',url),{
          method:'POST',headers:{'Content-Type':'application/json','X-Advisor-Request':'admin',Origin:url.origin,
          'oai-authenticated-user-id':USER_ID,'oai-authenticated-user-email':config.ADMIN_BOOTSTRAP_EMAIL},
          body:JSON.stringify({password:config.ADMIN_INITIAL_PASSWORD})
        }),env);
        if(![200,409].includes(setup.status))return unavailable(path);
        // Never expose the bootstrap session cookie or use it to authorize the incoming request.
      }
    }
    const headers=new Headers(request.headers);
    for(const key of [...headers.keys()])if(key.startsWith('oai-'))headers.delete(key);
    headers.set('oai-authenticated-user-id',USER_ID);
    headers.set('oai-authenticated-user-email',config.ADMIN_BOOTSTRAP_EMAIL||'');
    return worker.fetch(new Request(request,{headers}),env);
  }
  return async request=>{
    try {return secure(await handle(request),request);}
    catch {return secure(json({error:'storage_unavailable'},503),request);}
  };
}
function unavailable(path) {
  if(path==='/admin'||path==='/admin/')return new Response('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>إعداد لوحة الإدارة</title><body style="font-family:sans-serif;padding:3rem;background:#101017;color:white"><h1>لوحة الإدارة تحتاج إكمال الإعداد</h1><p>أكملي إعداد قاعدة البيانات وبيانات دخول الأدمن في Vercel، ثم أعيدي النشر. خطوات الإعداد موجودة في ملف VERCEL-SETUP.md المرفق بالمشروع.</p><a href="/" style="color:#c084fc">العودة للموقع</a></body></html>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
  return json({error:'admin_not_configured'},503);
}
export default createHandler();
