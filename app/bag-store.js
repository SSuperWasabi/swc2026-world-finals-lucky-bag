/* 럭키백 저장·기록 — 상태 전체를 localStorage 한 키에 JSON으로 둔다.
   모든 변경은 "새 상태를 만들어 저장 성공 → 그때 반영" 순서라 저장이 실패하면 아무것도 바뀌지 않는다. */
(function (root) {
  const STORAGE_KEY = 'swc2026-world-finals-lucky-bag.state.v1';
  const E = () => root.BagEngine;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const DEFAULT_STOCK = { A: 100, B: 100, C: 100 };

  function defaultState() {
    return {
      version: 1,
      config: { unit: 'batch', reveal: 'one', dupReduce: true, pin: '0000' },
      stock: { ...DEFAULT_STOCK },
      initial: { ...DEFAULT_STOCK },
      log: [],
      current: null,
      seq: 0,
    };
  }

  function validState(s) {
    const okStock = (x) => x && ['A', 'B', 'C'].every((t) => Number.isInteger(x[t]) && x[t] >= 0);
    return !!(s && typeof s === 'object' && s.config && okStock(s.stock) && okStock(s.initial) && Array.isArray(s.log) && Number.isInteger(s.seq));
  }

  function createStore(storage, opts) {
    const now = (opts && opts.now) || (() => Date.now());
    const rng = (opts && opts.rng) || Math.random;
    let state = defaultState();
    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (raw) { const s = JSON.parse(raw); if (validState(s)) state = { ...defaultState(), ...s, config: { ...defaultState().config, ...s.config } }; }
    } catch (e) { /* 읽기 실패 시 기본값 */ }

    function commit(next) {
      try { storage.setItem(STORAGE_KEY, JSON.stringify(next)); }
      catch (e) { throw new Error('저장 실패: iPad 저장 공간 또는 개인정보 보호 설정을 확인해 주세요.'); }
      state = next;
    }
    const iso = () => new Date(now()).toISOString();

    function startPurchase(qty) {
      if (state.current) throw new Error('진행 중인 구매가 있어요. 먼저 끝내 주세요.');
      const { results, stock } = E().drawMany(state.stock, qty, { dupReduce: state.config.dupReduce }, rng);
      const next = clone(state);
      next.seq += 1;
      const settings = { unit: state.config.unit, reveal: state.config.reveal, dupReduce: state.config.dupReduce };
      const id = `p${now()}-${next.seq}`;
      const batches = E().splitBatches(qty, settings.unit);
      next.stock = stock;
      next.log.push({ type: 'purchase', id, no: next.seq, ts: iso(), qty, results, batches, settings, status: 'ok' });
      next.current = { id, no: next.seq, qty, results, batches, batchIndex: 0, revealed: [], settings, done: false };
      commit(next);
      return clone(next.current);
    }

    function markRevealed(cardIndex) {
      if (!state.current || state.current.revealed.includes(cardIndex)) return;
      const next = clone(state);
      next.current.revealed.push(cardIndex);
      commit(next);
    }

    function nextBatch() {
      if (!state.current) return false;
      const next = clone(state);
      const c = next.current;
      if (c.batchIndex + 1 < c.batches.length) { c.batchIndex += 1; c.revealed = []; commit(next); return true; }
      c.done = true; commit(next); return false;
    }

    function finishPurchase() {
      if (!state.current) return;
      const next = clone(state); next.current = null; commit(next);
    }

    function cancelPurchase(id) {
      const i = state.log.findIndex((e) => e.type === 'purchase' && e.id === id);
      if (i < 0 || state.log[i].status !== 'ok') return false;
      const next = clone(state);
      const e = next.log[i];
      for (const t of e.results) next.stock[t] += 1;
      e.status = 'cancelled'; e.cancelTs = iso();
      if (next.current && next.current.id === id) next.current = null;
      commit(next);
      return true;
    }

    function setStock(stock, note) {
      const s = { A: stock.A, B: stock.B, C: stock.C };
      if (!['A', 'B', 'C'].every((t) => Number.isInteger(s[t]) && s[t] >= 0)) throw new Error('재고는 0 이상의 정수로 넣어 주세요.');
      const next = clone(state);
      next.log.push({ type: 'adjust', ts: iso(), before: clone(state.stock), after: s, note: note || '' });
      next.stock = s;
      commit(next);
    }

    function setConfig(partial) {
      const next = clone(state);
      next.config = { ...next.config, ...partial };
      commit(next);
    }

    function resetAll(initialStock) {
      const s = initialStock || DEFAULT_STOCK;
      const next = clone(state);
      next.stock = { ...s }; next.initial = { ...s }; next.log = []; next.current = null; next.seq = 0;
      commit(next);
    }

    function toCSV() {
      const head = '번호,시각,수량,결과,A,B,C,추첨단위,공개방식,중복줄이기,상태';
      const rows = state.log.filter((e) => e.type === 'purchase').map((e) => {
        const c = { A: 0, B: 0, C: 0 }; e.results.forEach((t) => c[t]++);
        const local = new Date(e.ts).toLocaleString('ko-KR', { hour12: false });
        return [e.no, `"${local}"`, e.qty, e.results.join(''), c.A, c.B, c.C,
          e.settings.unit === 'single' ? '한개씩' : '한꺼번에', e.settings.reveal === 'all' ? '동시에' : '한장씩',
          e.settings.dupReduce ? '켬' : '끔', e.status === 'cancelled' ? '취소' : '정상'].join(',');
      });
      return [head, ...rows].join('\n');
    }

    function exportBackup() {
      return JSON.stringify({ app: 'swc2026-world-finals-lucky-bag', exportedAt: iso(), state }, null, 1);
    }

    function importBackup(json) {
      let data;
      try { data = JSON.parse(json); } catch (e) { throw new Error('백업 파일을 읽을 수 없어요.'); }
      if (!data || data.app !== 'swc2026-world-finals-lucky-bag' || !validState(data.state)) throw new Error('럭키백 앱 백업 파일이 아니에요.');
      commit(clone(data.state));
    }

    return {
      get state() { return clone(state); },
      startPurchase, markRevealed, nextBatch, finishPurchase, cancelPurchase,
      setStock, setConfig, resetAll, toCSV, exportBackup, importBackup,
    };
  }

  root.BagStore = { createStore, STORAGE_KEY };
  if (typeof module === 'object' && module.exports) module.exports = root.BagStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
