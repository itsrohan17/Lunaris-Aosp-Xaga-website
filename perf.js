/* =============================================
   LUNARIS AOSP — MOBILE PERFORMANCE HELPERS
   perf.js
   ============================================= */

(function () {
  'use strict';

  var mq = window.matchMedia('(max-width: 767px)');
  var isMobile = mq.matches;

  window.LUNARIS_IS_MOBILE = isMobile;

  if (isMobile) {
    document.documentElement.classList.add('is-mobile');
  }

  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      window.LUNARIS_IS_MOBILE = e.matches;
      document.documentElement.classList.toggle('is-mobile', e.matches);
    });
  }

  window.lunarisWhenIdle = function (fn) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fn, { timeout: 2000 });
    } else {
      setTimeout(fn, 120);
    }
  };

  window.lunarisRevealOpts = function (desktop) {
    return isMobile
      ? { threshold: 0, rootMargin: '350px 0px 250px 0px' }
      : (desktop || { threshold: 0.05, rootMargin: '100px 0px 60px 0px' });
  };

  function markInView() {
    if (!isMobile) return;
    var targets = document.querySelectorAll('.scroll-reveal, .dl-card, .feat, .tl-item, .terminal-wrap, .spec-card');
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view', 'active', 'visible');
            obs.unobserve(e.target);
          }
        });
      }, { rootMargin: '350px 0px 250px 0px', threshold: 0 });

      targets.forEach(function (el) {
        obs.observe(el);
      });
    } else {
      targets.forEach(function (el) {
        el.classList.add('in-view', 'active', 'visible');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markInView);
  } else {
    markInView();
  }
})();
