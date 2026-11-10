# handoff — 럭키백 뽑기 앱 인수인계

## 1. 현재 상태 (2026-11-10)
- 버전 `swc-lb-v22`. 화면 1(메인)·3(수량 선택)·4(선택 오픈·결과)까지 연출 완료.
- 화면 흐름: 1 메인 루프 → 2 전환 → 3 수량 선택 → 4 선택 오픈(TAP TO OPEN) → 결과([지급 완료]/[다음 묶음], 관리자 "결과 확인" 끄면 탭·7초 자동) → 1.
- 테스트: 규칙·저장 32개, 브라우저 흐름 19개 통과.
- main에 커밋(11-10). 푸시는 Jason 승인 뒤. 원격 `origin` = SSuperWasabi/swc2026-world-finals-lucky-bag(비공개).
- Pages: 비공개 저장소라 아직 없음 → iPad 주소는 Cloudflare 터널 또는 공개 전환 중 결정 필요.
- 미리보기(녹화 영상): https://claude.ai/artifact/K6qMa6DudD61GNDyfJvX76

## 2. 일정
| 날짜 | 할 일 |
| --- | --- |
| 11/9 | 기능 빌드 |
| 11/10 | iPad QA, 카드 연출(레퍼런스 효과) 1차 |
| 11/11 | 최종 스탠바이 |
| 11/13 | 현장 리허설 |
| 11/14 | 행사 |

## 3. 구조와 결정
- 결과는 **구매 시작 순간 수량 전체를 한 번에** 정해 재고를 줄이고 기록한다(Jason 승인 11-09). 화면은 그 결과를 묶음별로 열어 보여 줄 뿐이라 새로 고침해도 같은 결과·같은 위치로 이어진다.
- 설정 3개(관리자 → 설정): 추첨 단위(한 개씩/한꺼번에 최대 3장), 공개 방식(한 장씩/동시에), 중복 줄이기(켜기/끄기). 기본값 한꺼번에·한 장씩·켜기. 진행 중 구매는 시작할 때 설정 그대로 끝난다.
- 저장: localStorage 키 `swc2026-world-finals-lucky-bag.state.v1` 하나에 전체 상태.
- 관리자 기록에서 구매 [취소] → 재고 복원, 기록은 "취소"로 남김. 재고 수정은 전·후를 기록.
- 백업은 JSON 파일(iPad는 공유 시트).
- `reveal.js`의 `enter / flip / show` 약속만 지키면 연출을 통째로 바꿀 수 있다. 애니메이션이 멈춰도 앱이 잠기지 않게 시간 제한이 들어 있다.

## 4. 남은 일
1. iPad 실기기 확인: 소리(럼블·휙·쾅), 영상 여러 개 동시 재생, 유리 버튼 흐림 효과, 전체 속도.
2. iPad 배포 주소: 비공개 저장소 Pages가 안 되면 Cloudflare 터널, 최종은 공개 Pages 검토.
3. 3번 수량 선택 화면 배경 루프는 움직임이 약함(OAP 원본도 배경만 루프). 금가루·빛 훑기를 얹어 둠. 필요하면 AE에서 다시 렌더.
4. 영상 규격: 1536×2048 영상은 H.264 레벨 5.1로 인코딩됨(CLAUDE.md의 "4.2 이하"와 다름). iPad Pro에서 재생 확인 필요.

## 5. 소재
- 시안: `Resource/mockups/screens-1109/`(원본), `screens-1109-m/`(폰용 경량판).
- 카드 원본: `Resource/card-design/gen/`(힉스필드 GPT Image 2.6).
- 앱 소재: `app/assets/lb/`(카드 800px, SD 700px 높이).
- 4번 화면 영상: `app/assets/main/draw-bg-loop.mp4`(OAP WF_BG 루프), `emblem-loop.mp4`(OAP WF LOGO, 흰 바탕 → 곱하기 합성). AE 컴포지션 `LB_04_BG`, `LB_04_Emblem`(`Resource/ae-work/lucky-bag-work.aep`).
- 카드 앞면: `scripts/compose-card-fronts.py`가 카드 그림 + 캐릭터 루프 영상을 합쳐 `card-front-{a,b,c}-loop.mp4`를 만든다. 캐릭터 배율·회전·위치(PLACE)는 Jason 가시안 실측값, 방패 안쪽 창은 카드 그림에서 자동으로 딴다.
- 받침대 소환진 `pedestal.webp`: Summonhenge 원화의 원판을 이미지 모델(GPT Image 2.6)로 분리·보라 보정. 원본은 `Resource/footage-src/`.
- 등급 엠블럼 `grade-A~C.png`: 월드 결선 럭키드로우 앱의 OAP 방패+알파벳 에셋.
- 뒤집기 레퍼런스: `Resource/reference/card flipping animation reference.mp4`. 회전 0.19초 · 옆면 빛기둥 0.30초 · 휙 0.07초(`reveal.js`의 T).
