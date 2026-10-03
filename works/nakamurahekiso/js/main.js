/* 「なかむら壁装」 デモサイト 共通スクリプト */
(function () {
  'use strict';

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
    window.matchMedia('(min-width: 1061px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
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

  /* ---------- Instagram 横スクロール（オプションの表示例） ----------
     自動では動かしません。ボタン・スワイプ・キーボード（←→）で操作します。 */
  document.querySelectorAll('[data-scroller]').forEach(function (wrap) {
    var list = wrap.querySelector('.insta-scroller');
    var prev = wrap.querySelector('[data-scroll="prev"]');
    var next = wrap.querySelector('[data-scroll="next"]');
    if (!list || !prev || !next) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var step = function () {
      var item = list.querySelector('li');
      return item ? item.getBoundingClientRect().width + 14 : list.clientWidth * 0.8;
    };
    var update = function () {
      var max = list.scrollWidth - list.clientWidth - 2;
      prev.disabled = list.scrollLeft <= 2;
      next.disabled = list.scrollLeft >= max;
    };
    prev.addEventListener('click', function () { list.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    next.addEventListener('click', function () { list.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

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
