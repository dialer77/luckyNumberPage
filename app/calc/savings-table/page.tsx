import type { Metadata } from "next";
import Link from "next/link";
import Faq from "../../components/Faq";
import { fixedDeposit, regularSavings, INTEREST_TAX_RATE } from "@/lib/savings";
import { wonFull } from "@/lib/salary";

export const metadata: Metadata = {
  title: "2026 적금·예금 이자 계산표 — 월 10만~100만원 적금, 1억 예금 세후 이자",
  description:
    "월 10만·20만·30만·50만·100만원 적금을 1·2·3년 넣었을 때와 1천만·3천만·5천만·1억원 예금을 1년 맡겼을 때의 세전·세후 이자와 만기 수령액을 연 3.0%·3.5%·4.0% 예시 금리로 표에 정리했습니다. 단리, 이자소득세 15.4% 기준.",
  keywords: [
    "적금 이자 계산표",
    "예금 이자 계산표",
    "적금 이자표",
    "월 50만원 적금 이자",
    "1억 예금 이자",
    "적금 만기 수령액",
    "2026 적금 이자",
  ],
  alternates: { canonical: "/calc/savings-table" },
};

// 표의 모든 숫자는 lib/savings.ts 의 regularSavings/fixedDeposit 으로 빌드 때 계산한다(적금·예금 계산기와 같은 식).
// 금리는 특정 상품이 아닌 예시 금리다.
const RATES = [0.03, 0.035, 0.04];
const MID_RATE = 0.035;
const MONTHLY = [100_000, 200_000, 300_000, 500_000, 1_000_000];
const TERMS = [12, 24, 36];
const PRINCIPALS = [10_000_000, 30_000_000, 50_000_000, 100_000_000];

const rateStr = (r: number) => `${(r * 100).toFixed(1)}%`;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const termStr = (m: number) => `${m / 12}년`;

type Row = {
  key: string;
  months: number;
  rate: number;
  totalIn: number;
  interest: number; // 세전 이자 (원 반올림)
  tax: number; // 세금 = 세전 이자 − 세후 이자 (표 안에서 앞뒤가 맞도록)
  netInterest: number; // 세후 이자 (원 반올림)
  net: number; // 세후 만기 수령액
};

function toRow(key: string, months: number, rate: number, r: ReturnType<typeof regularSavings>): Row {
  const interest = Math.round(r.interest);
  const netInterest = Math.round(r.netInterest);
  return { key, months, rate, totalIn: r.totalIn, interest, tax: interest - netInterest, netInterest, net: r.totalIn + netInterest };
}
const savingsRow = (monthly: number, months: number, rate: number) =>
  toRow(`${monthly}-${months}-${rate}`, months, rate, regularSavings(monthly, rate, months));
const depositRow = (principal: number, months: number, rate: number) =>
  toRow(`${principal}-${months}-${rate}`, months, rate, fixedDeposit(principal, rate, months));

const SAVINGS_BY_MONTHLY = MONTHLY.map((monthly) => ({
  monthly,
  rows: TERMS.flatMap((months) => RATES.map((rate) => savingsRow(monthly, months, rate))),
}));
const DEPOSIT_BY_PRINCIPAL = PRINCIPALS.map((principal) => ({
  principal,
  rows: RATES.map((rate) => depositRow(principal, 12, rate)),
}));

// 본문·FAQ 예시
const s50y1 = savingsRow(500_000, 12, MID_RATE);
const s100y1 = savingsRow(1_000_000, 12, MID_RATE);
const s100y3 = savingsRow(1_000_000, 36, MID_RATE);
const d1200 = depositRow(12_000_000, 12, MID_RATE); // 적금 월 100만원 × 12개월과 같은 원금
const d1eok = depositRow(100_000_000, 12, MID_RATE);
const ratio12 = s100y1.interest / d1200.interest; // 같은 원금·금리에서 적금 이자 ÷ 예금 이자 = (n+1)/(2n)

const FAQ = [
  {
    q: "월 50만원씩 1년 적금을 넣으면 이자는 얼마인가요?",
    a: `연 ${rateStr(MID_RATE)} 단리 적금 기준으로 원금 ${wonFull(s50y1.totalIn)}에 세전 이자 ${wonFull(s50y1.interest)}, 이자소득세 ${pct(INTEREST_TAX_RATE)}를 떼면 세후 이자 ${wonFull(s50y1.netInterest)}입니다. 만기에는 ${wonFull(s50y1.net)}을 받습니다.`,
  },
  {
    q: "1억원을 1년 예금하면 이자는 얼마인가요?",
    a: `연 ${rateStr(MID_RATE)} 정기예금이면 세전 이자 ${wonFull(d1eok.interest)}, 세금 ${wonFull(d1eok.tax)}을 떼고 세후 이자 ${wonFull(d1eok.netInterest)}입니다. 한 달로 나누면 세후 약 ${wonFull(Math.round(d1eok.netInterest / 12))}입니다.`,
  },
  {
    q: "적금 이자가 표시 금리보다 훨씬 적은 이유는 무엇인가요?",
    a: `적금은 매달 넣은 돈마다 이자가 붙는 기간이 다르기 때문입니다. 1년 적금이라면 첫 달 넣은 돈은 12개월, 마지막 달 넣은 돈은 1개월치 이자만 받습니다. 그래서 월 100만원 1년 적금(원금 ${wonFull(s100y1.totalIn)})의 세전 이자는 ${wonFull(s100y1.interest)}으로, 같은 돈을 처음부터 예금했을 때(${wonFull(d1200.interest)})의 ${pct(ratio12, 0)} 정도입니다.`,
  },
  {
    q: "이자에 붙는 세금은 얼마인가요?",
    a: `일반과세 기준 이자소득세 ${pct(INTEREST_TAX_RATE)}(소득세 14% + 지방소득세 1.4%)가 만기에 원천징수됩니다. 비과세종합저축·조합 예탁금 같은 세금우대 상품이나 ISA 계좌에 넣으면 세금이 줄어들 수 있으며, 이 표는 일반과세로 계산했습니다.`,
  },
  {
    q: "은행 앱에 나오는 금액과 조금 다른 이유는 무엇인가요?",
    a: "은행은 상품에 따라 월복리를 쓰거나, 날짜 단위로 이자를 계산하거나, 세금을 10원 단위 미만에서 버리는 등 세부 규칙이 다릅니다. 이 표는 단리·월 단위 근사라 실제 만기 금액과 몇 원에서 몇백 원 정도 차이가 날 수 있습니다.",
  },
];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";
const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-1.5 text-right tabular-nums whitespace-nowrap";

function RowsTable({ rows, label }: { rows: Row[]; label: "term" | "rate" }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {/* 휴대폰에서도 핵심(세후 이자·만기 수령액)이 먼저 보이도록 조건 바로 옆에 둔다 */}
            <th className={`${th} text-left`}>{label === "term" ? "기간 · 금리" : "금리"}</th>
            <th className={`${th} text-right`}>세후 이자</th>
            <th className={`${th} text-right`}>만기 수령액(세후)</th>
            <th className={`${th} text-right`}>세전 이자</th>
            <th className={`${th} text-right`}>세금 {pct(INTEREST_TAX_RATE)}</th>
            <th className={`${th} text-right`}>원금</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.key}>
              <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">
                {label === "term" ? `${termStr(r.months)} · ${rateStr(r.rate)}` : rateStr(r.rate)}
              </td>
              <td className={`${td} font-semibold text-indigo-600`}>{wonFull(r.netInterest)}</td>
              <td className={`${td} text-slate-700`}>{wonFull(r.net)}</td>
              <td className={td}>{wonFull(r.interest)}</td>
              <td className={`${td} text-rose-500`}>{wonFull(r.tax)}</td>
              <td className={td}>{wonFull(r.totalIn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SavingsTablePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <div>
        <h1 className="text-2xl font-bold leading-snug">🏦 2026 적금·예금 이자 계산표</h1>
        <p className="mt-1 text-sm text-slate-500">
          적금 월 10만~100만원 × 1·2·3년 · 예금 1천만~1억원 × 1년 · 예시 금리 연 3.0·3.5·4.0% ·
          단리, 이자소득세 15.4%
        </p>
      </div>

      <section className={card}>
        <p>
          매달 넣는 적금과 목돈을 맡기는 예금의 이자를 세금까지 떼고 정리했습니다. 연{" "}
          {rateStr(MID_RATE)} 기준으로 월 50만원을 1년 적금하면 세후 이자는{" "}
          {wonFull(s50y1.netInterest)}, 월 100만원을 3년 넣으면 {wonFull(s100y3.netInterest)}이고,
          1억원을 1년 예금하면 {wonFull(d1eok.netInterest)}입니다.
        </p>
        <p className="mt-2">
          금리 3.0%·3.5%·4.0%는 특정 상품의 금리가 아니라 비교를 위한 <b>예시 금리</b>입니다.
          실제 금리는 은행·상품·가입 시점·우대조건에 따라 다르니, 가입하려는 상품의 기본금리로
          다시 확인하세요. 적금은 단리 관례(월납입 × 연이율 × n(n+1)/2 ÷ 12), 예금은 단리(원금 ×
          연이율 × 개월 ÷ 12)로 계산하고 이자소득세 {pct(INTEREST_TAX_RATE)}를 뗐습니다.
        </p>
        <p className="mt-2 text-slate-500">
          내 금리·기간으로 계산하려면{" "}
          <Link href="/calc/savings" className={link}>
            적금·예금 계산기
          </Link>
          를 쓰세요.
        </p>
      </section>

      {/* 연 3.5% 기준 요약 매트릭스 */}
      <section className={card}>
        <h2 className={h2}>한눈에 보기 — 적금 세후 이자 (연 {rateStr(MID_RATE)})</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} text-left`}>월 납입</th>
                {TERMS.map((m) => (
                  <th key={m} className={`${th} text-right`}>
                    {termStr(m)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {MONTHLY.map((monthly) => (
                <tr key={monthly}>
                  <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">{wonFull(monthly)}</td>
                  {TERMS.map((months) => {
                    const r = savingsRow(monthly, months, MID_RATE);
                    return (
                      <td key={months} className={td}>
                        <span className="font-semibold text-indigo-600">{wonFull(r.netInterest)}</span>
                        <span className="block text-xs text-slate-400">만기 {wonFull(r.net)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          위 숫자는 세후 이자, 아래 작은 숫자는 원금을 더한 세후 만기 수령액입니다. 다른 금리는 아래
          월 납입액별 표에 있습니다.
        </p>
      </section>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="표 바로가기">
        {MONTHLY.map((m) => (
          <a
            key={m}
            href={`#monthly-${m / 10_000}`}
            className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
          >
            적금 월 {wonFull(m).replace("원", "")}
          </a>
        ))}
        <a
          href="#deposit"
          className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
        >
          예금
        </a>
      </nav>

      {SAVINGS_BY_MONTHLY.map((g) => (
        <section key={g.monthly} id={`monthly-${g.monthly / 10_000}`} className={card}>
          <h2 className={h2}>월 {wonFull(g.monthly)} 적금 — 1년 · 2년 · 3년</h2>
          <div className="mt-3">
            <RowsTable rows={g.rows} label="term" />
          </div>
        </section>
      ))}

      <section id="deposit" className={card}>
        <h2 className={h2}>정기예금 1년 — 1천만원 · 3천만원 · 5천만원 · 1억원</h2>
        <p className="mt-2">
          예금은 맡긴 돈 전체가 처음부터 끝까지 이자를 받아 표시 금리를 그대로 누립니다. 같은 원금{" "}
          {wonFull(d1200.totalIn)}을 연 {rateStr(MID_RATE)}로 1년 굴려도 예금은 세전 {wonFull(d1200.interest)}, 월
          100만원 적금은 {wonFull(s100y1.interest)}으로 적금 이자가 예금의 {pct(ratio12, 0)} 정도입니다.
        </p>
        <div className="mt-3 space-y-4">
          {DEPOSIT_BY_PRINCIPAL.map((g) => (
            <div key={g.principal}>
              <h3 className="mb-2 font-semibold text-slate-700">예치금 {wonFull(g.principal)}</h3>
              <RowsTable rows={g.rows} label="rate" />
            </div>
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>표를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            금리는 예시입니다. 광고의 &lsquo;최고 연 X%&rsquo;는 우대조건을 모두 채웠을 때 금리라,
            조건을 못 채우면 기본금리만 적용됩니다.
          </li>
          <li>
            단리·월 단위 근사입니다. 월복리 상품이나 날짜 단위로 이자를 계산하는 상품은 실제 금액이
            조금 다르고, 중도해지하면 약정 금리보다 훨씬 낮은 중도해지 금리가 적용됩니다.
          </li>
          <li>
            세금은 일반과세 {pct(INTEREST_TAX_RATE)}로 계산했습니다. 비과세·세금우대 상품이나 ISA
            계좌는 세후 이자가 더 큽니다. 이자를 포함한 금융소득이 한 해 2,000만원을 넘으면
            금융소득종합과세 대상이 될 수 있습니다.
          </li>
          <li>
            예금자보호는 2025년 9월부터 금융회사별 1인당 원금과 이자를 합쳐 1억원까지입니다. 1억원
            예금은 만기 이자까지 합치면 한도를 넘을 수 있습니다.
          </li>
          <li>
            특정 금융상품 가입을 권하는 자료가 아닙니다. 계산 기준은{" "}
            <Link href="/data-sources" className={link}>
              데이터 출처와 계산 기준
            </Link>
            에 있습니다.
          </li>
        </ul>
      </section>

      <section className={card}>
        <h2 className={h2}>함께 보면 좋은 글</h2>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link href="/calc/savings" className={link}>
              적금·예금 계산기
            </Link>{" "}
            — 내 금리·기간으로 세후 만기 수령액 계산
          </li>
          <li>
            <Link href="/guide/savings-vs-deposit" className={link}>
              적금 vs 예금, 표시 금리에 속지 마세요
            </Link>{" "}
            — 같은 금리라도 이자가 다른 이유
          </li>
          <li>
            <Link href="/calc/compound" className={link}>
              복리 계산기
            </Link>{" "}
            — 이자에 이자가 붙으면 얼마나 불어날까
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
