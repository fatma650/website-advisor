/** أقسام الصفحة الرئيسية من لوحة الإدارة: تُملأ العناصر المعلّمة بـdata-content، ويبقى HTML الأصلي احتياطياً عند تعذر التحميل. */
(() => {
  const content = window.AdvisorContent;
  const language = () => window.AdvisorI18n?.language || 'en';
  // المسار بصيغة "القسم.الحقل"؛ غياب القسم أو الحقل يترك النص الأصلي كما هو.
  const read = path => {const [id, ...keys] = path.split('.'); return keys.reduce((value, key) => value?.[key], content.section(id));};
  const say = value => typeof value === 'string' ? value : content.select(value, language());
  const pad = index => String(index + 1).padStart(2, '0');
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  // كل سطر عقدة نصية يفصلها <br>؛ لا يُفسَّر أي HTML مكتوب في اللوحة.
  function lines(el, text) {
    el.replaceChildren();
    text.split('\n').forEach((line, index) => {if (index) el.append(document.createElement('br')); el.append(line);});
    return el;
  }
  function keywords(el, items) {
    el.replaceChildren();
    items.forEach((item, index) => {if (index) el.append(make('span', '', '✦')); el.append(make('span', '', say(item)));});
  }

  // عناصر القوائم تُبنى بنفس الأصناف الأصلية حتى تبقى الحركات والتنسيق كما هي.
  const lists = {
    'hero.lines'(el, items) {
      el.replaceChildren(...items.map((item, index) => {
        const line = make('span', 'hero-line');
        line.append(make('span', 'hero-line-inner' + (index % 2 ? ' text-gradient-purple' : ''), say(item)));
        setTimeout(() => line.classList.add('active'), 250 + index * 220);
        return line;
      }));
      el.setAttribute('aria-label', items.map(say).join(' '));
    },
    'hero.ticker'(el, items) {
      // نكرر الكلمات مرتين حتى تكتمل حلقة الشريط دون فراغ.
      el.replaceChildren(...[...items, ...items].map(item => {
        const word = make('span', 'ticker-item', say(item) + ' ');
        word.append(make('span', 'ticker-sparkle', '✦'));
        return word;
      }));
    },
    'about.stats'(el, items) {
      el.replaceChildren();
      items.forEach((item, index) => {
        if (index) el.append(make('div', 'about-stat-divider'));
        const stat = make('div');
        stat.append(make('div', 'about-stat-value', say(item.value)), make('div', 'about-stat-label', say(item.label)));
        el.append(stat);
      });
    },
    'about.words'(el, items) {
      el.replaceChildren(...items.map((item, index) => make('span', 'kinetic-word' + (index % 2 ? ' highlight' : ''), say(item))));
    },
    'vision.visionKeywords': keywords,
    'vision.missionKeywords': keywords,
    'vision.pillars'(el, items) {
      el.replaceChildren(...items.map((item, index) => {
        const pillar = make('div', 'pillar-item');
        pillar.append(make('div', 'pillar-num', `${pad(index)} / ${say(item.label)}`), make('div', 'pillar-name', say(item.name)), make('div', 'pillar-desc', say(item.desc)));
        return pillar;
      }));
    },
    'services.items'(el, items) {
      el.replaceChildren(...items.map((item, index) => {
        const row = make('div', 'service-item'), heading = make('div');
        heading.append(make('h3', 'service-title', say(item.title)));
        row.append(make('div', 'service-num', pad(index)), heading, make('p', 'service-desc', say(item.desc)));
        return row;
      }));
    },
    'why.items'(el, items) {
      el.replaceChildren(...items.map((item, index) => {
        const row = make('div', 'why-statement-item');
        row.append(make('div', 'why-num', pad(index)), lines(make('h3', 'why-claim'), say(item.claim)), make('p', 'why-detail', say(item.detail)));
        return row;
      }));
    },
    'footer.socials'(el, items) {
      el.replaceChildren();
      items.filter(item => /^https:\/\//.test(item.url)).forEach((item, index) => {
        if (index) el.append(make('span', 'footer-social-dot', '•'));
        const link = make('a', 'footer-link', say(item.label));
        link.href = item.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        el.append(link);
      });
    }
  };

  function apply() {
    document.querySelectorAll('[data-content]').forEach(el => {
      const value = read(el.dataset.content);
      if (value === undefined) return;
      const text = say(value);
      lines(el, text);
      el.setAttribute('data-no-i18n', '');
      el.hidden = !text.trim();
    });
    document.querySelectorAll('[data-content-list]').forEach(el => {
      const items = read(el.dataset.contentList);
      if (!Array.isArray(items) || !lists[el.dataset.contentList]) return;
      lists[el.dataset.contentList](el, items);
      el.setAttribute('data-no-i18n', '');
    });
    document.querySelectorAll('[data-content-tel]').forEach(el => {
      const phone = read(el.dataset.contentTel);
      if (phone) el.href = 'tel:' + phone.replace(/[^\d+]/g, '');
    });
    const logo = read('brand.logo');
    if (logo) {
      document.querySelectorAll('[data-content-src="brand.logo"]').forEach(img => img.src = logo);
      document.querySelector('link[rel="icon"]')?.setAttribute('href', logo);
    }
    const whatsapp = read('contact.whatsapp');
    if (whatsapp) document.querySelectorAll('a[href*="wa.me/"]').forEach(link => link.href = `https://wa.me/${whatsapp}`);
    // i18n يضبط العنوان والوصف أولاً عند تغيير اللغة، ثم نستبدلهما بالنص المحفوظ.
    const title = read('brand.siteTitle'), description = read('brand.siteDescription');
    if (title && say(title)) document.title = say(title);
    if (description && say(description)) document.querySelector('meta[name="description"]')?.setAttribute('content', say(description));
    
    const fontTheme = read('brand.fontTheme');
    if (fontTheme) {
      document.documentElement.className = document.documentElement.className.replace(/\bfont-\w+\b/g, '');
      if (fontTheme !== 'modern') document.documentElement.classList.add('font-' + fontTheme);
    }
  }

  // تُسجَّل قبل app.js حتى تكون العناصر الجديدة جاهزة عند ربط الحركات.
  window.AdvisorContentReady.then(() => {
    if (!content.hasSections()) return;
    apply();
    document.addEventListener('advisor:languagechange', apply);
  });
})();
