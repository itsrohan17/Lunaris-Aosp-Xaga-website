/* Lunaris — starfield (lightweight on mobile, full on desktop, Retina/HiDPI optimized) */
(function () {
  'use strict';

  window.lunarisInitStars = function () {
    var canvas = document.getElementById('pc');
    if (!canvas) return null;

    var isMobile = window.LUNARIS_IS_MOBILE ?? window.matchMedia('(max-width:767px)').matches;
    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      canvas.style.display = 'none';
      return null;
    }

    var linked = canvas.hasAttribute('data-linked') || true;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null;

    var W = 0;
    var H = 0;
    var dpr = 1;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var running = true;
    var isPaused = false;
    var rafId = 0;

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    if (!isMobile) {
      document.addEventListener('mousemove', function (e) {
        targetX = (e.clientX - W / 2) * 0.04;
        targetY = (e.clientY - H / 2) * 0.04;
      }, { passive: true });
    }

    var count = isMobile ? 45 : 85;
    var pts = Array.from({ length: count }, function () {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * (isMobile ? 0.05 : 0.07),
        vy: (Math.random() - 0.5) * (isMobile ? 0.05 : 0.07) - (isMobile ? 0.02 : 0.035),
        s: Math.random() * (isMobile ? 1.2 : 1.6) + 0.5,
        a: Math.random() * 0.45 + 0.15,
        td: Math.random() > 0.5 ? 1 : -1,
        ts: Math.random() * 0.005 + 0.002,
        depth: Math.random() * 0.8 + 0.2,
        hue: !isMobile && Math.random() > 0.65
      };
    });

    var LINK_DIST = isMobile ? 70 : 100;

    function loop() {
      if (!running) return;
      if (isPaused) return;

      ctx.clearRect(0, 0, W, H);

      if (!isMobile) {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
      }

      var len = pts.length;
      for (var i = 0; i < len; i++) {
        var p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.ts * p.td;
        if (p.a > 0.85 || p.a < 0.15) p.td *= -1;
        if (p.x > W) p.x = 0;
        if (p.x < 0) p.x = W;
        if (p.y > H) p.y = 0;
        if (p.y < 0) p.y = H;
        p.renderX = p.x + (currentX * p.depth);
        p.renderY = p.y + (currentY * p.depth);
      }

      if (linked && !isMobile) {
        for (var i = 0; i < len; i++) {
          var p1 = pts[i];
          for (var j = i + 1; j < len; j++) {
            var p2 = pts[j];
            var dx = p1.renderX - p2.renderX;
            var dy = p1.renderY - p2.renderY;
            var dist = Math.hypot(dx, dy);
            if (dist < LINK_DIST) {
              var alpha = (1 - dist / LINK_DIST) * 0.15;
              ctx.beginPath();
              ctx.moveTo(p1.renderX, p1.renderY);
              ctx.lineTo(p2.renderX, p2.renderY);
              ctx.strokeStyle = 'rgba(167, 139, 250, ' + alpha + ')';
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      for (var i = 0; i < len; i++) {
        var p = pts[i];
        ctx.beginPath();
        ctx.arc(p.renderX, p.renderY, p.s, 0, Math.PI * 2);
        ctx.fillStyle = p.hue
          ? 'rgba(196, 181, 253, ' + p.a + ')'
          : 'rgba(255, 255, 255, ' + p.a + ')';
        ctx.fill();
      }

      rafId = requestAnimationFrame(loop);
    }

    if (isMobile) {
      var scrollTimer = null;
      window.addEventListener('scroll', function () {
        if (!isPaused) {
          isPaused = true;
          cancelAnimationFrame(rafId);
        }
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function () {
          if (running && !document.hidden) {
            isPaused = false;
            rafId = requestAnimationFrame(loop);
          }
        }, 120);
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        isPaused = true;
        cancelAnimationFrame(rafId);
      } else {
        isPaused = false;
        rafId = requestAnimationFrame(loop);
      }
    });

    canvas.hidden = false;
    canvas.style.display = 'block';
    canvas.style.opacity = isMobile ? '0.6' : '0.75';
    loop();

    return {
      destroy: function () {
        running = false;
        cancelAnimationFrame(rafId);
        window.removeEventListener('resize', resize);
      }
    };
  };

  function boot() {
    lunarisInitStars();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
