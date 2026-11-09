# 럭키백 뽑기 앱 기능 빌드 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**목표:** PRD대로 돌아가는 오프라인 iPad PWA를 오늘 안에 만들어 내일(11/10) iPad QA를 할 수 있게 한다. 카드 연출은 바꿔 끼울 자리만 만들고 단순 뒤집기로 채운다.

**구조:** 기존 럭키드로우 앱 파일은 모두 걷어내고 `app/`에 새로 쓴다. 순수 규칙(`bag-engine.js`), 저장·기록(`bag-store.js`), 연출 자리(`reveal.js`), 화면·흐름(`index.html`)으로 나눈다. 테스트는 Node 내장 `node:test`(규칙·저장)와 playwright-core + 설치된 Chrome(화면 흐름).

**기술:** 순수 HTML/CSS/JS(빌드 없음), Service Worker, localStorage, Node 24 `node:test`, playwright-core.

**근거 문서:** `docs/PRD-lucky-bag.md`, 시안 `Resource/mockups/screens-1109/index.html`

## 전체 제약

- 화면 2048×2732 세로 기준. 무대(stage)를 화면 크기에 맞춰 `transform: scale()`로 줄인다.
- 이름 분리: 저장 키 `swc2026-world-finals-lucky-bag.*`, 캐시 `swc2026-world-finals-lucky-bag-vN`, PWA id `./swc2026-world-finals-lucky-bag`, 앱 이름 "SWC Lucky Bag", 버전 `swc-lb-vN`(첫 배포 v1). APP_VER와 sw.js CACHE는 항상 함께 올린다.
- 고객 화면 글은 영어, 직원·관리자 화면 글은 한글. 주석·테스트 메시지·커밋은 한글.
- 재고 기본값 A·B·C 각 100. 유형 = A 연홍(분홍 `#ff4fa3`), B 랙돌(보라 `#a46bff`), C 오라클(금 `#ffc443`).
- 설정 기본값: 추첨 단위 `batch`(한꺼번에, 최대 3장), 공개 방식 `one`(한 장씩), 중복 줄이기 `true`. PIN 기본 `0000`.
- 관리자 진입: 오른쪽 위 300×260(무대 기준) 영역을 3초 안에 5번 → PIN.
- **Leo 결정:** 결과는 구매 시작 순간 **수량 전체를 한 번에** 정해 재고를 줄이고 기록한다(PRD 5절의 "묶음 시작 시 확정"보다 단순하고 새로 고침 복구가 쉬우며, 중복 줄이기를 구매 전체 범위로 적용하는 것과 결과 분포가 같다). 진행 상황(몇 장 공개했는지)은 따로 저장한다.
- 영상·큰 소재는 이번 빌드에 넣지 않는다(배경은 CSS + 정지 이미지). 소재는 시안 폴더의 축소본을 쓴다.

## 검토 초점

1. **연출 도중 새로 고침/앱 종료:** 같은 구매·같은 결과·같은 진행 위치로 돌아와야 한다(다시 뽑지 않음). → Task 2 `resume` 테스트, Task 4 브라우저 테스트.
2. **버튼 연타:** [뽑기 시작]·[다음 묶음]·카드 탭을 빠르게 여러 번 눌러도 구매가 두 번 생기거나 묶음을 건너뛰지 않는다. → Task 3 잠금, Task 4 연타 테스트.
3. **재고가 수량보다 적음 / 한 유형만 남음 / 0개:** 시작을 막고 "남은 럭키백 N개"를 보여 준다. 남은 유형만 나온다. → Task 1, Task 3.
4. **저장 실패(사파리 개인 정보 보호·용량):** 결과를 정하기 전에 저장을 먼저 시도하고, 실패하면 뽑지 않고 직원에게 알린다. → Task 2 `startPurchase`가 저장 실패 시 throw.
5. **기록 취소 두 번:** 같은 구매를 두 번 취소해도 재고가 두 번 늘지 않는다. → Task 2 테스트.

---

### Task 1: 뽑기 규칙 (`bag-engine.js`)

**Files:**
- Create: `app/bag-engine.js` (UMD: `module.exports` / `globalThis.BagEngine`)
- Test: `tests/bag-engine.test.cjs`

**Interfaces:**
- Produces:
  - `TYPES = ['A','B','C']`
  - `total(stock) -> number` — stock은 `{A:n,B:n,C:n}`
  - `canStart(stock, qty) -> {ok:true} | {ok:false, reason:string, left:number}` — qty는 1 이상 정수, 남은 전체 ≥ qty
  - `drawMany(stock, qty, {dupReduce:boolean}, rng=Math.random) -> {results:string[], stock:{A,B,C}}` — 입력 stock은 바꾸지 않는다
  - `splitBatches(qty, unit) -> number[]` — `unit==='single'`이면 `[1,1,…]`, `'batch'`면 3씩 나눔(10 → `[3,3,3,1]`)
- 알고리즘: 한 장씩 차례로 뽑는다. 후보 = 재고 > 0 인 유형. `dupReduce`면 후보 중 이번 구매에서 지금까지 나온 횟수가 최소인 유형만 남긴다. 남은 후보 안에서 재고 비율로 가중 추첨 → 그 유형 재고 1 감소.

- [ ] **Step 1: 실패하는 테스트 작성** — 테스트 이름과 단언:
  - `canStart: 재고 5에 6개 → 막힘, left 5, reason에 '남은 럭키백 5개'`
  - `canStart: 0·소수·문자 → 막힘`
  - `splitBatches(10,'batch') → [3,3,3,1]`, `splitBatches(2,'batch') → [2]`, `splitBatches(3,'single') → [1,1,1]`
  - `drawMany 중복 줄이기 켬, 재고 100/100/100, 3개 → 결과 정렬 시 ['A','B','C']` (rng 1000회 반복 모두)
  - `drawMany 중복 줄이기 켬, 6개 → 각 유형 정확히 2개`
  - `drawMany 켬, C 재고 0 → C 없음, A·B 차이 ≤ 1`
  - `drawMany 끔, 재고 {A:1,B:0,C:0}, 1개 → ['A']`
  - `drawMany 끔, 재고 비율 검증: {A:300,B:100,C:0}에서 1장씩 2만 번 → A 비율 0.75±0.02`
  - `drawMany: 입력 stock 불변, 반환 stock 합 = 원래 합 − qty`
  - `drawMany: qty > 재고 → throw`
- [ ] **Step 2:** `node --test tests/` 실행 → 모듈 없음으로 실패 확인
- [ ] **Step 3:** `app/bag-engine.js` 구현
- [ ] **Step 4:** `node --test tests/` → 모두 통과

### Task 2: 저장·기록 (`bag-store.js`)

**Files:**
- Create: `app/bag-store.js` (UMD: `globalThis.BagStore`)
- Test: `tests/bag-store.test.cjs` (메모리 storage 가짜 객체 주입)

**Interfaces:**
- Consumes: `BagEngine.canStart`, `drawMany`, `splitBatches`
- Produces: `createStore(storage, {now=()=>Date.now(), rng=Math.random}={})` → 객체:
  - `state` (읽기용): `{config:{unit:'batch'|'single', reveal:'one'|'all', dupReduce:boolean, pin:string}, stock:{A,B,C}, initial:{A,B,C}, log:Entry[], current:Purchase|null, seq:number}`
  - `Purchase = {id, no, qty, results:string[], batches:number[], batchIndex:number, revealed:number[] /* 현재 묶음에서 공개된 카드 인덱스 */, settings:{unit,reveal,dupReduce}, done:boolean}`
  - `Entry = {type:'purchase', id, no, ts, qty, results, batches, settings, status:'ok'|'cancelled', cancelTs?} | {type:'adjust', ts, before, after, note}`
  - `startPurchase(qty) -> Purchase` — canStart 실패 시 `Error(reason)`. 결과를 정하고 재고 감소·기록 추가·current 설정을 **한 번의 저장**으로 끝낸다. 저장 실패 시 상태를 원래대로 되돌리고 `Error('저장 실패')`.
  - `markRevealed(cardIndex)`, `nextBatch() -> boolean(마지막 묶음 뒤면 false)`, `finishPurchase()` (current → null), 모두 즉시 저장
  - `cancelPurchase(id) -> boolean` — status가 'ok'일 때만 재고 복원·'cancelled' 표시. 진행 중인 current면 current도 비움
  - `setStock({A,B,C}, note)` — adjust 기록 추가
  - `setConfig(partial)`, `resetAll(initialStock)` — 기록·재고 초기화(관리자 재확인 뒤에만 호출)
  - `toCSV() -> string` — 머리글 `번호,시각,수량,결과,A,B,C,추첨단위,공개방식,중복줄이기,상태`
  - `exportBackup() -> string(JSON)`, `importBackup(json)` — 형식 검사 실패 시 throw, 현재 데이터 덮어씀
- 저장 키: `swc2026-world-finals-lucky-bag.state.v1` (한 키에 전체 상태를 JSON으로)

- [ ] **Step 1: 실패하는 테스트 작성:**
  - `startPurchase(10): 재고 합 300→290, log 1건, current.batches [3,3,3,1]`
  - `resume: 같은 storage로 createStore 다시 만들면 current·results·batchIndex·revealed 그대로`
  - `startPurchase: storage.setItem이 throw → Error('저장 실패'), 재고·기록 변화 없음`
  - `current가 있는데 startPurchase → throw('진행 중인 구매')`
  - `nextBatch: 4묶음에서 3번 true, 4번째 false`
  - `cancelPurchase 두 번 → 두 번째 false, 재고는 한 번만 복원`
  - `setStock → adjust 기록, before/after 남음`
  - `toCSV: 취소 건은 상태 '취소'`
  - `exportBackup → importBackup 왕복 시 state 동일`, `importBackup('{}') → throw`
- [ ] **Step 2:** 실패 확인 → **Step 3:** 구현 → **Step 4:** `node --test tests/` 통과

### Task 3: 화면·흐름 (`index.html`, `reveal.js`)

**Files:**
- Delete: 기존 `app/` 안의 럭키드로우 전용 파일(`choose-screen.js, figure.js, figure.css, idle-video.js, result-video.js, scroll-audio.js, transition.js, draw-engine.js, media-diagnostics.html, review/`, `app/assets/oap/`, `app/assets/figure/`, `app/assets/badges/`, `app/assets/frames/`), 기존 `scripts/test-*.cjs`
- Create: `app/index.html`(새로), `app/reveal.js`, `app/assets/lb/`(시안 축소본: card-back.png, card-front-a/b/c.png, sd-*.png, emblem-key.png, emblem-x-white.png, bg-streaks.jpg)
- Keep: `app/assets/fonts/`(Unbounded, Pretendard), `com2us-store-lockup-white.svg`, 아이콘

**Interfaces:**
- Consumes: `BagStore.createStore(localStorage)`, `BagEngine`
- Produces (`reveal.js`, 나중에 진짜 연출로 통째로 바꿔 끼울 경계):
  - `Reveal.enter(slotEls:HTMLElement[]) -> Promise` — 카드 등장
  - `Reveal.flip(slotEl, type:'A'|'B'|'C') -> Promise` — 한 장 공개
  - `Reveal.show(slotEl, type)` — 연출 없이 공개 상태로 그리기(새로 고침 복구용)
- 화면: `scr-idle`(대기), `scr-staff`(수량 입력), `scr-draw`(카드), `scr-summary`(구매 요약), `scr-admin`(PIN·탭 4개). 배치·문구는 시안 그대로.
- 흐름 규칙:
  - 대기 아무 데나 탭 → 직원 화면(오른쪽 위 영역 탭은 제외하고 5탭 카운트).
  - 직원 화면: −/+, 1~10 숫자 버튼, 남은 재고 A/B/C, 현재 설정 칩, [뽑기 시작](canStart 실패 시 비활성 + 안내), [취소](대기로).
  - 카드 자리: 1장=가운데, 2장=왼쪽·오른쪽, 3장=왼·가운데·오른쪽. "한 개씩" 설정이면 큰 카드 1장(`s-solo`).
  - 공개 `one`: 카드 탭마다 flip. 공개 `all`: [OPEN] 버튼 한 번에 모두 flip.
  - 묶음의 카드가 다 공개되면 [다음 묶음 ▶](또는 [다음 뽑기 ▶]), 마지막이면 [지급 완료] → 요약 → [다음 고객] → 대기.
  - 아래 진행 표시: `BATCH 2 / 4 · 6 OF 10` 또는 `5 / 10`, 누적 `A 3 · B 2 · C 1`.
  - 연출이 도는 동안 모든 버튼·카드 탭 잠금(`busy` 플래그), 버튼은 누르는 즉시 비활성.
  - 시작 시 `store.state.current`가 있으면 대기 대신 뽑기 화면으로 복구, 공개된 카드는 `Reveal.show`.
  - 관리자: PIN 4자리 → 탭 [설정](스위치 3개 + PIN 변경) [재고](A/B/C 수정 + 사유, 저장 시 재확인) [기록](최근순, 건마다 [취소] 재확인, CSV 내보내기) [백업](JSON 내보내기·가져오기, 전체 초기화는 재확인 2번), 앱 버전 표시, [닫기].
  - 파일 내보내기: iPad는 `navigator.share({files})`, 안 되면 다운로드 링크.

- [ ] **Step 1:** 기존 파일 정리(git rm), 소재 복사
- [ ] **Step 2:** `reveal.js` 단순판(rotateY 0→180, 0.6초) 작성
- [ ] **Step 3:** `index.html` 화면·흐름·관리자 작성
- [ ] **Step 4:** 로컬 서버로 Chrome에서 수동 확인(시안과 배치 비교)

### Task 4: 오프라인·브라우저 흐름 테스트

**Files:**
- Modify: `app/sw.js`(새 CACHE·자산 목록), `app/manifest.webmanifest`(id·이름), 루트 `index.html`(제목·링크)
- Create: `tests/flow-browser.cjs`(playwright-core, `C:/Program Files/Google/Chrome/Application/chrome.exe`, 1024×1366)

**Interfaces:**
- Consumes: Task 2·3 전부

- [ ] **Step 1: 브라우저 테스트 작성:**
  - `10개 한꺼번에·한 장씩: 4묶음 진행 → 요약 합계 10, 재고 합 290`
  - `연출 중 새로 고침 → 같은 결과·같은 묶음으로 복구, 재고 290 유지`
  - `[뽑기 시작] 5연타 → 구매 기록 1건`
  - `재고 2에서 3개 입력 → 시작 버튼 비활성, '남은 럭키백 2개' 보임`
  - `오른쪽 위 5탭 → PIN 화면, 0000 → 관리자`
  - `오프라인 전환 후 새로 고침 → 앱 뜸(SW 캐시)`
- [ ] **Step 2:** `node tests/flow-browser.cjs` 통과
- [ ] **Step 3:** CLAUDE.md·handoff.md·WORKLOG.md·README를 럭키백 앱 기준으로 새로 쓰기(짧게)
- [ ] **Step 4:** Jason에게 로컬 확인 요청 → 승인 뒤 커밋·origin 푸시 → Pages 확인, 안 되면 Cloudflare 터널 주소로 iPad QA
