// app/sw.js의 파일 목록(ASSETS)에 각 파일의 내용 지문(SHA-256)을 채운다.
// 앱 파일(코드·영상·그림)을 하나라도 바꿨으면 배포 전에 반드시 실행한다:
//   node tools/update-sw-manifest.cjs
// 지문이 실제 파일과 다르면 tests/sw-manifest.test.cjs가 실패한다.
//
// 왜 필요한가: 새 버전을 받을 때 Service Worker가 파일마다 지문을 비교해서,
// 지문이 같은 파일은 이전 버전에서 그대로 옮기고 달라진 파일만 내려받는다(전에는 매번 45MB 전부를 다시 받았다).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const APP = path.join(__dirname, '..', 'app');
const SW = path.join(APP, 'sw.js');
const TEXT_EXT = new Set(['.html', '.js', '.css', '.json', '.webmanifest', '.svg', '.txt']);

// 배포본(GitHub Pages)은 저장소에 들어간 그대로(줄바꿈 LF)다. 이 PC의 파일은 줄바꿈이 CRLF일 수 있어, 글자 파일은 LF로 맞춘 뒤 지문을 낸다.
function hashOf(relUrl) {
  const rel = relUrl === './' ? './index.html' : relUrl;
  const file = path.join(APP, rel);
  let buf = fs.readFileSync(file);
  if (TEXT_EXT.has(path.extname(file).toLowerCase())) buf = Buffer.from(buf.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// sw.js에서 목록 구간과 항목을 읽는다
function readManifest(text) {
  const m = /\/\* ASSETS:BEGIN[^\n]*\n([\s\S]*?)\/\* ASSETS:END \*\//.exec(text);
  if (!m) throw new Error('sw.js에서 ASSETS:BEGIN ~ ASSETS:END 구간을 찾지 못했습니다');
  const entries = [];
  const re = /\[\s*'([^']+)'\s*,\s*'([0-9a-f]*)'\s*\]/g;
  let e;
  while ((e = re.exec(m[1]))) entries.push([e[1], e[2]]);
  return { block: m[0], inner: m[1], entries };
}

function update() {
  const text = fs.readFileSync(SW, 'utf8');
  const { inner, entries } = readManifest(text);
  let changed = 0;
  const lines = entries.map(([url, old]) => {
    const h = hashOf(url);
    if (h !== old) { changed++; console.log('바뀜  ' + url); }
    return `  ['${url}', '${h}'],`;
  });
  const next = text.replace(inner, 'const ASSETS = [\n' + lines.join('\n') + '\n];\n');
  if (next !== text) fs.writeFileSync(SW, next);
  console.log(`파일 ${entries.length}개 · 지문이 바뀐 파일 ${changed}개`);
}

module.exports = { hashOf, readManifest, SW, APP };
if (require.main === module) update();
