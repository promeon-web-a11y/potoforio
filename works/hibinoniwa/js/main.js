/* 喫茶と焼き菓子「日々ノ庭」 デモサイト 共通スクリプト */
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

  /* ---------- 今日の営業状況（日本時間で判定） ----------
     営業日：火〜土 11:00〜17:00（デモ用の仮設定） */
  var OPEN_DAYS = [2, 3, 4, 5, 6];
  var OPEN_MIN = 11 * 60;
  var CLOSE_MIN = 17 * 60;

  function nowInTokyo() {
    try {
      var parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Tokyo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
      }).formatToParts(new Date());
      var map = {};
      parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[map.weekday], minutes: Number(map.hour) * 60 + Number(map.minute) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }

  var now = nowInTokyo();

  document.querySelectorAll('.hours-table tr[data-day]').forEach(function (row) {
    var days = row.getAttribute('data-day').split(',').map(Number);
    if (days.indexOf(now.day) !== -1) row.classList.add('is-today');
  });

  document.querySelectorAll('[data-today-status]').forEach(function (el) {
    var isOpenDay = OPEN_DAYS.indexOf(now.day) !== -1;
    var text;
    if (!isOpenDay) {
      text = '本日は定休日です';
    } else if (now.minutes < OPEN_MIN) {
      text = '本日は 11:00 から営業';
    } else if (now.minutes < CLOSE_MIN) {
      text = 'ただいま営業中（17:00まで）';
      el.classList.add('is-open');
    } else {
      text = '本日の営業は終了しました';
    }
    el.textContent = text;
    el.hidden = false;
  });

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
    }, { threshold: 0.12 });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- お問い合わせフォーム（デモ：送信はしません） ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var thanks = document.getElementById('form-thanks');

    var rules = {
      name: function (v) { return v.trim() !== '' || 'お名前を入力してください。'; },
      email: function (v) {
        if (v.trim() === '') return 'メールアドレスを入力してください。';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'メールアドレスの形式をご確認ください。';
      },
      message: function (v) { return v.trim() !== '' || 'お問い合わせ内容を入力してください。'; }
    };

    function validate(name) {
      var input = form.elements[name];
      var field = input.closest('.field');
      var result = rules[name](input.value);
      var ok = result === true;
      field.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      field.querySelector('.error').textContent = ok ? '' : result;
      return ok;
    }

    Object.keys(rules).forEach(function (name) {
      form.elements[name].addEventListener('blur', function () {
        if (this.value !== '' || this.closest('.field').classList.contains('has-error')) validate(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validate(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      // デモサイトのため、実際の送信は行わず完了メッセージのみ表示します。
      // 実案件では送信先（フォームサービス等）を設定してから公開してください。
      form.hidden = true;
      thanks.classList.add('is-visible');
      thanks.setAttribute('tabindex', '-1');
      thanks.focus();
    });
  }
})();
