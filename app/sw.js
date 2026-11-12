/* SWC2026 World Finals Lucky Bag — Service Worker
   앱 파일을 미리 저장해 첫 실행 뒤에는 인터넷 없이 돈다.
   ※ 앱을 고쳐 다시 배포할 때:
     1) CACHE 버전과 index.html의 APP_VER를 함께 올린다.
     2) node tools/update-sw-manifest.cjs 로 아래 목록의 지문을 다시 채운다(안 하면 tests/sw-manifest.test.cjs가 실패한다). */
const CACHE = 'swc2026-world-finals-lucky-bag-v39';
const PREFIX = 'swc2026-world-finals-lucky-bag-';
/* ASSETS:BEGIN — [주소, 내용 지문(SHA-256)]. 지문은 tools/update-sw-manifest.cjs가 채운다. 손으로 고치지 않는다. */
const ASSETS = [
  ['./', '538cca9c93d5c36ae541dd9baf98a21e77cb82213163bc091b20600cac577635'],
  ['./index.html', '538cca9c93d5c36ae541dd9baf98a21e77cb82213163bc091b20600cac577635'],
  ['./manifest.webmanifest', '737fc83aecc52faaf409e60e53fd9534204ce04b4e45e595771a80b200f6d561'],
  ['./bag-engine.js', '01867ad4793f2d08bff665c9265f83a77f160143b2d8af882f84017b0b309647'],
  ['./bag-store.js', '775813a06b84ce1cbd15d063d35af5ddfd9f1feceffa951a0957c372ebc4da58'],
  ['./reveal.js', 'b919e11b352004fc77f8acc240494620606db4a4cfe7c13d16b8d923e96c5e2b'],
  ['./transition.js', '53de7caff4b051ed5b5027fc3529b08a35cb9a1a6d6b2b6c689b3bbb0c49cda0'],
  ['./assets/main/main-intro.mp4', 'bd55114cf96f0cbd3fc7a1bc9f2c2f4b913d9e6d69b3fb9086f530ac123f8642'],
  ['./assets/main/main-loop.mp4', 'bcededa160933d9dd9c95ee27a08444e577de2bef83d6654032761d177e61284'],
  ['./assets/main/select-loop.mp4', '01fdb0d0be98a7893dc93e23d549f1197545c00dea3b38238f9c9c23cc26d29f'],
  ['./assets/main/draw-bg-loop.mp4', '06ef21dba91daf783b615295bea23211084eb86fecaee9cecf3e4977a05ed675'],
  ['./assets/main/emblem-loop.mp4', '0317f54448fadef05e4b97160349782881fa95392c260901062a3378725aedcd'],
  ['./assets/main/main-intro-poster.jpg', '3d99e197ab98b2bf65649d10ee89e6ca9382274008e7fc22d4aed93b31622be8'],
  ['./assets/main/main-loop-poster.jpg', '17099d44d099c3ce3a05fc0b513316e5b7db34bf2c85a793b6da9b5528dd704e'],
  ['./assets/main/select-loop-poster.jpg', '78406023b4bc6621f0b4573fed8c3324c291d51256ee634d8237bd08ed56916f'],
  ['./assets/main/draw-bg-poster.jpg', 'f56b2eec06797d621ce3ce7f3db17136e3d9d4afcbcbd81632f301cfa3110166'],
  ['./assets/com2us-store-h-white.png', '01fe371a1ce89550982b7fe1c04a17cf7972fbc9af8675711af1d3f0af755bf3'],
  ['./assets/transition/transition-matte.mp4', 'c0946c72f59106d9ddabcc71b712bad362f31ea482470ffd751a68e976321666'],
  ['./assets/transition/transition-color.mp4', 'dd58c372efbb942a8a8023ca671d3ec1933455b9d6de442bbcc4e7906b1bbf14'],
  ['./assets/transition/transition-stack.mp4', '535f91b45f495975b4c624b60635496d15d2686e0c6850eee9cb002626ebd07d'],
  ['./assets/icon-192.png', 'da580f3f1296d35e555d3eb74dd56674b8fab0ff058b340e796a8d8022d68077'],
  ['./assets/icon-512.png', 'd7ac2f6ee6140673e09ce77509d1f6b554b2f152c22a5f3ae10ca6825d9dc5a6'],
  ['./assets/com2us-store-lockup-white.svg', '2f8bd7c0e96c87297de6466f71baed0c472645a9f7cfe39383f488726d51714f'],
  ['./assets/fonts/Pretendard-Bold.otf', '03a5b0e86f4de0a25b65544336cf653ef4489418802ec789deacff9b8524eb55'],
  ['./assets/fonts/LINESeedSans-Bold.otf', '43d740c82fbdc55c43e010a252a55325bbb24f51f202da142082673d86981095'],
  ['./assets/fonts/Unbounded-Variable.ttf', 'c920c00876215ab1f902482a2fbb1eb307fe2cd5e7380ea307f7e4de1e064f72'],
  ['./assets/lb/bg-streaks.jpg', 'bac49e2d96d05e20d85e97f9234ee4d4035fbf1a3bc31c56fb365618e3833fdb'],
  ['./assets/lb/card-back.png', 'f9e54e3e023c34c7326c562e6fc8e5779c234fc2843118ee2f373cd8a6af02cf'],
  ['./assets/lb/card-front-a.png', 'c59c5a00761898c5f381720e36c91e9fb4b80cfeb19563bcc3b182d82ee99876'],
  ['./assets/lb/pedestal.webp', '90498635bc9f8675e2892c92c0abe56376ecedbf23987b2f7843bb577732d433'],
  ['./assets/lb/reveal-sfx.mp3', '204044a9ce637ed1febf6550222076e9edcfd10ce45a6623abe751d84cf3cc66'],
  ['./assets/lb/grade-A.png', '2e2ca1ced6d119439d84828fb7f0468ca669da1c09989bb0ac82753aba0eab27'],
  ['./assets/lb/grade-B.png', 'edbbef0385b07c0c06a1930248cdb57abafef081f092b661e8ca352a7bf7645e'],
  ['./assets/lb/grade-C.png', 'ccf6278917a926a3598479c9d4cad66ced1945a1ab1a5250a65379fb103607cf'],
  ['./assets/lb/card-front-a-loop.mp4', '6256dc4967a2571c5a1db49751093a2f97f90568f84be4b0eb83eaecec5310d2'],
  ['./assets/lb/card-front-a-poster.jpg', '76e00fdf907f2796df0b1f2eacaeeba2a70c70feaec8f2ec55309413e8d1f260'],
  ['./assets/lb/card-front-b-loop.mp4', '35ae8e6b651a269353b2da1db4aac9da936624d66157f4e5237a8e2fe2300b8d'],
  ['./assets/lb/card-front-b-poster.jpg', 'effd7e9b47f81cfba54b6483419b42a2326a764aa5dc2680a29d244b7ebc40b5'],
  ['./assets/lb/card-front-c-loop.mp4', 'e40716a3e3b0adcd2e0401fc5b9042e069bee907e437a03126ca39fd4615e6b9'],
  ['./assets/lb/card-front-c-poster.jpg', 'fb7ec311333fcc629b5752061084df6959fe99f6d2d227bed127e00660e7ee4a'],
  ['./assets/lb/emblem-key.png', '9f584eb1f2a7156ef265296cd5ac23074583e22820577717907d90b60e33c3a5'],
];
/* ASSETS:END */

const DEV_HOST = ['localhost', '127.0.0.1', '[::1]'].includes(self.location.hostname);
const TYPES = { html: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8', webmanifest: 'application/manifest+json', mp4: 'video/mp4', mp3: 'audio/mpeg', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', otf: 'font/otf', ttf: 'font/ttf' };

async function sha256(buf) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', buf));
  let s = ''; for (let i = 0; i < d.length; i++) s += d[i].toString(16).padStart(2, '0');
  return s;
}
// 저장할 응답: 본문과 꼭 필요한 머리말(종류·크기)만 담는다
function stored(url, buf, from) {
  const ext = (url === './' ? 'html' : url.split('.').pop()).toLowerCase();
  const type = (from && from.headers.get('Content-Type')) || TYPES[ext] || 'application/octet-stream';
  return new Response(buf, { status: 200, headers: { 'Content-Type': type, 'Content-Length': String(buf.byteLength) } });
}
async function tell(msg) {
  try { (await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })).forEach((c) => c.postMessage(msg)); } catch (e) { /* 알림은 실패해도 설치에 영향 없음 */ }
}

/* 새 버전 설치: 파일마다 지문을 비교해서 '달라진 파일만' 내려받는다.
   0) 이 버전 저장소에 이미 맞는 파일이 있으면 건너뜀 — 받는 도중 앱이 닫혀도 다음에 이어서 받는다(전에는 처음부터 다시).
   1) 이전 버전 저장소에 지문이 같은 파일이 있으면 그대로 옮김(내려받지 않음).
   2) 없으면 내려받고, 받은 내용의 지문이 목록과 같은지 확인한다(다르면 설치를 멈추고 다음에 다시 시도 → 새 파일과 옛 파일이 섞이지 않는다).
   모든 파일이 갖춰져야 설치가 끝나고, 그 뒤에 새 버전으로 바뀐다. */
async function installAssets() {
  const cache = await caches.open(CACHE);
  const oldNames = (await caches.keys()).filter((k) => k.startsWith(PREFIX) && k !== CACHE);
  const olds = await Promise.all(oldNames.map((k) => caches.open(k)));
  const total = ASSETS.length; let done = 0, reused = 0, fetched = 0, bytes = 0;
  const one = async (entry) => {
    const url = entry[0], hash = entry[1], key = new Request(url);
    const have = await cache.match(key);
    if (have && await sha256(await have.clone().arrayBuffer()) === hash) { reused++; return; }
    for (let i = 0; i < olds.length; i++) {
      const hit = await olds[i].match(key);
      if (!hit) continue;
      const buf = await hit.arrayBuffer();
      if (await sha256(buf) === hash) { await cache.put(key, stored(url, buf, hit)); reused++; return; }
    }
    // 주소 끝에 지문 앞부분을 붙여 받는다 → 중간 서버에 남아 있을 수 있는 옛 파일을 피한다. 저장은 원래 주소로 한다.
    const res = await fetch(url + (url.indexOf('?') < 0 ? '?' : '&') + 'v=' + hash.slice(0, 12), { cache: 'reload' });
    if (!res.ok) throw new Error('내려받기 실패 ' + url + ' (' + res.status + ')');
    const buf = await res.arrayBuffer();
    // 개발용 PC(localhost)에서는 고치는 중인 파일이 목록과 다를 수 있어 그대로 받아들인다. 실제 배포 주소에서는 반드시 일치해야 한다.
    if (!DEV_HOST && await sha256(buf) !== hash) throw new Error('받은 파일이 목록과 다름 ' + url);
    await cache.put(key, stored(url, buf, res)); fetched++; bytes += buf.byteLength;
  };
  const queue = ASSETS.slice();
  const worker = async () => { while (queue.length) { await one(queue.shift()); done++; tell({ type: 'sw-progress', cache: CACHE, done, total, reused, fetched }); } };
  await Promise.all([worker(), worker(), worker()]);   // 3개씩 나란히
  tell({ type: 'sw-installed', cache: CACHE, total, reused, fetched, bytes });
}

self.addEventListener('install', (e) => {
  e.waitUntil(installAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* 캐시 우선: 있으면 바로 주고, 없으면 네트워크에서 받아 캐시에 넣는다. 영상용 Range 요청도 캐시에서 잘라 준다. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // 개발용 PC(localhost)에서는 항상 최신 파일을 먼저 받는다(고치는 도중의 예전 화면이 캐시에 남아 섞여 보이지 않게).
    // 서버에 못 닿으면 아래 캐시로 넘어가므로 오프라인 동작은 그대로다. 실제 배포 주소(iPad)는 캐시 우선.
    if (DEV_HOST) {
      try { const fresh = await fetch(e.request, { cache: 'no-store' }); if (fresh.status === 200 && fresh.type === 'basic') e.waitUntil(cache.put(e.request, fresh.clone()).catch(() => {})); if (fresh.ok || fresh.status === 206) return fresh; } catch (err) { /* 오프라인 → 캐시 */ }
    }
    const hit = await cache.match(e.request, { ignoreSearch: e.request.mode === 'navigate' });
    if (hit) {
      const range = e.request.headers.get('range');
      if (!range) return hit;
      // 파일 전체를 메모리로 읽지 않고(blob) 필요한 구간만 잘라 준다 — iPad는 영상 하나에 구간 요청을 여러 번 보낸다
      const blob = await hit.blob(), size = blob.size, m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m || (!m[1] && !m[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      const start = m[1] ? Number(m[1]) : Math.max(0, size - Number(m[2]));
      const end = m[1] && m[2] ? Math.min(Number(m[2]), size - 1) : size - 1;
      if (start > end || start >= size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
      const type = hit.headers.get('Content-Type') || 'video/mp4';
      return new Response(blob.slice(start, end + 1, type), { status: 206, headers: { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
    }
    try {
      const res = await fetch(e.request);
      if (res.status === 200 && res.type === 'basic') e.waitUntil(cache.put(e.request, res.clone()).catch(() => {}));
      return res;
    } catch {
      if (e.request.mode === 'navigate') { const page = await cache.match('./index.html'); if (page) return page; }
      return new Response('Offline resource unavailable', { status: 503, statusText: 'Offline' });
    }
  })());
});
