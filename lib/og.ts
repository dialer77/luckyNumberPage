// OG(공유 카드) 이미지에서 한글을 렌더링하려면 한글 폰트 데이터가 필요합니다.
// (기본 폰트는 라틴 문자만 지원 → 한글이 □□□ 로 깨짐)
//
// Google Fonts에서 "필요한 글자만" 부분추출(subset)해 받아옵니다.
// text 파라미터에 실제 사용할 글자를 넘기면 그 글자만 담긴 작은 폰트를 줍니다.
//
// ⚠️ Windows XP(NT 5.1) User-Agent를 쓰는 이유:
//   최신 UA로 요청하면 woff2를 주는데, 이미지 생성기(satori)는 woff2를
//   못 읽습니다. 구형 UA로 요청하면 ttf를 주기 때문에 이렇게 합니다.
export async function loadKoreanFont(text: string): Promise<ArrayBuffer> {
  const url =
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=" +
    encodeURIComponent(text);

  const css = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 5.1)" },
  }).then((r) => r.text());

  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error("폰트 URL을 찾지 못했습니다.");

  return fetch(match[1]).then((r) => r.arrayBuffer());
}
