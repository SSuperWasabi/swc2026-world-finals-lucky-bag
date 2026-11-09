/* 럭키백 뽑기 규칙 — 순수 함수. 앱(globalThis.BagEngine)과 Node 테스트(module.exports)가 함께 쓴다.
   재고: {A:n, B:n, C:n}. 결과: ['A','C',...] */
(function (root) {
  const TYPES = ['A', 'B', 'C'];
  const BATCH_MAX = 3;

  function total(stock) { return TYPES.reduce((n, t) => n + (stock[t] || 0), 0); }

  function canStart(stock, qty) {
    const left = total(stock);
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) return { ok: false, reason: '수량을 1 이상으로 넣어 주세요.', left };
    if (qty > left) return { ok: false, reason: `남은 럭키백 ${left}개`, left };
    return { ok: true };
  }

  function splitBatches(qty, unit) {
    const size = unit === 'single' ? 1 : BATCH_MAX;
    const out = [];
    for (let left = qty; left > 0; left -= size) out.push(Math.min(size, left));
    return out;
  }

  // 한 장씩 차례로 뽑는다. 중복 줄이기를 켜면 이번 구매에서 가장 적게 나온 유형만 후보로 남기고,
  // 후보 안에서는 남은 재고 비율로 고른다. 품절 유형은 항상 빠진다.
  function drawMany(stock, qty, opts, rng) {
    const check = canStart(stock, qty);
    if (!check.ok) throw new Error(check.reason);
    const random = rng || Math.random;
    const next = { A: stock.A || 0, B: stock.B || 0, C: stock.C || 0 };
    const seen = { A: 0, B: 0, C: 0 };
    const results = [];
    for (let i = 0; i < qty; i++) {
      let pool = TYPES.filter((t) => next[t] > 0);
      if (opts && opts.dupReduce) {
        const min = Math.min(...pool.map((t) => seen[t]));
        pool = pool.filter((t) => seen[t] === min);
      }
      let ticket = random() * pool.reduce((n, t) => n + next[t], 0);
      let hit = pool[pool.length - 1];
      for (const t of pool) { ticket -= next[t]; if (ticket < 0) { hit = t; break; } }
      next[hit]--; seen[hit]++; results.push(hit);
    }
    return { results, stock: next };
  }

  root.BagEngine = { TYPES, BATCH_MAX, total, canStart, splitBatches, drawMany };
  if (typeof module === 'object' && module.exports) module.exports = root.BagEngine;
})(typeof globalThis !== 'undefined' ? globalThis : this);
