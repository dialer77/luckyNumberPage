// 적금·예금 이자 계산 (단리, 세전·세후).
// 적금·예금 계산기(app/calc/SavingsCalculator.tsx)와 이자표(/calc/savings-table)가 같은 식을 쓴다.
// 세율이나 식이 바뀌면 여기만 고치면 둘 다 함께 바뀐다.

/** 이자소득세 일반과세 15.4% (소득세 14% + 지방소득세 1.4%) */
export const INTEREST_TAX_RATE = 0.154;

export type SavingsResult = {
  totalIn: number; // 넣은 원금 합계
  interest: number; // 세전 이자 (반올림 전)
  tax: number; // 이자소득세 (반올림 전)
  netInterest: number; // 세후 이자 = 세전 이자 − 세금 (반올림 전)
  net: number; // 세후 만기 수령액 = 원금 + 세후 이자 (반올림 전)
};

function withTax(totalIn: number, interest: number, taxRate: number): SavingsResult {
  const tax = interest * taxRate;
  return { totalIn, interest, tax, netInterest: interest - tax, net: totalIn + interest - tax };
}

/**
 * 정기적금(매월 같은 금액 납입) — 단리 관례.
 * 이자 = 월납입 × 연이율 × n(n+1)/2 ÷ 12  (n = 납입 개월 수)
 * 첫 달 납입분은 n개월, 마지막 달 납입분은 1개월치 이자를 받는다는 뜻.
 * @param annualRate 연이율(소수). 3.5% → 0.035
 */
export function regularSavings(
  monthly: number,
  annualRate: number,
  months: number,
  taxRate = INTEREST_TAX_RATE,
): SavingsResult {
  const totalIn = monthly * months;
  const interest = monthly * annualRate * ((months * (months + 1)) / 2) / 12;
  return withTax(totalIn, interest, taxRate);
}

/**
 * 정기예금(목돈 한 번에 예치) — 단리.
 * 이자 = 원금 × 연이율 × 개월 ÷ 12
 * @param annualRate 연이율(소수). 3.5% → 0.035
 */
export function fixedDeposit(
  principal: number,
  annualRate: number,
  months: number,
  taxRate = INTEREST_TAX_RATE,
): SavingsResult {
  const interest = principal * annualRate * (months / 12);
  return withTax(principal, interest, taxRate);
}
