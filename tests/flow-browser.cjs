// 화면 흐름 브라우저 검사 — 설치된 Chrome + playwright-core(test-tools)
// 실행: node tests/flow-browser.cjs   (스크린샷은 tests/out/ 에 저장)
const path = require('path');
const fs = require('fs');
const http = require('http');
const { chromium } = require(path.join(__dirname, '../test-tools/node_modules/playwright-core'));

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, 'out');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };

function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f)) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rsp);
    }).listen(0, () => res(srv));
  });
}

let pass = 0, fail = 0;
async function check(name, fn) {
  try { await fn(); pass++; console.log('통과 —', name); }
  catch (e) { fail++; console.log('실패 —', name, '\n   ', e.message); }
}
function eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); }

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}/app/`;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });

  async function fresh(stateSetup) {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 } });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('   [페이지 오류]', e.message));
    await page.goto(base);
    await page.evaluate(() => localStorage.clear());
    if (stateSetup) await page.evaluate(stateSetup);
    await page.reload();
    await page.waitForFunction(() => window.__app);
    return { ctx, page };
  }
  const idle = (page) => page.waitForFunction(() => !window.__app.busy);
  const st = (page) => page.evaluate(() => window.__app.store.state);
  async function startQty(page, n) {
    await page.click('#stage', { position: { x: 500, y: 900 } });
    await page.waitForSelector('#scr-staff.on');
    for (let i = 1; i < n; i++) await page.click('#qPlus');
    await page.click('#qStart');
    await page.waitForSelector('#scr-draw.on');
    await idle(page);
  }
  async function revealBatchOneByOne(page) {
    const n = await page.locator('#slots .slot').count();
    for (let i = 0; i < n; i++) { await page.locator('#slots .slot').nth(i).click(); await idle(page); }
  }

  await check('10개 한꺼번에·한 장씩: 4묶음 → 요약 TOTAL 10, 재고 290', async () => {
    const { ctx, page } = await fresh();
    await page.screenshot({ path: path.join(OUT, '1-idle.png') });
    await startQty(page, 10);
    for (let b = 0; b < 4; b++) {
      eq(await page.locator('#slots .slot').count(), b < 3 ? 3 : 1, `${b + 1}묶음 카드 수`);
      await revealBatchOneByOne(page);
      if (b === 0) await page.screenshot({ path: path.join(OUT, '2-batch1.png') });
      await page.click('#dNext');
      if (b < 3) await idle(page);
    }
    await page.waitForSelector('#scr-summary.on');
    eq(await page.textContent('#sTotal'), 'TOTAL 10', '요약 합계');
    await page.screenshot({ path: path.join(OUT, '3-summary.png') });
    const s = await st(page);
    eq(s.stock.A + s.stock.B + s.stock.C, 290, '재고 합');
    await page.click('#sNext');
    await page.waitForSelector('#scr-idle.on');
    eq((await st(page)).current, null, '다음 고객 뒤 진행 비움');
    await ctx.close();
  });

  await check('연출 중 새로 고침 → 같은 결과·같은 묶음으로 복구', async () => {
    const { ctx, page } = await fresh();
    await startQty(page, 7);
    await revealBatchOneByOne(page); await page.click('#dNext'); await idle(page);
    await page.locator('#slots .slot').nth(1).click();
    const before = await st(page);
    await page.reload(); await page.waitForFunction(() => window.__app); await idle(page);
    const after = await st(page);
    eq(after.current.results, before.current.results, '결과');
    eq(after.current.batchIndex, 1, '묶음 위치');
    eq(after.current.revealed, [1], '공개한 카드');
    eq(await page.locator('#slots .slot.flipped').count(), 1, '공개 상태 그대로 그림');
    eq(after.stock.A + after.stock.B + after.stock.C, 293, '재고 그대로');
    await ctx.close();
  });

  await check('[뽑기 시작] 5연타 → 구매 기록 1건', async () => {
    const { ctx, page } = await fresh();
    await page.click('#stage', { position: { x: 500, y: 900 } });
    await page.waitForSelector('#scr-staff.on');
    await page.evaluate(() => { for (let i = 0; i < 5; i++) document.getElementById('qStart').click(); });
    await idle(page);
    eq((await st(page)).log.length, 1, '기록 수');
    await ctx.close();
  });

  await check('재고 2에 3개 → 시작 막힘, 안내 문구', async () => {
    const { ctx, page } = await fresh(() => {
      localStorage.setItem('swc2026-world-finals-lucky-bag.state.v1', JSON.stringify({ version: 1, config: { unit: 'batch', reveal: 'one', dupReduce: true, pin: '0000' }, stock: { A: 1, B: 0, C: 1 }, initial: { A: 100, B: 100, C: 100 }, log: [], current: null, seq: 0 }));
    });
    await page.click('#stage', { position: { x: 500, y: 900 } });
    await page.click('#qPlus'); await page.click('#qPlus');
    eq(await page.isDisabled('#qStart'), true, '시작 버튼 비활성');
    const w = await page.textContent('#qWarn');
    if (!w.includes('남은 럭키백 2개')) throw new Error('안내 문구: ' + w);
    await page.screenshot({ path: path.join(OUT, '4-staff-short.png') });
    await ctx.close();
  });

  await check('오른쪽 위 5번 → PIN 0000 → 관리자, 설정 바꾸기', async () => {
    const { ctx, page } = await fresh();
    for (let i = 0; i < 5; i++) await page.click('#tapzone');
    await page.waitForSelector('#scr-admin.on');
    for (const k of '0000') await page.click(`#pinGrid [data-k="${k}"]`);
    await page.waitForSelector('#admView', { state: 'visible' });
    await page.click('[data-key="unit"] [data-v="single"]');
    eq((await st(page)).config.unit, 'single', '추첨 단위 저장');
    await page.screenshot({ path: path.join(OUT, '5-admin.png') });
    await ctx.close();
  });

  await check('한 개씩 추첨: 3개 → 큰 카드 1장씩 3번', async () => {
    const { ctx, page } = await fresh(() => {
      localStorage.setItem('swc2026-world-finals-lucky-bag.state.v1', JSON.stringify({ version: 1, config: { unit: 'single', reveal: 'one', dupReduce: true, pin: '0000' }, stock: { A: 100, B: 100, C: 100 }, initial: { A: 100, B: 100, C: 100 }, log: [], current: null, seq: 0 }));
    });
    await startQty(page, 3);
    for (let i = 0; i < 3; i++) {
      eq(await page.locator('#slots .slot.s-solo').count(), 1, '큰 카드');
      await page.locator('#slots .slot').first().click(); await idle(page);
      if (i === 0) await page.screenshot({ path: path.join(OUT, '6-single.png') });
      await page.click('#dNext'); if (i < 2) await idle(page);
    }
    await page.waitForSelector('#scr-summary.on');
    await ctx.close();
  });

  await check('동시에 공개: [OPEN] 한 번에 3장', async () => {
    const { ctx, page } = await fresh(() => {
      localStorage.setItem('swc2026-world-finals-lucky-bag.state.v1', JSON.stringify({ version: 1, config: { unit: 'batch', reveal: 'all', dupReduce: true, pin: '0000' }, stock: { A: 100, B: 100, C: 100 }, initial: { A: 100, B: 100, C: 100 }, log: [], current: null, seq: 0 }));
    });
    await startQty(page, 3);
    await page.locator('#slots .slot').first().click(); // 동시 모드에서는 카드 탭 무시
    eq((await st(page)).current.revealed.length, 0, '카드 탭 무시');
    await page.click('#dOpen'); await idle(page);
    eq(await page.locator('#slots .slot.flipped').count(), 3, '3장 공개');
    await ctx.close();
  });

  await check('관리자 기록에서 구매 취소 → 재고 복원', async () => {
    const { ctx, page } = await fresh();
    await startQty(page, 2);
    for (let i = 0; i < 5; i++) await page.click('#tapzone');
    for (const k of '0000') await page.click(`#pinGrid [data-k="${k}"]`);
    await page.click('#admTabs [data-t="log"]');
    await page.click('[data-cancel]');
    await page.click('#mYes');
    const s = await st(page);
    eq(s.stock.A + s.stock.B + s.stock.C, 300, '재고 복원');
    eq(s.current, null, '진행 중 구매도 비움');
    await ctx.close();
  });

  await check('오프라인에서 새로 고침해도 앱이 뜸 (Service Worker 캐시)', async () => {
    const { ctx, page } = await fresh();
    // 캐시가 다 차고 이 페이지를 Service Worker가 맡을 때까지 기다린 뒤 오프라인으로 바꾼다.
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    eq(await page.isVisible('#scr-idle.on'), true, '처음 설치 때 저절로 새로 고침되지 않음');
    await ctx.setOffline(true);
    await page.reload(); await page.waitForFunction(() => window.__app, null, { timeout: 5000 });
    eq(await page.isVisible('#scr-idle.on'), true, '대기 화면');
    const imgsOk = await page.evaluate(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
    eq(imgsOk, true, '이미지 모두 표시');
    await ctx.close();
  });

  await browser.close(); srv.close();
  console.log(`\n결과: 통과 ${pass} · 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
