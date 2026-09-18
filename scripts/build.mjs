/** تجميع Worker خفيف مع الموقع الأصلي؛ بلا تغيير إطار الواجهة أو تحميل مكتبات جديدة للزائر. */
import {readFile,writeFile,mkdir,rm,cp} from 'node:fs/promises';
const read = p => readFile(p,'utf8');
await rm('dist',{recursive:true,force:true});
await mkdir('dist/server',{recursive:true});
await cp('public','dist/client',{recursive:true});

const data = `export const SEED = ${await read('server/seed.json')};\nexport const ADMIN_HTML = ${JSON.stringify(await read('server/admin.html'))};\nexport const PASSWORD_HTML = ${JSON.stringify(await read('server/password.html'))};\nexport const HOME_HTML = ${JSON.stringify(await read('public/index.html'))};\n`;
const worker = (await read('server/worker.mjs')).replace("import { SEED, ADMIN_HTML, HOME_HTML, PASSWORD_HTML } from './site-data.mjs';",data.replaceAll('export const ','const '));
await writeFile('dist/server/index.js',worker);
await mkdir('dist/.openai',{recursive:true});
await cp('.openai/hosting.json','dist/.openai/hosting.json');
await cp('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Worker, public assets, and migrations built.');
