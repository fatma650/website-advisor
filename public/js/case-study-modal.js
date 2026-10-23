/**
 * ADVISOR AGENCY — FULL-SCREEN EDITORIAL CASE STUDY MODAL CONTROLLER
 * Seamless open/close, project navigation, rich editorial layout injection, image lightbox.
 */

(function () {
  const safe = window.AdvisorContent.escape;
  const overlay = document.getElementById('caseStudyOverlay');
  if (!overlay) return;

  const closeBtn = document.getElementById('caseCloseBtn');
  const prevBtn = document.getElementById('casePrevBtn');
  const nextBtn = document.getElementById('caseNextBtn');
  const nextTeaser = document.getElementById('caseNextTeaser');

  let currentProjectIndex = 0;
  let returnFocus = null;
  let galleryFocus = null;
  const pageRegions = [...document.querySelectorAll('body > header, body > main, body > footer')];
  // عزل نافذة المشروع عن الصفحة للقارئ الآلي والكيبورد مع السماح بتمريرها الأصلي.
  overlay.setAttribute('data-lenis-prevent', '');

  // إنشاء نافذة تكبير الصورة مرة واحدة وإعادة استخدامها — Lightbox element creation
  const lightbox = document.createElement('div');
  lightbox.className = 'case-lightbox';
  lightbox.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(3, 3, 5, 0.95);
    backdrop-filter: blur(25px);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    padding: 30px;
  `;
  lightbox.innerHTML = `
    <button class="lightbox-close" style="
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    ">✕</button>
    <img class="lightbox-img" src="" alt="Enlarged Visual" style="
      max-width: 92vw;
      max-height: 88vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139, 92, 246, 0.2);
    " />
  `;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Enlarged Visual');
  lightbox.setAttribute('data-lenis-prevent', '');
  lightbox.inert = true;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxCloseBtn = lightbox.querySelector('.lightbox-close');
  lightboxCloseBtn.setAttribute('aria-label', 'Close enlarged image');

  // تكبير الصورة وحفظ موضع التركيز للعودة إليه.
  function openLightbox(src) {
    galleryFocus = document.activeElement;
    lightbox.inert = false;
    overlay.inert = true;
    lightboxImg.src = src;
    lightboxCloseBtn.focus({preventScroll: true});
    lightbox.style.opacity = '1';
    lightbox.style.pointerEvents = 'auto';
  }

  // إغلاق التكبير وإعادة التركيز للمعرض.
  function closeLightbox() {
    lightbox.inert = true;
    overlay.inert = !overlay.classList.contains('is-active');
    galleryFocus?.focus({preventScroll: true});
    lightbox.style.opacity = '0';
    lightbox.style.pointerEvents = 'none';
  }

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // حقن تفاصيل المشروع المختار وترجمة النصوص الجديدة.
  function renderCaseStudy(project) {
    project = window.AdvisorContent.project(project);
    // ملء عنوان المشروع ومسار التنقل — Breadcrumbs & Header
    document.getElementById('caseBreadcrumbCat').textContent = project.category;
    document.getElementById('caseBreadcrumbTitle').textContent = project.title;
    document.getElementById('caseProjectNumber').textContent = `PROJECT ${project.number}`;
    document.getElementById('caseCategoryBadge').textContent = project.category;
    document.getElementById('caseTitle').textContent = project.title;
    document.getElementById('caseSubtitle').textContent = project.subtitle;

    // عرض العميل والمجال والسنة والخدمات — Specs
    document.getElementById('specClient').textContent = project.client;
    document.getElementById('specIndustry').textContent = project.category;
    document.getElementById('specYear').textContent = project.year;
    document.getElementById('specServices').textContent = project.services.slice(0, 3).join(', ');

    // تحديد الصورة الرئيسية ونصها البديل — Master Hero Board
    const masterImg = document.getElementById('caseMasterImg');
    masterImg.src = project.boardImage || project.heroImage;
    masterImg.alt = project.title;

    // عرض التحدي والمنهج والتوجه الإبداعي — Narrative
    document.getElementById('caseChallenge').textContent = project.challenge;
    document.getElementById('caseApproach').textContent = project.approach;
    document.getElementById('caseCreativeDirection').textContent = project.creativeDirection;

    // إنشاء بطاقات النتائج من بيانات المشروع الأصلية — Results Metrics
    const resultsContainer = document.getElementById('caseResultsContainer');
    resultsContainer.innerHTML = '';
    if (project.results && project.results.length > 0) {
      project.results.forEach(res => {
        const statBox = document.createElement('div');
        statBox.className = 'result-stat-box';
        statBox.setAttribute('data-no-i18n','');
        statBox.innerHTML = `
          <div class="result-value">${safe(res.value)}</div>
          <div class="result-label">${safe(res.label)}</div>
          <div class="result-desc">${safe(res.desc)}</div>
        `;
        resultsContainer.appendChild(statBox);
      });
    }

    // إنشاء معرض صور الحملة مع وصف كل صورة — Editorial Gallery
    const galleryContainer = document.getElementById('caseEditorialGallery');
    galleryContainer.innerHTML = '';
    if (project.gallery && project.gallery.length > 0) {
      project.gallery.forEach((item, idx) => {
        const galItem = document.createElement('div');
        galItem.className = 'gallery-visual-item';
        galItem.innerHTML = `
          <div class="gallery-img-wrap" data-img="${safe(item.src)}">
            <img src="${safe(item.src)}" alt="${safe(item.caption || project.title)}" class="gallery-img" data-no-i18n loading="lazy" />
          </div>
          <div class="gallery-caption">
            <span data-no-i18n>${safe(item.caption || project.title)}</span>
            <span class="mono-tag" style="font-size: 0.65rem;">HIGH-RES</span>
          </div>
        `;

        // Click to view in lightbox
        const wrap = galItem.querySelector('.gallery-img-wrap');
        wrap.tabIndex = 0;
        wrap.setAttribute('role', 'button');
        wrap.setAttribute('data-no-i18n', '');
        wrap.setAttribute('aria-label', item.caption || project.title);
        wrap.addEventListener('click', () => openLightbox(item.src));
        wrap.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(item.src); }
        });

        galleryContainer.appendChild(galItem);
      });
    }

    // عرض معاينة المشروع التالي مع الالتفاف عند نهاية القائمة — Next Project Setup
    const nextIndex = (currentProjectIndex + 1) % window.ADVISOR_PROJECTS.length;
    const nextProj = window.AdvisorContent.project(window.ADVISOR_PROJECTS[nextIndex]);
    document.getElementById('caseNextNumber').textContent = `NEXT UP — ${String(nextIndex + 1).padStart(2, '0')}`;
    document.getElementById('caseNextTitle').textContent = nextProj.title;
    window.AdvisorI18n.translate(overlay);
  }

  window.openCaseStudy = function (projectId, updateHistory = true) {
    const idx = window.ADVISOR_PROJECTS.findIndex(p => p.id === projectId);
    if (idx === -1) return;

    if (!overlay.classList.contains('is-active')) {
      returnFocus = document.activeElement;
      window.AdvisorScroll.remember();
      if (updateHistory) history.pushState({advisorCase: true}, '', `#case-${projectId}`);
    }
    currentProjectIndex = idx;
    const project = window.ADVISOR_PROJECTS[idx];

    renderCaseStudy(project);
    overlay.classList.add('is-active');
    overlay.inert = false;
    overlay.setAttribute('aria-hidden', 'false');
    pageRegions.forEach(el => el.inert = true);
    window.AdvisorScroll.lock('case');
    closeBtn.focus({preventScroll: true});
    overlay.scrollTop = 0;

    // Optional URL hash
    if (updateHistory) history.replaceState(history.state, '', `#case-${projectId}`);
  };

  window.closeCaseStudy = function (updateHistory = true) {
    if (updateHistory && history.state?.advisorCase) {
      history.back();
      return;
    }
    overlay.classList.remove('is-active');
    overlay.inert = true;
    overlay.setAttribute('aria-hidden', 'true');
    pageRegions.forEach(el => el.inert = false);
    window.AdvisorScroll.unlock('case');
    closeLightbox();
    returnFocus?.focus({preventScroll: true});
    if (updateHistory && window.location.hash.startsWith('#case-')) {
      history.replaceState('', document.title, window.location.pathname + window.location.search);
    }
  };

  // عرض المشروع التالي وتحديث الرابط وإرجاع النافذة إلى أولها.
  function nextProject() {
    currentProjectIndex = (currentProjectIndex + 1) % window.ADVISOR_PROJECTS.length;
    const proj = window.ADVISOR_PROJECTS[currentProjectIndex];
    renderCaseStudy(proj);
    history.replaceState(history.state, '', `#case-${proj.id}`);
    overlay.scrollTop = 0;
  }

  // عرض المشروع السابق مع الالتفاف لأول وآخر القائمة.
  function prevProject() {
    currentProjectIndex = (currentProjectIndex - 1 + window.ADVISOR_PROJECTS.length) % window.ADVISOR_PROJECTS.length;
    const proj = window.ADVISOR_PROJECTS[currentProjectIndex];
    renderCaseStudy(proj);
    history.replaceState(history.state, '', `#case-${proj.id}`);
    overlay.scrollTop = 0;
  }

  // ربط تفاعلات المستخدم بالوظائف — Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', () => window.closeCaseStudy());
  if (prevBtn) prevBtn.addEventListener('click', prevProject);
  if (nextBtn) nextBtn.addEventListener('click', nextProject);
  if (nextTeaser) nextTeaser.addEventListener('click', nextProject);

  // حصر Tab داخل النافذة النشطة وإرجاع التركيز إلى البطاقة عند الإغلاق.
  document.addEventListener('keydown', e => {
    const active = lightbox.style.opacity === '1' ? lightbox : overlay.classList.contains('is-active') ? overlay : null;
    if (!active || e.key !== 'Tab') return;
    const focusable = [...active.querySelectorAll('button,a[href],[tabindex="0"]')].filter(el => !el.disabled);
    const first = focusable[0], last = focusable.at(-1);
    if (e.shiftKey && (document.activeElement === first || !active.contains(document.activeElement))) {e.preventDefault(); last?.focus();}
    else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first?.focus();}
  });
  nextTeaser.tabIndex = 0;
  nextTeaser.setAttribute('role', 'button');
  nextTeaser.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); nextProject();}
  });

  // اختصارات لوحة المفاتيح للتنقل والإغلاق — Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (lightbox.style.opacity === '1' && e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (!overlay.classList.contains('is-active')) return;
    if (e.key === 'Escape') window.closeCaseStudy();
    if (lightbox.style.opacity === '1') return;
    const rtl = document.documentElement.dir === 'rtl';
    if (e.key === 'ArrowRight') rtl ? prevProject() : nextProject();
    if (e.key === 'ArrowLeft') rtl ? nextProject() : prevProject();
  });

  document.addEventListener('advisor:languagechange', () => {
    if (overlay.classList.contains('is-active')) renderCaseStudy(window.ADVISOR_PROJECTS[currentProjectIndex]);
  });

  // فتح البطاقات الديناميكية عن طريق تفويض حدث النقر — Delegate click on project cards
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project-id]');
    if (card) {
      e.preventDefault();
      const id = card.getAttribute('data-project-id');
      window.openCaseStudy(id);
    }
  });

  window.addEventListener('popstate', () => {
    if (location.hash.startsWith('#case-')) window.openCaseStudy(location.hash.slice(6), false);
    else window.closeCaseStudy(false);
  });

  // فتح المشروع المشار إليه في الرابط عند تحميل الموقع — Check initial hash
  window.addEventListener('load', async () => {
    await window.AdvisorContentReady;
    const hash = window.location.hash;
    if (hash && hash.startsWith('#case-')) {
      const id = hash.replace('#case-', '');
      window.openCaseStudy(id, false);
    }
  });
})();
