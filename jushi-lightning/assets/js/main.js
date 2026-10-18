// 巨石防雷 - 公共交互
(function(){
  'use strict';

  // 移动端导航
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function(){
      links.classList.toggle('open');
      var sp = toggle.querySelectorAll('span');
      if (links.classList.contains('open')) {
        sp[0].style.transform = 'rotate(45deg) translate(5px,5px)';
        sp[1].style.opacity = '0';
        sp[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
      } else {
        sp[0].style.transform = ''; sp[1].style.opacity = ''; sp[2].style.transform = '';
      }
    });
    links.addEventListener('click', function(e){
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        var sp = toggle.querySelectorAll('span');
        sp[0].style.transform = ''; sp[1].style.opacity = ''; sp[2].style.transform = '';
      }
    });
  }

  // 案例筛选
  var btns = document.querySelectorAll('.cf-btn');
  var items = document.querySelectorAll('.case-item');
  if (btns.length && items.length) {
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        btns.forEach(function(x){ x.classList.remove('active'); });
        b.classList.add('active');
        var f = b.getAttribute('data-f');
        items.forEach(function(it){
          if (f === 'all' || it.getAttribute('data-cat') === f) {
            it.classList.remove('hide');
          } else {
            it.classList.add('hide');
          }
        });
      });
    });
  }

  // 表单校验
  var form = document.getElementById('rfForm');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name  = document.getElementById('f-name');
      var phone = document.getElementById('f-phone');
      var ok = true;
      [name, phone].forEach(function(el){
        var fg = el.closest('.fg');
        if (!el.value.trim()) { fg.classList.add('has-err'); ok = false; }
        else { fg.classList.remove('has-err'); }
      });
      var re = /^1[3-9]\d{9}$/;
      if (phone.value.trim() && !re.test(phone.value.trim())) {
        phone.closest('.fg').classList.add('has-err'); ok = false;
      }
      if (ok) {
        var btn = form.querySelector('button[type="submit"]');
        var t = btn.textContent;
        btn.textContent = '提交成功 ✓'; btn.disabled = true;
        setTimeout(function(){ btn.textContent = t; btn.disabled = false; form.reset(); }, 2600);
      }
    });
  }

  // 滚动出现动画
  var els = document.querySelectorAll('.card, .step-node, .flow-node, .hl-card');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) {
          en.target.style.opacity = '1';
          en.target.style.transform = 'translateY(0)';
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(function(el){
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .6s ease, transform .6s ease';
      io.observe(el);
    });
  }
})();
