/** ربط المحتوى المنشور بقاعدة البيانات مع محول يحافظ على واجهة الموقع الأصلية. */
(() => {
  const projects = new Map(), logos = new Map(), sections = new Map();
  const select = (pair,lang) => pair?.[lang] || pair?.en || pair?.ar || '';
  function projectData(item,lang) {
    const output={id:item.id,number:String(item.order).padStart(2,'0'),year:item.year,heroImage:item.heroImage,boardImage:item.boardImage};
    ['title','category','subtitle','client','location','summary','challenge','approach','creativeDirection'].forEach(k=>output[k]=select(item[k],lang));
    output.services=item.services.map(p=>select(p,lang));
    output.results=item.results.map(r=>({label:select(r.label,lang),value:select(r.value,lang),desc:select(r.desc,lang)}));
    output.gallery=item.gallery.map(g=>({src:g.src,caption:select(g.caption,lang),ratio:g.ratio}));
    return output;
  }
  function logoData(item,lang) {return {id:item.id,name:select(item.name,lang),industry:select(item.industry,lang),logo:item.logo};}
  const legacy = item => {
    if (typeof item === 'string') return window.AdvisorI18n?.t(item) || item;
    if (Array.isArray(item)) return item.map(legacy);
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).map(([key,value])=>[key,legacy(value)]));
    return item;
  };
  window.AdvisorContent={
    project:source=>projects.has(source.id)?projectData(projects.get(source.id),window.AdvisorI18n?.language||'en'):legacy(source),
    client:source=>logos.has(source.id)?logoData(logos.get(source.id),window.AdvisorI18n?.language||'en'):legacy(source),
    // أقسام الصفحة الرئيسية المحفوظة من اللوحة؛ site-sections.js يعرضها.
    section:id=>sections.get(id),
    hasSections:()=>sections.size>0,
    select,
    whatsapp:()=>sections.get('contact')?.whatsapp||window.ADVISOR_CONFIG.whatsappNumber,
    // حماية المواضع القديمة التي تستخدم قوالب HTML. بقية النصوص تُكتب بـtextContent.
    escape:value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
  };
  window.AdvisorContentReady=(async()=>{
    try {
      const response=await fetch('/api/content',{cache:'no-store',signal:AbortSignal.timeout(12000)});
      if(!response.ok)throw new Error('content unavailable');
      const data=await response.json();
      data.projects.forEach(({data:item})=>projects.set(item.id,item));data.logos.forEach(({data:item})=>logos.set(item.id,item));data.sections?.forEach(({data:item})=>sections.set(item.id,item));
      window.ADVISOR_PROJECTS=data.projects.map(({data:item})=>projectData(item,'en'));
      window.ADVISOR_CLIENTS=data.logos.map(({data:item})=>logoData(item,'en'));
    } catch {
      // النسخة المرفقة تظل متاحة عند فتح الملفات محلياً؛ على الاستضافة يظهر تنبيه واضح للتحديثات.
      if(location.protocol!=='file:') {
        const notice=document.createElement('p');notice.className='content-status';notice.setAttribute('role','status');
        const update=()=>notice.textContent=document.documentElement.lang==='ar'?'تعذر تحميل أحدث التعديلات. حدّثي الصفحة للمحاولة مرة أخرى.':'Latest updates could not be loaded. Refresh the page to try again.';
        update();document.addEventListener('advisor:languagechange',update);document.querySelector('#work .container')?.prepend(notice);
      }
    }
  })();
})();
