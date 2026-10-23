/** واجهة الأدمن: نستخدم عناصر DOM ونصوصاً صريحة حتى لا يتحول المحتوى المدخل إلى HTML قابل للتنفيذ. */
(() => {
  const $ = id => document.getElementById(id);
  let language = 'ar';
  try {language = localStorage.getItem('advisor-admin-language') || 'ar';} catch {}
  const t = (ar,en) => language === 'ar' ? ar : en;
  const value = pair => pair?.[language] || pair?.en || pair?.ar || '';
  const clone = item => structuredClone(item);
  const emptyPair = () => ({en:'',ar:''});
  let content = {sections:[],projects:[],logos:[]}, kind = 'sections', draft = null, version = 0, dirty = false, saving = false, pendingUploads = 0, ready = false;
  let toastTimer;
  const messages = {
    password_required:['اللوحة مقفلة. أدخلي كلمة المرور ثم أعيدي المحاولة.','The admin is locked. Enter your password, then try again.'],
    storage_unavailable:['الخدمة غير متاحة حالياً. احتفظنا بالتعديلات؛ حاولي مرة أخرى.','The service is unavailable. Your edits are still here; please try again.'],
    sign_in_required:['انتهت جلسة الدخول. سجّلي الدخول ثم أعيدي المحاولة.','Your session has ended. Sign in, then try again.'],
    admin_only:['هذا الحساب لا يملك صلاحية التعديل.','This account does not have editing access.'],
    admin_not_configured:['حساب الأدمن غير مهيأ بعد.','The admin account is not configured yet.'],
    invalid_data:['راجعي الحقول وحدود عدد العناصر ثم حاولي مرة أخرى.','Check the fields and item limits, then try again.'],
    invalid_image:['اختاري صورة صالحة لكل صورة مطلوبة.','Choose a valid image for every required image field.'],
    unsupported_image:['الصور المدعومة: PNG وJPG وWebP.','Supported images: PNG, JPG, and WebP.'],
    file_too_large:['الصورة أكبر من الحد المسموح للاستضافة.','This image exceeds the hosting upload limit.'],
    english_title_required:['الاسم والمجال بالإنجليزية مطلوبان.','The English name and category are required.'],
    invalid_phone:['رقم الهاتف أو واتساب غير صالح. رقم واتساب أرقام فقط بالصيغة الدولية دون +، مثل 201599990398.','The phone or WhatsApp number is not valid. WhatsApp takes digits only in international format without +, e.g. 201599990398.'],
    invalid_link:['روابط حسابات التواصل يجب أن تبدأ بـ https://','Social links must start with https://'],
    version_conflict:['تم تعديل هذا العنصر من مكان آخر. لم نكتب فوق التعديل الأحدث. احتفظي بنصوصك ثم حمّلي النسخة الأحدث.','This item changed elsewhere. We did not overwrite the newer version. Keep a copy of your edits, then load the latest version.'],
    invalid_request:['تعذر قبول الطلب. افتحي اللوحة من رابط الموقع ثم حاولي مجدداً.','The request could not be accepted. Open the admin page from the site and try again.'],
    password_short:['استخدمي كلمة مرور من 12 حرفاً على الأقل.','Use at least 12 characters.'],
    password_incorrect:['كلمة المرور الحالية غير صحيحة.','Current password incorrect.'],
    password_invalid:['راجعي كلمة المرور المدخلة.','Check the password you entered.']
  };
  const message = error => t(...(messages[error.code] || messages.storage_unavailable));

  // تعريف أقسام الصفحة الرئيسية بترتيب ظهورها. المفاتيح تطابق SECTION_FIELDS في server/worker.mjs.
  const P = (key,ar,en,options={}) => ({type:'pair',key,ar,en,...options});
  const T = (key,ar,en,options={}) => ({type:'text',key,ar,en,...options});
  const L = (key,ar,en,max,item,add) => ({type:'list',key,ar,en,max,item,add});
  const word = (ar,en) => ({type:'pair',ar,en});
  const heading = [P('tag','الوسم الصغير فوق العنوان','Small label above the headline'),P('title','العنوان','Headline'),P('titleAccent','الجزء الملوّن من العنوان','Highlighted part of the headline')];
  const lineHelp = ['في الحقول متعددة الأسطر، كل سطر تكتبينه يظهر سطراً مستقلاً على الموقع.','In multi-line fields, each line you type shows as its own line on the site.'];
  const SECTIONS = {
    brand:{ar:'الهوية والبحث',en:'Brand & search',anchor:'',about:['الشعار واسم العلامة وزر البداية، وعنوان الصفحة في محركات البحث.','Logo, brand name, header button, and the page title in search results.'],groups:[
      {ar:'الشعار والاسم',en:'Logo and name',fields:[{type:'image',key:'logo',ar:'الشعار — يظهر في الرأس والتذييل وأيقونة المتصفح *',en:'Logo — header, footer and browser tab *'},T('name','اسم العلامة','Brand name',{required:true}),P('subtitle','السطر الصغير تحت الاسم','Line under the name'),P('ctaLabel','زر «ابدأ مشروعك» في الرأس وقائمة الموبايل','"Start a project" button in the header and mobile menu')]},
      {ar:'الخطوط والتصميم',en:'Typography and design',fields:[T('fontTheme','نوع الخط','Font theme',{input:'select',options:[{value:'modern',ar:'الحديث (الافتراضي)',en:'Modern (Default)'},{value:'classic',ar:'الكلاسيكي الأنيق',en:'Classic Elegance'},{value:'arabic',ar:'العربي (Cairo/Tajawal)',en:'Arabic (Cairo/Tajawal)'}]})]},
      {ar:'محركات البحث',en:'Search engines',fields:[P('siteTitle','عنوان الصفحة','Page title'),P('siteDescription','وصف الصفحة','Page description',{area:'short'})]}
    ]},
    hero:{ar:'المقدمة',en:'Hero',anchor:'#hero',about:['العنوان الرئيسي والأزرار الأولى والشريط المتحرك.','The main headline, first buttons and the moving ticker.'],groups:[
      {ar:'العنوان',en:'Headline',fields:[P('tag','الوسم الصغير','Small label'),L('lines','سطور العنوان — السطر الثاني والرابع بلون متدرج','Headline lines — every second line is highlighted',6,word('السطر','Line'),['+ إضافة سطر','+ Add line']),P('subcopy','الفقرة تحت العنوان','Paragraph under the headline',{area:'short'})]},
      {ar:'الأزرار',en:'Buttons',fields:[P('primaryCta','زر «اكتشف أعمالنا»','"Explore our work" button'),P('secondaryCta','زر «ابدأ مشروعك»','"Start a project" button'),P('scrollPrompt','نص «مرّر لاكتشاف المزيد»','"Scroll to explore" text')]},
      {ar:'الشريط المتحرك',en:'Moving ticker',fields:[L('ticker','كلمات الشريط','Ticker words',20,word('الكلمة','Word'),['+ إضافة كلمة','+ Add word'])]}
    ]},
    about:{ar:'من نحن',en:'About',anchor:'#about',about:['فلسفة الوكالة والأرقام البارزة والكلمات الكبيرة المتحركة.','Agency philosophy, highlighted figures and the large moving words.'],groups:[
      {ar:'العنوان والنص',en:'Headline and text',fields:[...heading,P('lead','الفقرة الرئيسية','Lead paragraph',{area:true}),P('body','الفقرة الثانية','Second paragraph',{area:true})]},
      {ar:'الأرقام البارزة',en:'Highlighted figures',fields:[L('stats','الأرقام','Figures',4,[P('value','الرقم','Figure'),P('label','الوصف','Label')],['+ إضافة رقم','+ Add figure'])]},
      {ar:'الكلمات المتحركة',en:'Moving words',fields:[L('words','الكلمات — كل كلمة ثانية ملوّنة','Words — every second word is highlighted',10,word('الكلمة','Word'),['+ إضافة كلمة','+ Add word'])]}
    ]},
    vision:{ar:'الرؤية والرسالة',en:'Vision & mission',anchor:'#vision',about:['لوحتا الرؤية والرسالة والركائز الأربع.','The vision and mission panels and their pillars.'],groups:[
      {ar:'العنوان',en:'Headline',fields:heading},
      {ar:'لوحة الرؤية',en:'Vision panel',fields:[P('visionTag','الوسم الصغير','Small label'),P('visionTitle','العنوان','Title'),P('visionQuote','الاقتباس','Quote',{area:'short'}),P('visionBody','النص','Text',{area:true}),L('visionKeywords','الكلمات أسفل اللوحة','Keywords under the panel',4,word('الكلمة','Keyword'),['+ إضافة كلمة','+ Add keyword'])]},
      {ar:'لوحة الرسالة',en:'Mission panel',fields:[P('missionTag','الوسم الصغير','Small label'),P('missionTitle','العنوان','Title'),P('missionQuote','الاقتباس','Quote',{area:'short'}),L('pillars','الركائز — تُرقّم تلقائياً بالترتيب','Pillars — numbered automatically in order',6,[P('label','التصنيف','Label'),P('name','الاسم','Name'),P('desc','الوصف','Description',{area:'short'})],['+ إضافة ركيزة','+ Add pillar']),L('missionKeywords','الكلمات أسفل اللوحة','Keywords under the panel',4,word('الكلمة','Keyword'),['+ إضافة كلمة','+ Add keyword'])]}
    ]},
    services:{ar:'الخدمات',en:'Services',anchor:'#services',about:['قائمة الخدمات ووصف كل خدمة.','The service list and each service description.'],groups:[
      {ar:'العنوان',en:'Headline',fields:heading},
      {ar:'قائمة الخدمات',en:'Service list',fields:[L('items','الخدمات — تُرقّم تلقائياً بالترتيب','Services — numbered automatically in order',20,[P('title','اسم الخدمة','Service name'),P('desc','الوصف','Description',{area:'short'})],['+ إضافة خدمة','+ Add service'])]}
    ]},
    work:{ar:'عنوان الأعمال المختارة',en:'Selected work heading',anchor:'#work',about:['عنوان قسم المشاريع. المشاريع نفسها في تبويب «المشاريع».','The projects section heading. Projects themselves are in the Projects tab.'],groups:[
      {ar:'العنوان',en:'Headline',fields:[...heading,P('dragHint','تلميح السحب أسفل المشاريع','Drag hint under the projects'),P('countLabel','النص بجانب عدد المشاريع','Text next to the project count')]}
    ]},
    why:{ar:'لماذا ADVISOR',en:'Why Advisor',anchor:'#why-advisor',about:['أسباب اختيار الوكالة.','The reasons to choose the agency.'],groups:[
      {ar:'العنوان',en:'Headline',fields:[...heading,P('lead','الفقرة','Paragraph',{area:'short'})]},
      {ar:'الأسباب',en:'Reasons',help:lineHelp,fields:[L('items','الأسباب — تُرقّم تلقائياً بالترتيب','Reasons — numbered automatically in order',12,[P('claim','العبارة','Statement',{area:'short'}),P('detail','التوضيح','Detail',{area:'short'})],['+ إضافة سبب','+ Add reason'])]}
    ]},
    clients:{ar:'عنوان العملاء',en:'Clients heading',anchor:'#clients',about:['عنوان قسم العملاء. الشعارات في تبويب «شعارات العملاء».','The clients section heading. Logos are in the Client logos tab.'],groups:[
      {ar:'العنوان',en:'Headline',fields:heading}
    ]},
    statement:{ar:'عبارة ADVISOR',en:'Advisor creed',anchor:'#creed',about:['العبارة الكبيرة قبل قسم التواصل.','The large statement before the contact section.'],groups:[
      {ar:'العبارة',en:'Statement',help:lineHelp,fields:[P('tag','الوسم الصغير','Small label'),P('quote','السطر الأول','First line'),P('quoteAccent','السطر الملوّن','Highlighted line'),P('subquote','النص الصغير','Small text',{area:'short'})]}
    ]},
    contact:{ar:'التواصل',en:'Contact',anchor:'#contact',about:['رقم الهاتف وواتساب ومواعيد العمل وعنوان النموذج.','Phone, WhatsApp, working hours and the form title.'],groups:[
      {ar:'بيانات التواصل',en:'Contact details',help:['رقم الهاتف يظهر في التواصل والتذييل وقائمة الموبايل. رقم واتساب يستقبل رسائل نموذج الاستفسار.','The phone number shows in Contact, the footer and the mobile menu. The WhatsApp number receives inquiry form messages.'],fields:[T('phone','رقم الهاتف','Phone number',{input:'tel',placeholder:'01599990398'}),T('whatsapp','رقم واتساب — دولي، أرقام فقط دون +','WhatsApp number — international, digits only, no +',{inputmode:'numeric',pattern:'[0-9]{8,15}',placeholder:'201599990398'}),P('phoneLabel','عنوان بطاقة الاتصال','Contact card label'),P('officeNote','المكتب ومواعيد العمل','Office and working hours'),P('whatsappCta','زر واتساب','WhatsApp button')]},
      {ar:'العنوان',en:'Headline',help:lineHelp,fields:[...heading,P('philosophy','العبارة تحت العنوان','Line under the headline',{area:'short'}),P('formTitle','عنوان نموذج الاستفسار','Inquiry form title')]}
    ]},
    footer:{ar:'التذييل',en:'Footer',anchor:'#footer',about:['وصف الوكالة والموقع وحسابات التواصل وحقوق النشر.','Agency description, website, social channels and copyright.'],groups:[
      {ar:'النصوص',en:'Text',fields:[P('tagline','الشعار النصي','Tagline'),P('description','الوصف','Description',{area:'short'}),T('website','الموقع الإلكتروني المعروض','Website shown',{placeholder:'www.advisoregypt.com'}),P('location','المدينة','Location'),P('copyright','حقوق النشر','Copyright line',{area:'short'})]},
      {ar:'حسابات التواصل',en:'Social channels',fields:[L('socials','الحسابات','Channels',8,[P('label','الاسم','Name'),T('url','الرابط — يبدأ بـ https://','Link — starts with https://',{input:'url',pattern:'https://.+',placeholder:'https://'})],['+ إضافة حساب','+ Add channel'])]}
    ]}
  };
  const sectionFields = id => SECTIONS[id]?.groups.flatMap(group => group.fields) || [];
  const defaultFor = field => field.type === 'pair' ? emptyPair() : field.type === 'list' ? [] : '';
  const blank = item => Array.isArray(item) ? Object.fromEntries(item.map(field => [field.key,defaultFor(field)])) : defaultFor(item);
  // سجل محفوظ قبل إضافة حقل جديد يُكمَّل بقيم فارغة حتى يقبله الخادم عند الحفظ.
  function fill(fields,target) {
    for (const field of fields) {
      if (target[field.key] === undefined) target[field.key] = defaultFor(field);
      if (field.type === 'list' && Array.isArray(field.item)) target[field.key].forEach(item => fill(field.item,item));
    }
  }
  function preview(item) {
    const parts = {brand:[item.siteTitle],hero:item.lines,statement:[item.quote,item.quoteAccent],footer:[item.tagline]}[item.id] || [item.title,item.titleAccent];
    return (parts || []).map(value).join(' ').replace(/\s+/g,' ').trim();
  }

  function node(tag, cls, text) {const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
  function button(label, action, cls='button quiet') {const el=node('button',cls,label);el.type='button';el.addEventListener('click',action);return el;}
  function toast(text) {clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
  function markDirty() {dirty=true;updateSaveState();}
  function updateSaveState() {
    $('save').disabled=saving || pendingUploads>0;
    $('saveStatus').textContent=saving?t('جارٍ الحفظ…','Saving…'):pendingUploads?t('جارٍ رفع الصور…','Uploading images…'):dirty?t('تغييرات غير محفوظة','Unsaved changes'):t('كل التغييرات محفوظة','All changes saved');
  }
  async function api(path,options={}) {
    let response;
    try {response=await fetch(path,{credentials:'same-origin',cache:'no-store',...options,headers:{'X-Advisor-Request':'admin',...(options.headers||{})}});}
    catch {throw {code:'storage_unavailable'};}
    let body;try {body=await response.json();} catch {throw {code:response.status===401?'sign_in_required':'storage_unavailable'};}
    if(!response.ok) throw {code:body.error || 'storage_unavailable',status:response.status};
    return body;
  }

  // تبديل لغة اللوحة لا يغيّر لغة المحتوى؛ حقلا العربي والإنجليزي يظلان متاحين معاً.
  function applyLanguage() {
    document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-ar][data-en]').forEach(el=>el.textContent=el.dataset[language]);
    $('language').textContent=language==='ar'?'English':'العربية';
    document.title=t('ADVISOR — إدارة المحتوى','ADVISOR — Content studio');
    if(draft) renderEditor(); else renderList();
  }
  $('language').addEventListener('click',()=>{if(saving||pendingUploads)return;language=language==='ar'?'en':'ar';try{localStorage.setItem('advisor-admin-language',language);}catch{}applyLanguage();});
  function canLeave() {
    if(saving||pendingUploads){toast(t('انتظري اكتمال الحفظ أو الرفع أولاً.','Wait for saving or uploads to finish.'));return false;}
    return !dirty || confirm(t('توجد تغييرات غير محفوظة. هل تريدين تركها؟','Discard your unsaved changes?'));
  }
  function switchSection(next) {
    if(!canLeave())return;
    if(next==='trash') { $('trashTab').click(); return; }
    draft=null;dirty=false;kind=next;$('editorView').hidden=true;$('trashView').hidden=true;$('listView').hidden=false;renderList();window.scrollTo(0,0);
  }
  $('sectionsTab').addEventListener('click',()=>switchSection('sections'));
  $('projectsTab').addEventListener('click',()=>switchSection('projects'));
  $('logosTab').addEventListener('click',()=>switchSection('logos'));
  $('trashTab').addEventListener('click', async () => {
    if(!canLeave())return;draft=null;dirty=false;kind='trash';
    $('editorView').hidden=true;$('listView').hidden=true;$('trashView').hidden=false;
    ['sections','projects','logos','trash'].forEach(k=>{const el=$(k+'Tab');el.classList.toggle('active',kind===k);if(kind===k)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    
    const container = $('trashItems');
    container.replaceChildren(node('p','muted',t('جارٍ التحميل...','Loading...')));
    try {
      const data = await api('/api/admin/trash');
      container.replaceChildren();
      if (!data.items.length && !data.media.length) {
        container.append(node('p','muted',t('سلة المهملات فارغة.','Trash is empty.')));
        return;
      }
      const renderItem = (title, type, id, kindOrKey, isMedia) => {
        const card=node('article','item-card'), body=node('div','card-body');
        body.append(node('h2','',title), node('p','muted',type));
        const footer=node('div','card-footer');
        footer.append(
          button(t('استعادة ♻️','Restore ♻️'), async ()=>{
            if(saving)return; saving=true;
            try {
              await api(`/api/admin/trash/restore/${isMedia?'media':kindOrKey}/${id}`, {method:'POST'});
              toast(t('تمت الاستعادة بنجاح.','Restored successfully.'));
              $('trashTab').click(); load();
            } catch(e) { showEditorError(e); }
            finally { saving=false; }
          },'button'),
          button(t('حذف نهائي ❌','Delete ❌'), async ()=>{
            if(saving)return;
            if(!confirm(t('سيتم تدمير العنصر نهائياً، هل توافقين؟','Permanently destroy this item?')))return;
            saving=true;
            try {
              await api(`/api/admin/trash/permanent/${isMedia?'media':kindOrKey}/${id}`, {method:'DELETE'});
              toast(t('تم الحذف النهائي.','Permanently deleted.'));
              $('trashTab').click();
            } catch(e) { showEditorError(e); }
            finally { saving=false; }
          },'button danger')
        );
        body.append(footer); card.append(body); container.append(card);
      };
      data.items.forEach(item => {
        const title = value(item.data.title || item.data.name) || item.id;
        renderItem(title, item.kind==='projects'?t('مشروع','Project'):t('شعار','Logo'), encodeURIComponent(item.id), item.kind, false);
      });
      data.media.forEach(m => {
        renderItem(m.filename, t('صورة ('+Math.round(m.size/1024)+' KB)','Image ('+Math.round(m.size/1024)+' KB)'), m.key, 'media', true);
      });
    } catch (e) {
      container.replaceChildren(node('p','error',message(e)));
    }
  });
  $('back').addEventListener('click',()=>switchSection(kind));
  window.addEventListener('beforeunload',event=>{if(dirty||pendingUploads){event.preventDefault();event.returnValue='';}});

  async function load() {
    ready=false;$('loading').hidden=false;$('loadError').hidden=true;$('items').replaceChildren();$('addItem').disabled=true;
    try {
      const [session,data]=await Promise.all([api('/api/admin/session'),api('/api/admin/content')]);
      window.advisorMaxUploadBytes=session.maxUploadBytes||3*1024*1024;content={sections:[],...data};$('accountEmail').textContent=session.email;ready=true;renderList();
    } catch(error) {
      $('loadError').hidden=false;$('loadErrorText').textContent=message(error);$('signinLink').hidden=!['sign_in_required','password_required'].includes(error.code);
    } finally {$('loading').hidden=true;}
  }
  $('retry').addEventListener('click',load);
  const headings = {
    sections:[['أقسام الموقع','Site sections'],['كل نص وصورة في الصفحة الرئيسية، مرتبة كما تظهر من الأعلى إلى الأسفل.','Every text and image on the home page, in the order they appear from top to bottom.']],
    projects:[['المشاريع','Projects'],['قصص أعمالكم وصورها، في مكان واحد.','Your project stories and images, in one place.']],
    logos:[['شعارات العملاء','Client logos'],['أضيفي شعاراً أو حدّثي بيانات وصور العملاء الحاليين.','Add a logo or update existing client details and images.']]
  };
  function renderList() {
    $('sectionCount').textContent=ready?content.sections.length:'—';$('projectCount').textContent=ready?content.projects.length:'—';$('logoCount').textContent=ready?content.logos.length:'—';
    ['sections','projects','logos','trash'].forEach(k=>{const el=$(k+'Tab');el.classList.toggle('active',kind===k);if(kind===k)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    $('listTitle').textContent=t(...headings[kind][0]);$('listDescription').textContent=t(...headings[kind][1]);
    $('addItem').hidden=kind==='sections';$('addItem').textContent=kind==='projects'?t('+ إضافة مشروع','+ Add project'):t('+ إضافة شعار','+ Add logo');$('addItem').disabled=!ready;
    const container=$('items');container.replaceChildren();if(!ready)return;
    if(kind==='sections'){
      // الأقسام ثابتة العدد: تعديل فقط، مع مقتطف من النص الحالي ورابط لمكانها على الموقع.
      content.sections.filter(record=>SECTIONS[record.data.id]).forEach(record=>{
        const spec=SECTIONS[record.data.id],card=node('article','item-card section-card'),body=node('div','card-body');
        body.append(node('span','card-meta',String(record.data.order).padStart(2,'0')+' / '+t('الصفحة الرئيسية','Home page')),node('h2','',t(spec.ar,spec.en)),node('p','muted',t(...spec.about)));
        const snippet=preview(record.data);if(snippet)body.append(node('p','card-preview',snippet));
        const footer=node('div','card-footer'),view=node('a','button quiet',t('عرض على الموقع ↗','View on site ↗'));view.href='/'+spec.anchor;view.target='_blank';view.rel='noopener';
        footer.append(button(t('تعديل','Edit'),()=>openEditor(record),'button'),view);body.append(footer);card.append(body);container.append(card);
      });
      return;
    }
    if(!content[kind].length){container.append(node('p','muted',t('لا توجد عناصر بعد. ابدئي بإضافة أول عنصر.','No items yet. Add your first item.')));return;}
    content[kind].forEach(record=>{
      const item=record.data,card=node('article','item-card'+(kind==='logos'?' logo':'')),image=node('div','card-image'),img=node('img');
      img.src=kind==='projects'?item.heroImage:item.logo;img.alt=value(item.title||item.name);img.loading='lazy';image.append(img);card.append(image);
      const body=node('div','card-body');body.append(node('span','card-meta',String(item.order).padStart(2,'0')+(item.year?' / '+item.year:'')),node('h2','',value(item.title||item.name)),node('p','muted',value(item.category||item.industry)));
      const footer=node('div','card-footer');footer.append(button(t('تعديل','Edit'),()=>openEditor(record),'button'),node('span','muted',kind==='projects'?`${item.gallery.length} ${t('صور','images')}`:t('شعار عميل','Client logo')));body.append(footer);card.append(body);container.append(card);
    });
  }
  function openEditor(record) {
    draft=clone(record.data);version=record.version;dirty=false;if(kind==='sections')fill(sectionFields(draft.id),draft);
    $('listView').hidden=true;$('editorView').hidden=false;$('editorError').hidden=true;renderEditor();window.scrollTo(0,0);
  }
  $('addItem').addEventListener('click',()=>{
    const item={id:crypto.randomUUID(),order:Math.max(0,...content[kind].map(r=>r.data.order))+1};
    if(kind==='projects'){
      Object.assign(item,{year:String(new Date().getFullYear()),heroImage:'',boardImage:'',services:[],gallery:[],results:[]});
      ['title','category','subtitle','client','location','summary','challenge','approach','creativeDirection'].forEach(k=>item[k]=emptyPair());
    }else Object.assign(item,{name:emptyPair(),industry:emptyPair(),logo:''});
    openEditor({data:item,version:0});dirty=true;updateSaveState();
  });

  // مولدات حقول صغيرة قابلة لإعادة الاستخدام، بدلاً من تكرار نموذج لكل مشروع.
  function section(ar,en) {const el=node('section','form-section');el.append(node('h2','',t(ar,en)));return el;}
  function inputField(label,initial,onInput,{area=false,lang='',required=false,type='text',pattern='',placeholder='',inputmode='',options=[]}={}) {
    const labelEl=node('label','field');
    labelEl.append(node('span','',label));
    let control;
    if (type === 'select') {
      control = node('select');
      options.forEach(opt => {
        const o = node('option', '', t(opt.ar, opt.en));
        o.value = opt.value;
        control.append(o);
      });
      control.value = initial || options[0].value;
      control.addEventListener('change',()=>{onInput(control.value);markDirty();});
    } else {
      control = node(area?'textarea':'input');
      if(!area)control.type=type;control.value=initial??'';control.required=required;
      if(area==='short')control.className='short';
      if(lang){control.lang=lang;control.dir=lang==='ar'?'rtl':'ltr';}
      if(type==='number'){control.min='0';control.max='100000';control.step='1';}
      if(pattern)control.pattern=pattern;if(placeholder)control.placeholder=placeholder;if(inputmode)control.inputMode=inputmode;
      control.maxLength=area?10000:500;
      control.addEventListener('input',()=>{onInput(type==='number'?Number(control.value):control.value);markDirty();});
    }
    labelEl.append(control);return labelEl;
  }
  function pairFields(labelAr,labelEn,pair,{area=false,required=false}={}) {
    const row=node('div','pair-fields');
    for(const lang of ['ar','en'])row.append(inputField(`${t(labelAr,labelEn)} · ${lang==='ar'?'العربية':'English'}${required&&lang==='en'?' *':''}`,pair[lang],v=>pair[lang]=v,{area,lang,required:required&&lang==='en'}));
    return row;
  }
  async function uploadFile(file) {
    if(file.size>(window.advisorMaxUploadBytes||3*1024*1024))throw {code:'file_too_large'};
    if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw {code:'unsupported_image'};
    const form=new FormData();form.set('file',file);return api('/api/admin/uploads',{method:'POST',body:form});
  }
  function uploadPicker(label,onFiles,multiple=false) {
    const wrap=node('span'),input=node('input','upload-input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.multiple=multiple;input.tabIndex=-1;
    const trigger=button(label,()=>input.click(),'button');wrap.append(trigger,input);
    input.addEventListener('change',async()=>{
      const files=[...input.files];if(!files.length)return;
      pendingUploads++;updateSaveState();trigger.disabled=true;
      try{await onFiles(files);markDirty();toast(t('تم رفع الصورة. احفظي التغييرات لإظهارها على الموقع.','Image uploaded. Save your changes to show it on the site.'));}
      catch(error){showEditorError(error);}
      finally{pendingUploads--;input.value='';trigger.disabled=false;updateSaveState();}
    });return wrap;
  }
  function imageEditor(labelAr,labelEn,url,onChange,optional=false) {
    const wrapper=node('div','image-edit'),preview=node('div'),actions=node('div');
    function draw(src){
      preview.replaceChildren();
      if(src){const img=node('img');img.src=src;img.alt=t(labelAr,labelEn);preview.append(img);}
      else preview.append(node('div','image-empty',t('لا توجد صورة','No image')));
      actions.replaceChildren();
      actions.append(node('p','',t(labelAr,labelEn)));
      const btns = node('div'); btns.style.display = 'flex'; btns.style.gap = '0.5rem'; btns.style.marginBottom = '0.5rem';
      btns.append(uploadPicker(src?t('استبدال','Replace'):t('رفع صورة','Upload image'),async files=>{const result=await uploadFile(files[0]);onChange(result.url);draw(result.url);}));
      if(src) {
        btns.append(button(t('إزالة للسلة','Trash'),async ()=>{
          if(!confirm(t('هل تريد نقل الصورة للسلة؟','Move image to trash?')))return;
          const key=src.split('/').pop();
          try {
            await api('/api/admin/media/'+key,{method:'DELETE'});
            toast(t('نُقلت للسلة.','Moved to trash.'));
            onChange('');draw('');markDirty();
          } catch(e){ showEditorError(e); }
        },'button danger'));
      }
      actions.append(btns, node('small','',t('PNG أو JPG أو WebP · حتى ','PNG, JPG, or WebP · up to ')+Math.floor((window.advisorMaxUploadBytes||3*1024*1024)/1024/1024)+' MB'));
    }
    draw(url); wrapper.append(preview,actions); return wrapper;
  }
  function collection(parent,items,renderRow,newItem,labelAr,labelEn,max) {
    const list=node('div','gallery-list');
    function draw(){list.replaceChildren();items.forEach((item,index)=>{
      const row=node('div','collection-row'),actions=node('div','row-actions');
      const up=button(t('↑ لأعلى','↑ Move up'),()=>{[items[index-1],items[index]]=[items[index],items[index-1]];markDirty();draw();});up.disabled=index===0;
      const down=button(t('↓ لأسفل','↓ Move down'),()=>{[items[index+1],items[index]]=[items[index],items[index+1]];markDirty();draw();});down.disabled=index===items.length-1;
      actions.append(up,down,button(t('إزالة','Remove'),()=>{if(pendingUploads)return;items.splice(index,1);markDirty();draw();},'button danger'));
      row.append(actions);renderRow(row,item,index);list.append(row);
    });}
    parent.append(list);if(newItem)parent.append(button(t(labelAr,labelEn),()=>{if(items.length>=max){toast(t('وصلتِ للحد الأقصى لهذا القسم.','This section has reached its item limit.'));return;}items.push(newItem());markDirty();draw();},'button add-row'));draw();return draw;
  }
  // يبني نموذج القسم من تعريفه في SECTIONS؛ القوائم تدعم الإضافة والحذف والترتيب.
  function renderFields(parent,fields,target) {
    for(const field of fields){
      if(field.type==='pair')parent.append(pairFields(field.ar,field.en,target[field.key],{area:field.area,required:field.required}));
      else if(field.type==='image')parent.append(imageEditor(field.ar,field.en,target[field.key],url=>target[field.key]=url));
      else if(field.type==='list'){
        const block=node('div','list-block');block.append(node('h3','',t(field.ar,field.en)));
        collection(block,target[field.key],(row,item)=>{if(Array.isArray(field.item))renderFields(row,field.item,item);else row.append(pairFields(field.item.ar,field.item.en,item,{area:field.item.area}));},()=>blank(field.item),...field.add,field.max);
        parent.append(block);
      }
      else parent.append(inputField(t(field.ar,field.en)+(field.required?' *':''),target[field.key],v=>target[field.key]=v,{lang:'en',required:field.required,type:field.input||'text',pattern:field.pattern,placeholder:field.placeholder,inputmode:field.inputmode,options:field.options||[]}));
    }
  }

  function renderEditor() {
    if(!draft)return;
    const spec=kind==='sections'?SECTIONS[draft.id]:null;
    $('editorTitle').textContent=spec?t(spec.ar,spec.en):version===0?(kind==='projects'?t('مشروع جديد','New project'):t('شعار جديد','New logo')):value(draft.title||draft.name);
    $('deleteItemBtn').hidden = (kind === 'sections' || version === 0);
    updateSaveState();const form=$('editorForm');form.replaceChildren();
    const fields=node('fieldset');fields.id='editorFields';fields.style.cssText='border:0;padding:0;margin:0;min-width:0';form.append(fields);
    if(spec){
      spec.groups.forEach(group=>{const box=section(group.ar,group.en);if(group.help)box.append(node('p','image-help',t(...group.help)));renderFields(box,group.fields,draft);fields.append(box);});
      return;
    }
    const basics=section('البيانات الأساسية','Basic details');
    if(kind==='logos'){
      basics.append(pairFields('اسم العميل','Client name',draft.name,{required:true}),pairFields('المجال','Industry',draft.industry),inputField(t('ترتيب الظهور','Display order'),draft.order,v=>draft.order=v,{type:'number'}),imageEditor('شعار العميل','Client logo',draft.logo,url=>draft.logo=url));fields.append(basics);return;
    }
    basics.append(pairFields('اسم المشروع','Project title',draft.title,{required:true}),pairFields('المجال','Category',draft.category,{required:true}),pairFields('وصف قصير','Subtitle',draft.subtitle),pairFields('العميل','Client',draft.client),pairFields('الموقع','Location',draft.location));
    const simple=node('div','simple-fields');simple.append(inputField(t('السنة','Year'),draft.year,v=>draft.year=v),inputField(t('ترتيب الظهور','Display order'),draft.order,v=>draft.order=v,{type:'number'}));basics.append(simple);fields.append(basics);
    const images=section('الغلاف وصور المشروع','Cover and project images');
    images.append(imageEditor('صورة بطاقة المشروع *','Project card image *',draft.heroImage,url=>draft.heroImage=url),imageEditor('الصورة الرئيسية داخل المشروع','Main case study image',draft.boardImage,url=>draft.boardImage=url,true));
    images.append(node('p','image-help',t('معرض المشروع: ارفعي عدة صور، واكتبي وصفاً لكل صورة. يمكن تغيير ترتيبها.','Project gallery: upload multiple images, add captions, and arrange their order.')));
    const drawGallery=collection(images,draft.gallery,(row,item)=>{row.append(imageEditor('صورة المعرض','Gallery image',item.src,url=>item.src=url),pairFields('وصف الصورة','Caption',item.caption));},null,'','',80);
    images.append(uploadPicker(t('+ إضافة صور للمعرض','+ Add gallery images'),async files=>{
      if(draft.gallery.length+files.length>80)throw {code:'invalid_data'};
      for(const file of files){const result=await uploadFile(file);draft.gallery.push({src:result.url,caption:emptyPair(),ratio:'1:1'});markDirty();drawGallery();}
    },true));fields.append(images);
    const story=section('قصة المشروع','Project story');
    [['summary','الملخص','Summary'],['challenge','التحدي','Challenge'],['approach','المنهج','Approach'],['creativeDirection','التوجه الإبداعي','Creative direction']].forEach(([key,ar,en])=>story.append(pairFields(ar,en,draft[key],{area:true})));fields.append(story);
    const services=section('الخدمات','Services');collection(services,draft.services,(row,item)=>row.append(pairFields('الخدمة','Service',item)),emptyPair,'+ إضافة خدمة','+ Add service',30);fields.append(services);
    const results=section('النتائج','Results');collection(results,draft.results,(row,item)=>row.append(pairFields('المؤشر','Metric',item.label),pairFields('القيمة','Value',item.value),pairFields('التوضيح','Description',item.desc,{area:true})),()=>({label:emptyPair(),value:emptyPair(),desc:emptyPair()}),'+ إضافة نتيجة','+ Add result',20);fields.append(results);
  }
  function showEditorError(error) {
    const box=$('editorError');box.replaceChildren(node('p','',message(error)));box.hidden=false;
    if(error.code==='sign_in_required'||error.code==='password_required'){const link=node('a','button',t('تسجيل الدخول في نافذة جديدة','Sign in in a new tab'));link.href='/admin';link.target='_blank';link.rel='noopener';box.append(link);}
    if(error.code==='version_conflict')box.append(button(t('تحميل النسخة الأحدث','Load latest version'),async()=>{
      if(!confirm(t('سيتم استبدال التعديلات غير المحفوظة بالنسخة الأحدث. متابعة؟','Replace your unsaved edits with the latest version?')))return;
      try{const latest=await api('/api/admin/content');content={sections:[],...latest};const record=content[kind].find(r=>r.data.id===draft.id);if(record)openEditor(record);}catch(error){showEditorError(error);}
    }));
    box.scrollIntoView({block:'center',behavior:'smooth'});
  }
  function missingImage() {
    if(kind==='projects')return !draft.heroImage;
    if(kind==='logos')return !draft.logo;
    return sectionFields(draft.id).some(field=>field.type==='image'&&!draft[field.key]);
  }
  $('editorForm').addEventListener('submit',async event=>{
    event.preventDefault();if(saving||pendingUploads||!draft)return;
    if(!$('editorForm').reportValidity())return;
    if(missingImage()){showEditorError({code:'invalid_image'});return;}
    saving=true;$('editorFields').disabled=true;$('editorError').hidden=true;updateSaveState();
    try{
      const saved=await api(`/api/admin/${kind}/${encodeURIComponent(draft.id)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:draft,version})});
      const index=content[kind].findIndex(record=>record.data.id===draft.id);if(index<0)content[kind].push(saved);else content[kind][index]=saved;
      content[kind].sort((a,b)=>a.data.order-b.data.order);version=saved.version;draft=clone(saved.data);dirty=false;
      toast(t('تم الحفظ. المحتوى المحدّث متاح الآن على الموقع.','Saved. Your updated content is now available on the site.'));renderEditor();
    }catch(error){showEditorError(error);}
    finally{saving=false;$('editorFields').disabled=false;updateSaveState();}
  });
  // قفل الجلسة يحذف صلاحيتها من قاعدة البيانات ومن المتصفح معاً.
  async function lock(next) {
    if(!canLeave())return;
    try{await api('/api/admin/password/logout',{method:'POST'});dirty=false;window.location.assign(next);}catch(error){toast(message(error));}
  }
  $('lockAdmin').addEventListener('click',()=>lock('/admin'));
  $('adminSignout').addEventListener('click',event=>{event.preventDefault();lock('/signout-with-chatgpt?return_to=%2F');});
  
  const cpModal = $('changePasswordModal');
  const cpForm = $('changePasswordForm');
  $('changePasswordBtn').addEventListener('click', () => {
    $('cpOld').value = '';
    $('cpNew').value = '';
    $('cpError').hidden = true;
    cpModal.showModal();
  });
  $('cpCancel').addEventListener('click', () => {
    cpModal.close();
  });
  cpForm.addEventListener('submit', async event => {
    event.preventDefault();
    if(saving||pendingUploads)return;
    const oldPassword = $('cpOld').value;
    const newPassword = $('cpNew').value;
    $('cpSubmit').disabled = true;
    $('cpError').hidden = true;
    try {
      await api('/api/admin/password/change', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({oldPassword, newPassword}) });
      cpModal.close();
      toast(t('تم تغيير كلمة المرور بنجاح.','Password changed successfully.'));
    } catch(error) {
      $('cpError').textContent = message(error);
      $('cpError').hidden = false;
    } finally {
      $('cpSubmit').disabled = false;
    }
  });

  $('deleteItemBtn').addEventListener('click', async () => {
    if(saving||pendingUploads||!draft||version===0)return;
    if(!confirm(t('هل أنت متأكدة من رغبتك في حذف هذا العنصر نهائياً؟','Are you sure you want to permanently delete this item?')))return;
    saving=true;$('editorFields').disabled=true;$('editorError').hidden=true;updateSaveState();
    try{
      await api(`/api/admin/${kind}/${encodeURIComponent(draft.id)}`,{method:'DELETE'});
      content[kind] = content[kind].filter(record=>record.data.id!==draft.id);
      dirty=false; draft=null;
      toast(t('تم الحذف بنجاح.','Deleted successfully.'));
      switchSection(kind);
    }catch(error){showEditorError(error);}
    finally{saving=false;if($('editorFields'))$('editorFields').disabled=false;updateSaveState();}
  });

  applyLanguage();load();
})();
