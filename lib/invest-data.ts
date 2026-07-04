// "그때 그랬다면" 투자 시뮬레이터 데이터.
//
// ⚠️ 지금은 대략적인 "예시 시세"입니다 (연도별 어림값).
// 실제 배포 시 CoinGecko(코인)·stooq(주식) 등 무료 소스로 과거 시세를
// 채우고 Upstash에 캐시하면 됩니다. 화면은 이 파일의 함수만 쓰므로
// 데이터 출처가 바뀌어도 UI는 그대로.
//
// 계산엔 "지금값 ÷ 그때값" 비율만 쓰기 때문에 자산별 통화(원/달러)가
// 달라도 상관없습니다.

export const CURRENT_YEAR = 2026;
export const PAST_YEARS = [2015, 2018, 2020, 2021, 2023];

export type AssetCategory = "stock" | "coin" | "gold" | "dividend";

export type Asset = {
  key: string;
  name: string;
  emoji: string;
  category: AssetCategory;
  prices: Record<number, number>; // 연도 → 대략 가격 (2026 = 현재값)
  dividendYield?: number; // 배당주만: 연 배당수익률(%) 예시
};

export const CATEGORIES: { key: AssetCategory; name: string; emoji: string }[] = [
  { key: "stock", name: "주식", emoji: "📈" },
  { key: "coin", name: "코인", emoji: "₿" },
  { key: "gold", name: "금", emoji: "🪙" },
  { key: "dividend", name: "배당주", emoji: "💰" },
];

export const ASSETS: Asset[] = [
  // ── 주식 ──
  { key: "samsung", name: "삼성전자", emoji: "📱", category: "stock", prices: { 2015: 26000, 2018: 45000, 2020: 55000, 2021: 80000, 2023: 68000, 2026: 92000 } },
  { key: "apple", name: "애플", emoji: "🍎", category: "stock", prices: { 2015: 27, 2018: 42, 2020: 75, 2021: 130, 2023: 130, 2026: 255 } },
  { key: "tesla", name: "테슬라", emoji: "🚗", category: "stock", prices: { 2015: 15, 2018: 21, 2020: 90, 2021: 250, 2023: 240, 2026: 430 } },
  { key: "nvidia", name: "엔비디아", emoji: "🎮", category: "stock", prices: { 2015: 7, 2018: 40, 2020: 130, 2021: 300, 2023: 490, 2026: 1350 } },
  // ── 코인 ──
  { key: "bitcoin", name: "비트코인", emoji: "₿", category: "coin", prices: { 2015: 300, 2018: 7000, 2020: 9000, 2021: 47000, 2023: 30000, 2026: 105000 } },
  { key: "ethereum", name: "이더리움", emoji: "💎", category: "coin", prices: { 2015: 1, 2018: 250, 2020: 200, 2021: 3700, 2023: 1900, 2026: 4200 } },
  // ── 금 ──
  { key: "gold", name: "금", emoji: "🪙", category: "gold", prices: { 2015: 1100, 2018: 1300, 2020: 1900, 2021: 1800, 2023: 1950, 2026: 2650 } },
  // ── 배당주 (dividendYield = 연 배당수익률 예시) ──
  { key: "realty", name: "리얼티인컴", emoji: "🏢", category: "dividend", dividendYield: 5.2, prices: { 2015: 48, 2018: 55, 2020: 62, 2021: 68, 2023: 58, 2026: 64 } },
  { key: "cocacola", name: "코카콜라", emoji: "🥤", category: "dividend", dividendYield: 3.0, prices: { 2015: 42, 2018: 47, 2020: 53, 2021: 55, 2023: 60, 2026: 70 } },
  { key: "sktelecom", name: "SK텔레콤", emoji: "📡", category: "dividend", dividendYield: 6.5, prices: { 2015: 44000, 2018: 47000, 2020: 45000, 2021: 55000, 2023: 50000, 2026: 58000 } },
  { key: "ktng", name: "KT&G", emoji: "🚬", category: "dividend", dividendYield: 5.5, prices: { 2015: 82000, 2018: 100000, 2020: 84000, 2021: 82000, 2023: 88000, 2026: 105000 } },
];

export function getAsset(key: string): Asset | undefined {
  return ASSETS.find((a) => a.key === key);
}

export function assetsByCategory(cat: AssetCategory): Asset[] {
  return ASSETS.filter((a) => a.category === cat);
}

// 특정 소수 연도(예: 2019.5)의 가격을 선형 보간으로 추정 (DCA용).
function priceAtYear(asset: Asset, y: number): number {
  const years = Object.keys(asset.prices)
    .map(Number)
    .sort((a, b) => a - b);
  if (y <= years[0]) return asset.prices[years[0]];
  if (y >= years[years.length - 1]) return asset.prices[years[years.length - 1]];
  for (let i = 0; i < years.length - 1; i++) {
    const y0 = years[i];
    const y1 = years[i + 1];
    if (y >= y0 && y <= y1) {
      const t = (y - y0) / (y1 - y0);
      return asset.prices[y0] + (asset.prices[y1] - asset.prices[y0]) * t;
    }
  }
  return asset.prices[years[years.length - 1]];
}

// ── 일시불: 그때 amount원을 넣었으면 지금 얼마 ──
export function simulateInvest(
  asset: Asset,
  fromYear: number,
  amount: number
): { nowValue: number; profit: number; multiple: number } {
  const then = asset.prices[fromYear] ?? priceAtYear(asset, fromYear);
  const now = asset.prices[CURRENT_YEAR];
  const multiple = now / then;
  const nowValue = Math.round(amount * multiple);
  return { nowValue, profit: nowValue - amount, multiple };
}

// ── 배당 재투자(DRIP) 포함: 시세차익 + 배당 복리 (근사) ──
export function simulateWithDividend(
  asset: Asset,
  fromYear: number,
  amount: number
): { priceValue: number; dividendBonus: number; totalValue: number; profit: number } {
  const base = simulateInvest(asset, fromYear, amount);
  const years = CURRENT_YEAR - fromYear;
  const dy = (asset.dividendYield ?? 0) / 100;
  // 시세가치 위에 배당수익률만큼 매년 복리 재투자된다고 근사
  const totalValue = Math.round(base.nowValue * Math.pow(1 + dy, years));
  return {
    priceValue: base.nowValue,
    dividendBonus: totalValue - base.nowValue,
    totalValue,
    profit: totalValue - amount,
  };
}

// ── 적립식(DCA): startYear부터 weeks주 동안 매주 weeklyAmount원씩 ──
export function simulateDCA(
  asset: Asset,
  startYear: number,
  weeklyAmount: number,
  weeks: number
): { invested: number; nowValue: number; profit: number; boughtWeeks: number } {
  let shares = 0;
  let invested = 0;
  let boughtWeeks = 0;
  for (let w = 0; w < weeks; w++) {
    const y = startYear + w / 52;
    if (y >= CURRENT_YEAR) break; // 미래 구간은 스킵
    const p = priceAtYear(asset, y);
    shares += weeklyAmount / p;
    invested += weeklyAmount;
    boughtWeeks++;
  }
  const nowValue = Math.round(shares * asset.prices[CURRENT_YEAR]);
  return { invested, nowValue, profit: nowValue - invested, boughtWeeks };
}
