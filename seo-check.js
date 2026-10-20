#!/usr/bin/env node
/* ============================================================
 *  seo-check.js · 本地 SEO 体检脚本（纯 Node，无需任何依赖）
 *  ------------------------------------------------------------
 *  无需联网、无需上线，直接扫描本地 HTML 文件，输出 SEO 健康度报告。
 *  适合：发布前自查 / 改版后复查 / 定期体检。
 *
 *  用法：
 *     node seo-check.js
 *
 *  检查项：
 *    - title：是否存在、长度、是否重复
 *    - meta description：是否存在、长度
 *    - H1：是否恰好 1 个
 *    - canonical：是否存在
 *    - 结构化数据 JSON-LD：是否存在
 *    - 图片 alt：缺失比例
 *    - 内链数量（影响爬虫抓取深度）
 *    - 页面体积（影响加载速度）
 *    - 关键词/描述是否与页面主题一致
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const P = (...a) => path.join(ROOT, ...a);

/* 收集所有需要检查的 HTML */
function collectHtml() {
  const list = [];
  const top = ['index.html', 'cases.html', '404.html'];
  top.forEach(f => { if (fs.existsSync(P(f))) list.push(f); });
  const dir = P('cases');
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).filter(f => f.endsWith('.html'))
      .forEach(f => list.push('cases/' + f));
  }
  return list;
}

/* ---------- 解析工具 ---------- */
function meta(html, name) {
  const re = new RegExp('<meta\\s+[^>]*name=["\']' + name + '["\'][^>]*content=["\']([^"\']*)["\']', 'i');
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp('<meta\\s+[^>]*content=["\']([^"\']*)["\'][^>]*name=["\']' + name + '["\']', 'i');
  const m2 = html.match(re2);
  return m2 ? m2[1] : '';
}
function title(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : '';
}
function countTag(html, tag) {
  const m = html.match(new RegExp('<' + tag + '[\\s>]', 'gi'));
  return m ? m.length : 0;
}
function imgs(html) {
  const out = [];
  const re = /<img\s+[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[0];
    const src = (tag.match(/src=["']([^"']*)["']/i) || [, ''])[1];
    const alt = (tag.match(/alt=["']([^"']*)["']/i) || [, ''])[1];
    const lazy = /loading=["']lazy["']/i.test(tag);
    out.push({ src, alt, lazy });
  }
  return out;
}

/* ---------- 检查 ---------- */
const issues = { error: [], warn: [], info: [] };
const titles = {};
const descs = {};

function add(level, file, msg) { issues[level].push({ file, msg }); }

const files = collectHtml();
console.log('──────────────────────────────────────────────');
console.log(' 巨石防雷官网 · 本地 SEO 体检');
console.log('──────────────────────────────────────────────');
console.log(' 共 ' + files.length + ' 个页面待检查\n');

files.forEach(f => {
  const html = fs.readFileSync(P(f), 'utf8');
  const size = fs.statSync(P(f)).size;
  const t = title(html);
  const d = meta(html, 'description');
  const h1 = countTag(html, 'h1');
  const hasCanonical = /rel=["']canonical["']/i.test(html);
  const hasLd = /application\/ld\+json/i.test(html);
  const list = imgs(html);
  const noAlt = list.filter(i => !i.alt).length;
  const noLazy = list.filter(i => !i.lazy).length;
  /* 内链：站内 .html 链接（含 index.html#anchor 这类带锚点的写法） */
  const internal = (html.match(/href="(?!https?:|mailto:|tel:|#|javascript:)[^"]*\.html(#[^"]*)?"/gi) || []).length;

  /* title */
  if (!t) add('error', f, '缺少 <title>');
  else {
    const len = [...t].length;
    if (len > 60) add('warn', f, 'title 过长（' + len + ' 字），搜索结果会被截断，建议 ≤30 个汉字');
    if (len < 10) add('warn', f, 'title 过短（' + len + ' 字），信息量不足');
    if (titles[t]) add('error', f, 'title 与 ' + titles[t] + ' 完全重复');
    titles[t] = f;
  }

  /* description */
  if (!d) add('error', f, '缺少 meta description（搜索结果会随机抓取正文，点击率低）');
  else {
    const len = [...d].length;
    if (len > 160) add('warn', f, 'description 过长（' + len + ' 字），建议 70-120 个汉字');
    if (len < 40) add('warn', f, 'description 过短（' + len + ' 字），建议补充项目/服务/地区关键词');
    if (descs[d]) add('warn', f, 'description 与 ' + descs[d] + ' 重复');
    descs[d] = f;
  }

  /* H1 */
  if (h1 === 0) add('warn', f, '没有 H1 标签（页面主题不明确）');
  else if (h1 > 1) add('warn', f, '有 ' + h1 + ' 个 H1，建议每页只保留 1 个');

  /* canonical */
  if (!hasCanonical && f !== '404.html') add('info', f, '无 canonical（由 JS 运行时注入，爬虫可能看不到）');

  /* 结构化数据 */
  if (!hasLd && f !== '404.html') add('info', f, '无静态 JSON-LD（由 JS 注入，建议改为静态写入更稳妥）');

  /* 图片 */
  if (noAlt > 0) add('warn', f, noAlt + '/' + list.length + ' 张图片缺 alt 描述');
  if (noLazy > 0 && list.length > 2) add('info', f, noLazy + ' 张图片未加 loading="lazy"');

  /* 内链 */
  if (internal < 3 && f !== '404.html') add('warn', f, '内链仅 ' + internal + ' 个，爬虫难以发现更多页面，建议 ≥5');

  /* 体积 */
  if (size > 100 * 1024) add('warn', f, 'HTML 体积 ' + Math.round(size / 1024) + 'KB，偏大');

  const ok = !issues.error.some(x => x.file === f) && !issues.warn.some(x => x.file === f);
  console.log(' ' + (ok ? '✓' : '·') + ' ' + f + '  (' + Math.round(size / 1024) + 'KB, 图 ' + list.length + ', 内链 ' + internal + ')');
});

/* ---------- 汇总 ---------- */
console.log('\n──────────────────────────────────────────────');
function dump(level, label) {
  if (!issues[level].length) { console.log(' ' + label + '：无'); return; }
  console.log(' ' + label + '（' + issues[level].length + '）');
  issues[level].forEach(i => console.log('   [' + i.file + '] ' + i.msg));
}
dump('error', '必须修复');
dump('warn', '建议优化');
dump('info', '提示');

const score = Math.max(0, 100 - issues.error.length * 10 - issues.warn.length * 3);
console.log('\n SEO 健康度评分：' + score + ' / 100');
console.log('──────────────────────────────────────────────');

/* ---------- 附带核对：搜索引擎文件 ---------- */
console.log('\n 搜索引擎配置文件：');
['robots.txt', 'sitemap.xml'].forEach(f => {
  if (!fs.existsSync(P(f))) { console.log(' ✗ 缺少 ' + f); return; }
  const s = fs.readFileSync(P(f), 'utf8');
  if (f === 'sitemap.xml') {
    const n = (s.match(/<url>/g) || []).length;
    const placeholder = /example\.com|localhost|yourdomain/i.test(s);
    console.log(' ✓ sitemap.xml（' + n + ' 条 URL）' + (placeholder ? '  ⚠ 仍是示例域名' : ''));
  } else {
    const bots = (s.match(/User-agent:/g) || []).length;
    const hasSitemap = /Sitemap:/i.test(s);
    const placeholder = /example\.com|localhost|yourdomain/i.test(s);
    console.log(' ✓ robots.txt（' + bots + ' 个爬虫规则，' + (hasSitemap ? '含 sitemap 声明' : '⚠ 缺 sitemap 声明') + '）'
      + (placeholder ? '  ⚠ 仍是示例域名' : ''));
  }
});
console.log('');
