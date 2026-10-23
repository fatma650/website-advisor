/** محرك ترجمة مستقل عن التصميم: يحتفظ بالنص الأصلي ويترجم النصوص والخصائص دون كسر العناصر. */
(() => {
  const config = window.ADVISOR_CONFIG;
  const dictionary = window.ADVISOR_TRANSLATIONS;
  const originals = new WeakMap();
  const attributes = new WeakMap();
  let language = config.defaultLanguage;
  try { language = localStorage.getItem(config.storageKey) || language; } catch (_) { /* يعمل أيضاً عند منع التخزين. */ }
  if (!['en', 'ar'].includes(language)) language = 'en';

  // المفتاح هو النص الإنجليزي نفسه؛ النص غير المترجم يرجع للأصل بدلاً من الاختفاء.
  function t(text) {
    if (language === 'en') return text;
    const key = text.trim();
    const translated = dictionary[key] || key.replace(/^PROJECT (\d+)$/, 'مشروع $1').replace(/^NEXT UP — (\d+)$/, 'التالي — $1');
    return text.replace(key, translated);
  }

  // تعديل عقد النص يحافظ على الروابط والأيقونات وعلى مستمعات النقر الموجودة.
  function translate(root = document.body) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim() || node.parentElement.closest('script,style,[data-no-i18n]')) continue;
      if (!originals.has(node)) originals.set(node, node.textContent);
      node.textContent = t(originals.get(node));
    }
    root.querySelectorAll('[placeholder],[aria-label],[title],img[alt]').forEach(el => {
      if (el.closest('[data-no-i18n]')) return;
      const saved = attributes.get(el) || {};
      ['placeholder','aria-label','title','alt'].filter(a => el.hasAttribute(a)).forEach(a => {
        const current = el.getAttribute(a);
        // إذا غيّر عارض المشروع الخاصية، نلتقط الأصل الجديد بدل إعادة عنوان الصورة القديمة.
        if (!saved[a] || current !== saved[a].last) saved[a] = {source: current, last: current};
        saved[a].last = t(saved[a].source);
        el.setAttribute(a, saved[a].last);
      });
      attributes.set(el, saved);
    });
  }

  // تغيير اللغة يضبط اتجاه الصفحة ويحفظ تفضيل هذا المتصفح فقط.
  function setLanguage(next) {
    language = next === 'ar' ? 'ar' : 'en';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    try { localStorage.setItem(config.storageKey, language); } catch (_) {}
    translate(document.body);
    document.title = t('ADVISOR — Strategic Marketing & Creative Agency');
    const meta = document.querySelector('meta[name="description"]');
    if (!meta.dataset.original) meta.dataset.original = meta.content;
    meta.content = t(meta.dataset.original);
    document.querySelectorAll('[data-language-toggle]').forEach(button => {
      button.textContent = language === 'ar' ? 'English' : 'العربية';
      button.lang = language === 'ar' ? 'en' : 'ar';
      button.setAttribute('aria-label', language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    });
    document.dispatchEvent(new CustomEvent('advisor:languagechange', {detail: {language}}));
  }
  window.AdvisorI18n = {t, translate, setLanguage, get language() {return language;}};
  document.querySelectorAll('[data-language-toggle]').forEach(btn => btn.addEventListener('click', () => setLanguage(language === 'ar' ? 'en' : 'ar')));
  setLanguage(language);
})();
