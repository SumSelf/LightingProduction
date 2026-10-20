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
          // 可选前后缀：data-prefix / data-suffix，便于写成「2016 年成立」这类带说明的文案
          var pre = el.getAttribute('data-prefix') || '';
          var suf = el.getAttribute('data-suffix') || '';
          var out = pre + v + suf;
          if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.value = out;
          else el.textContent = out;
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
  /* 案例链接指向由 build.js 生成的独立静态页 cases/<id>.html（每个项目一个 URL，利于收录）。
     若你不想用独立页，把 casePage 改成 '' 即可退回「原地展开」模式。 */
  function caseHref(c) {
    if (useStaticCasePages()) return 'cases/' + c.id + '.html';
    return '';
  }
  function useStaticCasePages() {
    // 检测静态案例页是否存在：只在 http(s) 环境下通过一次 HEAD 判断，失败则退回展开模式
    if (location.protocol === 'file:') return false;
    if (typeof window.__casePagesExists === 'undefined') return true; // 默认假设已生成
    return !!window.__casePagesExists;
  }

  function caseCard(c) {
    var href = caseHref(c);
    var linkHtml = href
      ? '<a class="case-more" href="' + esc(href) + '">查看完整工程详情 →</a>'
      : '<a class="case-more" href="javascript:void(0)" data-toggle="case">展开工程详情 +</a>';
    return '<article class="case" id="' + esc(c.id) + '">' +
      (href ? '<a href="' + esc(href) + '" style="display:block;">' : '') +
      '<img src="' + esc(c.cover) + '" alt="' + esc(c.title) + '" loading="lazy">' +
      (href ? '</a>' : '') +
      '<div class="case-body">' +
      '<span class="case-meta">' + esc(c.location) + ' · ' + esc(c.year) + '</span>' +
      '<h3>' + (href ? '<a href="' + esc(href) + '" style="color:inherit;">' + esc(c.title) + '</a>' : esc(c.title)) + '</h3>' +
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
      linkHtml +
      '</div></article>';
  }

  function renderCasePreview() {
    var box = $('#case-preview'); if (!box) return;
    if (!CASES.length) {
      box.innerHTML = '<div class="card" style="text-align:center;padding:28px 20px;">' +
        '<p style="color:var(--muted);margin-bottom:12px;">项目案例正在整理归档，' +
        '欢迎直接来电了解我们在工厂、建筑、充电站与特殊站点的实施情况。</p>' +
        '<div class="btn-row" style="justify-content:center;">' +
        '<a class="btn" href="#contact">联系获取案例</a>' +
        '<a class="btn btn-ghost" style="border-color:var(--blue);color:var(--blue);" href="cases.html">进入案例中心</a>' +
        '</div></div>';
      return;
    }
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
      if (!list.length) {
        box.innerHTML = '<div class="card" style="text-align:center;padding:32px 20px;">' +
          '<p style="color:var(--muted);margin-bottom:12px;">' +
          (CASES.length ? '该分类下的项目正在整理，可切换其他分类查看，或直接联系我们了解同类项目经验。'
                        : '项目案例正在整理归档，欢迎来电了解我们的实施情况与同类项目经验。') +
          '</p>' +
          '<a class="btn" href="index.html#contact">联系我们了解案例</a></div>';
        return;
      }
      box.innerHTML = '<div class="case-grid">' + list.map(caseCard).join('') + '</div>';
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
    var y2 = new Date().getFullYear();
    var y = $('#year'); if (y) y.textContent = y2;
    // 由 build.js 生成的静态页用 class="year"
    $$('.year').forEach(function (el) { el.textContent = y2; });
  }

  /* ---------- 9.5 常见问题（answer-first，利于搜索引擎与 AI 引用） ---------- */
  function renderFaq() {
    var box = $('#faq-list');
    if (!box || !CFG.faq || !CFG.faq.length) {
      var sec = $('#faq'); if (sec) sec.style.display = 'none';
      return;
    }
    box.innerHTML = CFG.faq.map(function (f, i) {
      return '<article class="faq-item">' +
        '<h3 class="faq-q"><span class="faq-n">Q' + (i + 1) + '</span>' + esc(f.q) + '</h3>' +
        '<div class="faq-a"><p>' + esc(f.a) + '</p></div>' +
        '</article>';
    }).join('');
  }

  /* ---------- 9.8 在线留言浮窗（右下角常驻，点击展开/收起） ---------- */
  function bindMsgFloat() {
    var box = $('#message');
    var fab = $('#msg-fab');
    var closeBtn = $('#msg-close');
    var panel = $('#msg-panel');
    if (!box || !fab || !panel) return;

    function setOpen(open) {
      box.classList.toggle('open', open);
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        var first = $('#f-name', panel);
        if (first) first.focus();
      } else {
        fab.focus();
      }
    }

    fab.addEventListener('click', function () {
      setOpen(!box.classList.contains('open'));
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });

    // 点击面板外部收起（点面板内部不收起，避免误关）
    document.addEventListener('click', function (e) {
      if (!box.classList.contains('open')) return;
      if (!box.contains(e.target)) setOpen(false);
    });
    // Esc 收起
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && box.classList.contains('open')) setOpen(false);
    });

    // 导航里 / 页面内任何 href="#message" 的链接，改为打开浮窗
    $$('a[href="#message"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        setOpen(true);
      });
    });

    // 从案例页等子页面的「../index.html#message」跳过来时，自动展开浮窗
    if (location.hash === '#message') {
      setTimeout(function () { setOpen(true); }, 120);
    }
  }

  /* ---------- 10. SEO：canonical / OG / 结构化数据 ---------- */
  function absUrl(u) {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    var base = (CFG.site && CFG.site.url) || location.origin;
    return base.replace(/\/+$/, '') + '/' + String(u).replace(/^\/+/, '');
  }

  function injectSeo() {
    var S = CFG.site || {};
    var C = CFG.contact || {};
    var L = CFG.legal || {};
    var url = location.href.split('#')[0];

    /* canonical（静态案例页可能已写死，避免重复输出两个） */
    if (!document.querySelector('link[rel="canonical"]')) {
      var link = document.createElement('link');
      link.rel = 'canonical';
      link.href = url;
      document.head.appendChild(link);
    }

    /* 基础 meta */
    var metas = [
      ['og:type', 'website'],
      ['og:site_name', CFG.company.name],
      ['og:title', document.title],
      ['og:url', url],
      ['og:image', absUrl(S.ogImage)],
      ['og:locale', 'zh_CN'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', document.title]
    ];
    var d = $('meta[name="description"]');
    if (d) metas.push(['og:description', d.getAttribute('content')]);
    metas.forEach(function (m) {
      var el = document.createElement('meta');
      el.setAttribute('property', m[0]);
      el.setAttribute('content', m[1]);
      document.head.appendChild(el);
    });

    /* JSON-LD：本地企业 + 服务 + 网站 */
    var schema = [
      {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'ProfessionalService'],
        '@id': absUrl('/') + '#organization',
        name: CFG.company.name,
        alternateName: CFG.company.shortName,
        description: (CFG.company && CFG.company.intro) || '',
        url: absUrl('/'),
        telephone: C.phone || C.mobile || '',
        email: C.email || '',
        address: {
          '@type': 'PostalAddress',
          streetAddress: (C.address || '') + (C.addressDetail || ''),
          addressLocality: '成都市',
          addressRegion: '四川省',
          addressCountry: 'CN',
          postalCode: C.postcode || ''
        },
        areaServed: (S.areaServed || []).map(function (a) { return { '@type': 'AdministrativeArea', name: a }; }),
        knowsAbout: ['防雷设计', '防雷检测', '防雷设备', '防雷设施', '防雷工程', '智能防雷', '充电站防雷', '建筑物防雷'],
        openingHours: C.workTime || ''
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': absUrl('/') + '#website',
        url: absUrl('/'),
        name: CFG.company.name,
        inLanguage: 'zh-CN',
        publisher: { '@id': absUrl('/') + '#organization' }
      }
    ];

    /* 服务项：从 mainBusiness 自动生成 */
    if (CFG.mainBusiness && CFG.mainBusiness.length) {
      CFG.mainBusiness.forEach(function (b, i) {
        schema.push({
          '@context': 'https://schema.org',
          '@type': 'Service',
          '@id': absUrl('/') + '#service-' + (i + 1),
          name: b.title,
          description: b.desc || '',
          serviceType: b.title,
          provider: { '@id': absUrl('/') + '#organization' },
          areaServed: { '@type': 'AdministrativeArea', name: (S.areaServed || ['四川省']).join('、') }
        });
      });
    }

    /* FAQ 结构化数据（有机会在搜索结果中直接展示问答，也便于 AI 引用）
       仅当本页确实渲染了 FAQ 区块时才输出，避免在无此内容的页面上产生无效标记 */
    var faqBox = document.getElementById('faq-list');
    if (CFG.faq && CFG.faq.length && faqBox && faqBox.children.length) {
      schema.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': absUrl('/') + '#faq',
        mainEntity: CFG.faq.map(function (f) {
          return {
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a }
          };
        })
      });
    }

    /* 经纬度（填了才输出） */
    if (S.geo && S.geo.latitude && S.geo.longitude && schema[0].address) {
      schema[0].geo = {
        '@type': 'GeoCoordinates',
        latitude: S.geo.latitude,
        longitude: S.geo.longitude
      };
    }
    /* 其他平台官方主页（有助于实体识别） */
    if (S.sameAs && S.sameAs.length) schema[0].sameAs = S.sameAs;

    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(schema);
    document.head.appendChild(s);

    if (window.console && (!S.url || /example\.com/i.test(S.url))) {
      console.warn('[SEO] config.js 中 site.url 仍是示例域名，请替换为正式域名后重新提交给搜索引擎。');
    }
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    fillFields();
    renderStats();
    renderBusiness();
    renderSolutions();
    renderProducts();
    renderHighlights();
    renderFaq();
    renderCasePreview();
    renderCasesPage();
    bindCaseToggle();
    bindNav();
    bindMsgFloat();
    renderFooter();
    injectSeo();
  });
})();
