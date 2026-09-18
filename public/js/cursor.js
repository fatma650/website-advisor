/**
 * ADVISOR AGENCY — CUSTOM CIRCULAR MAGNETIC CURSOR
 * States: Normal dot + trailing ring, 'VIEW' on projects, 'DRAG' on horizontal sliders, magnet on buttons
 */

(function () {
  const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice() || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';

  const follower = document.createElement('div');
  follower.className = 'custom-cursor-follower';
  follower.setAttribute('data-no-i18n', '');
  follower.setAttribute('aria-hidden', 'true');

  document.body.appendChild(cursor);
  document.body.appendChild(follower);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followerX = mouseX;
  let followerY = mouseY;
  let targetFollowerX = mouseX;
  let targetFollowerY = mouseY;
  let isHoveringMagnetic = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;

    if (!isHoveringMagnetic) {
      targetFollowerX = mouseX;
      targetFollowerY = mouseY;
    }
  });

  // تنعيم حركة الدائرة التابعة للمؤشر تدريجياً — Smooth lerp loop
  function renderCursor() {
    followerX += (targetFollowerX - followerX) * 0.18;
    followerY += (targetFollowerY - followerY) * 0.18;

    follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // تبديل شكل المؤشر حسب العنصر — Helper functions for state
  window.setCursorMode = function (mode, text = '') {
    document.body.classList.remove('cursor-view', 'cursor-drag', 'cursor-hover');
    follower.textContent = text;

    if (mode === 'view') {
      document.body.classList.add('cursor-view');
      follower.textContent = window.AdvisorI18n.t('VIEW');
    } else if (mode === 'drag') {
      document.body.classList.add('cursor-drag');
      follower.textContent = window.AdvisorI18n.t('DRAG');
    } else if (mode === 'hover') {
      document.body.classList.add('cursor-hover');
    }
  };

  // تحديد حالة المؤشر عند المرور على الروابط والبطاقات — Delegate hover events
  document.addEventListener('mouseover', (e) => {
    const target = e.target;

    // View mode over project cards
    const projectCard = target.closest('.project-card, .gallery-img-wrap');
    if (projectCard) {
      window.setCursorMode('view');
      return;
    }

    // Drag mode over slider
    const slider = target.closest('.projects-slider-viewport');
    if (slider) {
      window.setCursorMode('drag');
      return;
    }

    // Interactive buttons/links
    const interactive = target.closest('a, button, .filter-btn, .service-toggle-btn, .client-grid-card, .service-item');
    if (interactive) {
      window.setCursorMode('hover');

      // Magnetic effect on buttons
      if (interactive.classList.contains('btn-magnetic')) {
        isHoveringMagnetic = true;
        const rect = interactive.getBoundingClientRect();
        targetFollowerX = rect.left + rect.width / 2;
        targetFollowerY = rect.top + rect.height / 2;
      }
      return;
    }

    window.setCursorMode('default');
    isHoveringMagnetic = false;
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '1';
  });
})();
