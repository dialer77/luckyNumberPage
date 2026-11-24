// 퇴직금(근사)과 퇴직소득세(추정) 계산.
// 퇴직금 계산기(app/calc/SeveranceCalculator.tsx)와 퇴직금 계산표(/calc/severance-table)가 같은 식을 쓴다.

import { basicIncomeTax } from "./salary";

// ─────────────────────────────────────────────────────────────
// 퇴직금 (근로자퇴직급여 보장법의 법정 퇴직금, 근사)
//   퇴직금 = 1일 평균임금 × 30 × (재직일수 ÷ 365)
//   1일 평균임금 ≈ 월 평균급여 ÷ 30.42  (30.42 ≈ 365 ÷ 12, 한 달 평균 일수)
// 실제 평균임금은 퇴직 전 3개월 임금 총액 ÷ 그 기간 총일수(89~92일)로 구한다.
// ─────────────────────────────────────────────────────────────
export const DAYS_PER_MONTH = 30.42;

export type SeveranceResult = {
  totalDays: number; // 총 재직일수 (반올림 전)
  dailyWage: number; // 1일 평균임금 (반올림 전)
  severance: number; // 예상 퇴직금 (세전, 원 단위 반올림)
};

/** @param monthlyWage 월 평균급여(세전, 상여 포함 환산) */
export function calcSeverance(monthlyWage: number, years: number, months = 0): SeveranceResult {
  const totalDays = years * 365 + months * DAYS_PER_MONTH;
  const dailyWage = monthlyWage / DAYS_PER_MONTH;
  const severance = Math.round((dailyWage * 30 * totalDays) / 365);
  return { totalDays, dailyWage, severance };
}

// ─────────────────────────────────────────────────────────────
// 퇴직소득세 (2023년 1월 1일 이후 퇴직분, 소득세법 제48조·제55조 기준 추정)
//   1) 근속연수공제        — 근속연수(1년 미만 끝수는 1년)에 따라
//   2) 환산급여           = (퇴직소득 − 근속연수공제) × 12 ÷ 근속연수
//   3) 환산급여공제        — 환산급여 구간에 따라
//   4) 과세표준           = 환산급여 − 환산급여공제
//   5) 환산산출세액        = 과세표준 × 기본세율(종합소득세 누진세율)
//   6) 퇴직소득세         = 환산산출세액 × 근속연수 ÷ 12
//   7) 지방소득세         = 퇴직소득세 × 10%
// 검산 예: 퇴직금 1억원·근속 10년 → 퇴직소득세 387만 5,000원 + 지방세 38만 7,500원.
// 중간정산·IRP 이연·임원 한도·비과세 소득은 반영하지 않는다.
// ─────────────────────────────────────────────────────────────

/** 근속연수공제 (2023.1.1 이후 퇴직분) */
export function serviceYearsDeduction(years: number): number {
  const n = Math.ceil(Math.max(0, years));
  if (n <= 5) return 1_000_000 * n;
  if (n <= 10) return 5_000_000 + 2_000_000 * (n - 5);
  if (n <= 20) return 15_000_000 + 2_500_000 * (n - 10);
  return 40_000_000 + 3_000_000 * (n - 20);
}

/** 환산급여공제 */
export function convertedPayDeduction(converted: number): number {
  if (converted <= 8_000_000) return converted;
  if (converted <= 70_000_000) return 8_000_000 + (converted - 8_000_000) * 0.6;
  if (converted <= 100_000_000) return 45_200_000 + (converted - 70_000_000) * 0.55;
  if (converted <= 300_000_000) return 61_700_000 + (converted - 100_000_000) * 0.45;
  return 151_700_000 + (converted - 300_000_000) * 0.35;
}

// 원 미만 버림. 0.1×0.33 같은 소수 곱셈 오차로 3,874,999.9999… 가 되어 1원 덜 나오는 것을 막는다.
const floorWon = (x: number) => Math.floor(x + 1e-6);

export type RetirementTax = {
  serviceDeduction: number; // 근속연수공제
  converted: number; // 환산급여
  convertedDeduction: number; // 환산급여공제
  taxBase: number; // 과세표준
  incomeTax: number; // 퇴직소득세 (원 미만 버림)
  localTax: number; // 지방소득세 (원 미만 버림)
  total: number; // 세금 합계
  net: number; // 세후 퇴직금
};

/** 퇴직소득세 추정. years 는 근속연수(1년 미만 끝수는 올려 1년으로 본다). */
export function calcRetirementTax(severance: number, years: number): RetirementTax {
  const n = Math.ceil(Math.max(0, years));
  if (severance <= 0 || n <= 0) {
    return { serviceDeduction: 0, converted: 0, convertedDeduction: 0, taxBase: 0, incomeTax: 0, localTax: 0, total: 0, net: Math.max(0, severance) };
  }
  const serviceDeduction = Math.min(severance, serviceYearsDeduction(n)); // 공제는 퇴직소득을 넘지 않는다
  const converted = ((severance - serviceDeduction) * 12) / n;
  const convertedDeduction = Math.min(converted, convertedPayDeduction(converted));
  const taxBase = Math.max(0, converted - convertedDeduction);
  const incomeTax = floorWon((basicIncomeTax(taxBase) * n) / 12);
  const localTax = floorWon(incomeTax * 0.1);
  const total = incomeTax + localTax;
  return { serviceDeduction, converted, convertedDeduction, taxBase, incomeTax, localTax, total, net: severance - total };
}
