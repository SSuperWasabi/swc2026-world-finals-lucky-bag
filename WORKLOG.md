# 작업 일지 (월드 결선)

APAC 작업 일지는 [docs/apac/WORKLOG-apac.md](docs/apac/WORKLOG-apac.md)에 있다.

## 2026-11-03 — 템플릿 제작 방식 결정

- **사용자 결정:** APAC과 모든 것을 똑같이 만들고 템플릿만 월드 파이널 버전으로 바꾼다. (나) APAC iPad 템플릿(선택 v8·오픈 v3·당첨 v5) 구조를 유지하고 소재만 교체한다. Astra로 새로 만들지 않는다.
- APAC 템플릿은 소환서 이미지 연결을 바꿔 둔 APAC 작업 사본에서 복사해 온다(원래 원본은 수정 금지 폴더를 불러옴).
- handoff 4절(다음 단계)·5절(결정·가져올 파일·화면별 교체 계획)·6절(첫 메시지 예) 갱신. 앱 변경 없음.

## 2026-10-30 — 월드 결선 앱 분리 (swc-wf-v1)

- **사용자 결정:** 기능·설정·관리자 화면은 그대로 두고, OAP 미디어 템플릿만 월드 결선 버전으로 바꾼다. 별도 저장소·작업 폴더로 분리한다.
- **복제:** APAC 저장소 main `fd317e9`(앱 v30)를 전체 이력째 복제했다.
  - 원격 `origin`은 새 저장소다.
  - `apac`은 가져오기 전용(푸시 주소 막음)이다.
- **이름 분리:** 저장 키, 미디어 DB, 캐시, PWA id, 앱 이름, 비교용 과거 화면 이름을 월드 결선용으로 바꿨다. 버전은 `swc-wf-v1`부터 시작한다.
- **격리 테스트 보강:** 원본 Figure Draw에 더해 APAC 앱의 저장 값·캐시도 그대로인지 검사한다.
- **문서:**
  - APAC handoff·WORKLOG·README는 `docs/apac/`로 옮겨 보관했다.
  - 새 handoff(0절 작업 규칙, 1절 분리 기준, 2절 AE 정리 규칙, 3절 교체 진행 표), README, CLAUDE.md를 썼다.
- **AE 폴더:** `resource/oap/`에 `ae-original`(사용자가 원본을 넣음), `ae-work`, `upload-ready`, `mockups`, `apac-ref-scripts`(APAC AE 스크립트 사본)를 만들었다.
- OAP 자산은 아직 APAC 그대로다.
- **배포:** 사용자 승인으로 공개 저장소를 만들고 main에 푸시(`34ec295`), Pages 켬(legacy, main, `/`). 첫 빌드 30초. 배포 주소 PWA 검사 통과(식별자·캐시·빈 행사·원본·APAC 저장 값 보존·오프라인·Range 206).
- **AE 원본 도착·목록 확인(읽기만):** `swc2026_oap.aep`(방송 OAP 수집본) + 소스 1.15GB, zip은 같은 수집본. **iPad 앱 전용 템플릿(CHOOSE·OPEN·WIN iPad)은 없다.** 받을지, APAC 템플릿 구조에 월드 결선 소재를 입힐지 사용자 결정 대기(handoff 5절).
- **새 세션 인계:** handoff 4절(현재 상태)·5절(AE 원본 목록)·6절(VS Code 새 세션 시작 방법) 작성.
