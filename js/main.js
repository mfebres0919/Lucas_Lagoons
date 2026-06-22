/* ============================================================
   LUCAS LAGOONS — js/main.js
   Site-wide interactions:
     • Mobile drawer (open/close, overlay, Esc)
     • Navbar scroll shadow
     • Scroll-reveal (IntersectionObserver)
     • Hero background carousel (crossfade + dots)
     • Scroll-to-top button
   Section-specific behavior is added here as sections are built.
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile drawer ───────────────────────────── */
  const hamburger = document.querySelector('.nav-hamburger');
  const drawer    = document.getElementById('navDrawer');
  const overlay   = document.querySelector('.nav-overlay');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay && overlay.classList.add('is-active');
    hamburger && hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay && overlay.classList.remove('is-active');
    hamburger && hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger && hamburger.addEventListener('click', openDrawer);
  document.querySelectorAll('[data-drawer-close]').forEach(function (el) {
    el.addEventListener('click', closeDrawer);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDrawer();
  });

  /* ── Navbar scroll shadow ────────────────────── */
  const navbar = document.getElementById('navbar');
  function onScrollNav() {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ── Scrollspy: highlight the nav link for the section in view ── */
  var spyMap = [
    { id: 'hero',      href: 'index.html' },
    { id: 'about',     href: '#about' },
    { id: 'series',    href: '#series' },
    { id: 'portfolio', href: '#portfolio' },
    { id: 'contact',   href: '#contact' }
  ];
  var spyLinks = {};
  spyMap.forEach(function (s) {
    spyLinks[s.id] = Array.prototype.slice.call(
      document.querySelectorAll('.nav-links a[href="' + s.href + '"], .nav-drawer a[href="' + s.href + '"]')
    );
  });
  var spySections = spyMap
    .map(function (s) { return document.getElementById(s.id); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && spySections.length) {
    var setActiveNav = function (id) {
      Object.keys(spyLinks).forEach(function (key) {
        spyLinks[key].forEach(function (a) { a.classList.toggle('is-active', key === id); });
      });
    };
    var spyIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setActiveNav(e.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    spySections.forEach(function (sec) { spyIo.observe(sec); });
  }

  /* ── Scroll reveal ───────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ── Gallery lightbox ─────────────────────────── */
  var lightbox = document.getElementById('lightbox');
  if (lightbox) {
    var lbImg = document.getElementById('lightboxImg');
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var sources = items.map(function (b) {
      var im = b.querySelector('img');
      return { src: b.getAttribute('data-full'), alt: im ? im.alt : '' };
    });
    var current = 0;

    function showLb(i) {
      current = (i + sources.length) % sources.length;
      lbImg.src = sources[current].src;
      lbImg.alt = sources[current].alt;
    }
    function openLb(i) {
      showLb(i);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    items.forEach(function (b, i) {
      b.addEventListener('click', function () { openLb(i); });
    });
    lightbox.querySelectorAll('[data-lb-close]').forEach(function (el) {
      el.addEventListener('click', closeLb);
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();   // click backdrop closes
    });
    var lbPrev = lightbox.querySelector('[data-lb-prev]');
    var lbNext = lightbox.querySelector('[data-lb-next]');
    lbPrev && lbPrev.addEventListener('click', function (e) { e.stopPropagation(); showLb(current - 1); });
    lbNext && lbNext.addEventListener('click', function (e) { e.stopPropagation(); showLb(current + 1); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showLb(current - 1);
      else if (e.key === 'ArrowRight') showLb(current + 1);
    });
  }

  /* ── Background videos: force autoplay + tighter loops ──────────
     Mobile Safari/Chrome block autoplay unless the muted *property*
     (not just the attribute) is set, and often need a JS play() nudge.
     The loop reset a hair early avoids the end-of-stream stall. */
  document.querySelectorAll('video.hero-video, video.work-video, video.reel-video').forEach(function (v) {
    v.muted = true;                      // set the property, not just the attribute
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', '');

    var tryPlay = function () {
      var p = v.play();
      if (p && typeof p.catch === 'function') p.catch(function () {});
    };
    tryPlay();
    // retry once on the first user gesture if the browser still blocked it
    ['touchstart', 'pointerdown', 'scroll'].forEach(function (evt) {
      window.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
    // and when it scrolls into view
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { tryPlay(); }
        });
      }, { threshold: 0.25 }).observe(v);
    }

    v.addEventListener('timeupdate', function () {
      if (v.duration && v.currentTime >= v.duration - 0.25) {
        v.currentTime = 0;
      }
    });
  });

  /* ── About tabs (Our Story / Approach / Different) ──
     Clicking a tab shows the matching panel and hides the rest. */
  (function aboutTabs() {
    var tabs   = Array.prototype.slice.call(document.querySelectorAll('.about-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.about-panel'));
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var on = p.getAttribute('data-panel') === key;
          p.classList.toggle('is-active', on);
          if (on) { p.removeAttribute('hidden'); } else { p.setAttribute('hidden', ''); }
        });
      });
    });
  })();

  /* ── Hero background carousel ─────────────────────
     Crossfades through .hero-slide elements every ~6s and keeps the
     dots in sync. Dots are clickable. Auto-advance is disabled when
     the user prefers reduced motion or the tab is hidden. */
  (function heroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('#hero .hero-slide'));
    var dots   = Array.prototype.slice.call(document.querySelectorAll('#hero .hero-dot'));
    if (slides.length < 2) return;

    var INTERVAL = 6000;
    var current  = 0;
    var timer    = null;
    var reduce   = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('is-active', idx === current); });
      dots.forEach(function (d, idx) { d.classList.toggle('is-active', idx === current); });
    }
    function next()  { go(current + 1); }
    function start() { if (!reduce && timer === null) timer = window.setInterval(next, INTERVAL); }
    function stop()  { if (timer !== null) { window.clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { go(idx); restart(); });
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    start();
  })();

  /* ── Testimonials marquee ─────────────────────────
     Duplicate each track's cards so the -50% loop is seamless. */
  document.querySelectorAll('.tm-track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  /* ── Scroll-to-top ───────────────────────────── */
  const toTop = document.querySelector('.scroll-top-btn');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
