# v12 — 마지막 확정 디자인을 적용한 동적 PNG OG

## OG 카드에 표시되는 동적 정보
- 우승 음식명
- 베스트 메뉴 TOP 3
- 오늘 추천 메뉴 3개

그 외 취향 수치나 인사이트는 OG 카드에 넣지 않습니다.

## 디자인 템플릿
`public/assets/og/og-result-background-template.png`

마지막으로 확정한:
- 큰 우승 음식 영역
- BEST MENU 한 줄
- 오늘 추천 메뉴 한 줄
형태의 디자인을 1200×630으로 넣었습니다.

## 배포 방식
이 버전은 Cloudflare **Workers + Static Assets** 방식입니다.

GitHub 저장소에 이 폴더 전체를 올린 뒤:

- 빌드 명령: 비워두기
- 배포 명령: `npx wrangler deploy`

또는:
```bash
npm install
npm run deploy
```

## 동작
- `/result/{token}` → 개인별 OG 메타 HTML
- `/og/{token}.png` → 마지막 확정 디자인에 결과 문구를 입힌 1200×630 PNG

## Images binding
`wrangler.jsonc`에 `IMAGES` binding 설정이 포함되어 있습니다.
Cloudflare Images text rasterization을 이용해 한글 결과 텍스트를 템플릿 위에 그립니다.

## 배포 후 확인
1. 월드컵 완료
2. 결과 공유 → 결과 링크 복사
3. `/result/{token}` 열기
4. HTML의 `og:image` 주소 확인
5. `/og/{token}.png`를 직접 열어 PNG 확인
6. 카카오톡에 새 결과 링크 공유

같은 링크로 테스트한 적이 있다면 카카오 메타 캐시를 초기화해야 할 수 있습니다.
