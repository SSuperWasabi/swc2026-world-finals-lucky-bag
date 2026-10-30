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
| 선택 | `app/assets/oap/choose/`(배경 인트로·루프, 소환서 12장, SELECT) | CHOOSE v8 | | 대기 |
| 오픈 | `app/assets/oap/open/open-frame-loop.mp4` | OPEN v3 | | 대기 |
| 화면 전환 | `app/assets/oap/transition/`(매트·색 54fps) | TRANS_ASIA | | 대기 |
| 축하(A·B) | `app/assets/oap/grade/congrats-A/B.mp4` | 축하 화면 1.8초 | | 대기 |
| 등급 배지 | `app/assets/oap/grade/grade-A~H.png` | 글자 없는 방패 | | 대기 |
| 상품·특별 영상 | 관리자 업로드(`upload-ready/`) | WIN v5 템플릿 | | 대기 |
| 대기 화면 타이틀 | Unbounded 글자 "LUCKY DRAW EVENT" | 앱 글자 | | 확인 필요 |
| 기타 | `app/assets/figure/`(소환 영상·소리·이미지) | 기반 앱 | | 쓰임 확인 필요 |

- 월드 결선 AE의 배치(카드·버튼 위치)나 타이밍이 APAC과 다르면 파일만 바꾸는 것으로 끝나지 않는다. 좌표·동작 명세를 다시 뽑고 화면 코드를 맞춘다.
- `test-transition-browser`의 화질 비교 기준 경로는 APAC AE 원본이다. 월드 결선 전환 영상으로 바꿀 때 새 기준으로 고친다.

## 4. 현재 상태 — 2026-10-30

- **배포 완료:** 공개 저장소 생성 → main 푸시(`34ec295`) → Pages 켬(legacy, main, `/`) → 배포 PWA 검사 통과.
  - 앱: https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/
  - 화면 디자인은 아직 APAC 그대로다. 새 앱이라 미디어 등록 없음·재고 0으로 시작한다.
- **AE 원본 도착:** 사용자가 `resource/oap/ae-original/`에 넣었다(5절 목록). 아직 열어 보지 않았다.
- **다음 단계:**
  0. **사용자 결정 받기:** iPad 앱 템플릿을 받을지, APAC 템플릿 구조에 월드 결선 소재를 입혀 만들지(5절).
  1. AE 원본을 `ae-work/`로 복사해 열고, 컴프 구성·배치·색·타이밍을 APAC과 비교한다(원본 폴더의 aep는 열지 않는다).
  2. 3절 교체 표의 화면마다 쓸 컴프·소재를 정해 사용자에게 보고하고 확인받는다.
  3. 화면별로 교체한다. 한 화면씩 0절 마무리 절차를 따른다(사용자 사전 점검 → 승인 → 푸시).
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
  - **사용자 결정 필요:** (가) 월드 결선용 iPad 템플릿을 디자이너에게 받는다, 또는 (나) APAC iPad 템플릿 사본의 구조를 그대로 두고 소재(배경·로고·색·전환)만 월드 결선 OAP 것으로 바꿔 작업 사본에서 만든다.
  - (나)로 갈 때 APAC iPad 템플릿은 APAC 원본 폴더에서 **복사해서** 쓴다(`ae-work/apac-ipad-templates/` 등). 원본은 건드리지 않는다.
- 만든 방법과 스크립트: APAC handoff 9~16절, `resource/oap/apac-ref-scripts/`, Git의 `scripts/ae/`.

## 6. 새 세션 시작 방법 (VS Code + Claude)

1. VS Code에서 **`F:\Download\SWC2026 World Finals_Lucky Draw App` 폴더를 연다.** APAC 폴더에서 열면 APAC 안내판이 읽힌다.
2. Claude 패널을 새로 연다. 루트 `CLAUDE.md`는 자동으로 읽힌다(이 문서를 가리킴).
3. 첫 메시지 예:
   > handoff.md 0~6절과 WORKLOG.md를 읽고 현재 상태를 요약해 줘. 그다음 resource/oap/ae-original의 월드 결선 AE 원본을 ae-work로 복사해서 열고, APAC 앱의 각 화면(선택·오픈·전환·축하·등급·당첨 영상)에 쓸 월드 결선 컴프·소재를 찾아 비교표로 보고해 줘. iPad 템플릿 방식은 (가)/(나) 중 ○로 간다. 원본은 수정하지 말고, 내가 열어 둔 AE 프로젝트는 닫거나 저장하지 마.
4. **이 PC에서 계속할 때:** 테스트 도구(`.tools/`)가 이미 있다. 사전 점검용 로컬 서버는 `py -m http.server 8090 --bind 0.0.0.0`(폴더 루트에서) → http://127.0.0.1:8090/app/
5. **다른 PC·랩탑에서 이어받을 때:** 저장소를 복제한 뒤 `powershell -File scripts/setup-tests.ps1`을 실행한다. `resource/`(AE 원본·작업 사본)는 Git에 없으니 따로 옮긴다. 자세한 준비는 APAC handoff 38절.
6. **알아 둘 것:**
   - 이 PC에서 `python`은 윈도우 스토어 안내 프로그램이다. 파이썬은 `py`로 실행한다.
   - 사전 점검용 로컬 서버(파이썬 기본 서버)는 영상 부분 요청(Range)을 지원하지 않는다. iPad Safari는 영상에 Range를 쓰므로 이 서버로는 iPad에서 영상이 안 나올 수 있다. 그럴 때는 Range를 지원하는 로컬 서버로 바꿔 점검한다(승인 전 푸시 금지 규칙은 그대로).
   - `test-open-browser`, `test-volume-real-browser`는 PC 부하가 클 때 가끔 실패한다. 단독으로 다시 돌리면 통과한다.
