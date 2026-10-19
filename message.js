/* ============================================================
 *  message.js · 留言模块（EmailJS + 本地记录 + Token 防重复）
 *  ------------------------------------------------------------
 *  规则：
 *   1. 每次打开页面生成一个随机 token（会话级，刷新同一标签页仍为同一 token）；
 *   2. 提交成功后该 token 立即作废，同一 token 不允许再次提交（本地前端检测）；
 *   3. 本机留言次数、已用 token、留言流水写入 localStorage（留言内容不对外展示）；
 *   4. 提交通道：EmailJS（访客留言直接发到公司邮箱），SDK 由 CDN 加载，
 *      多源自动切换；未启用或加载失败时降级为本地记录并明示提示；
 *   5. 页面只展示「提交成功」与本机留言次数，不展示留言列表。
 * ============================================================ */

(function () {
  'use strict';

  var CFG = window.SITE_CONFIG || {};
  var EJ = CFG.emailjs || {};
  var SK = CFG.storage || {};
  var PM = EJ.params || {};

  var KEY_COUNT = SK.countKey || 'jushi_msg_count';
  var KEY_TOKENS = SK.tokenKey || 'jushi_msg_tokens';
  var KEY_LOG = SK.logKey || 'jushi_msg_log';
  var KEY_SESSION = SK.sessionTokenKey || 'jushi_session_token';

  /* ---------- 本地存储读写 ---------- */
  function lsGet(k, def) {
    try { var v = localStorage.getItem(k); return v === null ? def : v; }
    catch (e) { return def; }
  }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
  function getCount() { return parseInt(lsGet(KEY_COUNT, '0'), 10) || 0; }
  function setCount(n) { lsSet(KEY_COUNT, String(n)); }
  function getUsedTokens() {
    try { return JSON.parse(lsGet(KEY_TOKENS, '[]')) || []; }
    catch (e) { return []; }
  }
  function addUsedToken(t) {
    var arr = getUsedTokens();
    if (arr.indexOf(t) < 0) arr.push(t);
    lsSet(KEY_TOKENS, JSON.stringify(arr.slice(-200)));
  }
  function appendLog(rec) {
    try {
      var arr = JSON.parse(lsGet(KEY_LOG, '[]')) || [];
      arr.push(rec);
      lsSet(KEY_LOG, JSON.stringify(arr.slice(-100)));
    } catch (e) { }
  }

  /* ---------- 随机 Token ---------- */
  function randomHex(n) {
    var a = new Uint8Array(n);
    if (window.crypto && window.crypto.getRandomValues) { window.crypto.getRandomValues(a); }
    else { for (var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256); }
    return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  function makeToken() {
    return 'jp-' + Date.now().toString(36) + '-' + randomHex(8);
  }
  function sessionToken() {
    var t = '';
    try { t = sessionStorage.getItem(KEY_SESSION) || ''; } catch (e) { }
    if (!t) {
      t = makeToken();
      try { sessionStorage.setItem(KEY_SESSION, t); } catch (e) { }
    }
    return t;
  }

  /* ---------- DOM ---------- */
  function $(s) { return document.querySelector(s); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var RE_PHONE = /^(1[3-9]\d{9}|0\d{2,3}-?\d{7,8})$/;
  var RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setError(row, show) {
    if (!row) return;
    if (show) row.classList.add('invalid'); else row.classList.remove('invalid');
  }

  /* ---------- 表单校验（本地前端检测） ---------- */
  function validate(data, token) {
    var errs = [];
    var rows = { name: $('#row-name'), phone: $('#row-phone'), content: $('#row-content'), email: $('#row-email') };
    Object.keys(rows).forEach(function (k) { setError(rows[k], false); });

    if (!data.name || data.name.length < 2 || data.name.length > 30) {
      errs.push('请填写姓名（2-30 字）'); setError(rows.name, true);
    }
    var phone = (data.phone || '').replace(/[\s-]/g, '').replace(/^(\+?86)/, '');
    if (!phone || !RE_PHONE.test(phone)) {
      errs.push('请填写有效的联系电话（手机号或带区号的固话）'); setError(rows.phone, true);
    }
    if (data.email && !RE_MAIL.test(data.email)) {
      errs.push('邮箱格式不正确（可留空）'); setError(rows.email, true);
    }
    if (!data.content || data.content.length < 5 || data.content.length > 500) {
      errs.push('留言内容请控制在 5-500 字'); setError(rows.content, true);
    }
    if (getUsedTokens().indexOf(token) >= 0) {
      errs.push('当前会话凭证（' + token.slice(0, 12) + '…）已提交过留言，请重新打开页面后再试');
    }
    return errs;
  }

  /* ---------- EmailJS SDK 加载 ---------- */
  var sdkPromise = null;
  function emailjsConfigured() {
    return !!(EJ.enabled && EJ.serviceId && EJ.templateId && EJ.publicKey
      && EJ.serviceId.indexOf('service_') === 0
      && EJ.templateId.indexOf('template_') === 0);
  }
  function loadSdk() {
    if (sdkPromise) return sdkPromise;
    var urls = EJ.sdkUrls || ['https://cdn.jsdelivr.net/npm/@emailjs/browser@5/dist/emailjs.min.js'];
    sdkPromise = new Promise(function (resolve, reject) {
      var i = 0;
      function next() {
        if (i >= urls.length) { reject(new Error('SDK 加载失败')); return; }
        var s = document.createElement('script');
        s.src = urls[i++];
        s.async = true;
        s.onload = function () {
          if (window.emailjs) resolve(window.emailjs); else next();
        };
        s.onerror = next;
        (document.head || document.body).appendChild(s);
      }
      next();
    });
    return sdkPromise;
  }

  function buildParams(payload) {
    var p = {};
    p[PM.fromName || 'from_name'] = payload.name;
    p[PM.org || 'org'] = payload.org || '（未填写）';
    p[PM.phone || 'phone'] = payload.phone;
    p[PM.email || 'reply_to'] = payload.email || '（未填写）';
    p[PM.need || 'need'] = payload.need;
    p[PM.message || 'message'] = payload.content;
    p[PM.token || 'token'] = payload.token;
    p[PM.page || 'page'] = payload.page;
    p[PM.time || 'time'] = payload.time;
    return p;
  }

  function sendMail(payload) {
    return loadSdk().then(function (emailjs) {
      var opts = { publicKey: EJ.publicKey };
      if (EJ.throttle) opts.limitRate = { throttle: EJ.throttle };
      if (EJ.blockHeadless) opts.blockHeadless = true;
      return emailjs.send(EJ.serviceId, EJ.templateId, buildParams(payload), opts);
    }).then(function (res) {
      if (!res || res.status !== 200) throw new Error('EmailJS 返回 ' + (res && res.status));
      return { mode: 'emailjs' };
    });
  }

  /* ---------- 界面状态 ---------- */
  function showResult(ok, title, msg) {
    var box = $('#msg-result'); if (!box) return;
    box.className = 'result show' + (ok ? '' : ' error');
    box.innerHTML = '<b>' + esc(title) + '</b>' + esc(msg);
  }
  function updateCounter() {
    var n = getCount();
    var el = $('#msg-count'); if (el) el.textContent = n;
    var el2 = $('#msg-count-2'); if (el2) el2.textContent = n;
  }
  function showToken(t) {
    var el = $('#msg-token'); if (el) el.textContent = t.slice(0, 16) + '…';
    var el2 = $('#msg-token-full'); if (el2) el2.textContent = t;
  }
  function lockForm(locked, keepButton) {
    var f = $('#msg-form'); if (!f) return;
    Array.prototype.forEach.call(f.querySelectorAll('input,textarea,select'), function (el) {
      el.disabled = !!locked;
    });
    if (!keepButton) {
      var b = f.querySelector('button[type="submit"]');
      if (b) b.disabled = !!locked;
    }
  }
  function submitButton(busy) {
    var b = $('#msg-form button[type="submit"]'); if (!b) return;
    if (busy) { b.disabled = true; b.dataset.text = b.textContent; b.textContent = '正在发送…'; }
    else if (b.dataset.text) { b.textContent = b.dataset.text; }
  }

  /* ---------- 提交流程 ---------- */
  function onSubmit(e) {
    e.preventDefault();
    var f = $('#msg-form'); if (!f) return;
    var token = sessionToken();

    var data = {
      name: (f.elements['name'] || {}).value ? f.elements['name'].value.trim() : '',
      org: (f.elements['org'] || {}).value ? f.elements['org'].value.trim() : '',
      phone: (f.elements['phone'] || {}).value ? f.elements['phone'].value.trim() : '',
      email: (f.elements['email'] || {}).value ? f.elements['email'].value.trim() : '',
      need: (f.elements['need'] || {}).value || '',
      content: (f.elements['content'] || {}).value ? f.elements['content'].value.trim() : ''
    };

    var errs = validate(data, token);
    if (errs.length) { showResult(false, '提交未通过', errs.join('；')); return; }

    var consent = f.elements['consent'];
    if (consent && !consent.checked) { showResult(false, '提交未通过', '请勾选信息使用同意项后再提交'); return; }

    var payload = {
      token: token,
      name: data.name, org: data.org, phone: data.phone, email: data.email,
      need: data.need, content: data.content,
      text: '【需求】' + (data.need || '未分类') + '\n【单位】' + (data.org || '未填写') +
        '\n【联系人】' + data.name + '\n【电话】' + data.phone + '\n【邮箱】' + (data.email || '未填写') +
        '\n【留言】' + data.content,
      page: location.pathname,
      time: new Date().toLocaleString('zh-CN')
    };

    var useMail = emailjsConfigured();
    submitButton(true);
    showResult(true, '正在提交…', useMail ? '留言正在发送至公司邮箱，请稍候' : '请稍候');

    var p = useMail
      ? sendMail(payload).catch(function (err) { return { mode: 'fail', error: String(err && err.text || err.message || err) }; })
      : Promise.resolve({ mode: 'local' });

    p.then(function (res) {
      var n = getCount() + 1;
      setCount(n);
      addUsedToken(token);
      appendLog({ token: token, time: payload.time, need: data.need, mode: res.mode });
      updateCounter();
      submitButton(false);

      if (res.mode === 'emailjs') {
        showResult(true, '提交成功', '留言已发送（编号 #' + n + '），我们会尽快与您联系。');
      } else if (res.mode === 'fail') {
        // 发送失败：如实提示，同时保留本机记录，避免访客以为已送达
        showResult(false, '邮件发送失败', '留言已保存在本机（编号 #' + n + '）。原因：' + res.error +
          '。请直接拨打页面上的联系电话与我们联系。');
      } else {
        showResult(true, '提交成功', '留言已在本机登记（编号 #' + n + '）。邮件通道尚未启用，' +
          '建议直接拨打页面上的联系电话与我们联系。');
      }

      f.reset();
      // 该 token 已作废：锁定表单，提示重新打开页面获取新凭证
      lockForm(true);
      var hint = $('#msg-token-hint');
      if (hint) hint.textContent = '当前会话凭证已使用，如需再次留言请重新打开本页面获取新凭证。';
    });
  }

  /* ---------- 初始化 ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var f = $('#msg-form');
    if (f) f.addEventListener('submit', onSubmit);

    var t = sessionToken();
    showToken(t);
    updateCounter();

    // 若当前 token 已用过，直接锁定表单并提示
    if (getUsedTokens().indexOf(t) >= 0) {
      lockForm(true);
      showResult(false, '本页已提交过留言', '当前会话凭证（' + t.slice(0, 12) + '…）已使用，请重新打开本页面后再提交。');
    }

    // 邮件通道未配置时，在页面上给出明确提示（避免误以为已送达公司）
    if (!emailjsConfigured()) {
      var tip = $('#mail-status');
      if (tip) tip.textContent = '（邮件通道未启用，留言暂记本机）';
    }
  });
})();
