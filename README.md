# 음식 이상형 월드컵 128강 · 업데이트 버전

## 반영된 변경점
1. 음식 비주얼을 접시/볼/보드 형태의 더 상세한 카드형 일러스트로 개선
2. 카드 전체를 누르면 음식 선택
3. 기존 선택 텍스트 영역을 `음식 설명 보기` 버튼으로 변경
4. 음식 설명은 모달로 표시
5. 최종 우승 결과 화면에서도 음식 설명 모달 확인 가능


## v3 DB correction
- `사시미` removed as a semantic duplicate of `회`.
- Replaced with `장어구이`.
- Round-of-128 bracket regenerated after semantic duplicate audit.


## v4 layout fix
- Fixed invalid nested `<button>` markup.
- Food card is now a clickable `<div role="button">`.
- `음식 설명 보기` remains a real button inside the card.
- Added Enter/Space keyboard selection for accessibility.
