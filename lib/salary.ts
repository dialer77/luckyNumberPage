// 대략적인 한국 연봉 실수령액 계산 (2026 기준 근사).
// ⚠️ 세액공제 등 세부는 생략한 근사치라 실제보다 세금이 약간 많게 나올 수 있습니다.
// 부양가족 없이 본인 1인, 일반적인 경우를 가정합니다.
// 페이지의 예시·표·FAQ 숫자도 이 함수로 계산하므로, 요율이 바뀌면 여기만 고치면 됩니다.

// 4대보험 근로자 부담 요율 (2026년). 해마다 1월에 확인해 갱신할 것.
//   국민연금 9.5%의 절반 4.75% — 기준소득월액 상한 659만원(2026.7~)
//   건강보험 7.19%의 절반 3.595%
//   장기요양 = 건강보험료 × 13.14% (소득 대비 0.9448%의 절반)
//   고용보험(실업급여) 0.9%
export const INSURANCE_2026 = {
  pension: 0.0475,
  pensionMonthlyCap: 6_590_000,
  health: 0.03595,
  longTermCareOfHealth: 0.1314,
  employment: 0.009,
} as const;

function insuranceOf(taxableAnnual: number) {
  const r = INSURANCE_2026;
  const monthly = taxableAnnual / 12;
  const pension = Math.round(Math.min(monthly, r.pensionMonthlyCap) * r.pension * 12);
  const health = Math.round(monthly * r.health * 12);
  const longTermCare = Math.round(monthly * r.health * r.longTermCareOfHealth * 12);
  const employment = Math.round(monthly * r.employment * 12);
  return { pension, health, longTermCare, employment, total: pension + health + longTermCare + employment };
}

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

/** 종합소득세 기본세율로 구한 산출세액. 퇴직소득세(lib/severance.ts)도 이 함수를 쓴다. */
export function basicIncomeTax(base: number): number {
  return incomeTax(base).tax;
}

function incomeTax(base: number): { tax: number; rate: number } {
  if (base <= 0) return { tax: 0, rate: 0 };
  const b = BRACKETS.find((x) => base <= x.upto)!;
  return { tax: Math.max(0, base * b.rate - b.deduct), rate: b.rate };
}

// 근로소득세액공제 (산출세액을 줄여줌) — 총급여별 한도 근사
function taxCredit(computedTax: number, gross: number): { credit: number; raw: number; cap: number } {
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
  return { credit: Math.min(credit, cap), raw: credit, cap };
}

export type TakeHome = {
  gross: number; // 연 세전
  insurance: number; // 4대보험(연) 합계
  insuranceDetail: { pension: number; health: number; longTermCare: number; employment: number };
  taxable: number; // 과세 급여(연봉 − 비과세)
  earnedDeduction: number; // 근로소득공제
  taxBase: number; // 과세표준
  computedTax: number; // 산출세액
  creditRaw: number; // 근로소득세액공제(한도 적용 전)
  creditCap: number; // 근로소득세액공제 한도
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
  const ins = insuranceOf(taxable);
  const insurance = ins.total;
  const earnedDeduction = earnedIncomeDeduction(taxable);
  const base = Math.max(0, taxable - earnedDeduction - 1_500_000); // 본인 기본공제 150만
  const { tax, rate } = incomeTax(base);
  const tc = taxCredit(tax, taxable);
  const incomeTaxV = Math.round(Math.max(0, tax - tc.credit));
  const localTax = Math.round(incomeTaxV * 0.1);
  const net = g - insurance - incomeTaxV - localTax;
  return {
    gross: g,
    insurance,
    insuranceDetail: {
      pension: ins.pension,
      health: ins.health,
      longTermCare: ins.longTermCare,
      employment: ins.employment,
    },
    taxable,
    earnedDeduction: Math.round(earnedDeduction),
    taxBase: Math.round(base),
    computedTax: Math.round(tax),
    creditRaw: Math.round(tc.raw),
    creditCap: Math.round(tc.cap),
    incomeTax: incomeTaxV,
    localTax,
    net,
    monthlyGross: Math.round(g / 12),
    monthlyNet: Math.round(net / 12),
    topRate: rate,
  };
}

/** 원 단위까지 읽기 쉽게: 42,032,550 → "4,203만 2,550원", 120,000,000 → "1억 2,000만원" */
export function wonFull(n: number): string {
  const v = Math.round(Math.abs(n));
  const sign = n < 0 ? "−" : "";
  const eok = Math.floor(v / 100_000_000);
  const man = Math.floor((v % 100_000_000) / 10_000);
  const rest = v % 10_000;
  const parts: string[] = [];
  if (eok) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man) parts.push(`${man.toLocaleString("ko-KR")}만`);
  if (rest) parts.push(rest.toLocaleString("ko-KR"));
  if (parts.length === 0) return "0원";
  return `${sign}${parts.join(" ")}원`;
}

/** 소득세율 구간(과세표준 기준)이 처음 rate 이상이 되는 연봉(만원 단위 반올림) */
export function salaryWhereRateStarts(rate: number, monthlyNonTaxable = 200_000): number {
  let lo = 0;
  let hi = 2_000_000_000;
  if (calcTakeHome(hi, monthlyNonTaxable).topRate < rate) return NaN;
  while (hi - lo > 1_000) {
    const mid = Math.floor((lo + hi) / 2);
    if (calcTakeHome(mid, monthlyNonTaxable).topRate >= rate) hi = mid;
    else lo = mid;
  }
  return Math.round(hi / 10_000) * 10_000;
}
