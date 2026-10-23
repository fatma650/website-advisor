/**
 * ADVISOR AGENCY — MAIN APPLICATION ORCHESTRATOR
 * Lenis smooth scroll, GSAP ScrollTrigger, kinetic typography, work filtering, marquee setup.
 */

document.addEventListener('DOMContentLoaded', async () => {
  await window.AdvisorContentReady;
  const safe = window.AdvisorContent.escape;
  // إنشاء التمرير الناعم للصفحة عند توفر المكتبة وتفعيل الإعداد — 1. Initialize Lenis Smooth Scroll
  let lenis = null;
  if (window.ADVISOR_CONFIG.smoothScroll && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: window.ADVISOR_CONFIG.scrollDuration,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  window.AdvisorScroll.attach(lenis);

  // تغيير خلفية شريط التنقل بعد التمرير — 2. Navbar Scroll State
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  });

  // فتح وإغلاق قائمة الموبايل مع قفل تمرير الصفحة — 3. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-menu-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mobileDrawer.classList.toggle('open');
      const open = mobileDrawer.classList.contains('open');
      mobileDrawer.inert = !open;
      mobileDrawer.setAttribute('aria-hidden', String(!open));
      mobileToggle.setAttribute('aria-expanded', String(open));
      window.AdvisorScroll[open ? 'lock' : 'unlock']('menu');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mobileDrawer.classList.remove('open');
        mobileDrawer.inert = true;
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileToggle.setAttribute('aria-expanded', 'false');
        window.AdvisorScroll.unlock('menu');
      });
    });
  }

  // Escape يغلق قائمة الموبايل ويعيد التحكم للصفحة.
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileDrawer?.classList.contains('open')) {
      mobileToggle.click();
      mobileToggle.focus();
    }
  });

  // إظهار سطور العنوان بالتتابع — 4. Hero Kinetic Headline Reveal
  const heroLines = document.querySelectorAll('.hero-line');
  heroLines.forEach((line, index) => {
    setTimeout(() => {
      line.classList.add('active');
    }, 250 + index * 220);
  });

  // إنشاء بطاقات المشاريع من ملف البيانات — 5. Render Selected Work Cards
  let activeFilter = 'ALL';
  const projectsTrack = document.getElementById('projectsTrack');
  document.getElementById('liveProjectCount').textContent = window.ADVISOR_PROJECTS.length;
  if (projectsTrack && window.ADVISOR_PROJECTS) {
    renderProjects('ALL');
  }

  function renderProjects(filterCategory) {
    projectsTrack.innerHTML = '';
    const filtered = filterCategory === 'ALL'
      ? window.ADVISOR_PROJECTS
      : window.ADVISOR_PROJECTS.filter(p => p.category === filterCategory);

    filtered.forEach(source => {
      const proj = window.AdvisorContent.project(source);
      const card = document.createElement('div');
      card.className = 'project-card';
      card.setAttribute('data-project-id', proj.id);
      card.setAttribute('data-category', source.category);
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.openCaseStudy(proj.id); }
      });

      const serviceTags = proj.services.slice(0, 3)
        .map(s => `<span class="service-pill" data-no-i18n>${safe(s)}</span>`)
        .join('');

      card.innerHTML = `
        <div class="project-canvas-wrap">
          <img src="${safe(proj.heroImage)}" alt="${safe(proj.title)}" class="project-thumb" data-no-i18n loading="lazy" />
          <div class="project-overlay-badge" data-no-i18n>${safe(proj.category)}</div>
        </div>
        <div class="project-info">
          <div>
            <div class="project-meta-row">
              <span class="project-num">PROJECT ${safe(proj.number)}</span>
              <span class="project-year" data-no-i18n>${safe(proj.year)}</span>
            </div>
            <h3 class="project-title" data-no-i18n>${safe(proj.title)}</h3>
            <div class="project-services-tags">
              ${serviceTags}
            </div>
          </div>
          <div class="project-action-btn">
            <span>VIEW CASE STUDY</span>
            <span>→</span>
          </div>
        </div>
      `;
      projectsTrack.appendChild(card);
    });
  }

  // الفلاتر تُبنى من المجالات الحالية؛ إضافة مجال من الأدمن تظهر تلقائياً هنا.
  function renderFilters() {
    const group = document.querySelector('.work-filters');
    group.replaceChildren();
    const categories = ['ALL', ...new Set(window.ADVISOR_PROJECTS.map(p => p.category))];
    categories.forEach(category => {
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'filter-btn'; btn.setAttribute('data-no-i18n','');
      btn.classList.toggle('active',category === activeFilter);
      btn.setAttribute('aria-pressed',String(category === activeFilter));
      btn.textContent = category === 'ALL' ? window.AdvisorI18n.t('All Projects') : window.AdvisorContent.project(window.ADVISOR_PROJECTS.find(p => p.category === category)).category;
      btn.addEventListener('click',() => {activeFilter=category;renderFilters();renderProjects(activeFilter);window.AdvisorI18n.translate(projectsTrack);});
      group.append(btn);
    });
  }
  renderFilters();
  document.addEventListener('advisor:languagechange', () => {
    renderProjects(activeFilter); renderFilters(); renderClients(); window.AdvisorI18n.translate(document.body);
  });

  // 6. سحب شريط المشاريع؛ العجلة العمودية تظل للصفحة ولا تفتح بطاقة بعد السحب.
  const sliderViewport = document.querySelector('.projects-slider-viewport');
  if (sliderViewport) {
    let startX = 0, startScroll = 0, dragging = false, moved = false;
    sliderViewport.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startScroll = sliderViewport.scrollLeft;
    });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      const distance = e.clientX - startX;
      if (Math.abs(distance) > window.ADVISOR_CONFIG.dragThreshold) moved = true;
      if (moved) {
        e.preventDefault();
        sliderViewport.scrollLeft = startScroll - distance * window.ADVISOR_CONFIG.dragSpeed;
      }
    });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointercancel', () => { dragging = false; moved = false; });
    window.addEventListener('blur', () => { dragging = false; });
    sliderViewport.addEventListener('dragstart', e => e.preventDefault());
    sliderViewport.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
    }, true);
    // إيقاف وصول الحركة الأفقية إلى Lenis مع إبقاء التمرير الأصلي للمتصفح.
    sliderViewport.addEventListener('wheel', e => {
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) e.stopPropagation();
    }, {passive: true});

    // أزرار التنقل بالسهمين الجانبيين للمشاريع
    const prevBtn = document.getElementById('projectsPrevBtn');
    const nextBtn = document.getElementById('projectsNextBtn');

    const getScrollStep = () => {
      const firstCard = sliderViewport.querySelector('.project-card');
      return firstCard ? firstCard.offsetWidth + 32 : 440;
    };

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        sliderViewport.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        sliderViewport.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
      });
    }
  }

  // بناء شريط شعارات العملاء وشبكتهم من البيانات — 7. Render Clients Marquee and Interactive Grid
  const marqueeTrack = document.getElementById('clientsMarqueeTrack');
  const clientsGrid = document.getElementById('clientsInteractiveGrid');

  function renderClients() {
    if (!window.ADVISOR_CLIENTS) return;
    const clients = window.ADVISOR_CLIENTS.map(window.AdvisorContent.client);
    // Populate Marquee (double items for smooth infinite loop)
    if (marqueeTrack) {
      const itemsToRender = [...clients, ...clients];
      marqueeTrack.innerHTML = itemsToRender.map(client => `
        <div class="marquee-logo-card" data-no-i18n title="${safe(client.name)}">
          <img src="${safe(client.logo)}" alt="${safe(client.name)}" class="marquee-logo-img" loading="lazy" />
        </div>
      `).join('');
    }

    // Populate Interactive Grid
    if (clientsGrid) {
      clientsGrid.innerHTML = clients.map(client => `
        <div class="client-grid-card">
          <img src="${safe(client.logo)}" alt="${safe(client.name)}" class="client-grid-logo" data-no-i18n loading="lazy" />
          <div class="client-grid-name" data-no-i18n>${safe(client.name)}</div>
          <div class="client-grid-ind" data-no-i18n>${safe(client.industry)}</div>
        </div>
      `).join('');
    }
  }

  renderClients();

  window.AdvisorI18n.translate(document.body);

  // تحريك الكلمات بمعدل مختلف عند التمرير — 8. Kinetic Words Parallax Interaction on Scroll
  // مجموعة حيّة: تشمل الكلمات التي يعيد site-sections.js بناءها عند تغيير اللغة.
  const kineticWords = document.getElementsByClassName('kinetic-word');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    [...kineticWords].forEach((word, i) => {
      const speed = (i % 2 === 0 ? 1 : -1) * 0.15;
      const offset = (scrollPos * speed) % 120;
      word.style.transform = `translateX(${offset}px)`;
    });
  });

  // إرجاع الصفحة إلى الأعلى — 9. Back To Top
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.5 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // الوصول إلى أقسام الصفحة من الروابط الداخلية — 10. Smooth Anchor Navigation
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // إزاحة طفيفة للأزرار مع مؤشر الماوس — 11. Magnetic Button Mouse Physics
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px)`;

      // Update ripple center coordinates
      btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
      btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
    });
  });

  // إظهار العناصر عند دخولها مجال الرؤية — 12. Intersection Observer for Scroll Reveals
  const revealElements = document.querySelectorAll('.service-item, .why-statement-item, .pillar-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
  });
});
