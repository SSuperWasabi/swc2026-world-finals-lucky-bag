// 저장·기록 회귀 검사 (node --test tests/)
const test = require('node:test');
const assert = require('node:assert/strict');
require('../app/bag-engine.js');
const { createStore, STORAGE_KEY } = require('../app/bag-store.js');

function memStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k), _m: m };
}
let seed = 1;
const rng = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const sum = (s) => s.A + s.B + s.C;

test('startPurchase(10): 재고 300→290, 기록 1건, 묶음 [3,3,3,1]', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(10);
  assert.equal(sum(st.state.stock), 290);
  assert.equal(st.state.log.length, 1);
  assert.deepEqual(p.batches, [3, 3, 3, 1]);
  assert.equal(p.results.length, 10);
  assert.equal(st.state.log[0].no, 1);
  assert.deepEqual(st.state.log[0].settings, { unit: 'batch', reveal: 'all', dupReduce: true, resultConfirm: true });
});

test('resume: 같은 저장소로 다시 만들면 진행 중 구매가 그대로', () => {
  const mem = memStorage();
  const a = createStore(mem, { rng });
  const p = a.startPurchase(7);
  a.markRevealed(0); a.markRevealed(2); a.nextBatch(); a.markRevealed(1);
  const b = createStore(mem, { rng });
  assert.deepEqual(b.state.current.results, p.results);
  assert.equal(b.state.current.batchIndex, 1);
  assert.deepEqual(b.state.current.revealed, [1]);
  assert.equal(sum(b.state.stock), 293);
});

test('startPurchase: 저장 실패 → 오류, 재고·기록 그대로', () => {
  const mem = memStorage();
  const st = createStore(mem, { rng });
  mem.setItem = () => { throw new Error('QuotaExceeded'); };
  assert.throws(() => st.startPurchase(3), /저장 실패/);
  assert.equal(sum(st.state.stock), 300);
  assert.equal(st.state.log.length, 0);
  assert.equal(st.state.current, null);
});

test('진행 중 구매가 있으면 새 구매 시작 막힘', () => {
  const st = createStore(memStorage(), { rng });
  st.startPurchase(2);
  assert.throws(() => st.startPurchase(1), /진행 중인 구매/);
});

test('nextBatch: 4묶음이면 true 3번, 4번째 false', () => {
  const st = createStore(memStorage(), { rng });
  st.startPurchase(10);
  assert.deepEqual([st.nextBatch(), st.nextBatch(), st.nextBatch(), st.nextBatch()], [true, true, true, false]);
  assert.equal(st.state.current.done, true);
  st.finishPurchase();
  assert.equal(st.state.current, null);
});

test('markRevealed: 같은 카드 두 번 눌러도 한 번만', () => {
  const st = createStore(memStorage(), { rng });
  st.startPurchase(3);
  st.markRevealed(1); st.markRevealed(1);
  assert.deepEqual(st.state.current.revealed, [1]);
});

test('cancelPurchase 두 번 → 두 번째는 false, 재고는 한 번만 복원', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(4);
  st.finishPurchase();
  assert.equal(st.cancelPurchase(p.id), true);
  assert.equal(st.cancelPurchase(p.id), false);
  assert.equal(sum(st.state.stock), 300);
  assert.equal(st.state.log[0].status, 'cancelled');
});

test('진행 중 구매를 취소하면 화면 진행도 비움', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(4);
  st.cancelPurchase(p.id);
  assert.equal(st.state.current, null);
});

test('setStock → 재고 수정 기록(전·후) 남음', () => {
  const st = createStore(memStorage(), { rng });
  st.setStock({ A: 90, B: 100, C: 100 }, '실물 확인');
  assert.deepEqual(st.state.stock, { A: 90, B: 100, C: 100 });
  const e = st.state.log[0];
  assert.equal(e.type, 'adjust');
  assert.deepEqual(e.before, { A: 100, B: 100, C: 100 });
  assert.deepEqual(e.after, { A: 90, B: 100, C: 100 });
  assert.throws(() => st.setStock({ A: -1, B: 0, C: 0 }), /재고/);
});

test('toCSV: 머리글과 취소 건 표시', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(2); st.finishPurchase(); st.cancelPurchase(p.id);
  const csv = st.toCSV().split('\n');
  assert.equal(csv[0], '번호,시각,수량,결과,A,B,C,추첨단위,공개방식,중복줄이기,상태');
  assert.match(csv[1], /,취소$/);
});

test('백업 왕복: exportBackup → importBackup 하면 상태 동일, 잘못된 파일은 거부', () => {
  const st = createStore(memStorage(), { rng });
  st.startPurchase(5); st.finishPurchase(); st.setConfig({ dupReduce: false });
  const json = st.exportBackup();
  const st2 = createStore(memStorage(), { rng });
  st2.importBackup(json);
  assert.deepEqual(st2.state, st.state);
  assert.throws(() => st2.importBackup('{}'), /백업 파일/);
  assert.throws(() => st2.importBackup('아님'), /백업 파일/);
});

test('resetAll: 재고·기록·진행 초기화, 설정은 유지', () => {
  const st = createStore(memStorage(), { rng });
  st.setConfig({ unit: 'single' });
  st.startPurchase(3);
  st.resetAll({ A: 100, B: 100, C: 100 });
  assert.equal(st.state.log.length, 0);
  assert.equal(st.state.current, null);
  assert.equal(sum(st.state.stock), 300);
  assert.equal(st.state.config.unit, 'single');
});

test('trimPurchase: 진행 중 구매에서 공개한 카드만 남기고 나머지는 재고로', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(10);
  st.markRevealed(0); st.markRevealed(1); st.markRevealed(2);
  const kept = st.trimPurchase(p.id);
  assert.deepEqual(kept, p.results.slice(0, 3));
  assert.equal(sum(st.state.stock), 297);
  const e = st.state.log[0];
  assert.equal(e.qty, 3);
  assert.deepEqual(e.results, p.results.slice(0, 3));
  assert.equal(e.trimmedFrom, 10);
  assert.equal(st.state.current.done, true);
  assert.equal(st.state.current.qty, 3);
});

test('trimPurchase: 진행 중이 아니면 false', () => {
  const st = createStore(memStorage(), { rng });
  const p = st.startPurchase(2); st.finishPurchase();
  assert.equal(st.trimPurchase(p.id), false);
});

test('setStock: 진행 중 구매가 있으면 막힘', () => {
  const st = createStore(memStorage(), { rng });
  st.startPurchase(2);
  assert.throws(() => st.setStock({ A: 1, B: 1, C: 1 }), /진행 중인 구매/);
});

test('저장 데이터가 깨졌으면 원본을 따로 보관하고 loadError를 알림', () => {
  const mem = memStorage();
  mem.setItem(STORAGE_KEY, '{"stock":{"A":"x"}}');
  const st = createStore(mem, { rng, now: () => 1234 });
  assert.ok(st.loadError);
  assert.equal(mem.getItem(STORAGE_KEY + '.corrupt-1234'), '{"stock":{"A":"x"}}');
  assert.equal(sum(st.state.stock), 300);
});

test('정상 저장 데이터면 loadError 없음', () => {
  const mem = memStorage();
  createStore(mem, { rng }).startPurchase(1);
  assert.equal(createStore(mem, { rng }).loadError, null);
});

test('백업: config가 비어 있으면 기본값을 채움', () => {
  const src = createStore(memStorage(), { rng });
  const data = JSON.parse(src.exportBackup());
  data.state.config = {};
  const st = createStore(memStorage(), { rng });
  st.importBackup(JSON.stringify(data));
  assert.deepEqual(st.state.config, { unit: 'batch', reveal: 'all', dupReduce: true, resultConfirm: true, pin: '0000' });
});

test('백업: 기록 항목 모양이 틀리면 거부', () => {
  const src = createStore(memStorage(), { rng });
  src.startPurchase(2); src.finishPurchase();
  const data = JSON.parse(src.exportBackup());
  delete data.state.log[0].results;
  assert.throws(() => createStore(memStorage(), { rng }).importBackup(JSON.stringify(data)), /백업 파일/);
});

test('백업: 진행 중 구매 모양이 틀리면 거부', () => {
  const src = createStore(memStorage(), { rng });
  src.startPurchase(4);
  const data = JSON.parse(src.exportBackup());
  data.state.current.results = ['A'];
  assert.throws(() => createStore(memStorage(), { rng }).importBackup(JSON.stringify(data)), /백업 파일/);
});

test('결과 확인 설정: 구매 시작 때 고정되고, 예전 저장본은 켜기로 채움', () => {
  const mem = memStorage();
  const st = createStore(mem, { rng });
  st.setConfig({ resultConfirm: false });
  const p = st.startPurchase(2);
  assert.equal(p.settings.resultConfirm, false);
  st.setConfig({ resultConfirm: true });
  assert.equal(st.state.current.settings.resultConfirm, false);
  const raw = JSON.parse(mem.getItem(STORAGE_KEY)); delete raw.config.resultConfirm;
  const mem2 = memStorage(); mem2.setItem(STORAGE_KEY, JSON.stringify(raw));
  assert.equal(createStore(mem2, { rng }).state.config.resultConfirm, true);
});

test('저장 키 이름이 럭키백 전용', () => {
  assert.equal(STORAGE_KEY, 'swc2026-world-finals-lucky-bag.state.v1');
});
