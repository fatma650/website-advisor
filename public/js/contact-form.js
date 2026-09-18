/** نموذج الاستفسار: اختيار الخدمات وفتح مسودة واتساب بلغة الزائر. لا توجد خدمة إرسال خلفية. */
(() => {
  const form = document.getElementById('projectInquiryForm');
  if (!form) return;
  const buttons = [...form.querySelectorAll('.service-toggle-btn')];
  const selected = new Set();
  const config = window.ADVISOR_CONFIG;
  // مصدر موحد لرقم واتساب؛ بيانات المستخدم لا تُخزّن محلياً.
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => link.href = `https://wa.me/${config.whatsappNumber}`);
  buttons.forEach(button => {
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const service = button.dataset.service;
      selected.has(service) ? selected.delete(service) : selected.add(service);
      button.classList.toggle('selected', selected.has(service));
      button.setAttribute('aria-pressed', String(selected.has(service)));
    });
  });
  // تسميات وصول واضحة لا تعتمد على اختفاء الـplaceholder أثناء الكتابة.
  const labels = {clientName: 'Your Name *', clientEmail: 'Your Email *', clientPhone: 'Phone Number (e.g. 010...)', clientBrief: 'Tell us about your brand, objectives, or timeline...'};
  Object.entries(labels).forEach(([id,label]) => document.getElementById(id).setAttribute('aria-label', label));
  document.getElementById('clientBudget').setAttribute('aria-label', 'Estimated Budget (Optional)');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const t = window.AdvisorI18n.t;
    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    if (!name || !email) {alert(t('Please provide your name and email address.')); return;}
    const phone = document.getElementById('clientPhone').value.trim();
    const budgetSelect = document.getElementById('clientBudget');
    const budget = budgetSelect.value ? budgetSelect.selectedOptions[0].textContent : ''; 
    const brief = document.getElementById('clientBrief').value.trim();
    const services = [...selected].map(t).join('، ') || t('General Consultation');
    const message = [t('Hello ADVISOR Team,'), '', `${t('My name is')} ${name}.`, t('I’m interested in starting a project with ADVISOR.'), '', `${t('Services Needed:')} ${services}`, `${t('Estimated Budget:')} ${t(budget || 'Not specified')}`, `${t('Email:')} ${email}`, `${t('Phone:')} ${phone || t('Not specified')}`, '', t('Project Brief:'), brief || t('Looking forward to discussing next steps.')].join('\n');
    // الفتح داخل حدث النقر مباشرة يمنع مشكلة حظر النوافذ الناتجة عن المؤقت السابق.
    // نحتفظ بالمدخلات لأن فتح المسودة لا يعني أن الزائر أرسل الرسالة.
    // الرقم يُقرأ لحظة الإرسال حتى يُستخدم آخر رقم محفوظ من لوحة الإدارة.
    window.open(`https://wa.me/${window.AdvisorContent.whatsapp()}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });
})();
