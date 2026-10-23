import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
function fixture({referrer='https://advisor.example/admin',hash='',denied=false}={}) {
 const events=new Map();let saved=JSON.stringify({y:1800,time:Date.now()});
 const location={pathname:'/',origin:'https://advisor.example',hash,search:''};
 const element=()=>{const values=new Set();return {style:{},classList:{add:v=>values.add(v),remove:v=>values.delete(v),contains:v=>values.has(v)},setAttribute(){},addEventListener(){},focus(){},appendChild(){},querySelector(){return element()},querySelectorAll(){return []}}};
 const nodes=new Map();
 const document={body:element(),documentElement:{},referrer,fonts:{ready:Promise.resolve()},addEventListener(){},getElementById(id){if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)},querySelectorAll(){return []},createElement:element};
 const window={scrollY:0,location,AdvisorContentReady:Promise.resolve(),addEventListener(n,f){events.set(n,f)},removeEventListener(n){events.delete(n)},scrollTo({top}){this.scrollY=top},AdvisorContent:{escape:s=>s,project:p=>p},AdvisorI18n:{translate(){}}};
 const stack=[{hash:'',state:null}],history={state:null,pushState(state,_,hash){stack.push({state,hash});this.state=state;location.hash=hash},replaceState(state,_,hash){stack[stack.length-1]={state,hash};this.state=state;location.hash=hash.startsWith('#')?hash:''},back(){stack.pop();this.state=stack.at(-1).state;location.hash=stack.at(-1).hash;events.get('popstate')?.()}};
 const context={window,document,location,history,URL,Date,Promise,performance:{getEntriesByType:()=>[{type:'navigate'}]},sessionStorage:{getItem(){if(denied)throw Error();return saved},setItem(k,v){if(denied)throw Error();saved=v}},requestAnimationFrame:f=>f(),setTimeout};
 vm.createContext(context);vm.runInContext(fs.readFileSync('public/js/scroll-manager.js','utf8'),context);
 return {window,events,nodes,context,history,location,read:()=>JSON.parse(saved)};
}
test('home link restores position after content, explicit anchor wins',async()=>{
 let f=fixture();await f.events.get('pageshow')({persisted:false});assert.equal(f.window.scrollY,1800);
 f=fixture({hash:'#contact'});await f.events.get('pageshow')({persisted:false});assert.equal(f.window.scrollY,0);
});
test('nested locks retain position and synchronize Lenis',()=>{
 const f=fixture();let engineY=0;f.window.AdvisorScroll.attach({stop(){},start(){},scrollTo(y){engineY=y}});
 f.window.scrollY=2300;f.window.AdvisorScroll.lock('case');f.window.AdvisorScroll.lock('menu');f.window.scrollY=0;f.events.get('pagehide')();assert.equal(f.read().y,2300);
 f.window.AdvisorScroll.unlock('case');assert.equal(f.window.scrollY,0);f.window.AdvisorScroll.unlock('menu');assert.equal(f.window.scrollY,2300);assert.equal(engineY,2300);
});
test('denied storage, external arrival and BFCache retain current position',async()=>{
 for(const opts of [{denied:true},{referrer:'https://external.example'}]){const f=fixture(opts);await f.events.get('pageshow')({persisted:false});assert.equal(f.window.scrollY,0)}
 const f=fixture();f.window.scrollY=2500;await f.events.get('pageshow')({persisted:true});assert.equal(f.window.scrollY,2500);
});
test('browser Back closes project and returns to previous home position',()=>{
 const f=fixture();f.window.ADVISOR_PROJECTS=[{id:'demo',services:[],results:[],gallery:[]}];
 vm.runInContext(fs.readFileSync('public/js/case-study-modal.js','utf8'),f.context);
 f.window.scrollY=2100;f.window.openCaseStudy('demo');assert.equal(f.history.state.advisorCase,true);assert.equal(f.location.hash,'#case-demo');
 f.window.scrollY=0;f.history.back();assert.equal(f.window.scrollY,2100);assert.equal(f.nodes.get('caseStudyOverlay').classList.contains('is-active'),false);
});
