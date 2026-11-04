# SWC2026 World Finals Lucky Draw — 작업 인수인계

작성: 2026-10-30. APAC 앱(v30)에서 파생한 월드 결선용 앱의 기준 문서. 다음 세션은 이 파일 0절·1절과 `WORKLOG.md` 최근 항목을 먼저 읽는다.

- **앱 기능 설명:** APAC 앱과 같다.
  - 화면 흐름, 추첨 규칙, 배경음악·효과음, 관리자 화면, 테스트: [docs/apac/handoff-apac.md](docs/apac/handoff-apac.md) 21절
  - 새 PC·랩탑 준비: 같은 문서 38절
- **APAC 작업 이력:** [docs/apac/](docs/apac/)(handoff·WORKLOG·README 보존본). 그 안의 경로·주소·버전은 APAC 기준이다.

## 0. 작업 규칙 (모든 세션 공통)

루트의 `CLAUDE.md`는 이 절의 요약이다. 규칙을 바꾸면 두 곳을 함께 고친다.

### 한글 표기
- **적용 범위:** 사용자에게 보이는 모든 글을 한글로 쓴다.
  - 진행 안내(도구 호출 사이의 한 줄 포함), 최종 보고
  - 명령 설명, 서브에이전트 지시·보고
  - 새로 쓰는 코드 주석, 스크립트 로그, 테스트 PASS/실패 메시지
  - 커밋 메시지, 문서
- **예외:** 코드 식별자, 파일 경로, 외부 도구의 고정 키워드.
- 영문은 사용자가 따로 요청할 때만 쓴다(APAC 작업 중 네 번 지적받음).

### 앱 변경 마무리 절차
1. `app/index.html`의 APP_VER(`swc-wf-vN`)와 `app/sw.js`의 CACHE(`swc2026-world-finals-lucky-draw-vN`)를 함께 올린다.
2. 로컬 테스트 18종(README 목록)을 모두 돌린다.
3. **사용자와 사전 테스트·점검을 마친다.**
   - 로컬 서버를 띄워 사용자가 Chrome에서 확인하게 한다. 필요하면 같은 와이파이의 iPad에서도 연다.
   - 사용자가 승인하기 전에는 커밋·푸시하지 않는다. 푸시하면 바로 Pages에 배포된다(APAC v31 되돌림 계기).
4. 승인 뒤 커밋하고 origin main에 푸시한다. **`apac` 원격으로는 푸시하지 않는다**(푸시 주소를 막아 둠).
5. Pages 배포를 확인한 뒤 PWA 검사: `node scripts/test-project-pwa-browser.cjs https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/`(주소 인자 필수)
6. 기록한다: 이 문서의 현재 상태 절 + 새 번호 절 + `WORKLOG.md` 맨 위.
7. 한글로 보고한다. 다시 올려야 할 관리자 업로드 파일이 있으면 알린다.

소리 문제를 보고받으면 Chrome 값 검사만 믿지 말고 `test-volume-real-browser`로 실제 출력을 잰다.

### 수정 금지
- `F:\Download\Figure draw app`(원본 앱)
- `F:\Download\SWC2026 APAC Cup_Lucky Draw App`(APAC 앱, 행사 완료본 보존)과 APAC 저장소
- APAC AE 원본 `C:\Users\jasonbae\Downloads\(0709) swc2026_oap_APAC_Final`
- 월드 결선 AE 원본 `resource/oap/ae-original/`
  - 작업은 `resource/oap/ae-work/` 사본에서만 한다.
- 사용자가 열어 둔 AE 프로젝트: 닫거나 저장하지 않는다.
- 사용자의 실제 `.kuji` 백업: 자동으로 복원하거나 삭제하지 않는다.

### 현장 조건 (APAC 기준 유지, 월드 결선 현장 정보가 오면 갱신)
- 실행 중 변수가 적고 iPad 부하가 낮은 방식을 고른다.
  - 상호작용하지 않는 연출은 AE 영상으로 굽고, 바뀌는 부분만 앱 요소로 둔다.
- **기준 기기:** iPad Pro 12.9형, 세로 2048×2732(3:4).
- **영상:** H.264 레벨 4.2 이하(1024×1366)로 만든다.
- **운영 데이터:** 상품·영상·소리·볼륨 등록 상태는 iPad 안에만 있다. 위험한 변경 전에는 `.kuji` 전체 백업을 권한다.

## 1. 파생 기준과 범위 — 2026-10-30

- **사용자 결정:**
  - 가챠 기능·설정·관리자 화면·화면 구성은 그대로 둔다.
  - 화면에 쓰이는 OAP 미디어 템플릿만 월드 결선 버전으로 바꾼다.
  - 별도 저장소·작업 폴더로 분리한다.
- **기반:** APAC 저장소 main `fd317e9`(앱 v30. v31 당첨 기록 전체 표시는 되돌린 상태라 미포함).
- **작업 폴더:** `F:\Download\SWC2026 World Finals_Lucky Draw App`
- **저장소:** https://github.com/SSuperWasabi/swc2026-world-finals-lucky-draw
  - 원격 `origin` = 월드 결선 저장소
  - 원격 `apac` = APAC 저장소(가져오기 전용. 공통 버그 수정을 옮겨 올 때 `git fetch apac` 후 골라 반영)
- **앱 주소(배포 후):** https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/

### 분리한 이름
APAC과 같은 `ssuperwasabi.github.io` 출처라 저장 공간을 함께 쓴다. 한 iPad에 두 앱을 깔아도 섞이지 않게 이름을 모두 나눴다.

| 항목 | APAC | 월드 결선 |
| --- | --- | --- |
| 설정·재고·기록·쿨다운 키 | `swc2026-apac-lucky-draw.*` | `swc2026-world-finals-lucky-draw.*` |
| 미디어 IndexedDB | `swc2026-apac-lucky-draw-media` | `swc2026-world-finals-lucky-draw-media` |
| 캐시 | `swc2026-apac-lucky-draw-v30` | `swc2026-world-finals-lucky-draw-v1` |
| 앱 버전 | `swc-apac-v30` | `swc-wf-v1` |
| PWA id | `./swc2026-apac-lucky-draw` | `./swc2026-world-finals-lucky-draw` |
| 앱 이름 / 홈 화면 이름 | SWC2026 APAC Cup Lucky Draw / SWC APAC Draw | SWC2026 World Finals Lucky Draw / SWC World Draw |
| 비교용 과거 화면 | `swc2026-apac-review-*` | `swc2026-world-finals-review-*` |

- `test-project-isolation`·`test-project-pwa-browser`는 원본 Figure Draw와 **APAC 앱의 저장 값·캐시도 그대로인지** 검사한다.
- APAC `.kuji` 백업은 가져올 수 있다. 다만 상품·재고·기록과 APAC 미디어까지 함께 들어온다.

## 2. AE 자료 정리 규칙

### 월드 결선 (이 폴더 `resource/oap/`, Git 제외)
| 폴더 | 용도 | 누가 |
| --- | --- | --- |
| `ae-original/` | 월드 결선 AE 원본. 받은 그대로 두고 수정하지 않는다 | 사용자가 넣음 |
| `ae-work/` | 원본을 복사한 작업 사본. 링크 정리·스크립트 실행·저장은 여기서만 한다 | Claude |
| `ae-work/render/` | 렌더 결과. 화면별 하위 폴더(choose, open, win, transition, congrats, grade) | Claude |
| `upload-ready/` | 관리자 업로드용 최종본. 파일 이름 앞에 `wf_`를 붙인다 | Claude 준비 → 사용자 업로드 |
| `mockups/` | 시안 비교 이미지 | Claude |
| `apac-ref-scripts/` | APAC AE 작업에서 쓴 스크립트 사본(참고용) | 복사해 둠 |

- AE 스크립트가 경로를 다루므로 이 폴더 이름들은 영문으로 둔다.
- 재사용할 공용 AE 스크립트는 Git의 `scripts/ae/`에 있다. 월드 결선용으로 고치면 그 자리에서 고친다.

### APAC (APAC 폴더에 그대로 보관)
- APAC AE 작업 자료(약 22GB, 렌더 19GB)는 **복사해 오지 않는다.** `F:\Download\SWC2026 APAC Cup_Lucky Draw App\resource\oap\`에 행사 완료본으로 둔다.
- 참고가 필요하면 그 폴더를 읽기만 한다.
  - 어떤 AE 컴프가 어떤 앱 자산이 됐는지: APAC handoff 21절 "자산과 도구 위치", 9~16절
  - 배치·움직임 명세: `docs/oap-spec/`(현재 APAC 값. 월드 결선 값으로 다시 뽑으면 갱신)

## 3. OAP 교체 대상 (진행 표)

| 화면 | 앱 자산 | APAC 출처 | 월드 결선 | 상태 |
| --- | --- | --- | --- | --- |
| 선택 | `app/assets/oap/choose/`(배경 인트로·루프, 소환서 12장, SELECT) | CHOOSE v8 | `WF_BG_(WAVE)`, `SWC BG_violet_2`, 보라 색 | v2 적용(미커밋, 사전 점검 대기) |
| 오픈 | `app/assets/oap/open/open-frame-loop.mp4` | OPEN v3 | `WF LOGO`, 캐스터 배경 색, `WF_BG_(WAVE)` | v2 적용(미커밋) |
| 화면 전환 | `app/assets/oap/transition/`(매트·색 54fps) | TRANS_ASIA | `0713_TRANS_FINALE_00006~00064`(APAC과 같은 범위) | v2 적용(미커밋) |
| 축하(A·B) | `app/assets/oap/grade/congrats-A/B.mp4` | 축하 화면 1.8초 | 월드 결선 전환 가림 프레임(로고 그림자) | v2 적용(미커밋) |
| 등급 배지 | `app/assets/oap/grade/grade-A~H.png` | 글자 없는 방패 | 흰색뿐이라 PNG 그대로, 앱 그림자·빛 색만 | v2 적용(미커밋) |
| 상품·특별 영상 | 관리자 업로드(`upload-ready/`) | WIN v5 템플릿 | `wf_WIN_PRIZE_iPad_template_v5.aep`로 상품 8개 렌더, 시네마틱 2개는 APAC 것 재사용 | 업로드 파일 준비 완료(8절) |
| 대기 화면 타이틀 | Unbounded 글자 "LUCKY DRAW EVENT" | 앱 글자 | 유지(사용자 확정) | 완료 |
| 기타 | `app/assets/figure/`(소환 영상·소리·이미지) | 기반 앱 | | 쓰임 확인 필요 |

- `test-choose/open/transition-browser`의 AE 비교 기준은 월드 결선 렌더로 바꿨다(7절).

## 4. 현재 상태 — 2026-11-04

- **배포 swc-wf-v5(2026-11-04, `54b8cd0`):** 사내 와이파이의 iPad(10.10.118.x)가 PC 유선망(10.27.0.x)의 로컬 서버에 닿지 않았다. 사용자 결정으로 iPad 테스트를 위해 커밋·푸시했다. Pages 빌드 완료, 배포본 버전 v5, 선택 배경 영상 해시가 로컬과 일치했다. 배포 PWA 검사 통과(식별자·서비스 워커·캐시, 빈 행사, 원본·APAC 저장 값 보존, 오프라인, Range 206).
  - 앱: https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/
  - 화면은 월드 결선판(7·10절)이다. 유리 카드는 주소 옵션 `?glass=b`일 때만 나온다(9절). 측정은 `?perf=1`.
  - 상품 영상·시네마틱은 앱에 넣지 않았다. iPad 관리자에서 `resource/oap/upload-ready/`의 파일을 등록한다(8절).
- **처음 배포(2026-10-30):** 공개 저장소 생성 → main 푸시(`34ec295`) → Pages 켬(legacy, main, `/`) → 배포 PWA 검사 통과.
- **방식 결정(2026-11-03):** (나) APAC 템플릿 구조 유지, 소재만 월드 파이널로 교체(5절 "결정").
- **1~3단계 완료(2026-11-03, 앱 변경 없음):** 결과는 5절 "사본 준비 결과"와 "화면별 교체 계획".
  - `ae-work/wf-oap/`(466개, zip 제외)와 `ae-work/apac-templates/`(616개, 1.87GB) 복사. 원본과 개수·크기 일치.
  - APAC 템플릿 3종은 AE에서 누락 소재 없음. 모두 작업 사본 쪽 파일에 연결된다.
  - 월드 결선 OAP는 APAC과 같은 프로젝트 계보다. 배경·로고 컴프가 같은 번호로 1:1 대응한다.
- **swc-wf-v2 작업 트리 반영(2026-11-03 저녁, 사용자 퇴근 중 진행, 커밋·푸시 안 함):** 7절. 선택·오픈·전환·축하 자산과 앱 CSS 색, 버전 v2.
- **다음 단계:**
  1. iPad 실측(배포 주소): 기본 `.../app/?perf=1`과 유리 B `.../app/?perf=1&glass=b`를 비교한다. 결과에 따라 유리 B를 기본으로 할지 정한다(9절).
  2. 확인받을 것: (선택 부제는 2026-11-04 "WORLD FINALS"로 확정·반영, 10절) 당첨 화면 진보라 면과 보라 상품의 대비, 대기 화면 터치 배너·금색 결과 카드(기반 앱 공통 금색 변수) 처리.
  3. 상품 영상 8개 완료(2026-11-04, 8절). iPad 관리자에서 상품마다 직접 지정한다. 모자 이름은 "SWC CAP"으로 확정했다.
- **AE 작업 방법(이번에 정착):** MCP 연결 패널은 안전장치 때문에 쓰기가 막힌다. 열기·수정·저장·렌더는 APAC 21절 방식 `AfterFX.com -r <jsx>`(JOB 앞에 붙임)로 한다. 스크립트는 열린 프로젝트가 작업 사본(ae-work)이 아니면 멈춘다.
- **정리할 것(급하지 않음):** 테스트 18종의 통과 메시지 78개가 기반 앱에서 온 영문 그대로다. 해당 테스트를 고칠 때 한글로 바꾼다(`test-project-pwa-browser`는 바꿈).

## 5. 월드 결선 AE 원본 목록 — 2026-10-30 확인

`resource/oap/ae-original/` (읽기 전용, 파일 467개, 1.15GB)

| 항목 | 내용 |
| --- | --- |
| `swc2026_oap.aep` | 월드 결선 방송 OAP 프로젝트(44MB). AE 수집 기능으로 모은 본(2026-07-21, `swc2026_oapReport.txt`) |
| `swc2026_oap_WF.zip` | 589MB. 같은 수집본의 압축이다(목록 확인: 482개, 같은 aep·같은 영상). 풀 필요 없음 |
| `(Footage)/COMP/01_Transition/pre/0713_TRANS_FINAL/` | 전환 영상 이미지 시퀀스 → 화면 전환 교체 후보 |
| `(Footage)/SRC/BG/` | `월드 파이널 배경 B.mp4`, `월드 파이널 배경 B_ups.mp4`(고해상도), `SWC2026_Symbol_FINAL_(basic).mov`, `SWC2026_Symbol_CHINA.mov`, `아메리카 배경 B2.mp4`, `BG IMG/`(색별 배경 5장), `BG_Mini/` |
| `(Footage)/SRC/ai file/` | `2026(10th)swc simple logo가로형.ai`(10주년 로고) |
| `(Footage)/SWC2025_OAP_WF copy 24.x.aep/Resource/` | 이전 해 프로젝트에서 온 시퀀스·아이콘 |

- **APAC과 비슷한 컴프 이름(추정, 열어서 확인할 것):** `01_Transition`, `15_Win`·`Win`·`15-2_Champion`, `07-1_2 vs 2 In game_Cam`(APAC 등급 방패의 출처와 같은 이름), `WF_BG_(WAVE)`·`WF_BG_(EX)`(배경), `WF LOGO`, `SWC2026 10th`.
- **iPad 앱 전용 템플릿이 없다(중요).**
  - APAC 원본 폴더에는 방송 OAP와 별도로 iPad 세로용 앱 템플릿 프로젝트가 있었다: `swc2026_CHOOSE_YOUR_SCROLL_iPad_*`(v8까지), `swc2026_OPEN_YOUR_SCROLL_iPad_v1~v3`, `swc2026_WIN_PRIZE_iPad_template_v1~v5`. APAC 앱의 선택·오픈·당첨 화면은 이것을 렌더·추출해 만들었다(APAC handoff 9절).
  - 월드 결선 원본에는 방송 OAP(`swc2026_oap.aep`) 하나뿐이다.
  - APAC iPad 템플릿은 디자이너가 아니라 사용자가 GPT Astra(컴퓨터 사용 기능)로 AE에서 만들었다. 그 영상을 Claude가 앱 화면으로 재현했다.

### 결정 — 2026-11-03: (나) APAC 템플릿 구조 유지, 소재만 월드 파이널로 교체
- **사용자 결정:** APAC과 모든 것을 똑같이 만들고, 템플릿만 월드 파이널 버전으로 바꾼다. Astra로 새로 만들지 않는다.
- **이유:** 앱 코드·테스트가 APAC 템플릿의 배치·타이밍(`docs/oap-spec/`)에 맞춰져 있다. 구조를 그대로 두면 소재만 바뀌고 코드·명세·AE 스크립트를 그대로 쓴다. 새로 만들면 배치·타이밍이 달라져 명세 재추출과 코드 수정이 필요하다.
- **지킬 것:**
  - 배치·크기·타이밍·키프레임·레이어 구조는 바꾸지 않는다. 바꾸는 것은 소재(영상·이미지·로고·색·글자)뿐이다.
  - 소재를 바꾸다 구조를 건드려야 하는 경우(예: 월드 파이널 소재의 비율·투명 영역이 달라 맞지 않음)는 바로 고치지 말고 사용자에게 먼저 보고한다.
  - 앱 코드 변경은 자산 파일 교체가 기본이다. 좌표·시간 값 변경이 필요하면 이유와 함께 보고한다.

### APAC 템플릿 사본 가져오기
- **가져올 곳:** `F:\Download\SWC2026 APAC Cup_Lucky Draw App\resource\oap\ae-work\(0709) swc2026_oap_APAC_Final\`(2.83GB, 소환서 이미지 연결을 바꿔 둔 사본)
  - 선택 `swc2026_CHOOSE_YOUR_SCROLL_iPad_INTRO_LOOP_v8_260923.aep`
  - 오픈 `swc2026_OPEN_YOUR_SCROLL_iPad_v3_260923.aep`
  - 당첨 `swc2026_WIN_PRIZE_iPad_template_v5_260923.aep`
  - 같은 폴더의 `(Footage)` 소재와, 형제 폴더 `external-footage\SWC2026_Scroll_nobg.png`(소환서 이미지)
- **복사할 곳:** 월드 결선 `resource/oap/ae-work/apac-templates/`. 폴더 구조째 복사해 상대 경로가 유지되게 한다. 렌더 결과(`render/`, 19GB)는 가져오지 않는다.
- **원래 APAC 원본**(`C:\Users\jasonbae\Downloads\(0709) swc2026_oap_APAC_Final`)은 쓰지 않는다. 그쪽 aep는 수정 금지 폴더 `F:\Download\Figure draw app`의 이미지를 불러온다.
- 복사 후 AE에서 열어 누락 소재가 없는지 확인하고, 월드 결선용 이름(`wf_` 접두어)으로 다른 이름 저장한 뒤 작업한다.

### 사본 준비 결과 — 2026-11-03
- **월드 결선:** `ae-work/wf-oap/` = 원본 467개 − zip 1개 = 466개(647,091,267바이트). AE 26.5에서 열면 "24.6.8에서 변환" 안내가 뜨고 `swc2026_oap(변환됨).aep`(저장 안 된 새 프로젝트)로 열린다. 원본 파일은 바뀌지 않는다.
- **APAC 템플릿:** `ae-work/apac-templates/(0709) swc2026_oap_APAC_Final/`에 aep 3종·`15_Win.mp4`·`(Footage)`·`ChooseYourScroll_Work`·`ae-choose-your-scroll-260922`·`open-your-scroll-260923`·`win-prize-260923`·`fonts`, 형제 `external-footage/`. 다른 버전 aep·로그·자동 저장·렌더는 가져오지 않았다.
- **누락 확인:** aep 안의 소재 경로(47개)를 읽고 AE에서 세 프로젝트를 차례로 열어 확인했다. 실제 소재는 모두 있고, AE가 작업 사본 쪽 파일로 연결한다. 없는 경로는 렌더 출력·옛 폴더 기록뿐이다.
- **공통 안내:** 네 프로젝트 모두 외부 효과 `UnMult`가 없다는 안내가 뜬다(이 PC에 미설치). APAC 때도 같은 상태로 렌더했다. 어느 레이어가 쓰는지는 렌더 단계에서 확인한다.
- **컴프 대응(같은 번호):** `ASIA_BG_(WAVE)`(2058) ↔ `WF_BG_(WAVE)`, `ASIA_BG_(EX)`(56) ↔ `WF_BG_(EX)`, `ASIA LOGO`(202) ↔ `WF LOGO`. 크기도 같다(1920², 3000², 1500²).
- 비교 이미지: `resource/oap/mockups/survey-1103/`.

### 화면별 교체 계획 (APAC 출처 → 월드 파이널 소재) — 2026-11-03 확인
| 화면 | APAC 템플릿에서 바뀌는 자리 | 월드 파이널 소재(출처) | 구조 영향 |
| --- | --- | --- | --- |
| 선택 배경 | `ASIA_BG_(WAVE)` ← `APAC BG B`(China type B, 주황 소용돌이, 2880², 5.09초·48fps) | `WF_BG_(WAVE)`(`월드 파이널 배경 B.mp4` 보라 방사 1920²·10초·30fps + `아메리카 배경 B2` 색조 보정) | 컴프 크기 같아 원본만 교체. 배경 시간식 `3 − cos(πt/2)`가 2~4초를 왕복해 방사형 빛줄기가 2초마다 방향을 바꿔 보일 수 있다(시안에서 확인) |
| 선택 카드 | 카드 배경 `SWC BG_yellow_1.jpg`(1920×1080), 도형 "APAC gold glass" | `SWC BG_violet_2.jpg`(3840×2160, 월드 결선 `[pre] WFIST-WF`가 쓰는 보라), 도형 색은 월드 결선 색 | 해상도가 2배라 그대로 바꾸면 2배로 보인다 → 1920×1080으로 줄인 사본으로 교체(레이어 배율 유지) |
| 선택 버튼·글자 | SELECT의 노랑 그라디언트·아래 턱·윗 반짝임, 상단 대비 그라디언트, 부제 "SWC2026 APAC CUP LUCKY DRAW"(v15, 배경 영상에 구워짐). RANDOM은 v21에서 삭제돼 앱에 없다 | 보라 계열 색(월드 결선 캐스터·우승 화면 색값), 부제 "SWC2026 WORLD FINALS LUCKY DRAW"(제안) | 색·글자만. 부제는 v15처럼 `export-choose-v8.jsx`의 `JOB.texts`로 바꿔 배경 영상째 다시 렌더 |
| 오픈 엠블럼 | `ASIA LOGO`(`SWC2026_Symbol_ASIA.mov` 주황 바람개비 3.1초, 칠 효과 주황) | `WF LOGO`(`SWC2026_Symbol_FINAL_(basic).mov` 보라 X 3.03초) | 크기 같음. 심볼 영상이 2프레임 짧다(반복 5.07초 안이라 영향 작을 것, 렌더로 확인) |
| 오픈 배경 | 도형 MILKY·PURPLE·WHITE 01/02·PLATTEN(흰색·금색) + `ASIA_BG_(WAVE)`, 아이보리 제목 패널·갈색 글자 | 월드 결선 `04_Caster_Cam2`의 MILKY 2·PURPLE 2·WHITE 03/04·PLATTEN 2(흰색·보라) + `WF_BG_(WAVE)` | 월드 결선 도형은 새로 그린 것이라 모양·위치가 다를 수 있다 → 기본안은 APAC 도형 모양 유지, 색만 교체 |
| 당첨 | `ASIA LOGO` 3곳(인트로 2·하단 1), `ASIA_BG_(EX)`(China type A 3840²), WIN 글자·프레임 도형·단색의 주황, 하단 "SWC2026 APAC CUP POP-UP STORE" | `WF LOGO`, `WF_BG_(EX)`(`월드 파이널 배경 B_ups.mp4` 3840²·10초), 월드 결선 `15_Win`의 흰 바탕·보라 글자, 하단 문구 "SWC2026 WORLD FINALS POP-UP STORE"(제안) | 배치 같음(월드 결선 `15_Win`도 같은 사선 WIN·하단 로고 구성). 상품 목록은 정해지면 받는다 |
| 화면 전환 | `TRANS_ASIA_00006~00064` 59장(알파 PNG, 1920×1080, 글자 없음) → 앱은 가운데를 세로로 재구성해 54fps·1.13초 | `0713_TRANS_FINALE_00006~00064` 59장(알파 PNG, 1920×1080, 보라 X·흰 로고, 글자 없음) | 없음. 80장 중 앞 6장·뒤 15장은 완전 투명 여백이고, 00006~00064는 APAC과 프레임별 가림 비율이 같다(완전 가림 40장도 같음). 방송 컴프의 "SWC2026"·"WORLD FINALS"는 PNG 밖의 별도 도형이라 에셋과 무관. APAC과 같은 범위·재구성·54fps를 그대로 적용 |
| 축하(A·B) | APAC 전환의 완전 가림 프레임 + Unbounded 글자(APAC `render/congrats/congrats-v25-A/B.jsx`, 1.8초) | 월드 결선 전환의 완전 가림 프레임(보라 X 화면) | 스크립트를 가져와 소재 경로만 교체 |
| 오픈 SLIDE 박스 | v22 B안: 딥 퍼플 `#3B1766` + 골드 글자 `#FFE58D`, 높이 180·글자 72(템플릿 v3 이후 스크립트로 바꿔 렌더, 사본 저장 안 함. `docs/oap-spec/open-v3/README.md` v22) | 월드 결선 색 | 크기·위치는 B안 그대로 재현하고 색만 교체 |
| 등급 배지 | `text 7`(글자 없는 방패)을 흰 방패로 뽑아 "10" 자리에 A~H 글자를 넣은 PNG(v22, `mockups/grade/`) | 월드 결선에도 같은 경로의 `text 7`이 있다(보라 방패) | 방패 모양이 같으면 방패는 그대로, **A~H 글자 색은 금색 화면 기준이라 월드 결선 색으로 다시 만든다** |
| 대기 화면 타이틀 | 앱 글자 "LUCKY DRAW EVENT"(Unbounded + 검은 소프트 섀도, v14) | — | 그대로인지 사용자 확인 |
| 앱 CSS 금색 요소 | AE가 아니라 `app/figure.css`가 그리는 금색: 대기 터치 배너, 선택 카드 선택 표시(금색 외곽선·호흡 발광·반짝임), 미선택 안내 문구, 오픈 드래그 UI(레일·쉐브론·손잡이 화살표)와 BACK, 오픈·당첨 화면 바깥 여백 배경(`#ffc309`·`#f6c21a`), 당첨 직원 표시, 상품 영상 없을 때의 금색 결과 카드 | 월드 결선 색 | **앱 코드 변경이다.** 배치·시간은 그대로 두고 색 값만 바꾼다. 관리자 화면 색은 그대로 |

- 그대로 두는 것: 소환서 이미지, 10주년 방패 PNG, Com2uS Store 로고, `sacred-idle/open` 영상, 모든 배치·크기·타이밍.
- **템플릿 aep는 최종 상태가 아니다.** APAC 앱 자산은 템플릿을 연 뒤 스크립트로 일부를 바꿔 렌더하고 사본을 저장하지 않은 것이 있다(v15 부제, v22 SLIDE B안, 축하·방패는 별도 jsx). 월드 결선판은 템플릿 + 이 후속 변경을 함께 재현해야 한다. 기준은 현재 앱 자산과 `docs/oap-spec/`.
- **AE 실행 방법(APAC 21절):** AE를 켠 뒤 `AfterFX.com -r <jsx>`, JOB 전역 변수를 앞에 붙인다. 열린 프로젝트가 있으면 스크립트가 거부한다. MCP 연결 패널은 확인·렌더 보조로만 쓴다.
- 상품·특별 영상(사용자 결정 2026-11-04): 동작은 APAC과 모두 같다.
  - 모든 당첨 상품에 상품별 당첨 화면(상품 영상)을 만든다. 사용자가 상품 이미지를 보정해서 주면 `wf_WIN_PRIZE_iPad_template_v5.aep`로 `render-prizes.jsx`를 돌린다.
  - A·B(라칸·제라투)는 축하 화면(월드 결선판 `congrats-A/B.mp4`, 앱 내장) → 시네마틱(특별 영상) → 상품 당첨 화면 순서다.
  - 바뀌는 것은 화면 템플릿의 비주얼(배경·키 컬러·엠블럼)뿐이다.
  - APAC 시네마틱 `special-video_rakan-statue.mp4`(14.95초, HEVC 1080×1440)·`special-video_zeratu-figure.mp4`(7.07초, H.264 1024×1366)를 1초 간격으로 확인했다. 캐릭터 영상이고 APAC 로고·글자는 보이지 않는다. 그대로 다시 쓸 수 있다(사용자가 새 영상을 주면 그것으로 바꾼다).
- 테스트 기준 갱신: `test-choose-browser`의 AE 기준 프레임, `test-transition-browser`의 화질 비교 기준(APAC `@TRANS_ASIA`)을 월드 결선 것으로 바꿔야 한다.

### 결정 필요 — 2026-11-03 보고
1. **문구(사용자 확정 2026-11-03):**
   - 선택 화면 부제: "SWC2026 APAC CUP LUCKY DRAW" → **"SWC2026 WORLD FINAL LUCKY DRAW"**(사용자가 준 그대로. 당첨 화면·OAP 공식 표기는 FINALS라 시안에서 한 번 더 보여 줌)
   - 당첨 화면 하단: **"SWC2026 WORLD FINALS POP-UP STORE"**
   - 대기 화면: **"LUCKY DRAW EVENT" 유지**

- **이미 정해진 것(다시 묻지 않는다, 2026-11-03 사용자 지적):** 이 절 "지킬 것"대로 움직임·배치·타이밍은 APAC과 100% 같게 한다.
  - 로고: APAC 로고(`ASIA LOGO`)가 나오는 모든 곳을 움직이는 `WF LOGO` 애니메이션째 교체한다(오픈 1곳, 당첨 3곳).
  - 오픈 배경 도형: APAC 도형 모양·위치는 그대로, 색만 바꾸고 바탕 영상을 `WF_BG_(WAVE)`로 교체한다.
  - 앱 CSS 금색 요소: 색 값만 바꾼다(좌표·시간 불변).

- 정정(같은 날): 처음 보고에서 전환을 "길이 80장·좌우 글자 잘림"으로 결정 사항에 올렸으나 잘못이었다. 사용자 지적대로 APAC 세로판에도 글자는 처음부터 없었고, 위 표처럼 같은 59장 범위를 쓰면 길이도 같다. 교훈: 방송 컴프 렌더가 아니라 앱 에셋의 실제 출처(PNG 시퀀스)끼리 비교한다.

- **진행 방식:** 선택 화면부터 한다. 정지 화면 시안 1장을 APAC과 나란히 보여 주고 방향을 확인받은 뒤 렌더한다. 화면마다 0절 마무리 절차(사용자 사전 점검 → 승인 → 푸시)를 따른다.
- 만든 방법과 스크립트: APAC handoff 9~16절, `resource/oap/apac-ref-scripts/`, Git의 `scripts/ae/`.

## 6. 새 세션 시작 방법 (VS Code + Claude)

1. VS Code에서 **`F:\Download\SWC2026 World Finals_Lucky Draw App` 폴더를 연다.** APAC 폴더에서 열면 APAC 안내판이 읽힌다.
2. Claude 패널을 새로 연다. 루트 `CLAUDE.md`는 자동으로 읽힌다(이 문서를 가리킴).
3. 첫 메시지 예:
   > handoff.md 0~6절과 WORKLOG.md를 읽고 현재 상태를 요약해 줘. 방식은 5절 결정대로 (나) — APAC 템플릿 구조는 그대로 두고 소재만 월드 파이널로 바꾼다. 4절 다음 단계 1~3을 진행해서, 화면별로 바꿀 월드 파이널 소재를 비교표로 보고해 줘. 원본은 수정하지 말고, 내가 열어 둔 AE 프로젝트는 닫거나 저장하지 마.
4. **이 PC에서 계속할 때:** 테스트 도구(`.tools/`)가 이미 있다. 사전 점검용 로컬 서버는 `py -m http.server 8090 --bind 0.0.0.0`(폴더 루트에서) → http://127.0.0.1:8090/app/
5. **다른 PC·랩탑에서 이어받을 때:** 저장소를 복제한 뒤 `powershell -File scripts/setup-tests.ps1`을 실행한다. `resource/`(AE 원본·작업 사본)는 Git에 없으니 따로 옮긴다. 자세한 준비는 APAC handoff 38절.
6. **알아 둘 것:**
   - 이 PC에서 `python`은 윈도우 스토어 안내 프로그램이다. 파이썬은 `py`로 실행한다.
   - 사전 점검용 로컬 서버(파이썬 기본 서버)는 영상 부분 요청(Range)을 지원하지 않는다. iPad Safari는 영상에 Range를 쓰므로 이 서버로는 iPad에서 영상이 안 나올 수 있다. 그럴 때는 Range를 지원하는 로컬 서버로 바꿔 점검한다(승인 전 푸시 금지 규칙은 그대로).
   - `test-open-browser`, `test-volume-real-browser`는 PC 부하가 클 때 가끔 실패한다. 단독으로 다시 돌리면 통과한다.

## 7. 월드 결선 소재 적용 — swc-wf-v2 (2026-11-03, 미커밋·사전 점검 대기)

방식 (나) 그대로: APAC 템플릿 사본에서 소재만 바꾸고, 배치·크기·시간·키프레임·레이어 구조는 그대로 둔다. 색은 월드 결선 OAP에 실제로 있는 값만 쓴다(`#3a0085` 진보라, `#5d09a0`, `#7922f4` 보라, `#a138ff` 로고 보라, `#af64ff`, `#dfd2ff` 연보라, `#f4f4f4`·`#ffffff`).

### AE 사본과 스크립트 (`scripts/ae/`, `AfterFX.com -r`로 실행)
| 화면 | 스크립트 | 저장한 사본(`ae-work/apac-templates/(0709)…/`) | 바꾼 것 |
| --- | --- | --- | --- |
| 선택 | `wf-build-choose-v8.jsx` → `export-choose-v8.jsx`(APAC 것 그대로) | `wf_CHOOSE_YOUR_SCROLL_iPad_INTRO_LOOP_v8.aep` | `ASIA_BG_(WAVE)` 안 `APAC BG B` → `WF BG B`(2880², `월드 파이널 배경 B_ups` 75%), 카드 바탕 `SWC BG_violet_2_1920.jpg`(`ae-work/wf-assets/`, 원본을 1920×1080으로 줄임), 색 75곳, 부제 "SWC2026 WORLD FINAL LUCKY DRAW" |
| 오픈 | `wf-build-open-v3.jsx` | `wf_OPEN_YOUR_SCROLL_iPad_v3.aep` | 앱 최종 상태 재현(v10 64px 올림, v22 SLIDE B안: 윗변 2299·높이 180·글자 72·간격 원래대로·방패 아이보리 유지) + `ASIA LOGO` 안 심볼 영상 → `SWC2026_Symbol_FINAL_(basic).mov`, 배경 영상, 색 30곳 |
| 당첨 | `wf-build-win-v5.jsx` | `wf_WIN_PRIZE_iPad_template_v5.aep` | 심볼 영상(로고 3곳), `ASIA_BG_(EX)` 영상 → `B_ups`(3840² 같음)·주황 색 보정층 `APAC` 끔, `15_Win` 같은 레이어 색 8곳, 하단 "SWC2026 / WORLD FINALS / POP-UP STORE". 상품 영상은 아직 안 만듦 |
| 전환 | ffmpeg(명세 `docs/oap-spec/transition` 명령 그대로) | — | `0713_TRANS_FINALE_00006`부터 59장 + 투명 2장 = 61장, 54fps |
| 축하 | `wf-congrats.jsx`(APAC `congrats-v25`에서 색만) | — | 배경판 `render/congrats-wf/clean/`: 전환 18~53번의 흰 로고를 띠 색 0.694배 그림자로(APAC 판 실측 비율), 입체 옆면 `#dfd2ff→#5d09a0`, 그림자 `#1d0042` |

- 오픈 B안 재현 확인: APAC 색 그대로 렌더해 APAC 앱 영상 원본 프레임(`open-v3-barB/seq/f_00030`)과 비교. 방패 x 340~419·글자 시작 448·세로 2335~2442가 같다. 전체 41.3dB, 띠 29dB(글자 가장자리 1px 미만 차이). 원래 B안 스크립트는 남아 있지 않아 명세 값과 실측으로 맞췄다(`dxShield 1.5`, `dxText −2`).
- 로고 교체는 `ASIA LOGO` 컴프의 `loopOut()` 구조를 그대로 두고 영상 파일만 바꿨다. 월드 결선 심볼 영상이 3.03초로 APAC(3.1초)보다 2프레임 짧다.
- 렌더·인코딩: 선택 배경 1024×1366 High 4.1 CRF 16 GOP 30, 반복·이어짐 경계 40dB(일반 이웃 36~42). 오픈 프레임 152장 같은 규격, 반복 경계 62.7dB, 영상 칸 완전 검정. 축하 1024×1366 3000kbps + 축하음 AAC.

### 앱 변경 (작업 트리, 커밋 안 함)
- 자산: 선택 15개, 오픈 1개, 전환 2개, 축하 2개. 등급 배지 PNG는 흰색뿐이라 그대로.
- `app/figure.css` 색 값만(좌표·시간 불변):
  - 선택: 선택 카드 외곽선·발광·반짝임·빛, SELECT 발광, HOME 바탕, 미선택 안내 상자
  - 오픈: 흰 쉐브론의 금빛 번짐, BACK, 무대 바탕·바깥 여백
  - 당첨: 바깥 여백, 무대 바탕, 직원 표시, 등급 배지 그림자·빛
- 그대로 둔 금색: 대기 화면 터치 배너, 결과 화면 "처음으로" 단추, 관리자 버튼·게이지는 `index.html`의 기반 앱 공통 변수(`--grad-gold`·`--glow-gold`)를 쓴다. 결과 카드 틀은 변수가 아니라 기반 앱(사내 스토어 1·2차) 그림 `assets/frames/frame-gold-card.png`(상위 등급인데 상품 영상이 없을 때)·`frame-purple-card.png`(참가상)이다. 사용자 확인 뒤 정한다. 캡처: `resource/oap/mockups/result-card-1104/`.
- 버전 `swc-wf-v2` / 캐시 `swc2026-world-finals-lucky-draw-v2`.
- 테스트 기준: `test-choose-browser` → `render/choose-wf/export/verify/full-t3.png`, `test-open-browser` → `render/open-wf/verify/idle-t1-wf.png`(월드 결선 프레임 + AE 소스 `sacred-idle` t=1 합성, 이미 올린 좌표라 보정 0), `test-transition-browser` → 월드 결선 PNG 시퀀스. 전환 화질 36.1~41.8dB(APAC 36.5~41.6).
- `test-open-browser` 55번 줄(1초 장면 표시 확인)은 APAC 원래 영상으로도 두 번 중 한 번 실패한다. 영상과 무관하게 흔들리는 검사다. 영상 칸 비교는 30.2dB로 기준(30)을 겨우 넘는다(기준 그림을 ffmpeg로 확대해 AE 확대 방식과 조금 다름).

### 비교 이미지
- 선택: `resource/oap/mockups/choose-wf/compare-apac-vs-wf-t3.jpg`, 실제 앱 화면 `app-choose-v2.jpg`
- 오픈: `resource/oap/ae-work/render/open-wf/verify/compare-apac-vs-wf.jpg`
- 당첨: `resource/oap/ae-work/render/win-wf/verify/compare-apac-vs-wf.jpg`(왼쪽 APAC, 가운데 WF, 오른쪽 시작 장면)
- 축하: `resource/oap/ae-work/render/congrats-wf/compare-apac-vs-wf.jpg`
- 전환: `resource/oap/mockups/survey-1103/` 설명 페이지 그림
- 당첨 견본: `render/prizes-wf-sample/sample_product-video_zeratu-figure.mp4`(1024×1366, 12초, APAC 제라투 사진). 관리자에서 상품 영상으로 올려 미리 볼 수 있다. 월드 결선 상품이 정해지면 같은 방식으로 `upload-ready/`에 `wf_` 이름으로 만든다. 비교: `render/prizes-wf-sample/compare-t4.jpg`.
- 전체 테스트(전부 반영 후): 17종 통과. `test-bgm-playlist-browser`는 묶음 실행에서 2회 시간 초과, 단독 2회 통과(앞 테스트 부하로 추정).

### 사고 기록 — 원본 폴더에 새 파일 생김 (2026-11-03 18:38)
- `resource/oap/ae-original/swc2026_oap(변환됨).aep`(45,994,254바이트)가 새로 생겼다. 원본 `swc2026_oap.aep`는 그대로다(작업 사본과 SHA256 같음). 그 밖의 원본 파일 수 변화 없음(467 → 468, 이 파일 하나).
- 경위(2026-11-04 사용자 확인): 18:12~18:37 사이에 AE에서 원본 폴더의 `swc2026_oap.aep`가 저장 안 된 "(변환됨)" 상태로 열려 있었다. 18:37에 Claude의 색 읽기 스크립트(`wf_palette.jsx`)가 다른 프로젝트를 열려고 했다. 이 스크립트는 `app.project.file`만 검사해서, 저장된 적 없는 프로젝트를 닫아도 되는 것으로 봤다. 그러자 AE가 열린 프로젝트를 저장할지 묻는 "다른 이름으로 저장" 창을 띄웠고, 퇴근 직전이던 사용자가 저장 단추를 눌렀다. 기본 위치가 원본 폴더라 그곳에 저장됐다.
- 내용 확인(2026-11-04): 두 aep의 이름 문자열(컴프·레이어·소재·글자) 전체를 비교했다. 차이는 AE 26 형식으로 저장하며 생긴 색 공간·언어 기본값뿐이다. Claude의 작업 흔적(WF BG B, `wf_` 이름, 바꾼 문구 등)은 없다. 스크립트는 그 프로젝트를 고치지 않았고, 저장은 열기 전에 일어났다. 즉 이 파일은 원본을 AE 26 형식으로 다시 저장한 것이다.
- 조치: 사용자 결정으로 모든 작업이 끝날 때까지 지우지 않고 둔다. `wf-build-*.jsx` 검사도 고쳤다. 이제 저장 안 된 프로젝트라도 내용이 있으면 닫지 않고 멈춘다.

## 8. 상품 당첨 영상 8개 — 2026-11-04 (앱 변경 없음)

- **사용자 요청:** `resource/lucky draw items/`의 경품 이미지로 APAC과 같은 상품별 당첨 화면을 모두 만든다. 상품명은 파일 이름을 대문자로 쓴다.
- **방식(APAC 16절과 같음):**
  - 누끼를 알파 경계로 잘랐다(알파 8 이하 잡티는 경계 계산에서 뺌). 결과: `resource/oap/ae-work/wf-prizes/cutouts-trimmed/<id>.png`
  - `scripts/ae/render-prizes.jsx`(수정 없음)로 `wf_WIN_PRIZE_iPad_template_v5.aep`에서 12초 2048×2732로 렌더했다(8개 544초). 결과: `ae-work/render/prizes-wf/`
  - 1024×1366 H.264 High 4.1, CRF 18, GOP 30, 소리 없음, faststart로 인코딩했다(5.7~7.1MB).
- **업로드용 파일:**
  - 상품 영상: `resource/oap/upload-ready/prize-videos/wf_product-video_<id>.mp4` 8개
  - 시네마틱(특별 영상): `resource/oap/upload-ready/special-videos/wf_special-video_rakan-statue.mp4`, `wf_special-video_zeratu-figure.mp4`. APAC 업로드 파일을 그대로 복사했다(SHA256 같음).
- **검수 시트:** `resource/oap/mockups/wf-prize-videos-t6.jpg`(업로드용 영상 t=6초)

| 폴더(순위·수량) | id | 화면 상품명 | 누끼 크기 |
| --- | --- | --- | --- |
| 1st 1ea | rakan-statue | RAKAN STATUE | 1061×1241 |
| 2nd 10ea | zeratu-figure | ZERATU FIGURE | 1017×1365 |
| 3rd 19ea Plushies | artamiel-plushie | ARTAMIEL PLUSHIE | 1669×1734 |
| 3rd 19ea Plushies | racuni-plushie | RACUNI PLUSHIE | 1760×1842 |
| 3rd 19ea Plushies | rica-plushie | RICA PLUSHIE | 5127×5536 |
| 3rd 19ea Plushies | sky-surfer-pillow | SKY SURFER PILLOW | 2044×1155 |
| 4th 100ea | swc-cap | SWC CAP | 1887×1346 |
| 5th 170ea | monster-deco-sticker-pack | DECO STICKER PACK | 785×863 |

- **스티커 팩 상품명:** 파일 이름 "MONSTER DECO STICKER PACK"(25자)은 사선 띠보다 길어 양끝이 잘렸다. APAC에서 가장 긴 이름은 18자였다. 사용자 선택으로 이름을 줄여 "DECO STICKER PACK"(17자)으로 다시 렌더했다. 배치·글자 크기는 그대로다.
- **모자 상품명:** 처음엔 파일 이름대로 "SWC2024 CAP"으로 만들었다. 사용자 요청으로 "SWC CAP"으로 다시 렌더했다(`wf_product-video_swc-cap.mp4`). 이전 파일은 `ae-work/render/prizes-wf/old/`에 보관했다. 누끼 파일 이름은 `swc2024-cap.png` 그대로다.
- **AE:** 렌더 전에 AE에 사용자가 연 `ae-original/swc2026_oap(변환됨).aep`가 열려 있었다. 사용자 허락을 받고 저장 없이 닫았다(파일은 그대로).
- **등록(iPad 관리자, APAC과 같음):** 상품마다 "상품 영상"을 직접 지정한다. 라칸·제라투는 "특별 영상"도 지정하고 표시 등급을 A·B로 정한다. A·B는 축하 → 시네마틱 → 상품 영상 순서로 나온다.

## 9. 소환서 카드 유리 시안 A 부하 시험판 — swc-wf-v3 (2026-11-04, 미커밋)

- **배경:** 선택 화면에서 카드 바탕과 배경이 같은 보라 빛줄기라 시선이 흩어진다는 사용자 의견. 비교 시안: https://claude.ai/artifact/QXNEQFrptrU7a8Xn48f2mn. 사용자가 A(맑은 유리, 라이브 블러)로 부하 시험을 요청했다.
- **시험판(기본 동작은 그대로):**
  - `?glass=a`: 카드를 유리 A로 그린다. 카드 위치·크기·등장·선택 표시·반짝임은 그대로다. 유리 판은 `backdrop-filter: blur(1.4cqw) saturate(165%) brightness(1.06)`, 소환서 그림은 `assets/oap/choose/scroll-art.webp`(AE 소재 `SWC2026_Scroll_nobg.png`, 265×288), 번호·SCROLL 글자는 Unbounded다.
  - 미선택 카드를 어둡게 할 때 원래 쓰던 `filter: brightness(.78) saturate(.9)` 대신 막(`.glass-dim`, 진보라 28%)을 덮는다. 조상에 filter가 있으면 유리 흐림이 뒤 배경 영상을 보지 못한다.
  - `?perf=1`: 선택 화면 아래에 측정 상자를 띄운다. 카드를 누를 수 있게 된 순간부터 10초 동안 화면 fps·기기 Hz·느린 프레임(중앙값 1.8배 초과)·최장 프레임·배경 영상 표시 fps·영상 누락 프레임을 잰다. 카드를 고르면 선택 상태로 다시 잰다. 결과는 `window.__choosePerf`에도 남는다.
  - 파일: `app/choose-screen.js`(`CHOOSE_GLASS`, `ChoosePerf`), `app/figure.css`(`.choose-stage.glass-a`, `.choose-perf`), `app/sw.js`(scroll-art.webp 캐시 추가), 버전 `swc-wf-v3`.
- **PC Chrome 측정(RTX 4060, 1024×1366 2배율, 각 2회):**

| 조건 | 기본 카드 | 유리 A |
| --- | --- | --- |
| CPU 1배 | 60fps, 느린 프레임 0~2/600, 최장 17~33ms, 영상 29.8~29.9fps | 60fps, 느린 프레임 0/600, 최장 17ms, 영상 29.6~29.8fps |
| CPU 4배 느리게 | 59.9~60fps, 느린 프레임 0~1, 최장 17~33ms | 59.4~59.7fps, 느린 프레임 1~4, 최장 50~67ms |

  - PC는 그래픽카드가 강해 흐림 비용이 거의 드러나지 않는다. 흐림은 GPU 작업이라 CPU를 느리게 해도 iPad를 흉내 내지 못한다. **판단은 iPad 실측으로 한다.**
- **iPad 실측 방법:** 같은 와이파이에서 로컬 서버(`py -m http.server 8090 --bind 0.0.0.0`)를 열고 Safari로 기본 `http://<PC IP>:8090/app/?perf=1`과 유리 `...?perf=1&glass=a`를 각각 연다. 상품이 있어야 대기 화면을 누를 수 있다. 판단 기준은 iPad Pro 12.9 ProMotion 120Hz에서 화면 fps가 기본 카드와 비슷하고, 영상이 30fps를 유지하며 영상 누락이 0에 가까운지다.
- **알려진 점:** 카드 등장(투명도 애니메이션) 0.45초 동안은 Chrome에서 유리 흐림이 잠깐 빠졌다가 끝나면 생길 수 있다(투명도 애니메이션 중인 조상은 흐림 기준이 된다). iPad에서 눈에 띄는지 함께 본다.
- **B로 변경(2026-11-04 사용자 결정):** "소환서가 잘 눈에 들어오지 않아" 기본은 B(짙은 유리)로 하고, 고른 카드에는 A(맑은 유리)를 적용했다.
  - 주소 옵션 `?glass=b`. `?glass=a`도 비교용으로 남겼다. 무대 클래스는 `glass`(공통) + `glass-b`.
  - B 판: `linear-gradient(165deg,#46149666,#1e00508c 55%,#3a00859e)`, `blur(2cqw) saturate(140%)`. `aria-pressed=false` 카드에만 적용되고, 고른 카드는 A 판·빛 맺힘·흰 외곽선·반짝임이 그대로다.
  - PC Chrome(각 2회): 기본 60fps / 유리 B 60fps(CPU 4배에서도 59.9~60fps, 최장 17~33ms). 영상 29.6~29.8fps.
- **테스트(v3):** 17종 통과. `test-open-browser` 55번 줄(1초 장면 표시)이 연속 실패했다. 그래서 v3 변경을 뺀 사본과 번갈아 돌려 비교했다. 작업 폴더에서도 통과할 때가 있고, v3를 뺀 사본에서도 실패할 때가 있어 변경과 관계없이 흔들리는 검사로 확인했다(7절과 같은 문제).
- **iPad 실측 주소:** 기본 `http://<PC IP>:8090/app/?perf=1`, 유리 B `...?perf=1&glass=b`.
- **첫 측정 결과(2026-11-04 사용자, 유리 B, 기기 60Hz로 표시):** 6회 중 2·4·6회는 60fps, 느린 프레임 0, 최장 17~20ms, 영상 29.7~29.8fps, 누락 0이었다. 1회(최장 6,717ms)와 3·5회(영상 7.8·22.2fps)는 측정 중 탭이 가려지거나 선택 화면을 벗어난 것으로 보이는 오염값이다.
- **측정기 보완(swc-wf-v4):** 측정 도중 탭이 가려지거나(`visibilitychange`) 선택 화면을 벗어나면(`is-interactive` 해제) 그 회차를 "중단"으로 표시하고 뺀다. 회차 번호로 이전 회차의 영상 프레임 콜백이 겹쳐 세지지 않게 했다. 선택 상태 회차에는 "(선택)"을 붙인다. Chrome에서 측정 2초 뒤 HOME을 누르면 중단으로 기록되는 것을 확인했다. 선택·캐시·DOM·격리 테스트가 통과했다.

## 10. 선택 화면 부제 FINALS — swc-wf-v5 (2026-11-04, 미커밋)

- **사용자 요청:** 선택 화면 상단 부제 "SWC2026 WORLD FINAL LUCKY DRAW" → "SWC2026 WORLD **FINALS** LUCKY DRAW"(5절 결정의 단수 표기를 고침).
- **방법:** 부제는 배경 영상에 구워져 있다. 그래서 `wf-build-choose-v8.jsx`를 `subtitle: "SWC2026 WORLD FINALS LUCKY DRAW"`로 다시 돌려 `wf_CHOOSE_YOUR_SCROLL_iPad_INTRO_LOOP_v8.aep`를 다시 저장했다(색 교체 75곳 그대로). 이어 `export-choose-v8.jsx`로 배경 0~6초 TIFF를 다시 렌더하고, 7절과 같은 명령으로 intro(0~2초)·loop(2~6초)를 인코딩했다.
  - 첫 내보내기에서 `verify/bg-t3.png` 저장이 시간 초과로 실패했다. 대화상자 없음을 확인하고 다시 실행해 성공했다(렌더 37.6초).
  - 카드 그림(scroll-01~12)은 이전과 픽셀이 같아 바꾸지 않았다. 앱에는 `choose-bg-intro.mp4`·`choose-bg-loop.mp4` 두 개만 교체했다. 이전 영상은 `render/choose-wf/web-v1/`에 보관했다.
  - `test-choose-browser` 기준 그림(`export/verify/full-t3.png`)도 FINALS로 다시 만들어졌다.
- **버전:** `swc-wf-v5`(9절 측정기 보완 v4 포함).
- **테스트:** 전체 18종 중 15종이 한 번에 통과했다. 나머지 3종은 다음과 같다.
  - `test-win-browser`: 임의 포트가 Chrome 차단 포트(6666)로 잡혀 실패했고, 다시 돌려 통과했다.
  - `test-volume-real-browser`: 부하로 시간 초과가 났고, 다시 돌려 통과했다.
  - `test-open-browser` 55번 줄: 2회 중 1회 통과했다(9절과 같은 흔들리는 검사).
- **사용자 확인에서 FINAL이 계속 보인 원인(2026-11-04):** PC `127.0.0.1`에서는 앱이 서비스 워커를 끈다. 그런데 `py -m http.server`는 캐시 헤더를 보내지 않아, Chrome이 전날 받아 둔 예전 배경 영상을 다시 확인하지 않고 썼다. 서버가 주는 파일은 새 영상이었다(해시 일치). 같은 와이파이 IP(http)는 보안 출처가 아니라 iPad에서도 서비스 워커 없이 브라우저 캐시만 쓴다.
  - 조치: 사전 점검 서버를 `Cache-Control: no-store`를 붙이는 서버로 바꿨다(스크래치 `serve_nocache.py`, 8090번). 새 Chrome으로 열어 FINALS를 확인했다.
  - 이미 받아 둔 예전 영상은 강력 새로 고침(PC Ctrl+Shift+R) 한 번으로 지운다. iPad는 개인정보 보호 탭으로 열거나 설정 → Safari → 고급 → 웹 사이트 데이터에서 해당 IP를 지운다.
  - 다음 세션 참고: 사전 점검 서버는 캐시 금지 헤더가 있는 것으로 띄운다.
