#!/usr/bin/env node
/* ============================================================
 *  build.js · 静态站构建脚本（纯 Node，无需任何依赖）
 *  ------------------------------------------------------------
 *  做三件事：
 *   1. 为每个案例生成独立静态页 cases/<id>.html（每个项目一个 URL，利于收录）
 *   2. 生成 sitemap.xml（自动包含全部页面与案例页）
 *   3. 生成 robots.txt（自动填好域名，并显式放行 AI 爬虫）
 *
 *  域名只从 assets/js/config.js 的 site.url 读取，改一处即可。
 *
 *  用法：
 *     node build.js
 *
 *  ★以下情况都要重新跑一次：
 *    - 改了 config.js 的 site.url（域名）
 *    - 在 cases-data.js 里新增 / 修改了案例
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const P = (...a) => path.join(ROOT, ...a);

/* ---------- 读取配置与数据 ---------- */
global.window = {};
eval(fs.readFileSync(P('assets/js/config.js'), 'utf8'));
eval(fs.readFileSync(P('assets/js/cases-data.js'), 'utf8'));
const CFG = global.window.SITE_CONFIG || {};
const CASES = global.window.CASES || [];
const CATS = global.window.CASE_CATEGORIES || [];

const COMPANY = (CFG.company && CFG.company.name) || '四川巨石防雷科技有限公司';
const SHORT = (CFG.company && CFG.company.shortName) || COMPANY;
const SITE = CFG.site || {};
const C = CFG.contact || {};

const SITE_URL = String(SITE.url || 'https://www.example.com').replace(/\/+$/, '');
const IS_PLACEHOLDER_DOMAIN = /example\.com|localhost|yourdomain/i.test(SITE_URL);

const TODAY = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

/* ---------- 工具 ---------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function catLabel(key) {
  const c = CATS.find(x => x.key === key);
  return c ? c.label : '工程案例';
}
/* 相对路径修正：cases/ 目录下页面引用 ../assets/ */
function assetUrl(u, inCasesDir) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  return inCasesDir ? '../' + u.replace(/^\/+/, '') : u;
}
function pageUrl(file) {
  return SITE_URL + '/' + file;
}
function desc(s, n) {
  const t = String(s || '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n) + '…' : t;
}

/* ---------- 公共片段 ---------- */
function head(title, keywords, description, inCasesDir, canonical) {
  const css = assetUrl('assets/css/style.css', inCasesDir);
  const icon = assetUrl('favicon.ico', inCasesDir);
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="keywords" content="${esc(keywords)}">
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical || pageUrl(''))}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="${esc(COMPANY)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="zh_CN">
<link rel="icon" href="${esc(icon)}" sizes="any">
<link rel="apple-touch-icon" href="${esc(assetUrl('assets/img/og-logo.png', inCasesDir))}">
<link rel="stylesheet" href="${esc(css)}">
</head>
<body>`;
}

function header(inCasesDir) {
  const home = inCasesDir ? '../index.html' : 'index.html';
  const cases = inCasesDir ? '../cases.html' : 'cases.html';
  return `
<header class="site-header">
  <div class="wrap nav">
    <a class="brand" href="${home}">
      <span class="brand-mark">${esc((CFG.company && CFG.company.shortName || '巨石').slice(0, 2))}</span>
      <span>
        <span class="brand-name">${esc(COMPANY)}</span><br>
        <span class="brand-sub">LIGHTNING PROTECTION</span>
      </span>
    </a>
    <button class="nav-toggle" type="button">菜单</button>
    <nav class="menu" id="main-menu">
      <a href="${home}#business">主营业务</a>
      <a href="${home}#solutions">业务分类</a>
      <a href="${home}#products">设备</a>
      <a href="${home}#highlights">工程亮点</a>
      <a href="${cases}">案例中心</a>
      <a href="${home}#message">在线留言</a>
      <a href="${home}#contact">联系我们</a>
    </nav>
  </div>
</header>`;
}

function footer(inCasesDir) {
  const home = inCasesDir ? '../index.html' : 'index.html';
  const cases = inCasesDir ? '../cases.html' : 'cases.html';
  return `
<footer class="site-footer">
  <div class="wrap foot-wrap">
    <div>${esc(COMPANY)} · ${esc(C.address || '')}</div>
    <div>
      电话 <a href="${esc(C.phoneHref || '#')}">${esc(C.phone || '')}</a> ·
      邮箱 <a href="${esc(C.emailHref || '#')}">${esc(C.email || '')}</a>
    </div>
    <div>
      ${esc((CFG.legal && CFG.legal.icp) || '')} ·
      © <span class="year">${new Date().getFullYear()}</span> ${esc((CFG.legal && CFG.legal.copyright) || COMPANY)}
    </div>
  </div>
</footer>`;
}

/* ---------- 案例详情页 ---------- */
function buildCasePage(c) {
  const inCases = true; // 位于 cases/ 目录
  const id = c.id;
  const url = pageUrl('cases/' + id + '.html');
  const title = `${c.title} | ${COMPANY}`;
  const keywords = [c.title, catLabel(c.category), c.location, '防雷工程案例', '防雷施工', COMPANY]
    .concat(c.tags || []).filter(Boolean).join(',');
  const description = desc(`${c.location} · ${c.year} · ${c.scale}。${c.summary}`, 150);

  /* 面包屑结构化数据 + 案例正文结构化数据 */
  const jsonld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页', item: pageUrl('') },
          { '@type': 'ListItem', position: 2, name: '工程案例', item: pageUrl('cases.html') },
          { '@type': 'ListItem', position: 3, name: c.title, item: url }
        ]
      },
      {
        '@type': 'Article',
        '@id': url + '#case',
        headline: c.title,
        description: description,
        image: c.cover ? SITE_URL + '/' + c.cover.replace(/^\/+/, '') : undefined,
        datePublished: (c.year || '2026') + '-01-01',
        dateModified: TODAY,
        inLanguage: 'zh-CN',
        author: { '@type': 'Organization', name: COMPANY },
        publisher: { '@type': 'Organization', name: COMPANY },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        about: (c.tags || []).map(t => ({ '@type': 'Thing', name: t }))
      }
    ]
  };

  /* 图集 */
  let galleryHtml = '';
  if (c.gallery && c.gallery.length) {
    galleryHtml = `
    <div class="grid g3" style="margin-top:14px;">
      ${c.gallery.map(g => `
      <figure class="prod-img">
        <img src="${esc(assetUrl(g, inCases))}" alt="${esc(c.title)}现场图" loading="lazy">
      </figure>`).join('')}
    </div>`;
  }

  /* 相关案例（同分类，最多 3 个） */
  const related = CASES.filter(x => x.id !== id && x.category === c.category).slice(0, 3);
  let relatedHtml = '';
  if (related.length) {
    relatedHtml = `
    <div class="grid g3" style="margin-top:8px;">
      ${related.map(r => `
      <a class="panel" href="${esc(r.id)}.html" style="text-decoration:none;">
        <img src="${esc(assetUrl(r.cover, inCases))}" alt="${esc(r.title)}" loading="lazy">
        <div class="panel-body">
          <h3 style="font-size:15.5px;">${esc(r.title)}</h3>
          <p style="font-size:13px;">${esc(desc(r.summary, 60))}</p>
        </div>
      </a>`).join('')}
    </div>`;
  }

  return `${head(title, keywords, description, inCases, url)}
${header(inCases)}

<section class="section" style="padding:36px 0 8px;">
  <div class="wrap">
    <nav style="font-size:13px;color:var(--muted);margin-bottom:14px;">
      <a href="../index.html">首页</a> › <a href="../cases.html">工程案例</a> › <span style="color:var(--ink);">${esc(c.title)}</span>
    </nav>
    <div class="case-meta" style="font-size:12px;letter-spacing:1px;">${esc(catLabel(c.category))} · ${esc(c.location)} · ${esc(c.year)}</div>
    <h1 style="font-size:26px;color:var(--ink);margin:10px 0 12px;line-height:1.4;">${esc(c.title)}</h1>
    <p style="color:var(--muted);max-width:820px;">${esc(c.summary)}</p>
  </div>
</section>

<section class="section" style="padding-top:20px;">
  <div class="wrap">
    <figure class="prod-img">
      <img src="${esc(assetUrl(c.cover, inCases))}" alt="${esc(c.title)}" style="width:100%;">
      <figcaption>${esc(c.scale || '')}</figcaption>
    </figure>
    ${galleryHtml}
  </div>
</section>

<section class="section section-alt">
  <div class="wrap">
    <div class="head">
      <div class="kicker">PROJECT SCOPE</div>
      <h2>项目概况</h2>
    </div>
    <div class="prod">
      <div>
        <h3 style="font-size:18px;color:var(--ink);margin-bottom:12px;">主要施工与服务内容</h3>
        <ul class="card">
          ${(c.scope || []).map(t => `<li style="font-size:14px;color:var(--muted);padding-left:16px;position:relative;margin-bottom:8px;"><span style="position:absolute;left:0;color:var(--blue);">▪</span>${esc(t)}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h3 style="font-size:18px;color:var(--ink);margin-bottom:12px;">实施成效</h3>
        <div class="card" style="font-size:14px;color:var(--muted);">${esc(c.result || '')}</div>
        <table class="spec" style="margin-top:18px;">
          <tbody>
            <tr><th>项目地点</th><td>${esc(c.location || '')}</td></tr>
            <tr><th>实施年份</th><td>${esc(c.year || '')}</td></tr>
            <tr><th>项目规模</th><td>${esc(c.scale || '')}</td></tr>
            <tr><th>业务分类</th><td>${esc(catLabel(c.category))}</td></tr>
          </tbody>
        </table>
        <div class="tags" style="margin-top:16px;">
          ${(c.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>

${relatedHtml ? `
<section class="section">
  <div class="wrap">
    <div class="head">
      <div class="kicker">RELATED</div>
      <h2>相关案例</h2>
    </div>
    ${relatedHtml}
  </div>
</section>` : ''}

<section class="section section-dark">
  <div class="wrap" style="text-align:center;">
    <h2 style="font-size:22px;color:#fff;margin-bottom:10px;">有类似项目需要评估？</h2>
    <p style="color:#93a8bf;margin-bottom:24px;">提供现场照片与基本参数，我们可先给出初步方案与整改建议。</p>
    <div class="btn-row" style="justify-content:center;">
      <a class="btn" href="../index.html#message">在线留言</a>
      <a class="btn btn-ghost" href="tel:${esc((C.mobileHref || C.phoneHref || '').replace('tel:', ''))}">电话咨询 ${esc(C.mobile || C.phone || '')}</a>
    </div>
  </div>
</section>
${footer(inCases)}

<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<script src="${esc(assetUrl('assets/js/config.js', inCases))}"></script>
<script src="${esc(assetUrl('assets/js/cases-data.js', inCases))}"></script>
<script src="${esc(assetUrl('assets/js/main.js', inCases))}"></script>
</body>
</html>
`;
}

/* ---------- robots.txt ---------- */
function buildRobots() {
  return `# robots.txt —— ${COMPANY}
# 本文件由 build.js 自动生成，请勿手动修改（改域名请改 config.js 后重跑 node build.js）
# 目的：显式放行各类爬虫，包括 AI 搜索爬虫。未声明时部分 AI 爬虫会保守跳过。

# ===== 通用 =====
User-agent: *
Allow: /
Disallow: /assets/js/
Disallow: /emailjs/
Crawl-delay: 1

# ===== 传统搜索引擎 =====
User-agent: Baiduspider
Allow: /

User-agent: Sogou web spider
Allow: /

User-agent: 360Spider
Allow: /

User-agent: Bytespider
Allow: /

# ===== AI 搜索 / 实时检索爬虫（决定能否被 AI 答案引用）=====
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: DeepSeekBot
Allow: /

User-agent: QwenBot
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: CCBot
Allow: /

# ===== 站点地图 =====
Sitemap: ${SITE_URL}/sitemap.xml
`;
}

/* ---------- sitemap.xml ---------- */
function buildSitemap() {
  const urls = [];
  const push = (file, priority, changefreq, images) => {
    urls.push({ file, priority, changefreq, images: images || [] });
  };
  push('', '1.0', 'weekly', ['assets/img/hero-main.png', 'assets/img/biz-charging.png']);
  push('cases.html', '0.9', 'weekly', ['assets/img/case-construction.png']);
  CASES.forEach(c => push('cases/' + c.id + '.html', '0.8', 'monthly', [c.cover].concat(c.gallery || [])));

  const body = urls.map(u => {
    const loc = SITE_URL + (u.file ? '/' + u.file : '/');
    const imgs = u.images.filter(Boolean).slice(0, 8).map(i =>
      `\n    <image:image>\n      <image:loc>${esc(SITE_URL + '/' + String(i).replace(/^\/+/, ''))}</image:loc>\n    </image:image>`
    ).join('');
    return `  <url>
    <loc>${esc(loc)}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${imgs}
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- 由 build.js 自动生成，请勿手动修改。新增案例后重跑：node build.js -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`;
}

/* ---------- 在线留言浮窗：从 index.html 提取，注入到其它页面 ----------
 * 浮窗只在 index.html 手写一份（MSG-FLOAT:START / END 之间）。
 * 本函数把它复用到 cases.html 和每个案例页，保证全站「随时可点开留言」。
 * 案例页在 cases/ 子目录，需把 assets/ 的相对路径改成 ../assets/。
 * 幂等：目标页面已含 msg-float 则跳过。
 */
function msgFloatHtml(inCasesDir) {
  const src = fs.readFileSync(P('index.html'), 'utf8');
  const m = src.match(/<!-- MSG-FLOAT:START[\s\S]*?-->([\s\S]*?)<!-- MSG-FLOAT:END -->/);
  if (!m) return '';
  let html = m[1].trim();
  if (inCasesDir) html = html.replace(/(src|href)="assets\//g, '$1="../assets/');
  return '<!-- 在线留言浮窗（由 build.js 从 index.html 复用） -->\n' + html + '\n';
}

function ensureMsgFloat(file, inCasesDir) {
  const fp = P(file);
  if (!fs.existsSync(fp)) return false;
  const s = fs.readFileSync(fp, 'utf8');
  if (/class="msg-float"/.test(s)) return false;
  const block = msgFloatHtml(inCasesDir);
  if (!block) return false;
  // 插到 </footer> 之后、脚本之前（若没有 footer 则插到 body 末尾）
  let out;
  if (/<\/footer>/.test(s)) {
    out = s.replace(/<\/footer>/, '</footer>\n\n' + block);
  } else {
    out = s.replace(/<\/body>/, block + '\n</body>');
  }
  // 确保引入了 message.js
  if (!/message\.js/.test(out)) {
    const jsTag = inCasesDir ? '<script src="../assets/js/message.js"></script>'
                             : '<script src="assets/js/message.js"></script>';
    out = out.replace(/<\/body>/, jsTag + '\n</body>');
  }
  fs.writeFileSync(fp, out, 'utf8');
  return true;
}

/* ---------- 同步 index.html / cases.html 里写死的域名 ----------
 * 这两个页面为了「爬虫不执行 JS 也能读到」，把 canonical 与 JSON-LD 静态写进了 HTML，
 * 所以里面会有域名字符串。改域名时必须同步替换，否则结构化数据里的 URL 会与真实域名不符。
 * 幂等：只替换占位域名（example.com / localhost / yourdomain），已是正式域名则不动。
 */
function patchStaticPages() {
  const PLACEHOLDER = /https?:\/\/(?:www\.)?(?:example\.com|localhost(?::\d+)?|yourdomain\.com|yourdomain)/gi;
  let changed = 0;
  ['index.html', 'cases.html'].forEach(f => {
    const fp = P(f);
    if (!fs.existsSync(fp)) return;
    const src = fs.readFileSync(fp, 'utf8');
    const out = src.replace(PLACEHOLDER, SITE_URL);
    if (out !== src) {
      const n = (src.match(PLACEHOLDER) || []).length;
      fs.writeFileSync(fp, out, 'utf8');
      changed += n;
      console.log(' ✓ 同步 ' + f + ' 中的 ' + n + ' 处域名');
    }
  });
  if (changed === 0) console.log(' ✓ 主页面域名已是最新，无需改动');
  else console.log(' ✓ 共替换 ' + changed + ' 处');
}

/* ---------- 执行 ---------- */
console.log('──────────────────────────────────────');
console.log(' 巨石防雷官网 · 静态构建');
console.log('──────────────────────────────────────');
console.log(' 站点域名：' + SITE_URL + (IS_PLACEHOLDER_DOMAIN ? '  ⚠ 仍是示例域名' : ''));

const dir = P('cases');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let n = 0;
CASES.forEach(c => {
  const html = buildCasePage(c);
  fs.writeFileSync(path.join(dir, c.id + '.html'), html, 'utf8');
  n++;
  console.log(' ✓ 生成案例页 cases/' + c.id + '.html  →  ' + c.title);
});

/* 给案例中心页与每个案例页加上在线留言浮窗 */
if (ensureMsgFloat('cases.html', false)) console.log(' ✓ cases.html 已加入留言浮窗');
let fc = 0;
CASES.forEach(c => { if (ensureMsgFloat('cases/' + c.id + '.html', true)) fc++; });
if (fc) console.log(' ✓ ' + fc + ' 个案例页已加入留言浮窗');

patchStaticPages();

fs.writeFileSync(P('sitemap.xml'), buildSitemap(), 'utf8');
console.log(' ✓ 生成 sitemap.xml（' + (CASES.length + 2) + ' 条 URL）');

fs.writeFileSync(P('robots.txt'), buildRobots(), 'utf8');
console.log(' ✓ 生成 robots.txt（已放行 AI 爬虫）');

console.log('──────────────────────────────────────');
console.log(' 完成：' + n + ' 个案例页 + sitemap + robots');
if (IS_PLACEHOLDER_DOMAIN) {
  console.log(' ⚠ 提醒：config.js 的 site.url 还是示例域名，');
  console.log('   改成正式域名后请再跑一次 node build.js');
}
console.log('──────────────────────────────────────');
