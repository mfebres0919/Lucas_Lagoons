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
    { id: 'hero',         href: 'index.html' },
    { id: 'about',        href: '#about' },
    { id: 'series',       href: '#series' },
    { id: 'portfolio',    href: 'html/portfolio.html' },
    { id: 'work',         href: '#work' },
    { id: 'testimonials', href: '#testimonials' },
    { id: 'blog',         href: 'html/blog.html' },
    { id: 'contact',      href: '#contact' }
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

  /* ── Marquees (testimonials + credentials stats) ──
     Duplicate each track's children so the -50% loop is seamless. */
  document.querySelectorAll('.tm-track, .creds-track').forEach(function (track) {
    Array.prototype.slice.call(track.children).forEach(function (card) {
      var clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });

  /* ── Stacked project cards (Featured Pool Projects) ──
     Desktop: hover brings a card to the front + expands it.
     Touch: tap a card to expand it. */
  (function projectStack() {
    var stack = document.querySelector('.stack');
    if (!stack) return;
    var cards = Array.prototype.slice.call(stack.querySelectorAll('.stack-card'));
    if (!cards.length) return;

    var canHover = window.matchMedia('(hover: hover)');
    var defaultCard = cards.filter(function (c) { return c.classList.contains('is-active'); })[0] || cards[0];

    function setActive(card) {
      cards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
    }

    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () { if (canHover.matches) setActive(card); });
      // Tap (touch) expands; if it's already active, let the link through.
      card.addEventListener('click', function (e) {
        if (canHover.matches) return;                 // desktop uses hover
        if (!card.classList.contains('is-active') && !e.target.closest('.stack-card-link')) {
          e.preventDefault();
          setActive(card);
        }
      });
    });

    stack.addEventListener('mouseleave', function () { if (canHover.matches) setActive(defaultCard); });
  })();

  /* ── Our Work: Photos / Reels toggle ── */
  (function workTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll('.work-tab'));
    var panels = Array.prototype.slice.call(document.querySelectorAll('.work-panel'));
    if (!tabs.length || !panels.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-worktab');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-workpanel') === key);
        });
        // Nudge the reels to play when their panel becomes visible
        if (key === 'reels') {
          document.querySelectorAll('.work-panel[data-workpanel="reels"] video.reel-video').forEach(function (v) {
            var pr = v.play();
            if (pr && typeof pr.catch === 'function') pr.catch(function () {});
          });
        }
      });
    });
  })();

  /* ── Gallery: filter tabs · desktop drag · mobile swipe/tap ── */
  (function galleryCarousel() {
    var track = document.getElementById('galleryTrack');
    var wrap  = document.getElementById('galleryTrackWrap');
    var btns  = document.querySelectorAll('.gallery-filter-btn');
    if (!track || !wrap) return;

    var currentOffset = 0;

    function visibleCards() { return Array.prototype.slice.call(track.querySelectorAll('.gallery-card:not(.is-hidden)')); }
    function perView() { if (window.innerWidth >= 1024) return 4; if (window.innerWidth >= 600) return 2; return 1; }
    function cardWidth() { var c = visibleCards()[0]; return c ? c.offsetWidth : 0; }
    function currentX() { var m = new DOMMatrix(window.getComputedStyle(track).transform); return m.m41; }

    function goToOffset(index) {
      var cards = visibleCards();
      var max = Math.max(0, cards.length - perView());
      currentOffset = Math.min(Math.max(index, 0), max);
      track.classList.remove('is-dragging');
      track.style.transform = 'translateX(-' + (currentOffset * cardWidth()) + 'px)';
    }

    window.addEventListener('resize', function () { currentOffset = 0; track.style.transform = 'translateX(0)'; }, { passive: true });

    /* Filter tabs */
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var filter = btn.dataset.filter;
        track.querySelectorAll('.gallery-card').forEach(function (card) {
          card.classList.toggle('is-hidden', filter !== 'all' && card.dataset.category !== filter);
        });
        currentOffset = 0;
        track.style.transform = 'translateX(0)';
      });
    });

    /* Desktop drag */
    var dragStartX = 0, dragStartOff = 0, isDragging = false, hasDragged = false;
    wrap.addEventListener('mousedown', function (e) {
      if (window.innerWidth < 1024) return;
      isDragging = true; hasDragged = false;
      dragStartX = e.clientX; dragStartOff = currentX();
      track.classList.add('is-dragging'); wrap.classList.add('is-dragging');
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 4) hasDragged = true;
      var cards = visibleCards();
      var maxPx = Math.max(0, cards.length - perView()) * cardWidth();
      var newX = Math.min(0, Math.max(dragStartOff + dx, -maxPx));
      track.style.transform = 'translateX(' + newX + 'px)';
    });
    window.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false; wrap.classList.remove('is-dragging');
      if (hasDragged) {
        var cw = cardWidth();
        if (cw) goToOffset(Math.round(-currentX() / cw));
      }
    });
    /* Swallow the click right after a drag so it doesn't follow a link */
    wrap.addEventListener('click', function (e) { if (hasDragged) { e.preventDefault(); hasDragged = false; } }, true);

    /* Mobile tap-to-reveal */
    var touchedCard = null, touchStartX = 0, touchStartY = 0, didScroll = false;
    var isTouch = function () { return window.matchMedia('(hover: none)').matches; };
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; didScroll = false;
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      if (Math.abs(e.touches[0].clientX - touchStartX) > 8 || Math.abs(e.touches[0].clientY - touchStartY) > 8) didScroll = true;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (didScroll || !isTouch()) return;
      var card = e.target.closest('.gallery-card');
      if (!card) { if (touchedCard) { touchedCard.classList.remove('is-touched'); touchedCard = null; } return; }
      if (card === touchedCard) { card.classList.remove('is-touched'); touchedCard = null; }
      else { e.preventDefault(); if (touchedCard) touchedCard.classList.remove('is-touched'); card.classList.add('is-touched'); touchedCard = card; }
    });
    document.addEventListener('touchend', function (e) {
      if (touchedCard && !track.contains(e.target)) { touchedCard.classList.remove('is-touched'); touchedCard = null; }
    }, { passive: true });
  })();

  /* ── Animated stat counters ───────────────────────
     Count up from 0 → data-count when scrolled into view. */
  (function statCounters() {
    var nums = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    if (!nums.length) return;

    function finalText(el) { return el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); }

    if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) {
      nums.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        var dur = 1500;
        var startTs = null;
        function tick(ts) {
          if (startTs === null) startTs = ts;
          var p = Math.min((ts - startTs) / dur, 1);
          var eased = p * p * (3 - 2 * p);               // smoothstep
          el.textContent = Math.floor(eased * target) + suffix;
          if (p < 1) window.requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });

    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ── Quote wizard ─────────────────────────────────
     Multi-step form. Step 1 picks the service, then the
     sequence branches by series. Validates each step before
     advancing; fake-submits to a success panel. */
  (function quoteWizard() {
    var form = document.getElementById('quoteForm');
    if (!form) return;

    var card     = form.closest('.quote-card');
    var steps    = {};
    form.querySelectorAll('.qf-step').forEach(function (s) { steps[s.id] = s; });

    var SEQ = {
      'Designer Series':  ['qfService', 'qfDesignerProject', 'qfContact', 'qfDesignerMessage', 'qfDesignerFinish'],
      'Signature Series': ['qfService', 'qfSignatureProject', 'qfSignatureSource', 'qfContact', 'qfSignatureMessage', 'qfSignatureFinish']
    };

    var seq     = ['qfService'];
    var current = 0;

    var backBtn   = form.querySelector('.qf-back');
    var nextBtn   = form.querySelector('.qf-next');
    var submitBtn = form.querySelector('.qf-submit');
    var bar       = card.querySelector('.qf-progress-bar span');
    var progText  = card.querySelector('.qf-progress-text');

    function chosenService() {
      var r = form.querySelector('input[name="service"]:checked');
      return r ? r.value : null;
    }

    function render() {
      seq.forEach(function (id, i) {
        steps[id].classList.toggle('is-active', i === current);
      });
      var last = seq.length > 1 && current === seq.length - 1;
      backBtn.style.display   = current === 0 ? 'none' : '';
      nextBtn.style.display   = last ? 'none' : '';
      submitBtn.style.display = last ? '' : 'none';

      if (seq.length > 1) {
        bar.style.width = ((current + 1) / seq.length * 100) + '%';
        progText.textContent = 'Step ' + (current + 1) + ' of ' + seq.length;
      } else {
        bar.style.width = '12%';
        progText.textContent = 'Step 1';
      }
    }

    function validate(id) {
      var el = steps[id];
      var ok = true;

      // required radio groups
      var groups = {};
      el.querySelectorAll('input[type="radio"]').forEach(function (r) {
        (groups[r.name] = groups[r.name] || []).push(r);
      });
      Object.keys(groups).forEach(function (name) {
        var arr = groups[name];
        var required = arr.some(function (r) { return r.required; });
        var checked  = arr.some(function (r) { return r.checked; });
        var grp = arr[0].closest('.qf-group');
        if (required && !checked) { ok = false; if (grp) grp.classList.add('qf-group-invalid'); }
        else if (grp) { grp.classList.remove('qf-group-invalid'); }
      });

      // required text / select / textarea / checkbox
      el.querySelectorAll('input[required]:not([type="radio"]), select[required], textarea[required]').forEach(function (f) {
        var bad = false;
        if (f.type === 'checkbox') bad = !f.checked;
        else if (!f.value.trim()) bad = true;
        else if (f.type === 'email') bad = !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value);
        if (bad) {
          ok = false;
          f.classList.add('qf-invalid');
          f.addEventListener('input',  function h() { f.classList.remove('qf-invalid'); f.removeEventListener('input', h); });
          f.addEventListener('change', function h() { f.classList.remove('qf-invalid'); f.removeEventListener('change', h); });
        }
      });

      return ok;
    }

    function go(i) {
      current = i;
      render();
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    nextBtn.addEventListener('click', function () {
      var id = seq[current];
      if (!validate(id)) return;
      if (id === 'qfService') seq = SEQ[chosenService()] || ['qfService'];
      go(current + 1);
    });

    backBtn.addEventListener('click', function () {
      if (current > 0) go(current - 1);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(seq[current])) return;
      Object.keys(steps).forEach(function (id) { steps[id].classList.remove('is-active'); });
      steps.qfSuccess.classList.add('is-active');
      form.querySelector('.qf-nav').style.display = 'none';
      bar.style.width = '100%';
      progText.textContent = 'Complete';
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    render();
  })();

  /* ── Parallax backgrounds ─────────────────────────
     Drift any [data-parallax] layer slower than the page scroll so its
     section's photo glides as you scroll past. Layer is sized taller
     than its section (CSS) so it never exposes a gap. */
  (function parallax() {
    var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!layers.length || !window.requestAnimationFrame) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;
    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      layers.forEach(function (layer) {
        var section = layer.parentElement;
        var rect = section.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;     // off-screen → skip
        var progress = (vh - rect.top) / (vh + rect.height);  // 0 → 1 as it passes through
        var y = (progress - 0.5) * section.offsetHeight * 0.3;
        layer.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
      });
      ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  })();

  /* ── Blog carousel ────────────────────────────────
     6 cards, 3/2/1 per view; auto-advance + arrows + dots. */
  (function blogCarousel() {
    var track = document.getElementById('blogTrack');
    var dots  = document.getElementById('blogDots');
    var outer = document.getElementById('blogCarouselOuter');
    if (!track || !dots) return;

    var total = track.querySelectorAll('.blog-card').length;
    var current = 0;
    var timer = null;

    function perView() { if (window.innerWidth >= 1024) return 3; if (window.innerWidth >= 600) return 2; return 1; }
    function totalSlides() { return Math.max(0, total - perView()); }

    function buildDots() {
      dots.innerHTML = '';
      for (var i = 0; i <= totalSlides(); i++) {
        var d = document.createElement('button');
        d.className = 'blog-dot' + (i === 0 ? ' is-active' : '');
        d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        (function (idx) { d.addEventListener('click', function () { go(idx); restart(); }); })(i);
        dots.appendChild(d);
      }
    }

    function go(index) {
      current = Math.min(Math.max(index, 0), totalSlides());
      var card = track.querySelector('.blog-card');
      var w = card ? card.offsetWidth + 24 : 0;   // card + 1.5rem gap
      track.style.transform = 'translateX(-' + (current * w) + 'px)';
      Array.prototype.forEach.call(dots.querySelectorAll('.blog-dot'), function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }
    function next() { go(current >= totalSlides() ? 0 : current + 1); }
    function start() { stop(); timer = window.setInterval(next, 6000); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    function restart() { start(); }

    var prev = document.getElementById('blogPrev');
    var nxt  = document.getElementById('blogNext');
    if (prev) prev.addEventListener('click', function () { go(current <= 0 ? totalSlides() : current - 1); restart(); });
    if (nxt)  nxt.addEventListener('click',  function () { next(); restart(); });

    if (outer) {
      outer.addEventListener('mouseenter', stop);
      outer.addEventListener('mouseleave', start);
    }
    window.addEventListener('resize', function () { buildDots(); go(0); }, { passive: true });

    buildDots();
    go(0);
    start();
  })();

  /* ── Portfolio listing: filter project cards ── */
  (function portfolioFilter() {
    var btns  = Array.prototype.slice.call(document.querySelectorAll('.pf-filter-btn'));
    var cards = Array.prototype.slice.call(document.querySelectorAll('.pf-card'));
    if (!btns.length || !cards.length) return;
    var empty = document.querySelector('.pf-empty');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var f = btn.getAttribute('data-filter');
        var shown = 0;
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-category') === f;
          c.classList.toggle('is-hidden', !show);
          if (show) shown++;
        });
        if (empty) empty.style.display = shown ? 'none' : 'block';
      });
    });
  })();

  /* ── Project page: photo-grid lightbox ── */
  (function projectGallery() {
    var photos = Array.prototype.slice.call(document.querySelectorAll('.pj-photo'));
    var lb = document.getElementById('pfLightbox');
    if (!photos.length || !lb) return;
    var lbImg = document.getElementById('pfLbImg');
    var lbCap = document.getElementById('pfLbCaption');
    var index = 0;

    function render() {
      var it = photos[index];
      if (!it) return;
      lbImg.src = it.getAttribute('data-full');
      lbImg.alt = it.getAttribute('data-title') || '';
      lbCap.innerHTML = '<small>' + (it.getAttribute('data-cat') || '') + '</small>' + (it.getAttribute('data-title') || '');
    }
    function step(dir) { index = (index + dir + photos.length) % photos.length; render(); }
    function open(it) {
      index = photos.indexOf(it);
      render();
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    photos.forEach(function (it) { it.addEventListener('click', function (e) { e.preventDefault(); open(it); }); });
    lb.querySelector('.pf-lb-close').addEventListener('click', close);
    lb.querySelector('.pf-lb-prev').addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    lb.querySelector('.pf-lb-next').addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('pf-lb-stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  })();

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
