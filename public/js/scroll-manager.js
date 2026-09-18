/** مدير التمرير: يفصل تمرير الصفحة عن النوافذ، ويعيد موضع الصفحة عند الإغلاق. */
(() => {
  const locks = new Set();
  let engine = null;
  let savedY = 0;
  let savedStyle = null;
  const storageKey = 'advisor-home-scroll-v1';
  const home = location.pathname === '/' || location.pathname === '/index.html';
  const position = () => locks.size ? savedY : window.scrollY;
  function remember() {
    if (!home) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({y: position(), time: Date.now()})); } catch {}
  }
  function jump(y) {
    if (locks.size) {
      savedY = y;
      document.body.style.top = `-${y}px`;
      return;
    }
    window.scrollTo({top: y, behavior: 'instant'});
    engine?.scrollTo(y, {immediate: true, force: true});
  }
  window.addEventListener('pagehide', remember);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') remember();
  });
  window.addEventListener('pageshow', async event => {
    if (!home || event.persisted) return; // BFCache already preserves the live page.
    const navigation = performance.getEntriesByType('navigation')[0]?.type;
    let internal = false;
    try { internal = new URL(document.referrer).origin === location.origin; } catch {}
    if (!internal && !['back_forward', 'reload'].includes(navigation)) return;
    if (location.hash && !location.hash.startsWith('#case-')) return;
    let saved;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey)); } catch { return; }
    if (!saved || !Number.isFinite(saved.y) || saved.y < 0 || Date.now() - saved.time > 86400000) return;
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    events.forEach(name => window.addEventListener(name, cancel, {passive: true}));
    await Promise.all([window.AdvisorContentReady, document.fonts?.ready]);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!cancelled) jump(saved.y);
      events.forEach(name => window.removeEventListener(name, cancel));
    }));
  });
  window.AdvisorScroll = {
    remember,
    // ربط Lenis بعد إنشائه؛ يظل الحل صالحاً عند عدم تحميل المكتبة.
    attach(instance) { engine = instance; if (locks.size) engine?.stop(); },
    lock(owner) {
      if (locks.has(owner)) return;
      if (!locks.size) {
        savedY = window.scrollY;
        savedStyle = ['position', 'top', 'width', 'overflow'].map(k => [k, document.body.style[k]]);
        engine?.stop();
        Object.assign(document.body.style, {position: 'fixed', top: `-${savedY}px`, width: '100%', overflow: 'hidden'});
      }
      locks.add(owner);
    },
    unlock(owner) {
      if (!locks.delete(owner) || locks.size) return;
      savedStyle.forEach(([key, value]) => document.body.style[key] = value);
      window.scrollTo({top: savedY, behavior: 'instant'});
      engine?.start();
      engine?.scrollTo(savedY, {immediate: true, force: true});
    }
  };
})();
