/* 北の手仕事舎 デモサイト 共通スクリプト */
(function () {
  'use strict';

  /* ---------- スマホ用ナビゲーション ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('global-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
      nav.classList.toggle('is-open', !open);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        toggle.click();
        toggle.focus();
      }
    });
  }

  /* ---------- 控えめなフェードイン ---------- */
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- フォーム（デモ：送信はしません） ----------
     一般問い合わせ・採用応募の両方で使用。
     必須項目は required、形式チェックは data-check="email" / "contact" で指定。 */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var TEL = /^[0-9０-９\-－()（）+\s]{10,}$/;

  function check(input) {
    var v = input.value.trim();
    var label = input.getAttribute('data-label') || 'この項目';
    if (input.required && v === '') {
      return input.tagName === 'SELECT' ? label + 'を選択してください。' : label + 'を入力してください。';
    }
    if (v !== '') {
      var type = input.getAttribute('data-check');
      if (type === 'email' && !EMAIL.test(v)) return 'メールアドレスの形式をご確認ください。';
      if (type === 'contact' && !EMAIL.test(v) && !TEL.test(v)) return 'メールアドレスまたは電話番号の形式をご確認ください。';
    }
    return '';
  }

  function validate(input) {
    var field = input.closest('.field');
    var msg = check(input);
    field.classList.toggle('has-error', msg !== '');
    input.setAttribute('aria-invalid', String(msg !== ''));
    var err = field.querySelector('.error');
    if (err) err.textContent = msg;
    return msg === '';
  }

  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    var inputs = form.querySelectorAll('[required], [data-check]');
    var thanks = document.getElementById(form.getAttribute('data-thanks'));

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value !== '' || input.closest('.field').classList.contains('has-error')) validate(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validate(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      // デモサイトのため送信は行わず、完了メッセージのみ表示します。
      // 実案件では送信先（一般問い合わせ・採用応募で別々）を設定してから公開してください。
      form.hidden = true;
      if (thanks) {
        thanks.classList.add('is-visible');
        thanks.setAttribute('tabindex', '-1');
        thanks.focus();
      }
    });
  });
})();
