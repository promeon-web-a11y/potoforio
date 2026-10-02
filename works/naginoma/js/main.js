/* 民宿「凪の間」 デモサイト 共通スクリプト */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

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

  /* ---------- 「空室確認・予約」ボタン ----------
     実案件では、このボタンを契約中の外部予約サイトの施設ページへのリンク
     （<a href="予約サイトURL" target="_blank" rel="noopener">）に置き換えます。
     デモでは実際の予約サイトへ移動せず、説明を表示します。 */
  var dialog = document.getElementById('reserve-dialog');
  document.querySelectorAll('[data-reserve]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        var fallback = document.getElementById('reserve-fallback');
        if (fallback) { fallback.hidden = false; fallback.focus(); }
      }
    });
  });
  if (dialog) {
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });
  }

  /* ---------- 客室タブ ---------- */
  var tabs = document.querySelectorAll('.room-tabs [role="tab"]');
  if (tabs.length) {
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    // 比較表の客室名から、該当する客室タブを開く
    document.querySelectorAll('[data-room-link]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href').slice(1);
        tabs.forEach(function (t) {
          if (t.getAttribute('aria-controls') === id) {
            e.preventDefault();
            select(t, false);
            document.querySelector('.room-tabs').scrollIntoView({ block: 'start' });
            t.focus({ preventScroll: true });
          }
        });
      });
    });
    var initial = tabs[0];
    tabs.forEach(function (t) { if (location.hash === '#' + t.getAttribute('aria-controls')) initial = t; });
    select(initial, false);
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

  /* ---------- お問い合わせフォーム（デモ：送信はしません） ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    var inputs = form.querySelectorAll('[required]');
    var thanks = document.getElementById(form.getAttribute('data-thanks'));

    function validate(input) {
      var v = input.value.trim();
      var label = input.getAttribute('data-label') || 'この項目';
      var msg = '';
      if (v === '') msg = label + 'を入力してください。';
      else if (input.type === 'email' && !EMAIL.test(v)) msg = 'メールアドレスの形式をご確認ください。';
      var field = input.closest('.field');
      field.classList.toggle('has-error', msg !== '');
      input.setAttribute('aria-invalid', String(msg !== ''));
      field.querySelector('.error').textContent = msg;
      return msg === '';
    }

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
      if (firstInvalid) { firstInvalid.focus(); return; }
      // デモサイトのため送信は行わず、完了メッセージのみ表示します。
      form.hidden = true;
      if (thanks) {
        thanks.classList.add('is-visible');
        thanks.setAttribute('tabindex', '-1');
        thanks.focus();
      }
    });
  });
})();
