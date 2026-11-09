// 뽑기 규칙 회귀 검사 (node --test tests/)
const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../app/bag-engine.js');

// 재현 가능한 난수 (mulberry32)
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const full = () => ({ A: 100, B: 100, C: 100 });
const count = (arr) => arr.reduce((m, t) => (m[t] = (m[t] || 0) + 1, m), {});

test('canStart: 재고 5에 6개 → 막힘, left 5, 안내 문구', () => {
  const r = E.canStart({ A: 2, B: 2, C: 1 }, 6);
  assert.equal(r.ok, false);
  assert.equal(r.left, 5);
  assert.match(r.reason, /남은 럭키백 5개/);
});

test('canStart: 0·소수·문자 → 막힘, 정상 수량은 통과', () => {
  for (const q of [0, -1, 1.5, '3', NaN]) assert.equal(E.canStart(full(), q).ok, false, String(q));
  assert.equal(E.canStart(full(), 10).ok, true);
});

test('splitBatches: 3장씩 나누기와 한 개씩', () => {
  assert.deepEqual(E.splitBatches(10, 'batch'), [3, 3, 3, 1]);
  assert.deepEqual(E.splitBatches(2, 'batch'), [2]);
  assert.deepEqual(E.splitBatches(3, 'single'), [1, 1, 1]);
});

test('drawMany 중복 줄이기 켬, 재고 넉넉, 3개 → 항상 A·B·C 하나씩', () => {
  const r = rng(1);
  for (let i = 0; i < 1000; i++) {
    const { results } = E.drawMany(full(), 3, { dupReduce: true }, r);
    assert.deepEqual([...results].sort(), ['A', 'B', 'C']);
  }
});

test('drawMany 중복 줄이기 켬, 6개 → 각 유형 정확히 2개', () => {
  const r = rng(2);
  for (let i = 0; i < 200; i++) {
    const c = count(E.drawMany(full(), 6, { dupReduce: true }, r).results);
    assert.deepEqual(c, { A: 2, B: 2, C: 2 });
  }
});

test('drawMany 켬, C 품절 → C 없음, A·B 차이 ≤ 1', () => {
  const r = rng(3);
  for (let i = 0; i < 200; i++) {
    const c = count(E.drawMany({ A: 50, B: 50, C: 0 }, 5, { dupReduce: true }, r).results);
    assert.equal(c.C, undefined);
    assert.ok(Math.abs((c.A || 0) - (c.B || 0)) <= 1);
  }
});

test('drawMany 끔, 한 유형만 남음 → 그 유형', () => {
  assert.deepEqual(E.drawMany({ A: 1, B: 0, C: 0 }, 1, { dupReduce: false }, rng(4)).results, ['A']);
});

test('drawMany 끔, 재고 비율대로 나옴 (A 300 : B 100 → A 약 75%)', () => {
  const r = rng(5); let a = 0; const N = 20000;
  for (let i = 0; i < N; i++) if (E.drawMany({ A: 300, B: 100, C: 0 }, 1, { dupReduce: false }, r).results[0] === 'A') a++;
  assert.ok(Math.abs(a / N - 0.75) < 0.02, String(a / N));
});

test('drawMany: 입력 재고는 그대로, 반환 재고 합 = 원래 합 − 수량', () => {
  const s = full();
  const out = E.drawMany(s, 10, { dupReduce: true }, rng(6));
  assert.deepEqual(s, full());
  assert.equal(E.total(out.stock), 290);
  const c = count(out.results);
  for (const t of E.TYPES) assert.equal(out.stock[t], 100 - (c[t] || 0));
});

test('drawMany: 수량 > 재고 → 오류', () => {
  assert.throws(() => E.drawMany({ A: 1, B: 1, C: 0 }, 3, { dupReduce: true }, rng(7)), /남은 럭키백 2개/);
});
