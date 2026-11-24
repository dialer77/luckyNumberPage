import type { Metadata } from "next";
import Link from "next/link";
import Faq from "../../components/Faq";
import { calcTakeHome, wonFull, INSURANCE_2026 } from "@/lib/salary";

export const metadata: Metadata = {
  title: "2026 연봉 실수령액 표 — 2천만원~1억 5천만원 월급 한눈에",
  description:
    "연봉 2,000만원부터 1억 5,000만원까지 100만원 단위로 2026년 4대보험·소득세를 뗀 월 실수령액과 실수령률을 표로 정리했습니다. 본인 1인, 비과세 식대 월 20만원 기준.",
  keywords: ["연봉 실수령액 표", "2026 연봉 실수령액", "연봉별 월급", "세후 월급 표", "연봉 실수령액"],
  alternates: { canonical: "/calc/salary-table" },
};

// 표의 모든 숫자는 lib/salary.ts 의 calcTakeHome 으로 빌드 때 계산한다(실수령액 계산기와 같은 식).
// 요율·세법이 바뀌면 lib/salary.ts 만 고치면 이 표도 함께 바뀐다.
const MEAL = 200_000;
const R = INSURANCE_2026;
const INS_SUM = R.pension + R.health * (1 + R.longTermCareOfHealth) + R.employment;
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;
const PENSION_CAP_SALARY = R.pensionMonthlyCap * 12 + MEAL * 12; // 국민연금 상한이 걸리기 시작하는 연봉

type Row = {
  salary: number;
  monthlyGross: number;
  insurance: number;
  tax: number;
  net: number;
  rate: number;
};

function row(salary: number): Row {
  const t = calcTakeHome(salary, MEAL);
  return {
    salary,
    monthlyGross: t.monthlyGross,
    insurance: Math.round(t.insurance / 12),
    tax: Math.round((t.incomeTax + t.localTax) / 12),
    net: t.monthlyNet,
    rate: t.net / salary,
  };
}

// 2,000만원 ~ 1억 5,000만원, 100만원 단위
const BANDS = Array.from({ length: 14 }, (_, i) => (2 + i) * 10_000_000); // 2천만 ~ 1억 5천만 시작점
const ROWS_BY_BAND = BANDS.map((start) => ({
  start,
  rows: Array.from({ length: start === 150_000_000 ? 1 : 10 }, (_, i) => row(start + i * 1_000_000)),
}));
const SUMMARY = [30, 40, 50, 60, 70, 80, 100, 120, 150].map((m) => row(m * 1_000_000));

const r3 = row(30_000_000);
const r5 = row(50_000_000);
const r10 = row(100_000_000);

const FAQ = [
  {
    q: "이 표는 어떤 조건으로 계산했나요?",
    a: `부양가족이 없는 본인 1인, 월 비과세 식대 20만원을 기준으로, 2026년 4대보험 요율(근로자 부담 합계 약 ${pct(INS_SUM)}, 국민연금은 월 소득 ${wonFull(R.pensionMonthlyCap)} 상한)과 근로소득공제·누진세율·근로소득세액공제를 반영했습니다. 이 사이트의 연봉 실수령액 계산기와 같은 식입니다.`,
  },
  {
    q: "실제 월급명세서와 다른 이유는 무엇인가요?",
    a: "회사는 매달 국세청 간이세액표로 소득세를 떼고, 연말정산 때 실제 공제(부양가족·카드·보험·연금저축 등)를 반영해 정산합니다. 이 표는 1년 치 세금을 연 단위로 계산해 12로 나눈 값이라, 공제가 많은 사람은 실제 세금이 이 표보다 적습니다.",
  },
  {
    q: "연봉이 같아도 실수령이 달라지나요?",
    a: "네. 비과세 수당(식대·자가운전보조금 등)이 많을수록, 부양가족과 각종 공제가 많을수록 실수령이 늘어납니다. 내 조건으로 계산하려면 연봉 실수령액 계산기에서 식대 등 비과세액을 바꿔 넣어 보세요.",
  },
  {
    q: "연봉 1억원이면 월급은 얼마인가요?",
    a: `이 표 기준으로 연봉 1억원의 월 세전은 ${wonFull(r10.monthlyGross)}, 4대보험 ${wonFull(r10.insurance)}와 소득세·지방소득세 ${wonFull(r10.tax)}를 떼면 월 실수령은 약 ${wonFull(r10.net)}(실수령률 ${pct(r10.rate)})입니다.`,
  },
];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";
const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-1.5 text-right tabular-nums whitespace-nowrap";

function RowsTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-slate-100">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            {/* 휴대폰에서도 핵심(월 실수령)이 먼저 보이도록 연봉 바로 옆에 둔다 */}
            <th className={`${th} text-left`}>연봉</th>
            <th className={`${th} text-right`}>월 실수령</th>
            <th className={`${th} text-right`}>실수령률</th>
            <th className={`${th} text-right`}>월 세전</th>
            <th className={`${th} text-right`}>4대보험</th>
            <th className={`${th} text-right`}>소득세+지방세</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.salary}>
              <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">{wonFull(r.salary)}</td>
              <td className={`${td} font-semibold text-indigo-600`}>{wonFull(r.net)}</td>
              <td className={td}>{pct(r.rate)}</td>
              <td className={td}>{wonFull(r.monthlyGross)}</td>
              <td className={td}>{wonFull(r.insurance)}</td>
              <td className={td}>{wonFull(r.tax)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SalaryTablePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <div>
        <h1 className="text-2xl font-bold leading-snug">💵 2026 연봉 실수령액 표</h1>
        <p className="mt-1 text-sm text-slate-500">
          연봉 2,000만원 ~ 1억 5,000만원 · 100만원 단위 · 본인 1인, 비과세 식대 월 20만원 기준
        </p>
      </div>

      <section className={card}>
        <p>
          연봉에서 4대보험과 소득세·지방소득세를 떼고 매달 실제로 들어오는 금액을
          100만원 단위로 정리했습니다. 연봉 3,000만원은 월 약 {wonFull(r3.net)}, 5,000만원은
          약 {wonFull(r5.net)}, 1억원은 약 {wonFull(r10.net)}입니다. 연봉이 오를수록 높은
          세율 구간에 들어가 실수령률은 {pct(r3.rate)}(3,000만원)에서 {pct(r10.rate)}(1억원)로
          내려갑니다.
        </p>
        <p className="mt-2">
          4대보험은 2026년 요율로 계산했습니다. 국민연금 {pct(R.pension, 2)}, 건강보험{" "}
          {pct(R.health, 3)}, 장기요양(건강보험료의 {pct(R.longTermCareOfHealth, 2)}), 고용보험{" "}
          {pct(R.employment, 1)}로 합계 약 {pct(INS_SUM)}입니다. 국민연금은 월 소득{" "}
          {wonFull(R.pensionMonthlyCap)}까지만 매기므로, 연봉 약 {wonFull(PENSION_CAP_SALARY)}부터는
          국민연금이 더 늘지 않습니다.
        </p>
        <p className="mt-2 text-slate-500">
          내 조건(비과세 수당 등)으로 정확히 계산하려면{" "}
          <Link href="/calc/take-home" className={link}>
            연봉 실수령액 계산기
          </Link>
          를 쓰세요.
        </p>
      </section>

      {/* 1,000만원 단위 요약 */}
      <section className={card}>
        <h2 className={h2}>한눈에 보기 (주요 연봉)</h2>
        <div className="mt-3">
          <RowsTable rows={SUMMARY} />
        </div>
        <p className="mt-3 text-xs text-slate-400">
          월 세전 = 연봉 ÷ 12. 4대보험·세금은 1년 치를 12로 나눈 월평균입니다.
        </p>
      </section>

      {/* 구간 바로가기 */}
      <nav className="flex flex-wrap gap-2 text-sm" aria-label="연봉 구간 바로가기">
        {ROWS_BY_BAND.map((b) => (
          <a
            key={b.start}
            href={`#band-${b.start / 10_000_000}`}
            className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
          >
            {wonFull(b.start).replace("원", "")}
          </a>
        ))}
      </nav>

      {ROWS_BY_BAND.map((b) => (
        <section key={b.start} id={`band-${b.start / 10_000_000}`} className={card}>
          <h2 className={h2}>
            {b.start === 150_000_000
              ? "연봉 1억 5,000만원"
              : `연봉 ${wonFull(b.start)} ~ ${wonFull(b.start + 9_000_000)}`}
          </h2>
          <div className="mt-3">
            <RowsTable rows={b.rows} />
          </div>
        </section>
      ))}

      <section className={card}>
        <h2 className={h2}>표를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            부양가족 공제, 자녀세액공제, 연금저축·보험료·의료비·카드 공제가 빠진 본인 1인
            기준이라 실제 연말정산 세금은 대개 이보다 적습니다.
          </li>
          <li>
            회사가 매달 떼는 소득세는 간이세액표 기준이라 이 표와 월별로 다를 수 있고, 그
            차이는 연말정산에서 정산됩니다.
          </li>
          <li>
            4대보험 요율과 세법은 해마다 바뀝니다. 이 표는 2026년 기준 근사값으로
            참고용입니다. 계산 기준은{" "}
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
            <Link href="/guide/salary-net-pay" className={link}>
              연봉 실수령액, 왜 생각보다 적을까?
            </Link>{" "}
            — 4대보험과 소득세 구조
          </li>
          <li>
            <Link href="/calc/salary" className={link}>
              이직 연봉 계산기
            </Link>{" "}
            — 연봉 차이가 쌓이면 얼마나 벌어질까
          </li>
          <li>
            <Link href="/guide/year-end-tax" className={link}>
              연말정산, &lsquo;13월의 월급&rsquo; 만드는 기초
            </Link>{" "}
            — 공제를 챙겨 세금을 돌려받는 법
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
