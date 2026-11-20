// 회차 페이지 중 검색 색인을 허용할 범위 — sitemap과 회차 페이지 robots가 같은 기준을 쓴다.
//
// 1,249개 회차 페이지는 같은 틀에 숫자만 다른 페이지라, 전부 색인 대상으로 두면
// "대량으로 찍어 낸 저품질 페이지" 신호가 된다(2026-08 서치콘솔: 대부분
// '발견됨-색인 안 됨', AdSense '가치가 별로 없는 콘텐츠' 반려 3회).
// 그래서 최근 회차와, 데이터 가이드에서 다룬 기록적인 회차만 색인을 허용하고
// 나머지는 noindex,follow 로 둔다. 페이지는 그대로 열리고 링크도 따라간다.

export const RECENT_INDEXED_ROUNDS = 120; // 약 2년 3개월

// 데이터 가이드(lib/guides-data.ts)에서 다룬 기록 회차 — 검색 수요가 따로 있다.
export const NOTABLE_ROUNDS: ReadonlySet<number> = new Set([
  // 1등 1게임당 당첨금 최고 TOP 10
  19, 25, 20, 43, 15, 36, 62, 33, 82, 86,
  // 1등 1게임당 당첨금 최저 TOP 10
  546, 1128, 1019, 381, 312, 292, 196, 757, 745, 21,
  // 1등 당첨자 최다 TOP 10 (위와 겹치는 회차 제외)
  1162, 1152, 1233, 1192, 1060, 1194, 1041,
  // 1등이 나오지 않은 회차 + 역대 최고 판매액(10회)
  1, 4, 5, 7, 8, 9, 10, 13, 18, 24, 41, 71, 289, 295, 463,
]);

export function isRoundIndexable(drwNo: number, latestNo: number): boolean {
  return drwNo > latestNo - RECENT_INDEXED_ROUNDS || NOTABLE_ROUNDS.has(drwNo);
}
