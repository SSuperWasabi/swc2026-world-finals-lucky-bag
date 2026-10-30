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

- 저장소 복제, 이름 분리, 격리 테스트 보강을 마쳤다. OAP 자산은 아직 APAC 그대로다.
- **다음 단계:**
  1. 사용자가 `resource/oap/ae-original/`에 월드 결선 AE 원본을 넣는다.
  2. 원본을 읽기 전용으로 확인하고 APAC과 비교한다(컴프 구성·배치·타이밍).
  3. 작업 범위를 보고하고 화면별로 교체한다.
