/* Promeon Web ポートフォリオ：制作サンプルの絞り込み（プルダウン）
   ・業種／目的／特徴をそれぞれ1つずつ選び、選んだ条件すべてに合うサンプルを表示します
   ・各選択肢には「選ぶと何件になるか」を表示します
   JavaScriptが動かない環境では絞り込みを出さず、全サンプルを表示します。 */
(function () {
  'use strict';

  var panel = document.getElementById('work-filter');
  if (!panel) return;

  var selects = Array.prototype.slice.call(panel.querySelectorAll('select[data-group]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.work-card[data-tags]'));
  var countEl = document.getElementById('filter-count');
  var resetBtn = document.getElementById('filter-reset');
  var emptyEl = document.getElementById('filter-empty');

  // 各選択肢の元の表示名を保存（件数を後ろに付けるため）
  selects.forEach(function (sel) {
    Array.prototype.forEach.call(sel.options, function (o) { o.setAttribute('data-label', o.textContent); });
  });

  // 現在の選択値の一覧。override で特定のプルダウンの値だけ差し替えられる
  function values(override) {
    return selects.map(function (sel) {
      return override && override.sel === sel ? override.value : sel.value;
    }).filter(Boolean);
  }

  function matches(card, vals) {
    var tags = card.getAttribute('data-tags').split(/\s+/);
    return vals.every(function (v) { return tags.indexOf(v) !== -1; });
  }

  function countFor(vals) {
    return cards.filter(function (c) { return matches(c, vals); }).length;
  }

  function update() {
    var vals = values();
    var shown = 0;

    cards.forEach(function (card) {
      var ok = matches(card, vals);
      card.hidden = !ok;
      if (ok) shown++;
    });

    selects.forEach(function (sel) {
      Array.prototype.forEach.call(sel.options, function (o) {
        var n = countFor(values({ sel: sel, value: o.value }));
        o.textContent = o.getAttribute('data-label') + '（' + n + '件）';
      });
      sel.classList.toggle('is-active', sel.value !== '');
    });

    countEl.textContent = vals.length
      ? '条件に合うサンプル：' + shown + '件（全' + cards.length + '件中）'
      : '全' + cards.length + '件のサンプルを表示しています';
    resetBtn.hidden = !vals.length;
    emptyEl.hidden = shown !== 0;
  }

  function reset() {
    selects.forEach(function (sel) { sel.value = ''; });
    update();
    selects[0].focus();
  }

  selects.forEach(function (sel) { sel.addEventListener('change', update); });
  resetBtn.addEventListener('click', reset);
  Array.prototype.forEach.call(document.querySelectorAll('[data-filter-reset]'), function (btn) {
    btn.addEventListener('click', reset);
  });

  panel.hidden = false;
  update();
})();
