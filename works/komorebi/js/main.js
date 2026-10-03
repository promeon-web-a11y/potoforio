/* 焼き菓子店「菓子室 こもれび」 デモサイト 共通スクリプト */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  /* ---------- スマホ用ナビゲーション ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('global-nav');
  if (toggle && nav) {
    var label = toggle.querySelector('.nav-toggle-label');
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      if (label) label.textContent = open ? '閉じる' : 'メニュー';
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- 今日の営業状況（日本時間で判定） ----------
     営業日：水〜日 10:30〜17:00／定休日：月・火（デモ用の仮設定） */
  var OPEN_DAYS = [0, 3, 4, 5, 6];
  var OPEN_MIN = 10 * 60 + 30;
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

  document.querySelectorAll('tr[data-day]').forEach(function (row) {
    var days = row.getAttribute('data-day').split(',').map(Number);
    if (days.indexOf(now.day) !== -1) row.classList.add('is-today');
  });

  document.querySelectorAll('[data-today-status]').forEach(function (el) {
    var text;
    if (OPEN_DAYS.indexOf(now.day) === -1) {
      text = '本日は定休日（仮設定）';
    } else if (now.minutes < OPEN_MIN) {
      text = '本日は10:30から営業（仮設定）';
    } else if (now.minutes < CLOSE_MIN) {
      text = 'ただいま営業時間内（仮設定）';
      el.classList.add('is-open');
    } else {
      text = '本日の営業は終了（仮設定）';
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
    }, { threshold: 0.1 });
    fadeEls.forEach(function (el) { io.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- お問い合わせフォーム（デモ：送信処理はありません） ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var thanks = document.getElementById('form-thanks');

    var rules = {
      name: function (v) { return v.trim() !== '' || 'お名前を入力してください。'; },
      email: function (v) {
        if (v.trim() === '') return 'メールアドレスを入力してください。';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'メールアドレスの形式をご確認ください（例：name@example.com）。';
      },
      tel: function (v) {
        return v.trim() === '' || /^[0-9０-９+\-－() ]{10,}$/.test(v.trim()) || '電話番号は数字とハイフンで入力してください。';
      },
      message: function (v) { return v.trim() !== '' || 'お問い合わせ内容を入力してください。'; }
    };

    var validate = function (name) {
      var input = form.elements[name];
      var field = input.closest('.field');
      var result = rules[name](input.value);
      var ok = result === true;
      field.classList.toggle('has-error', !ok);
      input.setAttribute('aria-invalid', String(!ok));
      field.querySelector('.error').textContent = ok ? '' : result;
      return ok;
    };

    Object.keys(rules).forEach(function (name) {
      form.elements[name].addEventListener('blur', function () {
        if (this.value !== '' || this.closest('.field').classList.contains('has-error')) validate(name);
      });
    });

    form.addEventListener('submit', function (e) {
      // デモサイトのため、どこにも送信しません（action属性も設定していません）。
      // 実案件では送信先を確定し、プライバシーポリシーを掲載してから設定します。
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        if (!validate(name) && !firstInvalid) firstInvalid = form.elements[name];
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      form.hidden = true;
      thanks.classList.add('is-visible');
      thanks.setAttribute('tabindex', '-1');
      thanks.focus();
    });
  }
})();
