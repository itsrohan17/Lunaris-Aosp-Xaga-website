/* Lunaris — page transitions (full on desktop, instant on mobile) */
(function () {
  'use strict';

  var SITE_PAGES = {
    'index.html': true,
    'downloads.html': true,
    'guide.html': true,
    'changelog.html': true
  };

  var isMobile = window.LUNARIS_IS_MOBILE ?? window.matchMedia('(max-width:767px)').matches;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var useTransitions = !reduced;
  var EXIT_MS = isMobile ? 120 : 180;
  var leaving = false;

  if (useTransitions) {
    document.documentElement.classList.add('page-enter');
  } else {
    document.documentElement.classList.add('page-instant', 'page-enter-active');
  }

  function pageFromHref(href) {
    try {
      var url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return null;
      var part = url.pathname.split('/').filter(Boolean).pop();
      if (!part || part.indexOf('.') === -1) return 'index.html';
      return part;
    } catch (e) {
      return null;
    }
  }

  function isSiteLink(a) {
    if (!a || !a.href) return false;
    if (a.target === '_blank' || a.hasAttribute('download')) return false;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#') return false;
    var page = pageFromHref(a.href);
    return page && SITE_PAGES[page];
  }

  function ensureCurtain() {
    if (document.querySelector('.page-curtain')) return;
    var el = document.createElement('div');
    el.className = 'page-curtain';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }

  function wrapPageRoot() {
    if (document.getElementById('page-root')) return;
    var wrap = document.createElement('div');
    wrap.id = 'page-root';

    // Do NOT move fixed canvas, glow, lightbox, or popups inside page-root
    var excludedSelectors = '#pc, .ambient-glow, .lightbox, .community-popup, #dl38-popup, .page-curtain, .toast-container';
    var toMove = [];
    var child = document.body.firstElementChild;
    while (child) {
      var next = child.nextElementSibling;
      if (!child.matches(excludedSelectors)) {
        toMove.push(child);
      }
      child = next;
    }

    if (toMove.length > 0) {
      document.body.insertBefore(wrap, toMove[0]);
      toMove.forEach(function (node) {
        wrap.appendChild(node);
      });
    } else {
      document.body.appendChild(wrap);
    }
    ensureCurtain();
  }

  function revealContent(instant) {
    document.querySelectorAll('.dl-card, .tl-item, .terminal-wrap').forEach(function (el) {
      el.classList.add('visible');
    });
    if (instant) return;

    var page = pageFromHref(window.location.href);
    if (page === 'downloads.html') {
      document.querySelectorAll('.dl-card').forEach(function (el, i) {
        window.setTimeout(function () { el.classList.add('visible'); }, i * 20);
      });
    } else if (page === 'changelog.html') {
      document.querySelectorAll('.tl-item').forEach(function (el, i) {
        window.setTimeout(function () { el.classList.add('visible'); }, Math.min(i * 15, 80));
      });
    } else if (page === 'guide.html') {
      document.querySelectorAll('.terminal-wrap').forEach(function (el, i) {
        window.setTimeout(function () { el.classList.add('visible'); }, i * 25);
      });
    }
  }

  function startEnter() {
    document.documentElement.classList.add('page-enter-active');
    revealContent(!useTransitions);
    window.setTimeout(function () {
      document.documentElement.classList.remove('page-enter', 'page-enter-active');
    }, isMobile ? 250 : 350);
  }

  function navigateWithExit(url) {
    if (!useTransitions || leaving) {
      window.location.href = url;
      return;
    }
    leaving = true;
    document.documentElement.classList.remove('page-enter-active');
    document.documentElement.classList.add('page-leave');
    window.setTimeout(function () {
      window.location.href = url;
    }, EXIT_MS);
    // Safety recovery if page navigation is aborted
    window.setTimeout(function () {
      leaving = false;
      document.documentElement.classList.remove('page-leave');
    }, 1600);
  }

  function markPageLinks() {
    document.querySelectorAll('a[href]').forEach(function (a) {
      if (isSiteLink(a)) a.classList.add('page-link');
    });
  }

  if (useTransitions) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var a = e.target.closest('a[href]');
      if (!isSiteLink(a)) return;

      var dest = pageFromHref(a.href);
      var current = pageFromHref(window.location.href);
      if (dest === current) return;

      e.preventDefault();
      navigateWithExit(a.href);
    }, true);

    window.addEventListener('pageshow', function (e) {
      leaving = false;
      document.documentElement.classList.remove('page-leave');
      if (e.persisted) {
        document.documentElement.classList.add('page-enter');
        startEnter();
      }
    });
  }

  function boot() {
    markPageLinks();
    if (useTransitions) {
      wrapPageRoot();
      startEnter();
    } else {
      revealContent(true);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
