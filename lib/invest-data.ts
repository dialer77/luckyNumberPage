// "그때샀으면" 투자 시뮬레이터 데이터.
//
// ⚠️ 지금은 대략적인 "예시 시세"입니다 (연도별 어림값).
// 실제 배포 시 야후 파이낸스 등 무료 소스로 과거 종가를 채우면 됩니다.
// 화면은 이 파일의 함수만 쓰므로 데이터 출처가 바뀌어도 UI는 그대로.
//
// 계산엔 "지금값 ÷ 그때값" 비율만 쓰기 때문에, 자산별 통화(원/달러)가
// 달라도 상관없습니다. (비율은 통화가 상쇄됨)

export const CURRENT_YEAR = 2026;
export const PAST_YEARS = [2015, 2018, 2020, 2021, 2023];

export type Asset = {
  key: string;
  name: string;
  emoji: string;
  prices: Record<number, number>; // 연도 → 대략 가격
};

// 연도별 대략 가격(예시). 2026 = 현재값.
export const ASSETS: Asset[] = [
  {
    key: "samsung",
    name: "삼성전자",
    emoji: "📱",
    prices: { 2015: 26000, 2018: 45000, 2020: 55000, 2021: 80000, 2023: 68000, 2026: 92000 },
  },
  {
    key: "apple",
    name: "애플",
    emoji: "🍎",
    prices: { 2015: 27, 2018: 42, 2020: 75, 2021: 130, 2023: 130, 2026: 255 },
  },
  {
    key: "tesla",
    name: "테슬라",
    emoji: "🚗",
    prices: { 2015: 15, 2018: 21, 2020: 90, 2021: 250, 2023: 240, 2026: 430 },
  },
  {
    key: "nvidia",
    name: "엔비디아",
    emoji: "🎮",
    prices: { 2015: 7, 2018: 40, 2020: 130, 2021: 300, 2023: 490, 2026: 1350 },
  },
  {
    key: "bitcoin",
    name: "비트코인",
    emoji: "₿",
    prices: { 2015: 300, 2018: 7000, 2020: 9000, 2021: 47000, 2023: 30000, 2026: 105000 },
  },
  {
    key: "ethereum",
    name: "이더리움",
    emoji: "💎",
    prices: { 2015: 1, 2018: 250, 2020: 200, 2021: 3700, 2023: 1900, 2026: 4200 },
  },
  {
    key: "gold",
    name: "금",
    emoji: "🪙",
    prices: { 2015: 1100, 2018: 1300, 2020: 1900, 2021: 1800, 2023: 1950, 2026: 2650 },
  },
];

export function getAsset(key: string): Asset | undefined {
  return ASSETS.find((a) => a.key === key);
}

// 그때(fromYear) amount원을 넣었으면 지금 얼마인지 계산.
export function simulateInvest(
  asset: Asset,
  fromYear: number,
  amount: number
): { nowValue: number; profit: number; multiple: number } {
  const then = asset.prices[fromYear];
  const now = asset.prices[CURRENT_YEAR];
  const multiple = now / then;
  const nowValue = Math.round(amount * multiple);
  return { nowValue, profit: nowValue - amount, multiple };
}
