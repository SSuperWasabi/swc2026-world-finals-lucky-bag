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

  const T3 = ['A', 'B', 'C'];
  const okStock = (x) => !!x && typeof x === 'object' && T3.every((t) => Number.isInteger(x[t]) && x[t] >= 0);
  const okResults = (r, n) => Array.isArray(r) && r.length === n && r.every((t) => T3.includes(t));
  const okBatches = (b, n) => Array.isArray(b) && b.length > 0 && b.every((x) => Number.isInteger(x) && x > 0) && b.reduce((a, x) => a + x, 0) === n;
  function okEntry(e) {
    if (!e || typeof e !== 'object') return false;
    if (e.type === 'adjust') return okStock(e.before) && okStock(e.after);
    return e.type === 'purchase' && typeof e.id === 'string' && Number.isInteger(e.qty) && e.qty > 0 &&
      okResults(e.results, e.qty) && okBatches(e.batches, e.qty) && !!e.settings && (e.status === 'ok' || e.status === 'cancelled');
  }
  function okCurrent(c, log) {
    if (c === null || c === undefined) return true;
    if (typeof c !== 'object' || !Number.isInteger(c.qty) || !okResults(c.results, c.qty) || !okBatches(c.batches, c.qty)) return false;
    if (!Number.isInteger(c.batchIndex) || c.batchIndex < 0 || c.batchIndex >= c.batches.length || !Array.isArray(c.revealed)) return false;
    return log.some((e) => e.type === 'purchase' && e.id === c.id && e.status === 'ok');
  }
  function validState(s) {
    return !!(s && typeof s === 'object' && okStock(s.stock) && okStock(s.initial) && Array.isArray(s.log) && s.log.every(okEntry) &&
      Number.isInteger(s.seq) && okCurrent(s.current, s.log));
  }
  // 저장본에 빠진 설정이 있으면 기본값으로 채운다.
  function withDefaults(s) {
    const d = defaultState();
    const cfg = { ...d.config, ...(s.config && typeof s.config === 'object' ? s.config : {}) };
    if (cfg.unit !== 'single' && cfg.unit !== 'batch') cfg.unit = d.config.unit;
    if (cfg.reveal !== 'one' && cfg.reveal !== 'all') cfg.reveal = d.config.reveal;
    if (typeof cfg.dupReduce !== 'boolean') cfg.dupReduce = d.config.dupReduce;
    if (!/^\d{4,8}$/.test(String(cfg.pin))) cfg.pin = d.config.pin;
    return { ...d, ...s, config: cfg, current: s.current || null };
  }

  function createStore(storage, opts) {
    const now = (opts && opts.now) || (() => Date.now());
    const rng = (opts && opts.rng) || Math.random;
    let state = defaultState();
    let loadError = null;
    let raw = null;
    try { raw = storage.getItem(STORAGE_KEY); } catch (e) { loadError = '저장소를 읽을 수 없어요.'; }
    if (raw) {
      let s = null;
      try { s = JSON.parse(raw); } catch (e) { /* 아래에서 처리 */ }
      if (validState(s)) state = withDefaults(s);
      else {
        // 깨진 저장본은 지우지 않고 따로 보관한 뒤 기본값으로 시작한다(직원에게 알림).
        loadError = '저장된 재고·기록을 읽지 못했어요. 원본은 따로 보관했어요.';
        try { storage.setItem(`${STORAGE_KEY}.corrupt-${now()}`, raw); } catch (e) { /* 보관 실패 */ }
      }
    }

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

    // 진행 중 구매에서 이미 공개한 카드만 남기고, 아직 안 연 몫은 재고로 돌린다(수량을 잘못 넣었을 때).
    function trimPurchase(id) {
      const c = state.current;
      if (!c || c.id !== id || c.done) return false;
      const start = c.batches.slice(0, c.batchIndex).reduce((a, b) => a + b, 0);
      const cur = c.results.slice(start, start + c.batches[c.batchIndex]);
      const kept = [...c.results.slice(0, start), ...c.revealed.slice().sort((a, b) => a - b).map((i) => cur[i])];
      if (!kept.length) return false;
      const next = clone(state);
      const n = next.current;
      const returned = n.results.slice();
      kept.forEach((t) => returned.splice(returned.indexOf(t), 1));
      returned.forEach((t) => { next.stock[t] += 1; });
      const e = next.log.find((x) => x.type === 'purchase' && x.id === id);
      e.trimmedFrom = e.qty; e.qty = kept.length; e.results = kept; e.batches = [kept.length]; e.trimTs = iso();
      Object.assign(n, { qty: kept.length, results: kept, batches: [kept.length], batchIndex: 0, revealed: kept.map((_, i) => i), done: true });
      commit(next);
      return kept.slice();
    }

    function setStock(stock, note) {
      if (state.current) throw new Error('진행 중인 구매가 있어요. 구매를 끝낸 뒤 재고를 고쳐 주세요.');
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
      commit(withDefaults(clone(data.state)));
    }

    return {
      get state() { return clone(state); },
      get loadError() { return loadError; },
      startPurchase, markRevealed, nextBatch, finishPurchase, cancelPurchase, trimPurchase,
      setStock, setConfig, resetAll, toCSV, exportBackup, importBackup,
    };
  }

  root.BagStore = { createStore, STORAGE_KEY };
  if (typeof module === 'object' && module.exports) module.exports = root.BagStore;
})(typeof globalThis !== 'undefined' ? globalThis : this);
