/* The Todd House — site behaviours
   Progressive enhancement only: every page works with JS disabled. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var drawer = document.getElementById('mobile-nav');
  if (toggle && drawer) {
    var lastFocus = null;

    var setNav = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
      drawer.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('nav-open', open);
      if (open) {
        lastFocus = document.activeElement;
        var first = drawer.querySelector('a, button');
        if (first) first.focus();
      } else if (lastFocus) {
        lastFocus.focus();
      }
    };

    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a, .mobile-nav__close')) setNav(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setNav(false);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (revealables.length) {
    if (reduced || !('IntersectionObserver' in window)) {
      revealables.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
      revealables.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---------- Accordions (FAQ) ---------- */
  document.querySelectorAll('.accordion__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.setAttribute('data-open', String(!open));
    });
  });

  /* ---------- Gallery filters ---------- */
  var filters = document.querySelectorAll('.filter');
  if (filters.length) {
    var figures = document.querySelectorAll('.grid-gallery figure');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var want = btn.dataset.filter;
        filters.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        figures.forEach(function (fig) {
          fig.hidden = !(want === 'all' || fig.dataset.category === want);
        });
        if (window.__toddRebuildLightbox) window.__toddRebuildLightbox();
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var stage    = lb.querySelector('.lightbox__stage img');
    var caption  = lb.querySelector('.lightbox__caption');
    var counter  = lb.querySelector('.lightbox__count');
    var btnPrev  = lb.querySelector('[data-lb="prev"]');
    var btnNext  = lb.querySelector('[data-lb="next"]');
    var btnClose = lb.querySelector('[data-lb="close"]');
    var items = [];
    var index = 0;
    var opener = null;

    var collect = function () {
      items = Array.prototype.filter.call(
        document.querySelectorAll('.grid-gallery figure'),
        function (fig) { return !fig.hidden; }
      ).map(function (fig) {
        var img = fig.querySelector('img');
        var cap = fig.querySelector('figcaption');
        return { src: img.dataset.full || img.currentSrc || img.src, alt: img.alt, caption: cap ? cap.textContent : img.alt };
      });
    };
    window.__toddRebuildLightbox = collect;

    var show = function (i) {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      var it = items[index];
      stage.src = it.src;
      stage.alt = it.alt;
      caption.textContent = it.caption;
      counter.textContent = (index + 1) + ' / ' + items.length;
    };

    var open = function (i, from) {
      collect();
      opener = from || null;
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
      show(i);
      btnClose.focus();
    };

    var close = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
      stage.removeAttribute('src');
      if (opener) opener.focus();
    };

    document.querySelectorAll('.grid-gallery button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        collect();
        var visible = Array.prototype.filter.call(
          document.querySelectorAll('.grid-gallery figure'),
          function (f) { return !f.hidden; }
        );
        open(visible.indexOf(btn.closest('figure')), btn);
      });
    });

    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', function () { show(index - 1); });
    btnNext.addEventListener('click', function () { show(index + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------- Date inputs: sensible minimums ---------- */
  var today = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.min) input.min = today;
  });
  var arrive = document.getElementById('arrive');
  var depart = document.getElementById('depart');
  if (arrive && depart) {
    arrive.addEventListener('change', function () {
      depart.min = arrive.value || today;
      if (depart.value && depart.value <= arrive.value) depart.value = '';
    });
  }

  /* ---------- Contact / enquiry form (no back end: hands off to email) ---------- */
  document.querySelectorAll('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (value, key) {
        if (String(value).trim()) lines.push(key + ': ' + value);
      });
      var subject = form.dataset.subject || 'Website enquiry — The Todd House';
      var href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\n'));
      window.location.href = href;
      if (status) {
        status.hidden = false;
        status.textContent =
          'Opening your email app with this message ready to send. ' +
          'If nothing happens, please call (724) 305-2797 or email jimandlinda425@comcast.net.';
      }
    });
  });

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
