// 고배당 ETF 배당 재투자 계산기 로직.
//
// 실제 주가 데이터를 쓰지 않고, 파라미터(배당율·납입·기간)만으로
// "배당을 재투자하면 얼마가 되는가"를 계산합니다.
// → 배당 데이터를 구하기 어려운 문제를 우회하면서, 사람들이 실제로
//   궁금해하는 "고배당 ETF에 이렇게 넣으면?"에 답하는 방식.
//
// ⚠️ 배당율은 대략적인 예시값입니다. 주가 변동(시세차익/손실)은 제외하고
//    배당과 그 재투자(복리)만 반영한 단순 모델입니다.

export type DividendEtf = {
  key: string;
  name: string;
  yield: number; // 연 배당수익률 (%) 예시
};

export const DIVIDEND_ETFS: DividendEtf[] = [
  { key: "schd", name: "SCHD · 미국 배당성장", yield: 3.5 },
  { key: "jepi", name: "JEPI · 커버드콜", yield: 7.5 },
  { key: "o", name: "리얼티인컴(O) · 리츠", yield: 5.2 },
  { key: "tigerreit", name: "TIGER 리츠부동산", yield: 6.0 },
  { key: "kodex", name: "KODEX 고배당", yield: 5.0 },
  { key: "arirang", name: "ARIRANG 고배당주", yield: 6.5 },
];

// 주기 → 1년에 몇 번인지
export type Freq = "monthly" | "quarterly" | "yearly";
export const FREQ_PER_YEAR: Record<Freq, number> = {
  monthly: 12,
  quarterly: 4,
  yearly: 1,
};
export const FREQ_LABEL: Record<Freq, string> = {
  monthly: "매월",
  quarterly: "매분기",
  yearly: "매년",
};

export type DividendInput = {
  initial: number; // 시작 금액
  contribution: number; // 추가 납입 1회 금액
  contributionFreq: Freq; // 추가 납입 주기
  dividendYield: number; // 연 배당수익률 %
  payoutFreq: Freq; // 배당 지급 주기
  years: number; // 보유 기간(년)
  reinvest: boolean; // 배당 재투자 여부
};

export type DividendResult = {
  totalContribution: number; // 총 납입금(시작금 포함)
  finalValue: number; // 최종 평가금액
  totalDividend: number; // 총 받은 배당금
  lastYearDividend: number; // 마지막 해 예상 연 배당
};

// ── 목표 배당 역산 ──
// 월 target원의 배당을 받으려면 필요한 투자 원금 (= 연배당/배당율)
export function requiredPrincipal(targetMonthly: number, yieldPct: number): number {
  if (yieldPct <= 0) return 0;
  return Math.round((targetMonthly * 12) / (yieldPct / 100));
}

// 시작금액 + 매월 납입(+배당 재투자)으로 목표에 도달하기까지 걸리는 개월 수.
// 100년 내 도달 못 하면 null.
export function monthsToTarget(
  initial: number,
  monthlyContribution: number,
  yieldPct: number,
  targetMonthly: number
): number | null {
  const req = requiredPrincipal(targetMonthly, yieldPct);
  if (initial >= req) return 0;
  const monthlyRate = yieldPct / 100 / 12;
  let balance = initial;
  const maxMonths = 100 * 12;
  for (let m = 1; m <= maxMonths; m++) {
    balance += monthlyContribution;
    balance += balance * monthlyRate; // 배당 재투자
    if (balance >= req) return m;
  }
  return null;
}

// 월 단위로 시뮬레이션 (납입·배당 주기를 월로 환산해서 처리)
export function simulateDividend(input: DividendInput): DividendResult {
  const {
    initial,
    contribution,
    contributionFreq,
    dividendYield,
    payoutFreq,
    years,
    reinvest,
  } = input;

  const months = Math.max(0, Math.round(years * 12));
  const contribEvery = 12 / FREQ_PER_YEAR[contributionFreq]; // 몇 개월마다 납입
  const payEvery = 12 / FREQ_PER_YEAR[payoutFreq]; // 몇 개월마다 배당
  const perPayoutRate = dividendYield / 100 / FREQ_PER_YEAR[payoutFreq]; // 1회 배당률

  let balance = initial;
  let totalContribution = initial;
  let totalDividend = 0;

  for (let m = 1; m <= months; m++) {
    // 추가 납입 (시작 이후 주기마다)
    if (contribution > 0 && m % contribEvery === 0) {
      balance += contribution;
      totalContribution += contribution;
    }
    // 배당 지급
    if (m % payEvery === 0) {
      const dividend = balance * perPayoutRate;
      totalDividend += dividend;
      if (reinvest) balance += dividend; // 재투자 → 복리
    }
  }

  const finalValue = reinvest ? balance : balance; // 재투자면 balance에 포함, 아니면 배당 별도
  const lastYearDividend = balance * (dividendYield / 100);

  return {
    totalContribution: Math.round(totalContribution),
    finalValue: Math.round(finalValue),
    totalDividend: Math.round(totalDividend),
    lastYearDividend: Math.round(lastYearDividend),
  };
}
