/**
 * ADVISOR AGENCY — VISION & MISSION INTERACTIVE SPLIT SCREEN
 * Dynamically expands panels on hover & scroll, adjusting seam and revealing content.
 */

(function () {
  const container = document.querySelector('.split-screen-container');
  const seam = document.querySelector('.split-seam');
  const panelVision = document.querySelector('.panel-vision');
  const panelMission = document.querySelector('.panel-mission');

  if (!container || !seam || !panelVision || !panelMission) return;

  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) return;

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    
    // Clamp ratio between 35% and 65% for elegant expansion
    const leftPercent = Math.max(35, Math.min(65, relativeX * 100));
    const rightPercent = 100 - leftPercent;

    container.style.gridTemplateColumns = `${leftPercent}% ${rightPercent}%`;
    seam.style.left = `${leftPercent}%`;
  });

  container.addEventListener('mouseleave', () => {
    container.style.gridTemplateColumns = '1fr 1fr';
    seam.style.left = '50%';
  });
})();
