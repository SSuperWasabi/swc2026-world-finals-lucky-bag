# SWC2026 World Finals Lucky Draw App

SWC2026 APAC Cup 럭키 드로우 앱(v30)을 계승한 월드 결선용 독립 PWA 프로젝트. 기능·설정·관리자 화면은 그대로 두고 OAP 미디어 템플릿만 월드 결선 버전으로 바꾼다.

- 프로젝트 시작일: 2026-10-30
- 현재 버전: `swc-wf-v1` / 캐시: `swc2026-world-finals-lucky-draw-v1`
- 기반: APAC 저장소 main `fd317e9`(앱 `swc-apac-v30`)
- 작업 폴더: `F:\Download\SWC2026 World Finals_Lucky Draw App`
- 저장소: https://github.com/SSuperWasabi/swc2026-world-finals-lucky-draw
- 앱 배포 주소: https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/
- 시작할 때 읽을 문서: [handoff.md](handoff.md)(작업 규칙·분리 기준·AE 정리 규칙·교체 진행 표·현재 상태·새 세션 시작 방법)

## 앱 기능
APAC 앱과 같다. 화면 흐름, 추첨 규칙, 배경음악·효과음, 관리자 사용법, 현장 준비 목록은 [docs/apac/handoff-apac.md](docs/apac/handoff-apac.md) 21절에 있다.

관리자 진입: 메인 좌측 상단을 3초 안에 5회 터치. 초기 PIN은 `0000`이며 운영 전에 바꾼다. 새 앱은 미디어 등록 없음, 재고 0, 추첨 기록 없음으로 시작한다.

## APAC 앱과 분리한 항목
저장 키, 미디어 DB, 캐시, PWA id, 앱 이름을 모두 나눠서, 한 iPad에 두 앱을 같이 설치해도 데이터가 섞이지 않는다. 표는 [handoff.md](handoff.md) 1절.

## 로컬 자료
`resource/`(AE 원본·작업 사본·렌더·업로드용 파일), `.tools/`, `.kuji` 백업은 Git에서 제외한다. AE 폴더 구성은 handoff 2절.

## 검증과 개발
Node.js, Python, Google Chrome이 필요하다. 새로 복제했다면 먼저 테스트 도구를 설치한다(검사 도구와 ffmpeg).

```powershell
powershell -File scripts/setup-tests.ps1
node scripts/test-project-isolation.cjs
node scripts/test-figure.cjs
node scripts/test-figure-dom.cjs
node scripts/test-idle-video-cycle.cjs
node scripts/test-scroll-audio.cjs
node scripts/test-audio-mix.cjs
node scripts/test-figure-sw.cjs
node scripts/test-figure-browser.cjs
node scripts/test-idle-video-browser.cjs
node scripts/test-result-video-browser.cjs
node scripts/test-choose-browser.cjs
node scripts/test-open-browser.cjs
node scripts/test-win-browser.cjs
node scripts/test-transition-browser.cjs
node scripts/test-bgm-playlist-browser.cjs
node scripts/test-idle-rotation-browser.cjs
node scripts/test-volume-real-browser.cjs
node scripts/test-scroll-encoding.cjs
```

- 브라우저 검사는 격리된 Chrome 프로필과 임시 로컬 서버를 쓴다. 실제 운영 데이터에는 접근하지 않는다.
- 배포 후 검사: `node scripts/test-project-pwa-browser.cjs https://ssuperwasabi.github.io/swc2026-world-finals-lucky-draw/app/`
  - 별도 Chrome 프로필에서 PWA 식별자, 캐시, 빈 행사, 원본·APAC 앱 저장 값 보존, 오프라인 재실행, 영상 Range 응답을 확인한다.

## 문서
- [인수인계(월드 결선)](handoff.md)
- [작업 일지(월드 결선)](WORKLOG.md)
- [APAC 작업 이력 보존본](docs/apac/): handoff, WORKLOG, README
- [OAP 명세](docs/oap-spec/): 현재 APAC 값. 월드 결선 값으로 다시 뽑으면 갱신한다.
