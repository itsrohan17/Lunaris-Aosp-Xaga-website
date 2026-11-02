/* =============================================
   LUNARIS AOSP — CORE JAVASCRIPT ENGINE
   script.js — Unified, robust, high-performance
   ============================================= */

(function () {
  'use strict';

  /* ── GLOBAL HELPERS & TOAST SYSTEM ── */
  window.showToast = function (msg, duration = 2200) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.innerHTML = `<span class="toast-icon">✓</span> <span>${msg}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  function copyTextToClipboard(text, onSuccess) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        if (onSuccess) onSuccess();
      }).catch(() => {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    ta.style.left = '-9999px';
    ta.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      const ok = document.execCommand('copy');
      if (ok && cb) cb();
    } catch (e) {
      console.warn('Fallback copy failed', e);
    }
    document.body.removeChild(ta);
  }

  /* ── COMMUNITY POPUP & MIRROR POPUP (AUTO-ALIGN & RESIZE SAFE) ── */
  function alignPopup(popup, btn, preferUp = false) {
    if (!popup || !btn) return;
    const rect = btn.getBoundingClientRect();
    const popupWidth = Math.min(280, window.innerWidth - 24);
    popup.style.width = popupWidth + 'px';

    let left = rect.left + (rect.width / 2) - (popupWidth / 2);
    if (left < 12) left = 12;
    if (left + popupWidth > window.innerWidth - 12) {
      left = window.innerWidth - popupWidth - 12;
    }

    const popupHeight = popup.offsetHeight || 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (preferUp && spaceAbove > popupHeight + 16) {
      popup.style.top = (rect.top - popupHeight - 10) + 'px';
      popup.classList.add('pop-upward');
    } else if (spaceBelow >= popupHeight + 16 || spaceBelow > spaceAbove) {
      popup.style.top = (rect.bottom + 10) + 'px';
      popup.classList.remove('pop-upward');
    } else {
      popup.style.top = Math.max(12, rect.top - popupHeight - 10) + 'px';
      popup.classList.add('pop-upward');
    }

    popup.style.left = left + 'px';
  }

  window.toggleCommunity = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const popup = document.getElementById('community-popup');
    const btn = document.getElementById('comm-btn') || (e ? e.currentTarget : null);
    if (!popup || !btn) return;

    const isOpen = popup.classList.contains('open');
    closeAllPopups();

    if (!isOpen) {
      popup.classList.add('open');
      alignPopup(popup, btn, false);
    }
  };

  window.toggleDl38 = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const popup = document.getElementById('dl38-popup');
    const btn = document.getElementById('dl38-btn') || (e ? e.currentTarget : null);
    if (!popup || !btn) return;

    const isOpen = popup.classList.contains('open');
    closeAllPopups();

    if (!isOpen) {
      popup.classList.add('open');
      alignPopup(popup, btn, true);
    }
  };

  function closeAllPopups() {
    document.querySelectorAll('.community-popup, #dl38-popup').forEach(p => p.classList.remove('open'));
    const drawer = document.getElementById('mobile-drawer');
    if (drawer && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
    }
  }

  document.addEventListener('click', function (e) {
    const isInsideComm = e.target.closest('#community-popup') || e.target.closest('#comm-btn');
    const isInsideDl38 = e.target.closest('#dl38-popup') || e.target.closest('#dl38-btn');
    const isInsideDrawer = e.target.closest('#mobile-drawer') || e.target.closest('#mobile-toggle');
    if (!isInsideComm && !isInsideDl38 && !isInsideDrawer) {
      closeAllPopups();
    }
  });

  window.addEventListener('resize', function () {
    const popComm = document.getElementById('community-popup');
    const btnComm = document.getElementById('comm-btn');
    if (popComm && popComm.classList.contains('open') && btnComm) {
      alignPopup(popComm, btnComm, false);
    }
    const popDl38 = document.getElementById('dl38-popup');
    const btnDl38 = document.getElementById('dl38-btn');
    if (popDl38 && popDl38.classList.contains('open') && btnDl38) {
      alignPopup(popDl38, btnDl38, true);
    }
  }, { passive: true });

  window.addEventListener('scroll', function () {
    // Dismiss popups on significant scroll to avoid floating out of context
    document.querySelectorAll('.community-popup, #dl38-popup').forEach(p => p.classList.remove('open'));
  }, { passive: true });

  /* ── COPY CHECKSUM & COPY COMMAND ── */
  window.copyChecksum = function (hashStr, btnElement) {
    const hash = hashStr || 'f1253703c02c9a8f29ef2aacdf60cc3288ffd45cfa2c4b4987b6bb7b59f8f82b';
    const btn = btnElement || document.querySelector('.dl-checksum-copy');
    copyTextToClipboard(hash, function () {
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }
      showToast('SHA-256 hash copied to clipboard');
    });
  };

  window.copyCmd = function (btn, text) {
    if (!text && btn) text = btn.getAttribute('data-cmd');
    if (!text) return;

    copyTextToClipboard(text, function () {
      if (btn) {
        const orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.classList.remove('copied');
        }, 2000);
      }
      showToast('Command copied to clipboard');
    });
  };

  /* ── GUIDE TABS SWITCHER ── */
  window.showTab = function (id, btn) {
    ['win', 'linux', 'termux', 'recovery'].forEach(t => {
      const el = document.getElementById('tab-' + t);
      if (el) el.style.display = (t === id) ? 'block' : 'none';
    });
    document.querySelectorAll('.mtab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    const targetBtn = btn || document.querySelector(`.mtab[data-tab="${id}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
    }
  };

  /* ── SCREENSHOT GALLERY & HORIZONTAL CONTROLS ── */
  window.filterGallery = function (category, clickedBtn) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(b => b.classList.remove('active'));

    if (clickedBtn && clickedBtn.classList) {
      clickedBtn.classList.add('active');
    } else {
      const match = Array.from(btns).find(b => b.textContent.trim().toLowerCase() === category.toLowerCase());
      if (match) match.classList.add('active');
    }

    const items = document.querySelectorAll('.ss-carousel .pw');
    items.forEach(item => {
      const itemCat = item.getAttribute('data-cat') || '';
      if (category === 'all' || itemCat === category) {
        item.style.display = 'block';
        requestAnimationFrame(() => {
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        });
      } else {
        item.style.opacity = '0';
        item.style.transform = 'scale(0.92)';
        setTimeout(() => {
          if (item.style.opacity === '0') item.style.display = 'none';
        }, 250);
      }
    });
  };

  window.scrollGallery = function (direction) {
    const carousel = document.getElementById('ss-carousel');
    if (!carousel) return;
    const scrollAmount = direction === 'next' ? 440 : -440;
    carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  /* ── LIGHTBOX MODAL WITH ZOOM, COUNTER & TOUCH NAVIGATION ── */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCaption = document.getElementById('lightbox-caption');

  let currentGalleryItems = [];
  let currentIdx = 0;

  function refreshGalleryList() {
    const visibleCards = Array.from(document.querySelectorAll('.ss-carousel .pw')).filter(el => {
      return el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none';
    });

    currentGalleryItems = visibleCards.map(card => {
      const img = card.querySelector('img');
      const caption = card.querySelector('.pl') ? card.querySelector('.pl').textContent.trim() : '';
      return {
        src: img ? img.src : '',
        alt: img ? img.alt : '',
        title: caption || (img ? img.alt : 'Screenshot')
      };
    }).filter(item => Boolean(item.src));
  }

  function updateLightboxView() {
    if (!lightboxImg || currentGalleryItems.length === 0) return;
    const current = currentGalleryItems[currentIdx];
    lightboxImg.src = current.src;
    lightboxImg.alt = current.alt || 'Lunaris screenshot preview';

    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIdx + 1} / ${currentGalleryItems.length}`;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = current.title;
    }
  }

  window.openModal = function (src) {
    if (!lightbox || !lightboxImg) return;
    refreshGalleryList();

    const normalizedSrc = decodeURIComponent(src);
    currentIdx = currentGalleryItems.findIndex(item => decodeURIComponent(item.src) === normalizedSrc);
    if (currentIdx === -1) currentIdx = 0;

    updateLightboxView();
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    if (!lightbox) return;
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  window.prevImage = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (currentGalleryItems.length === 0) return;
    currentIdx = (currentIdx - 1 + currentGalleryItems.length) % currentGalleryItems.length;
    updateLightboxView();
  };

  window.nextImage = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();
    if (currentGalleryItems.length === 0) return;
    currentIdx = (currentIdx + 1) % currentGalleryItems.length;
    updateLightboxView();
  };

  if (lightbox) {
    let touchstartX = 0;
    let touchstartY = 0;
    lightbox.addEventListener('touchstart', e => {
      if (e.changedTouches && e.changedTouches[0]) {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
      }
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      if (e.changedTouches && e.changedTouches[0]) {
        const dx = e.changedTouches[0].screenX - touchstartX;
        const dy = e.changedTouches[0].screenY - touchstartY;
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
          if (dx < 0) nextImage();
          else prevImage();
        }
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('show')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });

  /* ── SCROLL OBSERVER (REVEAL ANIMATIONS) ── */
  const revealOpts = window.lunarisRevealOpts
    ? lunarisRevealOpts({ threshold: 0.05, rootMargin: '120px 0px 80px 0px' })
    : { threshold: 0.05, rootMargin: '120px 0px 80px 0px' };

  if ('IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('active', 'visible', 'in-view');
          revealObs.unobserve(e.target);
        }
      });
    }, revealOpts);

    document.querySelectorAll('.scroll-reveal, .tl-item, .feat, .dl-card, .terminal-wrap, .spec-card').forEach(el => {
      revealObs.observe(el);
    });
  } else {
    document.querySelectorAll('.scroll-reveal, .tl-item, .feat, .dl-card, .terminal-wrap, .spec-card').forEach(el => {
      el.classList.add('active', 'visible', 'in-view');
    });
  }

  /* ── GITHUB RELEASES DATA FETCH WITH SMART SESSION CACHING ── */
  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
  };

  const applyReleaseData = (tag, dateStr, dlCount) => {
    setVal('gh-ver', tag || 'v3.13');
    setVal('gh-date', dateStr || 'Nov 2026');
    setVal('gh-dl', dlCount || '1,680+');

    // Also update any header badges or footer indicators
    document.querySelectorAll('.live-tag').forEach(el => el.textContent = tag || 'v3.13');
  };

  const fetchGithubStats = () => {
    const CACHE_KEY = 'lunaris_gh_release_cache';
    const CACHE_TIME_KEY = 'lunaris_gh_cache_time';
    const now = Date.now();
    const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
    const cachedData = sessionStorage.getItem(CACHE_KEY);

    // Cache for 10 minutes to avoid hitting GitHub API rate limits
    if (cachedTime && cachedData && (now - parseInt(cachedTime, 10) < 600000)) {
      try {
        const d = JSON.parse(cachedData);
        applyReleaseData(d.tag, d.date, d.dl);
        return;
      } catch (err) {
        // Fall through to fetch
      }
    }

    fetch('https://api.github.com/repos/itsrohan17/android_device_xiaomi_xaga/releases/latest')
      .then(r => {
        if (!r.ok) throw new Error('Network error');
        return r.json();
      })
      .then(d => {
        const tag = d.tag_name || 'v3.13';
        let dateFormatted = 'Nov 2026';
        if (d.published_at) {
          const dt = new Date(d.published_at);
          dateFormatted = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        let total = 0;
        if (d.assets && Array.isArray(d.assets)) {
          total = d.assets.reduce((sum, a) => sum + (a.download_count || 0), 0);
        }
        const dlFormatted = total > 0 ? total.toLocaleString() : '1,680+';

        applyReleaseData(tag, dateFormatted, dlFormatted);

        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ tag, date: dateFormatted, dl: dlFormatted }));
        sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
      })
      .catch(() => {
        // Graceful fallback with valid latest defaults
        applyReleaseData('v3.13', 'Nov 2026', '1,680+');
      });
  };

  if (window.lunarisWhenIdle) {
    lunarisWhenIdle(fetchGithubStats);
  } else {
    setTimeout(fetchGithubStats, 80);
  }
})();