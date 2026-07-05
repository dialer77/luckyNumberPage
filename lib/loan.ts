// 대출 상환 계산 — 원리금균등 / 원금균등 / 만기일시.

export type LoanMethod = "equal" | "principal" | "bullet";

export const LOAN_METHODS: { key: LoanMethod; name: string }[] = [
  { key: "equal", name: "원리금균등" },
  { key: "principal", name: "원금균등" },
  { key: "bullet", name: "만기일시" },
];

export type LoanRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type LoanResult = {
  method: LoanMethod;
  totalPayment: number;
  totalInterest: number;
  firstPayment: number;
  lastPayment: number;
  schedule: LoanRow[];
};

export function computeLoan(
  principal: number,
  annualRate: number,
  months: number,
  method: LoanMethod
): LoanResult {
  const P = Math.max(0, principal);
  const n = Math.max(0, Math.floor(months));
  const r = annualRate / 100 / 12; // 월 이자율
  const rows: LoanRow[] = [];
  let balance = P;
  let totalInterest = 0;

  const empty: LoanResult = {
    method,
    totalPayment: P,
    totalInterest: 0,
    firstPayment: 0,
    lastPayment: 0,
    schedule: [],
  };
  if (P === 0 || n === 0) return empty;

  if (method === "equal") {
    // 원리금균등: 매월 상환액 고정
    const pay =
      r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      let prin = pay - interest;
      if (m === n) prin = balance; // 마지막 달 잔액 정리
      balance -= prin;
      totalInterest += interest;
      rows.push(row(m, prin + interest, prin, interest, balance));
    }
  } else if (method === "principal") {
    // 원금균등: 매월 원금 고정, 이자는 잔액 기준 감소
    const prin = P / n;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      balance -= prin;
      totalInterest += interest;
      rows.push(row(m, prin + interest, prin, interest, balance));
    }
  } else {
    // 만기일시: 매월 이자만, 마지막에 원금
    for (let m = 1; m <= n; m++) {
      const interest = P * r;
      const isLast = m === n;
      totalInterest += interest;
      rows.push(
        row(m, interest + (isLast ? P : 0), isLast ? P : 0, interest, isLast ? 0 : P)
      );
    }
  }

  return {
    method,
    totalPayment: Math.round(P + totalInterest),
    totalInterest: Math.round(totalInterest),
    firstPayment: rows[0].payment,
    lastPayment: rows[rows.length - 1].payment,
    schedule: rows,
  };
}

function row(
  month: number,
  payment: number,
  principal: number,
  interest: number,
  balance: number
): LoanRow {
  return {
    month,
    payment: Math.round(payment),
    principal: Math.round(principal),
    interest: Math.round(interest),
    balance: Math.max(0, Math.round(balance)),
  };
}
