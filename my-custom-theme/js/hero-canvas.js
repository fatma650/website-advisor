/**
 * ADVISOR AGENCY — HERO INTERACTIVE CANVAS
 * Abstract animated purple energy waves & cursor-reactive luminous particles.
 * 60fps performant, retina-ready, smooth damping.
 */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  let width, height, dpr;

  let mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    radius: 220,
    isHovering: false
  };

  // ضبط دقة الرسم مع حجم العنصر وكثافة شاشة الجهاز.
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.parentElement.clientWidth;
    height = canvas.parentElement.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    initParticles();
  }

  // إنشاء الجزيئات المضيئة وتحديث مواضعها — Particle System
  let particles = [];
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 45 : 95;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 10;
      this.baseX = this.x;
      this.baseY = this.y;
      this.size = Math.random() * 2.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = -Math.random() * 0.6 - 0.2;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulse = Math.random() * Math.PI;
      this.color = Math.random() > 0.4 ? '#8b5cf6' : (Math.random() > 0.5 ? '#a855f7' : '#c084fc');
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulse += this.pulseSpeed;

      // Mouse reaction
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (1 - dist / mouse.radius) * 3;
        const angle = Math.atan2(dy, dx);
        this.x -= Math.cos(angle) * force * 1.5;
        this.y -= Math.sin(angle) * force * 1.5;
      }

      if (this.y < -20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      const currentAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
      ctx.save();
      ctx.globalAlpha = currentAlpha;
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = this.size * 5;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // إعادة إنشاء الجزيئات بعد تغيير مساحة الرسم.
  function initParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // رسم الموجات عبر دوال جيبية — Fluid Geometric Sine Waves
  let time = 0;

  function drawWaveCurves() {
    ctx.save();
    const waves = [
      { color: 'rgba(124, 58, 237, 0.15)', freq: 0.0018, amp: 70, yOffset: 0.52, speed: 0.015, blur: 18 },
      { color: 'rgba(139, 92, 246, 0.22)', freq: 0.0025, amp: 95, yOffset: 0.58, speed: 0.012, blur: 24 },
      { color: 'rgba(168, 85, 247, 0.12)', freq: 0.0032, amp: 55, yOffset: 0.65, speed: 0.02, blur: 12 },
      { color: 'rgba(79, 70, 229, 0.18)', freq: 0.0014, amp: 110, yOffset: 0.45, speed: 0.009, blur: 30 }
    ];

    waves.forEach(w => {
      ctx.beginPath();
      ctx.strokeStyle = w.color;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = w.blur;

      const baseY = height * w.yOffset;

      for (let x = 0; x <= width; x += 12) {
        // Wave harmonics
        let y = baseY +
          Math.sin(x * w.freq + time * w.speed) * w.amp +
          Math.cos(x * w.freq * 0.5 + time * w.speed * 0.7) * (w.amp * 0.35);

        // Subtle mouse ripple
        if (mouse.isHovering) {
          const mdx = mouse.x - x;
          const mdy = mouse.y - y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < 260) {
            const mForce = Math.sin((1 - mDist / 260) * Math.PI) * 45;
            y += mForce * (mouse.y > y ? -0.4 : 0.4);
          }
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    });

    ctx.restore();
  }

  // وصل الجزيئات القريبة بخطوط ضوئية — Draw Subtle Light Web Connectors
  function drawConnectors() {
    ctx.save();
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 110)})`;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // تحديث المشهد مع كل إطار — Animation Loop
  function animate() {
    ctx.clearRect(0, 0, width, height);

    time += 1;

    // Mouse smooth lag
    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    // Ambient center glow
    const grad = ctx.createRadialGradient(
      width * 0.5 + (mouse.x - width * 0.5) * 0.1,
      height * 0.55 + (mouse.y - height * 0.55) * 0.1,
      40,
      width * 0.5,
      height * 0.55,
      width * 0.55
    );
    grad.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
    grad.addColorStop(0.5, 'rgba(79, 70, 229, 0.05)');
    grad.addColorStop(1, 'rgba(6, 6, 8, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    drawWaveCurves();
    drawConnectors();

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  // ربط تفاعلات المستخدم بالوظائف — Event Listeners
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.targetX = e.clientX - rect.left;
    mouse.targetY = e.clientY - rect.top;
    mouse.isHovering = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isHovering = false;
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  resize();
  animate();
})();
