// 인플레이션(물가) 계산 — 한국 소비자물가지수(CPI, 2020=100) 근사값.
// ⚠️ 대략적인 참고용 값입니다. 실제 지수와 다소 차이날 수 있어요.

export const CURRENT_YEAR = 2026;

// 연도 → CPI (2020=100 기준, 근사)
export const CPI: Record<number, number> = {
  1975: 11.3,
  1980: 25.3,
  1985: 34.2,
  1990: 44.1,
  1995: 58.0,
  2000: 67.6,
  2005: 76.1,
  2010: 87.7,
  2015: 94.9,
  2020: 100.0,
  2026: 118.5,
};

export const PAST_YEARS = [1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020];

export type InflationResult = {
  value: number; // 변환된 금액
  multiple: number; // 배수
  totalPct: number; // 누적 물가상승률(%)
  annualPct: number; // 연평균 물가상승률(%)
};

// 그때(fromYear) amount원의 "지금" 가치
export function toNow(amount: number, fromYear: number): InflationResult {
  const then = CPI[fromYear] ?? CPI[CURRENT_YEAR];
  const now = CPI[CURRENT_YEAR];
  const multiple = now / then;
  const years = Math.max(1, CURRENT_YEAR - fromYear);
  return {
    value: Math.round(amount * multiple),
    multiple,
    totalPct: (multiple - 1) * 100,
    annualPct: (Math.pow(multiple, 1 / years) - 1) * 100,
  };
}

// 지금 amount원의 "그때(toYear)" 가치(구매력)
export function toPast(amount: number, toYear: number): InflationResult {
  const then = CPI[toYear] ?? CPI[CURRENT_YEAR];
  const now = CPI[CURRENT_YEAR];
  const multiple = then / now;
  const years = Math.max(1, CURRENT_YEAR - toYear);
  return {
    value: Math.round(amount * multiple),
    multiple,
    totalPct: (multiple - 1) * 100,
    annualPct: (Math.pow(now / then, 1 / years) - 1) * 100,
  };
}
