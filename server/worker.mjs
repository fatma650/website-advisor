/** خادم ADVISOR: حماية الأدمن، تخزين المحتوى في D1 والصور في R2.
 * لا نعتمد على كلمة مرور في JavaScript أو صلاحية يرسلها المتصفح.
 */
import { SEED, ADMIN_HTML, HOME_HTML, PASSWORD_HTML } from './site-data.mjs';

class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
const fail = (status, code) => { throw new HttpError(status, code); };
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {
  'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'
}});
const html = (body, status = 200) => new Response(body, {status, headers: {'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const db = env => env.DB || fail(503, 'storage_unavailable');

// هذه بيانات افتتاحية فقط؛ INSERT OR IGNORE لا يكتب فوق أي تعديل محفوظ.
// كل خطوة تُستورد مرة واحدة، فتصل أقسام الصفحة للمواقع المهيأة سابقاً دون المساس بمشاريعها.
const SEED_STEPS = [['initial-content-v1',['projects','logos']],['site-sections-v1',['sections']]];
async function ensureSeed(env) {
  const database = db(env);
  const done = new Set((await database.prepare('SELECT key FROM cms_meta').all()).results.map(row => row.key));
  const now = new Date().toISOString(), statements = [];
  for (const [key,kinds] of SEED_STEPS) {
    if (done.has(key)) continue;
    for (const kind of kinds) for (const item of SEED[kind]) statements.push(database.prepare(
      'INSERT OR IGNORE INTO content_items (kind,id,payload,version,sort_order,created_at,updated_at) VALUES (?,?,?,1,?,?,?)'
    ).bind(kind,item.id,JSON.stringify(item),item.order,now,now));
    statements.push(database.prepare('INSERT OR IGNORE INTO cms_meta (key,value) VALUES (?,?)').bind(key,now));
  }
  if (statements.length) await database.batch(statements);
}

// Headers هنا يضيفها Sites بعد تسجيل الدخول، ولا تُقرأ الهوية من جسم الطلب أو localStorage.
async function requireAdmin(request, env) {
  const userId = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email');
  if (!userId || !email) fail(401, 'sign_in_required');
  const database = db(env);
  let owner = await database.prepare('SELECT user_id FROM cms_admins WHERE role = ?').bind('owner').first();
  // أول دخول للحساب الموثق المحدد يربط معرفه الدائم بهذا الموقع. لا يستطيع أول زائر آخر امتلاك اللوحة.
  if (!owner) {
    const expected = env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    if (!expected) fail(503, 'admin_not_configured');
    if (email.trim().toLowerCase() !== expected) fail(403, 'admin_only');
    await database.prepare('INSERT OR IGNORE INTO cms_admins (role,user_id,created_at) VALUES (?,?,?)')
      .bind('owner',userId,new Date().toISOString()).run();
    owner = await database.prepare('SELECT user_id FROM cms_admins WHERE role = ?').bind('owner').first();
  }
  if (owner?.user_id !== userId) fail(403, 'admin_only');
  return {userId,email};
}

// منع الطلبات العابرة للمواقع: كل كتابة تحتاج هوية موثقة وطلباً صريحاً من نفس الموقع.
function requireSameOrigin(request) {
  if (request.headers.get('X-Advisor-Request') !== 'admin') fail(403,'invalid_request');
  if (request.headers.get('Sec-Fetch-Site') === 'cross-site') fail(403,'invalid_request');
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) fail(403,'invalid_request');
}

// تحديد الحجم أثناء القراءة يمنع تحميل طلب ضخم كاملاً في ذاكرة الخادم.
async function readLimited(request, maximum) {
  if (Number(request.headers.get('Content-Length')) > maximum) fail(413,'file_too_large');
  if (!request.body) fail(400,'invalid_data');
  const reader = request.body.getReader();
  const chunks = []; let size = 0;
  while (true) {
    const {value,done} = await reader.read(); if (done) break;
    size += value.length;
    if (size > maximum) {await reader.cancel(); fail(413,'file_too_large');}
    chunks.push(value);
  }
  const output = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) {output.set(chunk,offset); offset += chunk.length;}
  return output;
}

function text(value, maximum = 10000) {
  if (typeof value !== 'string' || value.length > maximum) fail(400,'invalid_data');
  return value.trim();
}
function pair(value, required = false) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400,'invalid_data');
  const result = {en:text(value.en || ''),ar:text(value.ar || '')};
  if (required && !result.en) fail(400,'english_title_required');
  return result;
}
function list(value, maximum) {
  if (!Array.isArray(value) || value.length > maximum) fail(400,'invalid_data');
  return value;
}
function imagePath(value, required = false) {
  const path = text(value || '',300);
  if (!path && !required) return '';
  if (!/^\/(?:assets\/[a-zA-Z0-9_/-]+\.(?:png|jpg|jpeg|webp)|media\/[0-9a-f-]{36}\.(?:png|jpg|webp))$/.test(path)) fail(400,'invalid_image');
  return path;
}

// أقسام الصفحة الرئيسية: مجموعة ثابتة، ولكل قسم حقول معروفة. المفاتيح تطابق SECTIONS في admin.js.
const P = 'pair', LIST = (max,item) => ({max,item});
const HEADING = {tag:P,title:P,titleAccent:P};
const SECTION_FIELDS = {
  brand: {name:'text',subtitle:P,logo:'image',ctaLabel:P,siteTitle:P,siteDescription:P,fontTheme:'text'},
  hero: {tag:P,lines:LIST(6,P),subcopy:P,primaryCta:P,secondaryCta:P,scrollPrompt:P,ticker:LIST(20,P)},
  about: {...HEADING,lead:P,body:P,stats:LIST(4,{value:P,label:P}),words:LIST(10,P)},
  vision: {...HEADING,visionTag:P,visionTitle:P,visionQuote:P,visionBody:P,visionKeywords:LIST(4,P),missionTag:P,missionTitle:P,missionQuote:P,pillars:LIST(6,{label:P,name:P,desc:P}),missionKeywords:LIST(4,P)},
  services: {...HEADING,items:LIST(20,{title:P,desc:P})},
  work: {...HEADING,dragHint:P,countLabel:P},
  why: {...HEADING,lead:P,items:LIST(12,{claim:P,detail:P})},
  clients: HEADING,
  statement: {tag:P,quote:P,quoteAccent:P,subquote:P},
  contact: {...HEADING,philosophy:P,formTitle:P,phone:'phone',whatsapp:'whatsapp',phoneLabel:P,officeNote:P,whatsappCta:P},
  footer: {tagline:P,description:P,website:'text',location:P,copyright:P,socials:LIST(8,{label:P,url:'url'})}
};
function sectionField(spec, value) {
  if (spec === 'pair') return pair(value);
  if (spec === 'text') return text(value,500);
  if (spec === 'image') return imagePath(value,true);
  if (spec === 'phone') {const v = text(value,30); if (v && !/^\+?[0-9][0-9 ()-]{3,28}$/.test(v)) fail(400,'invalid_phone'); return v;}
  // واتساب بالصيغة الدولية أرقاماً فقط، لأنه يُدرج في رابط wa.me.
  if (spec === 'whatsapp') {const v = text(value,15); if (v && !/^[0-9]{8,15}$/.test(v)) fail(400,'invalid_phone'); return v;}
  if (spec === 'url') {const v = text(value,500); if (v && !/^https:\/\/[^\s"'<>\\]+$/.test(v)) fail(400,'invalid_link'); return v;}
  if (spec.item) return list(value,spec.max).map(item => sectionField(spec.item,item));
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400,'invalid_data');
  return Object.fromEntries(Object.entries(spec).map(([key,child]) => [key,sectionField(child,value[key])]));
}

// إعادة بناء السجل من حقول معروفة فقط، مع بقاء نصوص المستخدم بيانات لا كوداً.
export function validateItem(kind, input, id) {
  if (!input || input.id !== id || !/^[a-zA-Z0-9_-]{1,80}$/.test(id)) fail(400,'invalid_data');
  if (!Number.isInteger(input.order) || input.order < 0 || input.order > 100000) fail(400,'invalid_data');
  const output = {id,order:input.order};
  if (kind === 'logos') return {...output,name:pair(input.name,true),industry:pair(input.industry),logo:imagePath(input.logo,true)};
  if(kind==='sections' && id==='brand') {
    input={...input,fontTheme:input.fontTheme||'modern'};
    if(!['modern','classic','arabic'].includes(input.fontTheme))fail(400,'invalid_data');
  }
  if (kind === 'sections') return {...output,...sectionField(SECTION_FIELDS[id] || fail(404,'not_found'),input)};
  if (kind !== 'projects') fail(404,'not_found');
  for (const key of ['title','category','subtitle','client','location','summary','challenge','approach','creativeDirection']) output[key] = pair(input[key],key === 'title' || key === 'category');
  output.year = text(input.year,40);
  output.heroImage = imagePath(input.heroImage,true);
  output.boardImage = imagePath(input.boardImage);
  output.services = list(input.services,30).map(item => pair(item));
  output.results = list(input.results,20).map(item => ({label:pair(item.label),value:pair(item.value),desc:pair(item.desc)}));
  output.gallery = list(input.gallery,80).map(item => ({src:imagePath(item.src,true),caption:pair(item.caption),ratio:text(item.ratio || '1:1',20)}));
  return output;
}

async function readContent(env) {
  await ensureSeed(env);
  const result = await db(env).prepare('SELECT kind,payload,version,updated_at FROM content_items WHERE deleted_at IS NULL ORDER BY sort_order ASC, id ASC').all();
  const content = {projects:[],logos:[],sections:[]};
  for (const row of result.results) if (content[row.kind]) content[row.kind].push({data:JSON.parse(row.payload),version:row.version,updatedAt:row.updated_at});
  return content;
}

async function saveItem(request,env,kind,id) {
  requireSameOrigin(request);
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) fail(415,'invalid_data');
  let input;
  try {input = JSON.parse(new TextDecoder().decode(await readLimited(request,256*1024)));}
  catch (error) {if (error instanceof HttpError) throw error; fail(400,'invalid_data');}
  if (!Number.isInteger(input.version) || input.version < 0) fail(400,'invalid_data');
  const data = validateItem(kind,input.data,id);
  await ensureSeed(env);
  const database = db(env), now = new Date().toISOString();
  let result;
  if (input.version === 0) {
    result = await database.prepare('INSERT OR IGNORE INTO content_items (kind,id,payload,version,sort_order,created_at,updated_at) VALUES (?,?,?,1,?,?,?)')
      .bind(kind,id,JSON.stringify(data),data.order,now,now).run();
  } else {
    // القفل التفاؤلي يمنع تبويباً قديماً من الكتابة فوق تعديل أحدث دون علم المستخدم.
    result = await database.prepare('UPDATE content_items SET payload = ?, sort_order = ?, version = version + 1, updated_at = ? WHERE kind = ? AND id = ? AND version = ?')
      .bind(JSON.stringify(data),data.order,now,kind,id,input.version).run();
  }
  if (!result.meta?.changes) fail(409,'version_conflict');
  return json({data,version:input.version + 1,updatedAt:now},input.version === 0 ? 201 : 200);
}

// نتحقق من توقيع الصورة الفعلي، وليس امتداد الملف أو MIME الذي يرسله المتصفح.
export function detectImage(bytes) {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b)) return {mime:'image/png',ext:'png'};
  if (bytes.length >= 3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return {mime:'image/jpeg',ext:'jpg'};
  const str = (start,end) => String.fromCharCode(...bytes.slice(start,end));
  if (bytes.length >= 12 && str(0,4)==='RIFF' && str(8,12)==='WEBP') return {mime:'image/webp',ext:'webp'};
  fail(415,'unsupported_image');
}
async function upload(request,env,user) {
  requireSameOrigin(request);
  if (!env.BUCKET) fail(503,'storage_unavailable');
  const type = request.headers.get('Content-Type') || '';
  if (!type.startsWith('multipart/form-data;')) fail(415,'invalid_data');
  const maximum = env.MAX_UPLOAD_BYTES || 10*1024*1024;
  const bytes = await readLimited(request,maximum + 256*1024);
  let form;
  try {form = await new Request(request.url,{method:'POST',headers:{'Content-Type':type},body:bytes}).formData();}
  catch {fail(400,'invalid_data');}
  const file = form.get('file');
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) fail(400,'invalid_image');
  if (file.size > maximum) fail(413,'file_too_large');
  const content = new Uint8Array(await file.arrayBuffer()), detected = detectImage(content);
  const key = `${crypto.randomUUID()}.${detected.ext}`;
  await env.BUCKET.put(key,content,{httpMetadata:{contentType:detected.mime}});
  try {
    await db(env).prepare('INSERT INTO media_files (key,filename,mime,size,uploaded_by,created_at) VALUES (?,?,?,?,?,?)')
      .bind(key,String(file.name).slice(0,180),detected.mime,file.size,user.userId,new Date().toISOString()).run();
  } catch (error) {await env.BUCKET.delete(key); throw error;}
  return json({url:`/media/${key}`,filename:file.name,size:file.size},201);
}
async function serveMedia(request,env,key) {
  if (!/^[0-9a-f-]{36}\.(png|jpg|webp)$/.test(key)) fail(404,'not_found');
  const metadata = await db(env).prepare('SELECT mime,size FROM media_files WHERE key = ?').bind(key).first();
  if (!metadata) fail(404,'not_found');
  const object = await env.BUCKET?.get(key);
  if (!object) fail(404,'not_found');
  return new Response(request.method === 'HEAD' ? null : object.body,{headers:{'Content-Type':metadata.mime,'Content-Length':String(metadata.size),'Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'}});
}

// جلسة الأدمن تنتهي بعد 8 ساعات؛ المخزن يحتفظ ببصمة التوكن فقط.
const PASSWORD_COOKIE = '__Host-advisor-admin';
const SESSION_SECONDS = 8 * 60 * 60;
const toHex = bytes => [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
const fromHex = hex => new Uint8Array(hex.match(/../g).map(v=>parseInt(v,16)));
const digest = async value => toHex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
function sessionToken(request) {
  const matches=(request.headers.get('Cookie')||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(PASSWORD_COOKIE+'='));
  if(matches.length!==1)return '';
  const token=matches[0].slice(PASSWORD_COOKIE.length+1);
  return /^[a-f0-9]{64}$/.test(token)?token:'';
}
async function passwordSession(request,env,user) {
  const token=sessionToken(request);if(!token)return false;
  const row=await db(env).prepare('SELECT user_id,expires_at FROM admin_sessions WHERE token_hash = ?').bind(await digest(token)).first();
  return !!row && row.user_id===user.userId && row.expires_at>Date.now();
}
async function derivePassword(password,salt,env) {
  if(!env.ADMIN_PASSWORD_PEPPER)fail(503,'admin_not_configured');
  const encode=s=>new TextEncoder().encode(s);
  // Pepper سري على الخادم ثم PBKDF2 بملح عشوائي؛ لا تكفي قاعدة البيانات وحدها لاختبار التخمينات.
  const pepper=await crypto.subtle.importKey('raw',encode(env.ADMIN_PASSWORD_PEPPER),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const input=await crypto.subtle.sign('HMAC',pepper,encode(password));
  const material=await crypto.subtle.importKey('raw',input,'PBKDF2',false,['deriveBits']);
  return toHex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:fromHex(salt),iterations:env.PASSWORD_ITERATIONS || 100000,hash:'SHA-256'},material,256));
}
function equalHash(a,b) {let difference=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)difference|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return difference===0;}
async function issueSession(env,user) {
  const token=toHex(crypto.getRandomValues(new Uint8Array(32))),now=Date.now();
  await db(env).batch([
    db(env).prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now),
    db(env).prepare('INSERT INTO admin_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(await digest(token),user.userId,now+SESSION_SECONDS*1000),
    db(env).prepare('DELETE FROM admin_login_attempts WHERE user_id = ?').bind(user.userId)
  ]);
  const response=json({ok:true});response.headers.set('Set-Cookie',`${PASSWORD_COOKIE}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`);return response;
}
const validNewPassword = p => typeof p==='string' && p.length<=128 && p.trim().length>=12;
async function resetHash(code,env) {
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.ADMIN_PASSWORD_PEPPER),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return toHex(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode('password-reset:'+code)));
}
async function replacePassword(env,user,hash,salt) {
  await db(env).batch([
    db(env).prepare('UPDATE admin_passwords SET password_hash=?, salt=? WHERE user_id=?').bind(hash,salt,user.userId),
    db(env).prepare('DELETE FROM admin_password_resets WHERE user_id=?').bind(user.userId),
    db(env).prepare('DELETE FROM admin_sessions WHERE user_id=?').bind(user.userId)
  ]);
}
async function passwordRoute(request,env,user,path) {
  if(path==='/api/admin/password/state' && request.method==='GET') {
    const row=await db(env).prepare('SELECT user_id FROM admin_passwords WHERE user_id = ?').bind(user.userId).first();
    return json({setupRequired:!row,passwordOnly:!!env.PASSWORD_ONLY,resetAvailable:!!(env.RESEND_API_KEY && env.RESEND_FROM)});
  }
  if(request.method!=='POST')fail(405,'method_not_allowed');
  requireSameOrigin(request);
  if(path==='/api/admin/password/logout') {
    const token=sessionToken(request);
    if(token)await db(env).prepare('DELETE FROM admin_sessions WHERE token_hash = ? AND user_id = ?').bind(await digest(token),user.userId).run();
    const response=json({ok:true});response.headers.set('Set-Cookie',`${PASSWORD_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);return response;
  }
  
  const now=Date.now(),windowStart=now-15*60*1000;
  async function checkRateLimit() {
    const rate=await db(env).prepare('INSERT INTO admin_login_attempts (user_id,started_at,attempts) VALUES (?,?,1) ON CONFLICT(user_id) DO UPDATE SET attempts = CASE WHEN started_at < ? THEN 1 ELSE attempts + 1 END, started_at = CASE WHEN started_at < ? THEN ? ELSE started_at END RETURNING attempts').bind(user.userId,now,windowStart,windowStart,now).first();
    if(rate.attempts>5)fail(429,'too_many_attempts');
  }

  if(path==='/api/admin/password/reset/request') {
    if(!env.RESEND_API_KEY || !env.RESEND_FROM)fail(503,'reset_unavailable');
    const existing = await db(env).prepare('SELECT user_id FROM admin_passwords WHERE user_id = ?').bind(user.userId).first();
    if(!existing) fail(409,'password_not_set');
    
    await checkRateLimit();
    const random = new Uint32Array(1);
    do {crypto.getRandomValues(random);} while(random[0]>=4294000000);
    const code = String(random[0] % 1000000).padStart(6,'0');
    const codeHash = await resetHash(code,env);
    const expiresAt = now + 15 * 60 * 1000;
    await db(env).prepare('INSERT OR REPLACE INTO admin_password_resets (user_id, code_hash, expires_at) VALUES (?,?,?)').bind(user.userId, codeHash, expiresAt).run();
    
    if (env.RESEND_API_KEY) {
      const emailHtml = `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px;background:#f9f9f9;border-radius:10px;">
          <h2 style="color:#333;text-align:center;">إعادة تعيين كلمة المرور</h2>
          <p style="color:#555;font-size:16px;">مرحباً،</p>
          <p style="color:#555;font-size:16px;">لقد طلبت إعادة تعيين كلمة المرور للوحة الإدارة. كود التحقق الخاص بك هو:</p>
          <div style="background:#fff;border:1px solid #ddd;padding:15px;text-align:center;font-size:24px;font-weight:bold;letter-spacing:5px;border-radius:5px;margin:20px 0;color:#c084fc;">
            ${code}
          </div>
          <p style="color:#555;font-size:14px;">صالح لمدة 15 دقيقة. إذا لم تطلب هذا الكود، يمكنك تجاهل هذه الرسالة.</p>
        </div>
      `;
      try {
        const delivered = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {'Authorization': `Bearer ${env.RESEND_API_KEY}`,'Content-Type': 'application/json'},
          body: JSON.stringify({
            from: env.RESEND_FROM,
            to: user.email,
            subject: 'كود استعادة كلمة المرور',
            html: emailHtml
          })
        });
        if(!delivered.ok)throw new Error('email_unavailable');
      } catch {
        await db(env).prepare('DELETE FROM admin_password_resets WHERE user_id=? AND code_hash=?').bind(user.userId,codeHash).run();
        fail(503,'email_unavailable');
      }
    }
    return json({ok:true});
  }

  if(!request.headers.get('Content-Type')?.startsWith('application/json'))fail(415,'invalid_data');
  let body;try{body=JSON.parse(new TextDecoder().decode(await readLimited(request,4096)));}catch(e){if(e instanceof HttpError)throw e;fail(400,'invalid_data');}
  
  if(path==='/api/admin/password/change') {
    if (!await passwordSession(request,env,user)) fail(401,'password_required');
    const {oldPassword, newPassword} = body;
    if(typeof oldPassword!=='string' || oldPassword.length>128 || !validNewPassword(newPassword)) fail(400,'password_invalid');
    const existing=await db(env).prepare('SELECT password_hash,salt FROM admin_passwords WHERE user_id = ?').bind(user.userId).first();
    if(!existing)fail(409,'password_not_set');
    await checkRateLimit();
    if(!equalHash(await derivePassword(oldPassword,existing.salt,env),existing.password_hash))fail(401,'password_incorrect');
    const salt=toHex(crypto.getRandomValues(new Uint8Array(16))),hash=await derivePassword(newPassword,salt,env);
    await replacePassword(env,user,hash,salt);
    return issueSession(env,user);
  }

  if(path==='/api/admin/password/reset/confirm') {
    const {code, newPassword} = body;
    if(typeof code!=='string' || !/^\d{6}$/.test(code) || !validNewPassword(newPassword)) fail(400,'password_invalid');
    await checkRateLimit();
    const reset = await db(env).prepare('DELETE FROM admin_password_resets WHERE user_id=? AND code_hash=? AND expires_at>? RETURNING user_id').bind(user.userId,await resetHash(code,env),now).first();
    if(!reset)fail(401,'code_incorrect');
    const salt=toHex(crypto.getRandomValues(new Uint8Array(16))),hash=await derivePassword(newPassword,salt,env);
    await replacePassword(env,user,hash,salt);
    return issueSession(env,user);
  }

  if(!['/api/admin/password/setup','/api/admin/password/login'].includes(path))fail(404,'not_found');
  const password=body.password;
  if(typeof password!=='string'||password.length>128||!password.length)fail(400,'password_invalid');
  const existing=await db(env).prepare('SELECT password_hash,salt FROM admin_passwords WHERE user_id = ?').bind(user.userId).first();
  if(path.endsWith('/setup')) {
    if(existing)fail(409,'password_already_set');
    if(password.length<12||password.trim().length<12)fail(400,'password_short');
    const salt=toHex(crypto.getRandomValues(new Uint8Array(16))),hash=await derivePassword(password,salt,env);
    const result=await db(env).prepare('INSERT OR IGNORE INTO admin_passwords (user_id,password_hash,salt,created_at) VALUES (?,?,?,?)').bind(user.userId,hash,salt,new Date().toISOString()).run();
    if(!result.meta?.changes)fail(409,'password_already_set');
    return issueSession(env,user);
  }
  if(!existing)fail(409,'password_not_set');
  await checkRateLimit();
  if(!equalHash(await derivePassword(password,existing.salt,env),existing.password_hash))fail(401,'password_incorrect');
  return issueSession(env,user);
}
async function deleteItem(env,kind,id) {
  const result = await db(env).prepare('UPDATE content_items SET deleted_at = ? WHERE kind = ? AND id = ? AND deleted_at IS NULL')
    .bind(Math.floor(Date.now() / 1000), kind, id).run();
  if(!result.meta?.changes) fail(404,'not_found');
  return json({ok:true});
}
async function deleteMedia(env,key) {
  const result = await db(env).prepare('UPDATE media_files SET deleted_at = ? WHERE key = ? AND deleted_at IS NULL')
    .bind(Math.floor(Date.now() / 1000), key).run();
  if(!result.meta?.changes) fail(404,'not_found');
  return json({ok:true});
}
async function getTrash(env) {
  const items = await db(env).prepare('SELECT kind, id, payload, deleted_at FROM content_items WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC').all();
  const media = await db(env).prepare('SELECT key, filename, mime, size, deleted_at FROM media_files WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC').all();
  return json({
    items: items.results.map(r => ({kind: r.kind, id: r.id, deletedAt: r.deleted_at, data: JSON.parse(r.payload)})),
    media: media.results.map(r => ({key: r.key, filename: r.filename, mime: r.mime, size: r.size, deletedAt: r.deleted_at}))
  });
}
async function restoreTrash(env, kind, id) {
  let result;
  if (kind === 'media') result = await db(env).prepare('UPDATE media_files SET deleted_at = NULL WHERE key = ? AND deleted_at IS NOT NULL').bind(id).run();
  else result = await db(env).prepare('UPDATE content_items SET deleted_at = NULL WHERE kind = ? AND id = ? AND deleted_at IS NOT NULL').bind(kind, id).run();
  if(!result.meta?.changes) fail(404,'not_found');
  return json({ok:true});
}
async function permanentDeleteTrash(env, kind, id) {
  let result;
  if (kind === 'media') {
    result = await db(env).prepare('DELETE FROM media_files WHERE key = ? AND deleted_at IS NOT NULL').bind(id).run();
    if(result.meta?.changes && env.BUCKET) await env.BUCKET.delete(id);
  } else {
    result = await db(env).prepare('DELETE FROM content_items WHERE kind = ? AND id = ? AND deleted_at IS NOT NULL').bind(kind, id).run();
  }
  if(!result.meta?.changes) fail(404,'not_found');
  return json({ok:true});
}

export default {
  async fetch(request,env) {
    const url = new URL(request.url), path = url.pathname;
    try {
      if (path === '/admin' || path === '/admin/') {
        if (!request.headers.get('oai-authenticated-user-id')) return new Response(null,{status:302,headers:{Location:'/signin-with-chatgpt?return_to=%2Fadmin','Cache-Control':'no-store'}});
        try {await requireAdmin(request,env);}
        catch (error) {
          if (error.status === 403) return html('<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ADVISOR — دخول الأدمن</title><body style="font-family:sans-serif;padding:3rem;background:#101017;color:white"><h1>هذا الحساب لا يملك صلاحية التعديل</h1><p>افتحي اللوحة بحساب مالك الموقع.</p><a style="color:#c084fc" href="/signout-with-chatgpt?return_to=%2Fadmin" target="_top">تغيير الحساب</a></body></html>',403);
          throw error;
        }
        const user = await requireAdmin(request,env);
        return html(await passwordSession(request,env,user) ? ADMIN_HTML : PASSWORD_HTML);
      }
      if (path === '/api/content' && request.method === 'GET') return json(await readContent(env));
      if (path.startsWith('/api/admin/')) {
        const user = await requireAdmin(request,env);
        if(!['GET','HEAD','OPTIONS'].includes(request.method))requireSameOrigin(request);
        if (path.startsWith('/api/admin/password/')) return await passwordRoute(request,env,user,path);
        if (!await passwordSession(request,env,user)) fail(401,'password_required');
        if (path === '/api/admin/session' && request.method === 'GET') return json({email:user.email,maxUploadBytes:env.MAX_UPLOAD_BYTES||10*1024*1024});
        if (path === '/api/admin/content' && request.method === 'GET') return json(await readContent(env));
        if (path === '/api/admin/uploads' && request.method === 'POST') return await upload(request,env,user);
        
        const mediaMatch = path.match(/^\/api\/admin\/media\/([0-9a-f-]{36}\.(png|jpg|webp))$/);
        if (mediaMatch && request.method === 'DELETE') return await deleteMedia(env, mediaMatch[1]);
        
        if (path === '/api/admin/trash' && request.method === 'GET') return await getTrash(env);
        const trashRestoreMatch = path.match(/^\/api\/admin\/trash\/restore\/(projects|logos|media)\/([^/]+)$/);
        if (trashRestoreMatch && request.method === 'POST') return await restoreTrash(env, trashRestoreMatch[1], trashRestoreMatch[2]);
        const trashDeleteMatch = path.match(/^\/api\/admin\/trash\/permanent\/(projects|logos|media)\/([^/]+)$/);
        if (trashDeleteMatch && request.method === 'DELETE') return await permanentDeleteTrash(env, trashDeleteMatch[1], trashDeleteMatch[2]);

        const match = path.match(/^\/api\/admin\/(projects|logos|sections)\/([a-zA-Z0-9_-]{1,80})$/);
        if (match) {
          if (request.method === 'PUT') return await saveItem(request,env,match[1],match[2]);
          if (request.method === 'DELETE' && ['projects','logos'].includes(match[1])) return await deleteItem(env,match[1],match[2]);
        }
        fail(405,'method_not_allowed');
      }
      if (path.startsWith('/media/') && ['GET','HEAD'].includes(request.method)) return await serveMedia(request,env,path.slice(7));
      if ((path === '/' || path === '/index.html') && ['GET','HEAD'].includes(request.method)) return html(request.method === 'HEAD' ? null : HOME_HTML);
      if (path.startsWith('/api/')) fail(404,'not_found');
      if (env.ASSETS && ['GET','HEAD'].includes(request.method)) return env.ASSETS.fetch(request);
      return new Response('Not found',{status:404});
    } catch (error) {
      if (!(error instanceof HttpError)) console.error('ADVISOR request failed',path,error.name,error.message);
      return json({error:error.code || 'storage_unavailable'},error.status || 503);
    }
  },
  async scheduled(event, env, ctx) {
    // 30 days retention policy for trash
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60);
    const database = db(env);
    
    // Clean up old media
    const oldMedia = await database.prepare('SELECT key FROM media_files WHERE deleted_at < ?').bind(thirtyDaysAgo).all();
    for (const row of oldMedia.results) {
      if (env.BUCKET) await env.BUCKET.delete(row.key);
      await database.prepare('DELETE FROM media_files WHERE key = ?').bind(row.key).run();
    }
    
    // Clean up old items
    await database.prepare('DELETE FROM content_items WHERE deleted_at < ?').bind(thirtyDaysAgo).run();
  }
};
