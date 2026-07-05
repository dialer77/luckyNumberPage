// 대략적인 한국 연봉 실수령액 계산 (2026 기준 근사).
// ⚠️ 세액공제 등 세부는 생략한 근사치라 실제보다 세금이 약간 많게 나올 수 있습니다.
// 부양가족 없이 본인 1인, 일반적인 경우를 가정합니다.

// 4대보험 근로자 부담 합계 근사(국민연금 4.5 + 건강 3.545 + 장기요양 + 고용 ≈ 9.4%)
const INSURANCE_RATE = 0.094;

// 근로소득공제 (총급여 구간별)
function earnedIncomeDeduction(gross: number): number {
  if (gross <= 5_000_000) return gross * 0.7;
  if (gross <= 15_000_000) return 3_500_000 + (gross - 5_000_000) * 0.4;
  if (gross <= 45_000_000) return 7_500_000 + (gross - 15_000_000) * 0.15;
  if (gross <= 100_000_000) return 12_000_000 + (gross - 45_000_000) * 0.05;
  return 14_750_000 + (gross - 100_000_000) * 0.02;
}

// 종합소득세 누진세율 (과세표준 → 산출세액). 누진공제 방식.
const BRACKETS = [
  { upto: 14_000_000, rate: 0.06, deduct: 0 },
  { upto: 50_000_000, rate: 0.15, deduct: 1_260_000 },
  { upto: 88_000_000, rate: 0.24, deduct: 5_760_000 },
  { upto: 150_000_000, rate: 0.35, deduct: 15_440_000 },
  { upto: 300_000_000, rate: 0.38, deduct: 19_940_000 },
  { upto: 500_000_000, rate: 0.4, deduct: 25_940_000 },
  { upto: 1_000_000_000, rate: 0.42, deduct: 35_940_000 },
  { upto: Infinity, rate: 0.45, deduct: 65_940_000 },
];

function incomeTax(base: number): { tax: number; rate: number } {
  if (base <= 0) return { tax: 0, rate: 0 };
  const b = BRACKETS.find((x) => base <= x.upto)!;
  return { tax: Math.max(0, base * b.rate - b.deduct), rate: b.rate };
}

// 근로소득세액공제 (산출세액을 줄여줌) — 총급여별 한도 근사
function taxCredit(computedTax: number, gross: number): number {
  const credit =
    computedTax <= 1_300_000
      ? computedTax * 0.55
      : 715_000 + (computedTax - 1_300_000) * 0.3;
  let cap: number;
  if (gross <= 33_000_000) cap = 740_000;
  else if (gross <= 70_000_000)
    cap = Math.max(660_000, 740_000 - (gross - 33_000_000) * 0.008);
  else if (gross <= 120_000_000)
    cap = Math.max(500_000, 660_000 - (gross - 70_000_000) * 0.5);
  else cap = Math.max(200_000, 500_000 - (gross - 120_000_000) * 0.5);
  return Math.min(credit, cap);
}

export type TakeHome = {
  gross: number; // 연 세전
  insurance: number; // 4대보험(연)
  incomeTax: number; // 소득세(연)
  localTax: number; // 지방소득세(연)
  net: number; // 연 실수령
  monthlyGross: number;
  monthlyNet: number;
  topRate: number; // 적용 세율 구간(과세표준 기준)
};

// monthlyNonTaxable: 월 비과세액(식대 등). 과세·4대보험 산정에서 제외되고
// 실수령에는 그대로 포함됨. 기본 20만원(대표적 식대 비과세).
export function calcTakeHome(gross: number, monthlyNonTaxable = 200_000): TakeHome {
  const g = Math.max(0, gross);
  const taxable = Math.max(0, g - Math.max(0, monthlyNonTaxable) * 12);
  const insurance = Math.round(taxable * INSURANCE_RATE);
  const base = Math.max(0, taxable - earnedIncomeDeduction(taxable) - 1_500_000); // 본인 기본공제 150만
  const { tax, rate } = incomeTax(base);
  const incomeTaxV = Math.round(Math.max(0, tax - taxCredit(tax, taxable)));
  const localTax = Math.round(incomeTaxV * 0.1);
  const net = g - insurance - incomeTaxV - localTax;
  return {
    gross: g,
    insurance,
    incomeTax: incomeTaxV,
    localTax,
    net,
    monthlyGross: Math.round(g / 12),
    monthlyNet: Math.round(net / 12),
    topRate: rate,
  };
}
