/**
 * Shared behaviour for every page. Loaded with `defer`, so it never blocks
 * rendering and the DOM is ready by the time it runs.
 *
 * Everything here is an enhancement. Without JavaScript the navigation links
 * still work, every section is visible, every figure shows its real value and
 * every bar shows its real length — nothing here is load-bearing.
 */

(function () {
  'use strict';

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* older browser: treat as no preference */ }

  /* ------------------------------------------------------------- mobile nav */

  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------------------------------------------------------------- reveals */

  var reveals = document.querySelectorAll('.reveal');

  /* Pre-animation state, installed by this script rather than by the
   * stylesheet. If app.js fails to load, no bar is ever zeroed and no figure
   * is ever blanked — the page just renders its real values with no animation.
   * Doing it synchronously here avoids a flash of the final state on any
   * chart that is already in view when the deferred script runs. */
  var pending = [];
  if (!reduce) {
    var css = document.createElement('style');
    css.textContent = '.bar[data-pending]{width:0 !important;transition:none}';
    document.head.appendChild(css);
    var allBars = document.querySelectorAll('.bar');
    for (var b = 0; b < allBars.length; b++) {
      allBars[b].setAttribute('data-pending', '');
      pending.push(allBars[b]);
    }
  }

  /* ------------------------------------------------------------- count-up
   * Figures animate from zero to the value already written in the HTML. The
   * text is the source of truth; this only re-renders it on the way up, so a
   * failure here leaves the correct number on screen.
   *
   * Handles the formats actually used on this site:
   *   47,835      AED 1.20M      11.83%      120+      AED 480M      8
   * Anything with no digits ("All") is left alone.
   */

  function parseFigure(text) {
    var m = text.match(/-?[\d,]*\.?\d+/);
    if (!m) return null;
    var num = parseFloat(m[0].replace(/,/g, ''));
    if (isNaN(num)) return null;
    return {
      value: num,
      prefix: text.slice(0, m.index),
      suffix: text.slice(m.index + m[0].length),
      decimals: (m[0].split('.')[1] || '').length,
      grouped: m[0].indexOf(',') !== -1
    };
  }

  function render(parts, v) {
    var body = parts.decimals
      ? v.toFixed(parts.decimals)
      : String(Math.round(v));
    if (parts.grouped) {
      var bits = body.split('.');
      bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      body = bits.join('.');
    }
    return parts.prefix + body + parts.suffix;
  }

  function countUp(el) {
    if (el.dataset.counted) return;
    var parts = parseFigure(el.textContent.trim());
    if (!parts) { el.dataset.counted = '1'; return; }
    el.dataset.counted = '1';

    var final = el.textContent;
    if (reduce) return;                       // leave the value exactly as written

    // Reserve the final width so the layout does not jitter as digits change.
    el.style.display = 'inline-block';
    el.style.minWidth = el.getBoundingClientRect().width + 'px';

    var dur = 1100, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);     // ease-out cubic
      el.textContent = p === 1 ? final : render(parts, parts.value * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* --------------------------------------------------------------- bar grow */

  function growBars(scope) {
    var bars = scope.querySelectorAll('.bar');
    for (var i = 0; i < bars.length; i++) {
      (function (bar, i) {
        if (bar.dataset.grown) return;
        bar.dataset.grown = '1';
        if (reduce) { bar.removeAttribute('data-pending'); return; }
        setTimeout(function () {
          bar.style.transition = 'width .9s cubic-bezier(.16,1,.3,1)';
          bar.removeAttribute('data-pending');
        }, 60 + i * 70);
      })(bars[i], i);
    }
  }

  /* ----------------------------------------------------------- freshness
   * The HTML carries the absolute date, so it is correct with no JavaScript.
   * This rewrites it as a relative age, which keeps telling the truth as the
   * snapshot gets older instead of freezing at the day it was written. */

  var stamps = document.querySelectorAll('[data-updated]');
  for (var s = 0; s < stamps.length; s++) {
    (function (el) {
      var iso = el.getAttribute('data-updated');
      var then = new Date(iso + 'T00:00:00Z');
      if (isNaN(then.getTime())) return;
      var absolute = el.textContent.trim();
      var days = Math.floor((Date.now() - then.getTime()) / 86400000);
      var label;
      if (days < 0) return;                       // clock skew: leave it alone
      else if (days === 0) label = 'Updated today';
      else if (days === 1) label = 'Updated yesterday';
      else if (days < 14) label = 'Updated ' + days + ' days ago';
      else if (days < 60) label = 'Updated ' + Math.floor(days / 7) + ' weeks ago';
      else label = 'Updated ' + Math.floor(days / 30) + ' months ago';
      el.innerHTML = label.replace(/(\d+)/, '<b>$1</b>');
      el.setAttribute('title', absolute);
    })(stamps[s]);
  }

  /* ------------------------------------------------------------- observers */

  function activate(el) {
    el.classList.add('in');
    var figs = el.querySelectorAll('.figure, .ticker-item b');
    for (var i = 0; i < figs.length; i++) countUp(figs[i]);
    if (el.classList.contains('chart') || el.querySelector('.bar')) growBars(el);
  }

  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) activate(reveals[i]);
    var charts = document.querySelectorAll('.chart');
    for (var j = 0; j < charts.length; j++) growBars(charts[j]);
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      activate(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

  for (var k = 0; k < reveals.length; k++) io.observe(reveals[k]);

  // Charts are not always inside a .reveal, so watch them directly too.
  var allCharts = document.querySelectorAll('.chart');
  for (var m = 0; m < allCharts.length; m++) io.observe(allCharts[m]);

  // Failsafe: nothing should stay invisible because an observer did not fire.
  setTimeout(function () {
    for (var i = 0; i < pending.length; i++) {
      if (pending[i].hasAttribute('data-pending')) {
        pending[i].style.transition = 'width .9s cubic-bezier(.16,1,.3,1)';
        pending[i].removeAttribute('data-pending');
      }
    }
  }, 6000);
})();
