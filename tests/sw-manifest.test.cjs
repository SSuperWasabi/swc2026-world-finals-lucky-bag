// 오프라인 저장 목록(app/sw.js의 ASSETS) 검사
// 지문이 실제 파일과 다르면, 기기가 '안 바뀐 파일'로 착각해 옛 파일을 계속 쓰거나 새 버전 설치가 실패한다.
// 실패하면: node tools/update-sw-manifest.cjs
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { hashOf, readManifest, SW, APP } = require('../tools/update-sw-manifest.cjs');

const sw = fs.readFileSync(SW, 'utf8');
const { entries } = readManifest(sw);

test('저장 목록에 파일이 있다', () => {
  assert.ok(entries.length >= 30, `항목 ${entries.length}개`);
});

test('목록의 모든 파일이 실제로 있고, 지문이 파일 내용과 같다', () => {
  const wrong = [];
  for (const [url, hash] of entries) {
    const rel = url === './' ? './index.html' : url;
    if (!fs.existsSync(path.join(APP, rel))) { wrong.push(url + ' (파일 없음)'); continue; }
    if (hashOf(url) !== hash) wrong.push(url + ' (지문 다름)');
  }
  assert.deepStrictEqual(wrong, [], '다시 채우기: node tools/update-sw-manifest.cjs');
});

test('목록에 같은 주소가 두 번 들어 있지 않다', () => {
  const urls = entries.map((e) => e[0]);
  assert.strictEqual(new Set(urls).size, urls.length);
});

test('앱 버전(index.html APP_VER)과 저장소 버전(sw.js CACHE)의 숫자가 같다', () => {
  const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
  const a = /const APP_VER = 'swc-lb-v(\d+)'/.exec(html);
  const c = /const CACHE = 'swc2026-world-finals-lucky-bag-v(\d+)'/.exec(sw);
  assert.ok(a && c, '버전 표기를 찾지 못함');
  assert.strictEqual(a[1], c[1]);
});

test('앱이 화면에서 쓰는 영상·그림·글꼴이 저장 목록에 들어 있다(오프라인에서 빠지지 않게)', () => {
  const html = fs.readFileSync(path.join(APP, 'index.html'), 'utf8');
  const reveal = fs.readFileSync(path.join(APP, 'reveal.js'), 'utf8');
  const listed = new Set(entries.map((e) => e[0]));
  const used = new Set();
  const re = /assets\/[A-Za-z0-9_\-./]+\.(?:mp4|mp3|png|jpg|webp|svg|otf|ttf)/g;
  for (const src of [html, reveal]) { let m; while ((m = re.exec(src))) used.add('./' + m[0]); }
  // 이름을 조립해 쓰는 파일(등급 엠블럼 A·B·C)
  ['A', 'B', 'C'].forEach((t) => used.add(`./assets/lb/grade-${t}.png`));
  const missing = [...used].filter((u) => !listed.has(u) && fs.existsSync(path.join(APP, u)));
  assert.deepStrictEqual(missing, []);
});
