// 새 버전 받기 검사 — 달라진 파일만 내려받는지, 받다가 끊겨도 이어서 받는지
// 실행: node tests/sw-update.cjs
// 방식: 작은 서버가 app/ 폴더를 내보내면서, 단계마다 sw.js(버전·지문)와 일부 파일 내용을 바꿔 '새 버전 배포'를 흉내 낸다.
//       Service Worker가 설치하면서 내려받는 요청은 주소 끝에 ?v=지문 이 붙으므로 그것만 센다.
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const { chromium } = require(path.join(__dirname, '../test-tools/node_modules/playwright-core'));

const APP = path.join(__dirname, '..', 'app');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.otf': 'font/otf', '.webmanifest': 'application/manifest+json', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg' };
const TEXT = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.txt']);
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
// 배포본처럼 글자 파일은 줄바꿈 LF로 내보낸다
function fileBytes(rel) {
  let buf = fs.readFileSync(path.join(APP, rel));
  if (TEXT.has(path.extname(rel).toLowerCase())) buf = Buffer.from(buf.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
  return buf;
}

const state = { version: null, changed: {}, failOnce: {}, installHits: [] };   // changed: { 'bag-engine.js': Buffer }
function swText() {
  let t = fileBytes('sw.js').toString('utf8');
  if (state.version) t = t.replace(/lucky-bag-v\d+'/, `lucky-bag-v${state.version}'`);
  for (const rel of Object.keys(state.changed)) {
    const re = new RegExp(`\\['\\./${rel.replace(/[.]/g, '\\.')}', '[0-9a-f]+'\\]`);
    if (!re.test(t)) throw new Error('목록에 없음 ' + rel);
    t = t.replace(re, `['./${rel}', '${sha(state.changed[rel])}']`);
  }
  return t;
}
function serve() {
  return new Promise((res) => {
    const srv = http.createServer((req, rsp) => {
      const u = new URL(req.url, 'http://x');
      let p = decodeURIComponent(u.pathname);
      if (p.endsWith('/')) p += 'index.html';
      const rel = p.replace(/^\/app\//, '');
      const isInstall = u.searchParams.has('v');
      if (isInstall) state.installHits.push(rel);
      if (!p.startsWith('/app/') || !fs.existsSync(path.join(APP, rel))) { rsp.writeHead(404); return rsp.end(); }
      const head = { 'Content-Type': TYPES[path.extname(rel)] || 'application/octet-stream', 'Cache-Control': 'no-store' };
      if (isInstall && state.failOnce[rel]) {
        const wait = state.failOnce[rel]; delete state.failOnce[rel];
        return setTimeout(() => { rsp.writeHead(500); rsp.end(); }, wait);   // 한 번만 실패(다른 파일이 먼저 받아지도록 늦게)
      }
      const body = rel === 'sw.js' ? Buffer.from(swText(), 'utf8') : (state.changed[rel] || fileBytes(rel));
      rsp.writeHead(200, head); rsp.end(body);
    }).listen(0, () => res(srv));
  });
}

let pass = 0, fail = 0;
async function check(name, fn) { try { await fn(); pass++; console.log('통과 —', name); } catch (e) { fail++; console.log('실패 —', name, '\n   ', e.message); } }
function eq(a, b, msg) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: ${JSON.stringify(a)} ≠ ${JSON.stringify(b)}`); }

(async () => {
  const srv = await serve();
  const base = `http://localhost:${srv.address().port}/app/`;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1024, height: 1366 } });
  const page = await ctx.newPage();
  const total = (swText().match(/\['\.\/[^']*', '[0-9a-f]+'\]/g) || []).length;
  const baseVer = Number(/lucky-bag-v(\d+)'/.exec(swText())[1]);
  const cacheInfo = () => page.evaluate(async () => {
    const out = {};
    for (const k of await caches.keys()) out[k.replace('swc2026-world-finals-lucky-bag-', '')] = (await (await caches.open(k)).keys()).length;
    return out;
  });
  // 설치가 요청한 파일만 저장소에 들어 있는지: 개발용 주소에서는 화면이 부르는 파일도 저장소에 더 들어가므로 '목록 수 이상'으로 본다
  const waitFor = async (fn, ms = 60000) => { const t0 = Date.now(); for (;;) { const v = await fn().catch(() => null); if (v) return v; if (Date.now() - t0 > ms) throw new Error('시간 초과'); await new Promise((r) => setTimeout(r, 250)); } };
  const activeIs = (v) => waitFor(async () => { const c = await cacheInfo(); return Object.keys(c).length === 1 && c['v' + v] >= total ? c : null; });
  const cachedText = (v, rel) => page.evaluate(async ([name, url]) => { const r = await (await caches.open(name)).match(url); return r ? await r.text() : null; }, ['swc2026-world-finals-lucky-bag-v' + v, new URL(rel, base).href]);

  await check(`처음 설치: 목록의 파일 ${total}개를 모두 내려받는다`, async () => {
    await page.goto(base);
    await activeIs(baseVer);
    eq(state.installHits.length, total, '내려받은 요청 수');   // './'와 './index.html'은 같은 파일이지만 주소가 달라 각각 받는다
  });

  await check('새 버전(파일 1개만 바뀜): 그 1개만 내려받고 나머지는 이전 것을 그대로 쓴다', async () => {
    state.installHits = []; state.version = baseVer + 1;
    state.changed['bag-engine.js'] = Buffer.concat([fileBytes('bag-engine.js'), Buffer.from('\n// 새 버전에서 바뀐 줄\n')]);
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await activeIs(baseVer + 1);
    eq(state.installHits, ['bag-engine.js'], '내려받은 파일');
    const txt = await cachedText(baseVer + 1, 'bag-engine.js');
    if (!txt || !txt.includes('새 버전에서 바뀐 줄')) throw new Error('새 저장소에 바뀐 내용이 없음');
    if (!(await cachedText(baseVer + 1, 'reveal.js'))) throw new Error('안 바뀐 파일이 새 저장소로 옮겨지지 않음');
  });

  await check('받다가 실패하면 그 버전으로 넘어가지 않고, 다시 시도할 때 이미 받은 파일은 다시 받지 않는다', async () => {
    state.installHits = []; state.version = baseVer + 2;
    state.changed['bag-store.js'] = Buffer.concat([fileBytes('bag-store.js'), Buffer.from('\n// 두 번째 변경\n')]);
    state.changed['reveal.js'] = Buffer.concat([fileBytes('reveal.js'), Buffer.from('\n// 두 번째 변경\n')]);
    state.failOnce['reveal.js'] = 1500;   // 첫 시도에서 reveal.js만 1.5초 뒤 실패
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()).catch(() => {}));
    await waitFor(async () => state.installHits.includes('reveal.js') && !state.failOnce['reveal.js']);
    await new Promise((r) => setTimeout(r, 2500));
    const mid = await cacheInfo();
    if (!(mid['v' + (baseVer + 1)] >= total)) throw new Error('실패했는데 이전 버전 저장소가 사라짐: ' + JSON.stringify(mid));
    const txtOld = await cachedText(baseVer + 1, 'reveal.js');
    if (!txtOld || txtOld.includes('두 번째 변경')) throw new Error('실패한 버전의 파일이 쓰이고 있음');
    // 다시 시도
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await activeIs(baseVer + 2);
    eq(state.installHits.filter((x) => x === 'bag-store.js').length, 1, 'bag-store.js를 받은 횟수');
    eq(state.installHits.filter((x) => x === 'reveal.js').length, 2, 'reveal.js를 받은 횟수(실패 1 + 성공 1)');
    eq([...new Set(state.installHits)].sort(), ['bag-store.js', 'reveal.js'], '내려받은 파일 종류');
  });

  await check('인터넷이 끊겨도 새로 고침하면 앱이 뜬다', async () => {
    await page.reload(); await page.waitForFunction(() => window.__app);
    await ctx.setOffline(true);
    await page.reload(); await page.waitForFunction(() => window.__app && document.getElementById('scr-idle').classList.contains('on'));
    await ctx.setOffline(false);
  });

  await browser.close(); srv.close();
  console.log(`\n결과: 통과 ${pass} · 실패 ${fail}`);
  process.exit(fail ? 1 : 0);
})();
