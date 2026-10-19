/* ============================================================
 *  main.js · 站点内容渲染
 *  约定：页面中 id="xxx" 的容器由本文件按 config.js / cases-data.js 渲染；
 *       元素上的 data-field="contact.phone" 会被配置值自动填充（模板替换）。
 *  无动画、无第三方依赖，纯原生 JS。
 * ============================================================ */

(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var CASES = window.CASES || [];
  var CATS = window.CASE_CATEGORIES || [];

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byPath(path) {
    return path.split('.').reduce(function (o, k) { return (o == null ? o : o[k]); }, CFG);
  }
  function has(v) { return v !== '' && v !== null && v !== undefined; }

  /* ---------- 1. 填充所有 data-field 占位 ---------- */
  function fillFields() {
    $$('[data-field],[data-href-field]').forEach(function (el) {
      var attr = el.getAttribute('data-field-attr');
      var p = el.getAttribute('data-field');
      if (p && !attr) {
        var v = byPath(p);
        if (has(v)) {
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = v;
          else el.textContent = v;
        }
      }
      var hp = el.getAttribute('data-href-field');
      if (hp) {
        var hv = byPath(hp);
        if (has(hv)) el.setAttribute('href', hv);
      }
    });
  }

  /* ---------- 2. 数据条 ---------- */
  function renderStats() {
    var box = $('#stats-grid'); if (!box || !CFG.stats) return;
    box.innerHTML = CFG.stats.map(function (s) {
      return '<div class="stat"><b>' + esc(s.value) + '</b><span>' + esc(s.label) + '</span></div>';
    }).join('');
  }

  /* ---------- 3. 主营 / 次营 ---------- */
  function renderBusiness() {
    var m = $('#main-biz-list');
    if (m && CFG.mainBusiness) {
      m.innerHTML = CFG.mainBusiness.map(function (b, i) {
        return '<article class="card">' +
          '<span class="no">0' + (i + 1) + '</span>' +
          '<h3>' + esc(b.title) + '</h3>' +
          '<p>' + esc(b.desc) + '</p>' +
          '<ul>' + (b.items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
          '</article>';
      }).join('');
    }
    var s = $('#sub-biz-list');
    if (s && CFG.subBusiness) {
      s.innerHTML = CFG.subBusiness.map(function (b) {
        return '<article class="card">' +
          '<h3>' + esc(b.title) + '</h3>' +
          '<p>' + esc(b.desc) + '</p>' +
          '<ul>' + (b.items || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
          '</article>';
      }).join('');
    }
  }

  /* ---------- 4. 业务分类（场景图卡） ---------- */
  function renderSolutions() {
    var box = $('#solutions-list'); if (!box || !CFG.solutions) return;
    box.innerHTML = CFG.solutions.map(function (s) {
      return '<article class="panel">' +
        '<img src="' + esc(s.img) + '" alt="' + esc(s.title) + '防雷示意" loading="lazy">' +
        '<div class="panel-body">' +
        '<h3>' + esc(s.title) + '</h3>' +
        '<p>' + esc(s.desc) + '</p>' +
        '<div class="tags">' + (s.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
        '</div></article>';
    }).join('');
  }

  /* ---------- 5. 设备展示 ---------- */
  function renderProducts() {
    var box = $('#products-list'); if (!box || !CFG.products) return;
    box.innerHTML = CFG.products.map(function (p) {
      return '<div class="prod">' +
        '<figure class="prod-img">' +
        '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy">' +
        '<figcaption>' + esc(p.caption) + '</figcaption>' +
        '</figure>' +
        '<div>' +
        '<h3 style="font-size:19px;color:var(--ink);margin-bottom:14px;">' + esc(p.name) + '</h3>' +
        '<table class="spec"><tbody>' +
        (p.specs || []).map(function (r) {
          return '<tr><th>' + esc(r[0]) + '</th><td>' + esc(r[1]) + '</td></tr>';
        }).join('') +
        '</tbody></table>' +
        '</div></div>';
    }).join('');
  }

  /* ---------- 6. 工程亮点 / 流程 / 资质 / 规范 ---------- */
  function renderHighlights() {
    var h = $('#highlights-list');
    if (h && CFG.highlights) {
      h.innerHTML = '<div class="hl">' + CFG.highlights.map(function (x) {
        return '<div class="hl-item"><b>' + esc(x.t) + '</b><span>' + esc(x.d) + '</span></div>';
      }).join('') + '</div>';
    }
    var p = $('#process-list');
    if (p && CFG.process) {
      p.innerHTML = '<div class="steps">' + CFG.process.map(function (s) {
        return '<div class="step"><b>' + esc(s.n) + '</b><h4>' + esc(s.t) + '</h4><p>' + esc(s.d) + '</p></div>';
      }).join('') + '</div>';
    }
    var q = $('#qual-list');
    if (q && CFG.qualifications) {
      q.innerHTML = '<div class="qual">' + CFG.qualifications.map(function (x) {
        return '<span>' + esc(x) + '</span>';
      }).join('') + '</div>';
    }
    var st = $('#std-list');
    if (st && CFG.standards) {
      st.innerHTML = '<ul class="std">' + CFG.standards.map(function (s) {
        return '<li><span>' + esc(s.name) + '</span><b>' + esc(s.code) + '</b></li>';
      }).join('') + '</ul>';
    }
  }

  /* ---------- 7. 案例卡片 ---------- */
  function caseCard(c) {
    return '<article class="case" id="' + esc(c.id) + '">' +
      '<img src="' + esc(c.cover) + '" alt="' + esc(c.title) + '" loading="lazy">' +
      '<div class="case-body">' +
      '<span class="case-meta">' + esc(c.location) + ' · ' + esc(c.year) + '</span>' +
      '<h3>' + esc(c.title) + '</h3>' +
      '<p>' + esc(c.summary) + '</p>' +
      '<div class="case-tags">' + (c.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="case-detail">' +
      '<p style="margin-bottom:6px;"><b style="color:var(--ink);">规模：</b>' + esc(c.scale) + '</p>' +
      '<b style="color:var(--ink);">主要施工 / 服务内容：</b>' +
      '<ul style="margin-top:4px;">' + (c.scope || []).map(function (t) {
        return '<li style="font-size:13px;color:var(--muted);padding-left:12px;position:relative;">' +
          '<span style="position:absolute;left:0;">·</span>' + esc(t) + '</li>';
      }).join('') + '</ul>' +
      '<p style="margin-top:8px;"><b style="color:var(--ink);">成效：</b>' + esc(c.result) + '</p>' +
      '</div>' +
      '<a class="case-more" href="javascript:void(0)" data-toggle="case">展开工程详情 +</a>' +
      '</div></article>';
  }

  function renderCasePreview() {
    var box = $('#case-preview'); if (!box) return;
    box.innerHTML = '<div class="case-grid">' + CASES.slice(0, 3).map(caseCard).join('') + '</div>';
  }

  function renderCasesPage() {
    var box = $('#case-list'); if (!box) return;
    var filter = $('#case-filter');
    if (filter) {
      filter.innerHTML = CATS.map(function (c, i) {
        return '<button type="button" data-cat="' + esc(c.key) + '"' + (i === 0 ? ' class="on"' : '') + '>' + esc(c.label) + '</button>';
      }).join('');
      filter.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-cat]'); if (!btn) return;
        $$('button', filter).forEach(function (b) { b.classList.remove('on'); });
        btn.classList.add('on');
        draw(btn.getAttribute('data-cat'));
      });
    }
    function draw(cat) {
      var list = (cat && cat !== 'all') ? CASES.filter(function (c) { return c.category === cat; }) : CASES;
      box.innerHTML = list.length
        ? '<div class="case-grid">' + list.map(caseCard).join('') + '</div>'
        : '<p style="color:var(--muted);">该分类下暂无案例，可在 assets/js/cases-data.js 中补充。</p>';
    }
    draw('all');

    var total = $('#case-total');
    if (total) total.textContent = CASES.length;
  }

  /* 案例展开 / 收起 */
  function bindCaseToggle() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-toggle="case"]'); if (!a) return;
      var card = a.closest('.case'); if (!card) return;
      var open = card.classList.toggle('open');
      a.textContent = open ? '收起工程详情 -' : '展开工程详情 +';
    });
  }

  /* ---------- 8. 移动端菜单 ---------- */
  function bindNav() {
    var btn = $('.nav-toggle'), menu = $('#main-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () { menu.classList.toggle('show'); });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('show'); });
    });
  }

  /* ---------- 9. 页脚年份 ---------- */
  function renderFooter() {
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    fillFields();
    renderStats();
    renderBusiness();
    renderSolutions();
    renderProducts();
    renderHighlights();
    renderCasePreview();
    renderCasesPage();
    bindCaseToggle();
    bindNav();
    renderFooter();
  });
})();
