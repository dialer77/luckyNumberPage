// 로또 추첨 일정 — 서버·클라이언트 공용 순수 함수.
//
// 제1회 추첨은 2002-12-07(토) 20:35 KST(= 11:35 UTC)이고, 그 뒤로 매주 토요일
// 같은 시각에 한 주도 빠짐없이 열렸다(1~1249회 데이터로 확인). 한국은 서머타임이
// 없어서 UTC 기준 7일 간격으로 계산하면 된다.

export const FIRST_DRAW_UTC = Date.UTC(2002, 11, 7, 11, 35);
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** n회차 추첨 시각(ms, epoch) */
export function drawTime(n: number): number {
  return FIRST_DRAW_UTC + (n - 1) * WEEK_MS;
}

/** 지금 시각 기준으로 추첨이 이미 끝났어야 하는 가장 최근 회차 번호 */
export function expectedLatestNo(now: number = Date.now()): number {
  return Math.floor((now - FIRST_DRAW_UTC) / WEEK_MS) + 1;
}
