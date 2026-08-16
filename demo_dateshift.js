/* Revenue Sentinel — public DEMO — rolling dates.
 *
 * The bundle is a frozen snapshot: every NUMBER (revenue, ADR, occupancy, rates)
 * stays exactly as built. Only DATES move, by the whole days elapsed since the
 * build, so a visitor always sees "today" and the whole demo stays mutually
 * consistent (dashboard, rates calendar, charts and stamps all agree).
 *
 * Only text nodes are rewritten, and <script>/<style> are skipped, so chart data
 * and page logic are never touched.
 */
(function () {
  var BUILD = '2026-08-16';                 // YYYY-MM-DD, injected at build
  var base = new Date(BUILD + 'T00:00:00');
  var now = new Date(); now.setHours(0, 0, 0, 0);
  var OFF = Math.round((now - base) / 86400000);
  if (!isFinite(OFF) || OFF <= 0) return;       // build day (or a clock behind it): leave as-is

  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var BUILD_YEAR = base.getFullYear();

  function shift(y, m, d) {                     // m is 1-based
    var dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + OFF);
    return dt;
  }
  var p2 = function (n) { return (n < 10 ? '0' : '') + n; };

  // ---- 1. ISO  2026-08-16 ------------------------------------------------
  var RE_ISO = /\b(20\d{2})-(\d{2})-(\d{2})\b/g;
  function subIso(s) {
    return s.replace(RE_ISO, function (m, y, mo, d) {
      mo = +mo; d = +d;
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return m;   // e.g. 2026-W31 never matches anyway
      var t = shift(+y, mo, d);
      return t.getFullYear() + '-' + p2(t.getMonth() + 1) + '-' + p2(t.getDate());
    });
  }

  // ---- 2. D/M/Y  16/08/2026 ---------------------------------------------
  var RE_DMY = /\b(\d{2})\/(\d{2})\/(20\d{2})\b/g;
  function subDmy(s) {
    return s.replace(RE_DMY, function (m, d, mo, y) {
      mo = +mo; d = +d;
      if (mo < 1 || mo > 12 || d < 1 || d > 31) return m;
      var t = shift(+y, mo, d);
      return p2(t.getDate()) + '/' + p2(t.getMonth() + 1) + '/' + t.getFullYear();
    });
  }

  // ---- 3. Approvals row label  "5 Aug-Wed" ------------------------------
  var RE_DMONW = /\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/g;
  function subDMonW(s) {
    return s.replace(RE_DMONW, function (m, d, mon) {
      var t = shift(BUILD_YEAR, MON.indexOf(mon) + 1, +d);
      return t.getDate() + ' ' + MON[t.getMonth()] + '-' + DOW[t.getDay()];
    });
  }

  // ---- 3b. "16 Aug 2026"  (dashboard: "Generated HH:MM on D Mon YYYY") ---
  var RE_DMONY = /\b(\d{1,2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (20\d{2})\b/g;
  function subDMonY(s) {
    return s.replace(RE_DMONY, function (m, d, mon, y) {
      var t = shift(+y, MON.indexOf(mon) + 1, +d);
      return t.getDate() + ' ' + MON[t.getMonth()] + ' ' + t.getFullYear();
    });
  }

  function rewrite(s) { return subDMonY(subDMonW(subDmy(subIso(s)))); }

  // ---- walk text nodes only (never <script>/<style>) ---------------------
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: function (n) {
      return (n.parentNode && SKIP[n.parentNode.nodeName])
        ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }
  });
  var nodes = [], n;
  while ((n = walker.nextNode())) nodes.push(n);
  nodes.forEach(function (t) {
    var v = t.nodeValue;
    if (!v || v.length < 4) return;
    var out = rewrite(v);
    if (out !== v) t.nodeValue = out;
  });

  // The <title> lives outside <body>, so the TreeWalker never reaches it and the
  // browser tab would keep showing the build date.
  if (document.title) document.title = rewrite(document.title);

  // ---- 4. Rates calendar: <span class="wd">Sun</span><span class="dt">Aug 16</span>
  // The weekday must be RECOMPUTED, not shifted as text, or Mon/Tue go wrong.
  document.querySelectorAll('.dt').forEach(function (el) {
    var m = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{1,2})$/.exec(el.textContent.trim());
    if (!m) return;
    var t = shift(BUILD_YEAR, MON.indexOf(m[1]) + 1, +m[2]);
    el.textContent = MON[t.getMonth()] + ' ' + t.getDate();
    var card = el.closest('.cell') || el.parentNode;
    var wd = card && card.querySelector('.wd');
    if (wd) wd.textContent = DOW[t.getDay()];
  });

  // ---- 5. Compset chart axis: <text class="xlab">08-16</text> ------------
  document.querySelectorAll('text.xlab').forEach(function (el) {
    var m = /^(\d{2})-(\d{2})$/.exec(el.textContent.trim());
    if (!m) return;
    var t = shift(BUILD_YEAR, +m[1], +m[2]);
    el.textContent = p2(t.getMonth() + 1) + '-' + p2(t.getDate());
  });
})();
