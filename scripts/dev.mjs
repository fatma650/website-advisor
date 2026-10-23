/** معاينة محلية فقط: تشغّل Worker المبني مع قاعدة SQLite وتخزين صور في الذاكرة، وتضيف هوية مالك تجريبية.
 * لا تُنشر ولا تُضمَّن في البناء. التعديلات تُفقد عند إيقاف الأمر. يلزم Node يدعم node:sqlite.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {DatabaseSync} from 'node:sqlite';

const project = process.cwd(), port = Number(process.env.PORT || 8787);
const {default: worker} = await import(pathToFileURL(path.join(project, 'dist/server/index.js')).href);
const sqlite = new DatabaseSync(':memory:');
for (const name of fs.readdirSync(path.join(project, 'drizzle')).filter(n => n.endsWith('.sql')).sort()) sqlite.exec(fs.readFileSync(path.join(project, 'drizzle', name), 'utf8'));
const statement = (sql, values = []) => ({
  bind(...args) {return statement(sql, args);},
  async first() {return sqlite.prepare(sql).get(...values) || null;},
  async all() {return {results: sqlite.prepare(sql).all(...values)};},
  async run() {const result = sqlite.prepare(sql).run(...values); return {meta: {changes: Number(result.changes)}};}
});
const media = new Map();
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.json':'application/json','.svg':'image/svg+xml'};
const clientRoot = path.join(project, 'dist/client');
const env = {
  DB: {prepare: statement, async batch(statements) {sqlite.exec('BEGIN'); try {const out = []; for (const s of statements) out.push(await s.run()); sqlite.exec('COMMIT'); return out;} catch (error) {sqlite.exec('ROLLBACK'); throw error;}}},
  BUCKET: {async put(key, bytes) {media.set(key, new Uint8Array(bytes));}, async get(key) {return media.has(key) ? {body: media.get(key)} : null;}, async delete(key) {media.delete(key);}},
  // بديل ASSETS في الاستضافة: يقدّم ملفات dist/client بما فيها admin-assets/admin.css.
  ASSETS: {async fetch(request) {
    const file = path.join(clientRoot, decodeURIComponent(new URL(request.url).pathname));
    if (!file.startsWith(clientRoot + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return new Response('Not found', {status: 404});
    return new Response(fs.readFileSync(file), {headers: {'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream'}});
  }},
  ADMIN_BOOTSTRAP_EMAIL: 'owner@localhost', ADMIN_PASSWORD_PEPPER: 'local-preview-only'
};
const origin = `http://localhost:${port}`;
const identity = {'oai-authenticated-user-id': 'local-owner', 'oai-authenticated-user-email': 'owner@localhost'};
// إعداد كلمة المرور تلقائيًا — لكن بدون حقن الجلسة، فتظهر شاشة كلمة المرور عند فتح لوحة الأدمن.
await worker.fetch(new Request(origin + '/api/admin/password/setup', {method: 'POST', headers: {...identity, 'Content-Type': 'application/json', 'X-Advisor-Request': 'admin', Origin: origin}, body: JSON.stringify({password: 'local-preview-password'})}), env);

function startServer(currentPort) {
  const currentOrigin = `http://localhost:${currentPort}`;
  const server = http.createServer(async (req, res) => {
    try {
      const chunks = []; for await (const chunk of req) chunks.push(chunk);
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === 'string') headers.set(key, value);
        else if (Array.isArray(value)) headers.set(key, value.join(', '));
      }
      for (const [key, value] of Object.entries(identity)) headers.set(key, value);

      const rawCookie = headers.get('Cookie') || '';
      if (rawCookie.includes('advisor-admin=')) {
        headers.set('Cookie', rawCookie.replace('advisor-admin=', '__Host-advisor-admin='));
      }
      const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks);
      const response = await worker.fetch(new Request(currentOrigin + req.url, {method: req.method, headers, body}), env);

      const outHeaders = {};
      for (const [key, value] of response.headers.entries()) {
        if (key.toLowerCase() === 'set-cookie') {
          const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [value];
          outHeaders['set-cookie'] = cookies.map(c => c.replace('__Host-advisor-admin', 'advisor-admin').replace(/;\s*Secure/gi, ''));
        } else {
          outHeaders[key] = value;
        }
      }
      res.writeHead(response.status, outHeaders);
      res.end(Buffer.from(await response.arrayBuffer()));
    } catch (error) {
      console.error(error); res.writeHead(500); res.end('Local preview error');
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[DEV] Port ${currentPort} is currently in use, trying port ${currentPort + 1}...`);
      startServer(currentPort + 1);
    } else {
      console.error(err);
    }
  });

  server.listen(currentPort, '127.0.0.1', () => {
    console.log(`Site:  ${currentOrigin}/`);
    console.log(`Admin: ${currentOrigin}/admin`);
    console.log('Local preview only - edits are kept in memory and lost when you stop (Ctrl+C).');
  });
}

startServer(port);
