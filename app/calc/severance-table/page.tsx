import type { Metadata } from "next";
import Link from "next/link";
import Faq from "../../components/Faq";
import { calcSeverance, calcRetirementTax, serviceYearsDeduction, DAYS_PER_MONTH } from "@/lib/severance";
import { wonFull } from "@/lib/salary";

export const metadata: Metadata = {
  title: "2026 퇴직금 계산표 — 월급·근속연수별 퇴직금과 퇴직소득세",
  description:
    "월급 200만원부터 800만원까지, 근속 1·3·5·10·15·20년일 때 받는 법정 퇴직금(세전)을 표로 정리했습니다. 2023년 이후 퇴직분 기준 퇴직소득세 추정액과 세후 금액도 별도 열로 함께 보여 줍니다.",
  keywords: [
    "퇴직금 계산표",
    "퇴직금 표",
    "2026 퇴직금",
    "근속연수별 퇴직금",
    "월급별 퇴직금",
    "퇴직소득세 계산",
    "퇴직금 세금",
  ],
  alternates: { canonical: "/calc/severance-table" },
};

// 표의 모든 숫자는 lib/severance.ts 의 calcSeverance(퇴직금 계산기와 같은 식)와
// calcRetirementTax(퇴직소득세 추정)로 빌드 때 계산한다.
const WAGES = [2_000_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000, 5_000_000, 6_000_000, 8_000_000];
const YEARS = [1, 3, 5, 10, 15, 20];
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`;

type Row = { wage: number; years: number; severance: number; tax: number; net: number; rate: number };

function row(wage: number, years: number): Row {
  const { severance } = calcSeverance(wage, years);
  const t = calcRetirementTax(severance, years);
  return { wage, years, severance, tax: t.total, net: t.net, rate: severance > 0 ? t.total / severance : 0 };
}

const ROWS_BY_WAGE = WAGES.map((wage) => ({ wage, rows: YEARS.map((y) => row(wage, y)) }));

// 본문·FAQ 예시
const r300y1 = row(3_000_000, 1);
const r300y10 = row(3_000_000, 10);
const r400y20 = row(4_000_000, 20);
const r500y5 = row(5_000_000, 5);
const r500y20 = row(5_000_000, 20);
const t300y10 = calcRetirementTax(r300y10.severance, 10);
const oneYearRatio = calcSeverance(1_000_000, 1).severance / 1_000_000; // 1년치 퇴직금 ÷ 월급 = 30 ÷ 30.42

const FAQ = [
  {
    q: "월급 300만원으로 10년 일하면 퇴직금은 얼마인가요?",
    a: `이 표 기준으로 세전 ${wonFull(r300y10.severance)}입니다. 2023년 이후 퇴직분 기준으로 계산한 퇴직소득세(지방소득세 포함)는 약 ${wonFull(r300y10.tax)}(실효세율 ${pct(r300y10.rate)})라, 세후로는 약 ${wonFull(r300y10.net)}을 받습니다.`,
  },
  {
    q: "퇴직금은 어떻게 계산하나요?",
    a: `법정 퇴직금 = 1일 평균임금 × 30일 × (재직일수 ÷ 365)입니다. 이 표는 1일 평균임금을 월 평균급여 ÷ ${DAYS_PER_MONTH}일(365 ÷ 12)로 근사해, 1년치 퇴직금이 월급의 약 ${pct(oneYearRatio)}가 됩니다. 쉽게 말해 '한 달치 월급 × 근속연수'에 가깝습니다.`,
  },
  {
    q: "퇴직소득세는 어떻게 계산했나요?",
    a: `2023년 1월 1일 이후 퇴직분에 적용되는 소득세법 기준(근속연수공제 → 환산급여 → 환산급여공제 → 기본세율 → 근속연수 ÷ 12)으로 계산하고 지방소득세 10%를 더했습니다. 예를 들어 근속 10년이면 근속연수공제가 ${wonFull(serviceYearsDeduction(10))}이고, 월급 300만원·10년 퇴직금의 과세표준은 ${wonFull(Math.round(t300y10.taxBase))}입니다. 근속이 길수록 공제가 커져 같은 금액이라도 세금이 줄어듭니다.`,
  },
  {
    q: "1년 미만 일하면 퇴직금이 없나요?",
    a: "법정 퇴직금은 계속근로기간이 1년 이상이고 4주 평균 주 15시간 이상 일한 근로자에게 발생합니다. 1년 미만이면 원칙적으로 지급 의무가 없습니다.",
  },
  {
    q: "실제 퇴직금이 이 표와 다른 이유는 무엇인가요?",
    a: "실제 평균임금은 퇴직 전 3개월 동안 받은 임금 총액(정기 상여·연차수당 일부 포함)을 그 기간 일수(89~92일)로 나눠 구합니다. 상여금이 많거나 퇴직 직전 급여가 바뀌었다면 금액이 달라지고, 퇴직연금 DC형은 회사가 적립한 금액과 운용 수익으로 정해져 이 공식과 다릅니다.",
  },
  {
    q: "퇴직금을 IRP로 받으면 세금이 달라지나요?",
    a: "퇴직금을 IRP(개인형 퇴직연금) 계좌로 받으면 퇴직소득세를 당장 떼지 않고 미룰 수 있고, 나중에 연금으로 나눠 받으면 퇴직소득세 일부를 감면받습니다. 감면율은 연금 수령 연차에 따라 다르니 가입한 금융회사 안내로 확인하세요. 이 표의 세금은 일시금으로 받을 때 기준입니다.",
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
            {/* 휴대폰에서도 핵심(세전 퇴직금)이 먼저 보이도록 근속 바로 옆에 둔다 */}
            <th className={`${th} text-left`}>근속</th>
            <th className={`${th} text-right`}>퇴직금(세전)</th>
            <th className={`${th} text-right`}>퇴직소득세(추정)</th>
            <th className={`${th} text-right`}>세후(추정)</th>
            <th className={`${th} text-right`}>실효세율</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((r) => (
            <tr key={r.years}>
              <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">{r.years}년</td>
              <td className={`${td} font-semibold text-indigo-600`}>{wonFull(r.severance)}</td>
              <td className={`${td} text-rose-500`}>{wonFull(r.tax)}</td>
              <td className={td}>{wonFull(r.net)}</td>
              <td className={td}>{pct(r.rate)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SeveranceTablePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <div>
        <h1 className="text-2xl font-bold leading-snug">🧳 2026 퇴직금 계산표</h1>
        <p className="mt-1 text-sm text-slate-500">
          월 평균급여 200만~800만원 × 근속 1·3·5·10·15·20년 · 법정 퇴직금(세전) · 퇴직소득세는
          추정치로 별도 표시
        </p>
      </div>

      <section className={card}>
        <p>
          월급과 근속연수만으로 받을 퇴직금을 가늠할 수 있게 정리했습니다. 월급 300만원이면 1년에{" "}
          {wonFull(r300y1.severance)}, 10년이면 {wonFull(r300y10.severance)}이고, 월급 500만원으로
          20년을 일하면 {wonFull(r500y20.severance)}입니다. 퇴직금은 대략 &lsquo;한 달치 월급 ×
          근속연수&rsquo;라 월급과 근속에 거의 정비례합니다.
        </p>
        <p className="mt-2">
          <b>표의 퇴직금은 세전 금액</b>입니다. 계산은 법정 퇴직금 공식(1일 평균임금 × 30일 ×
          재직일수 ÷ 365)에 1일 평균임금 = 월 평균급여 ÷ {DAYS_PER_MONTH}일로 근사했고, 월
          평균급여는 상여·수당을 포함해 한 달로 환산한 세전 금액입니다.
        </p>
        <p className="mt-2">
          퇴직소득세는 2023년 1월 1일 이후 퇴직분 기준으로 계산한 <b>추정치</b>를 별도 열에
          넣었습니다(지방소득세 10% 포함, 일시금 수령 기준). 근속이 길수록 공제가 커서 실효세율이
          낮게 유지됩니다. 월급 500만원이라도 5년이면 {pct(r500y5.rate)}, 20년이면{" "}
          {pct(r500y20.rate)}입니다.
        </p>
        <p className="mt-2 text-slate-500">
          근속 개월 수까지 넣어 계산하려면{" "}
          <Link href="/calc/severance" className={link}>
            퇴직금 계산기
          </Link>
          를 쓰세요.
        </p>
      </section>

      {/* 월급 × 근속 요약 매트릭스 (세전) */}
      <section className={card}>
        <h2 className={h2}>한눈에 보기 — 월급 × 근속연수별 퇴직금 (세전)</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} sticky left-0 bg-slate-50 text-left`}>월급</th>
                {YEARS.map((y) => (
                  <th key={y} className={`${th} text-right`}>
                    {y}년
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ROWS_BY_WAGE.map((g) => (
                <tr key={g.wage}>
                  <td className="sticky left-0 bg-white px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">
                    {wonFull(g.wage)}
                  </td>
                  {g.rows.map((r) => (
                    <td key={r.years} className={td}>
                      {wonFull(r.severance)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          세전 금액입니다. 퇴직소득세 추정치와 세후 금액은 아래 월급별 표에 있습니다.
        </p>
      </section>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="월급별 표 바로가기">
        {WAGES.map((w) => (
          <a
            key={w}
            href={`#wage-${w / 10_000}`}
            className="rounded-full bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
          >
            월 {wonFull(w).replace("원", "")}
          </a>
        ))}
      </nav>

      {ROWS_BY_WAGE.map((g) => (
        <section key={g.wage} id={`wage-${g.wage / 10_000}`} className={card}>
          <h2 className={h2}>월급 {wonFull(g.wage)} 퇴직금</h2>
          <div className="mt-3">
            <RowsTable rows={g.rows} />
          </div>
        </section>
      ))}

      <section className={card}>
        <h2 className={h2}>퇴직소득세는 이렇게 추정했습니다</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            근속연수공제: 5년 이하 연 100만원, 5~10년은 500만원 + 5년 초과분 연 200만원, 10~20년은
            1,500만원 + 10년 초과분 연 250만원, 20년 초과는 4,000만원 + 20년 초과분 연 300만원
          </li>
          <li>환산급여 = (퇴직금 − 근속연수공제) × 12 ÷ 근속연수</li>
          <li>
            환산급여공제: 800만원 이하 전액, 7,000만원 이하 800만원 + 초과분 60%, 1억원 이하 4,520만원
            + 초과분 55%, 3억원 이하 6,170만원 + 초과분 45%, 그 이상 1억 5,170만원 + 초과분 35%
          </li>
          <li>과세표준(환산급여 − 환산급여공제)에 종합소득세 기본세율(6~45%)을 곱한 뒤, 근속연수 ÷ 12를 곱함</li>
          <li>지방소득세(퇴직소득세의 10%)를 더함</li>
        </ol>
        <p className="mt-2">
          예를 들어 월급 400만원으로 20년 일한 퇴직금 {wonFull(r400y20.severance)}의 세금은 약{" "}
          {wonFull(r400y20.tax)}(실효세율 {pct(r400y20.rate)})입니다. 중간정산 이력, 임원 퇴직금 한도,
          IRP 이연, 비과세 소득은 반영하지 않았으니 정확한 세금은 회사의 퇴직소득 원천징수영수증이나
          국세청 홈택스 모의계산으로 확인하세요.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>표를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            실제 평균임금은 퇴직 전 3개월 임금 총액 ÷ 그 기간 일수(89~92일)라, 같은 월급이라도 퇴직
            시점에 따라 이 표보다 1~3% 안팎 많거나 적을 수 있습니다. 정기 상여금과 연차수당이 있으면
            평균임금이 더 커집니다.
          </li>
          <li>
            퇴직연금 DC형은 회사가 매년 적립한 금액과 운용 수익으로 받는 돈이 정해져 이 공식과 다릅니다.
            DB형과 퇴직금 제도에 가까운 계산입니다.
          </li>
          <li>
            근속연수는 꽉 채운 해 기준입니다. 퇴직소득세 계산에서는 1년 미만 끝수를 1년으로 올려 보므로,
            몇 개월 더 다닌 경우 세금이 조금 달라집니다.
          </li>
          <li>
            세법은 해마다 바뀔 수 있습니다. 이 표는 2026년 11월 기준 참고용이며 세무 상담을 대신하지
            않습니다. 계산 기준은{" "}
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
            <Link href="/calc/severance" className={link}>
              퇴직금 계산기
            </Link>{" "}
            — 근속 개월 수까지 넣어 계산
          </li>
          <li>
            <Link href="/guide/severance-guide" className={link}>
              퇴직금, 얼마나 받을까? 계산법과 세금
            </Link>{" "}
            — 평균임금, DB·DC형, IRP
          </li>
          <li>
            <Link href="/calc/salary-table" className={link}>
              2026 연봉 실수령액 표
            </Link>{" "}
            — 연봉별 월 실수령액
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
