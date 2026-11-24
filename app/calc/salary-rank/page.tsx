import type { Metadata } from "next";
import Link from "next/link";
import SalaryRankCalculator from "../SalaryRankCalculator";
import Faq from "../../components/Faq";
import {
  salaryTopPercent,
  salaryAtTopPercent,
  TOTAL_WORKERS,
  MEDIAN_SALARY,
  AVERAGE_SALARY,
  SALARY_RANK_SOURCE,
} from "@/lib/salary-rank";
import { wonFull } from "@/lib/salary";

export const metadata: Metadata = {
  title: "내 연봉 상위 몇 %? — 2024 국세청 근로소득 순위 계산기",
  description:
    "국세청 2024년 귀속 근로소득 천분위 자료로 내 연봉이 대한민국 직장인 중 상위 몇 %인지 계산합니다. 상위 1%·10%·중위 연봉 기준과 연봉별 순위표도 함께 확인하세요.",
  keywords: ["연봉 상위 몇퍼", "연봉 순위", "근로소득 상위", "연봉 백분위", "상위 1% 연봉", "중위 연봉"],
  alternates: { canonical: "/calc/salary-rank" },
};

// 이 페이지의 모든 숫자는 lib/salary-rank.ts(국세청 원자료)로 빌드 때 계산한다.
const man = (won: number) => wonFull(Math.round(won / 10_000) * 10_000);
const fmtTop = (p: number) => (p < 1 ? p.toFixed(2) : p < 10 ? p.toFixed(1) : p.toFixed(0));

const CUTS = [0.1, 0.5, 1, 3, 5, 10, 20, 30, 40, 50].map((p) => ({
  p,
  salary: salaryAtTopPercent(p),
}));
const BY_SALARY = [2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000, 30000].map(
  (m) => ({ salary: m * 10_000, top: salaryTopPercent(m * 10_000) })
);
const workersMan = Math.round(TOTAL_WORKERS / 10_000).toLocaleString();
const top1 = salaryAtTopPercent(1);
const top10 = salaryAtTopPercent(10);
const eok = salaryTopPercent(100_000_000);

const FAQ = [
  {
    q: "이 순위는 어떤 자료로 계산하나요?",
    a: `${SALARY_RANK_SOURCE.name}(${SALARY_RANK_SOURCE.year}년 근로소득, 공공데이터포털 공개)입니다. 연말정산을 신고한 근로자 ${workersMan}만 명을 총급여 순으로 줄 세워 상위 1%까지는 0.1% 단위, 그 아래는 1% 단위로 나눈 표로, 구간마다 1인 평균 총급여를 이어 내 연봉의 위치를 추정합니다.`,
  },
  {
    q: "상위 10%, 상위 1%는 연봉이 얼마부터인가요?",
    a: `이 자료 기준으로 상위 10%는 연봉 약 ${man(top10)}, 상위 1%는 약 ${man(top1)}부터입니다. 연봉 1억원은 상위 약 ${fmtTop(eok)}%입니다.`,
  },
  {
    q: "중위 연봉과 평균 연봉은 얼마인가요?",
    a: `중위 연봉(정확히 가운데)은 약 ${man(MEDIAN_SALARY)}, 평균은 약 ${man(AVERAGE_SALARY)}입니다. 고소득자가 평균을 끌어올려 평균이 중위보다 1,000만원 넘게 높습니다. '보통 직장인'을 떠올릴 때는 중위 연봉이 더 가깝습니다.`,
  },
  {
    q: "세전 연봉 기준인가요? 비과세 수당은요?",
    a: "총급여는 비과세 소득(식대 등)을 뺀 세전 연간 근로소득입니다. 연봉에 비과세 식대가 포함돼 있다면 그만큼 빼고 넣으면 더 정확합니다. 실수령액이 궁금하면 연봉 실수령액 계산기를 이용해 보세요.",
  },
  {
    q: "나이대별로 비교할 수는 없나요?",
    a: "국세청 자료는 나이 구분이 없습니다. 내 나이대에서의 위치는 국가데이터처 임금근로일자리 소득 자료로 만든 '내 월급, 내 나이대에서 상위 몇 %' 계산기에서 볼 수 있습니다.",
  },
];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";
const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-1.5 tabular-nums whitespace-nowrap";

export default function SalaryRankPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryRankCalculator />

      <section className={card}>
        <p>
          내 연봉이 남들과 비교해 어느 정도인지, 국세청이 공개한{" "}
          <b>{SALARY_RANK_SOURCE.year}년 근로소득 천분위 자료</b>로 계산합니다. 연말정산을 신고한
          근로자 {workersMan}만 명의 중위 연봉은 약 {man(MEDIAN_SALARY)}, 평균은 약{" "}
          {man(AVERAGE_SALARY)}입니다. 상위 10%에 들려면 약 {man(top10)}, 상위 1%에 들려면 약{" "}
          {man(top1)}이 필요합니다.
        </p>
        <p className="mt-2 text-slate-500">
          세후 월급은{" "}
          <Link href="/calc/take-home" className={link}>
            연봉 실수령액 계산기
          </Link>
          와{" "}
          <Link href="/calc/salary-table" className={link}>
            2026 연봉 실수령액 표
          </Link>
          , 내 나이대에서의 위치는{" "}
          <Link href="/calc/salary-by-age" className={link}>
            내 월급, 내 나이대에서 상위 몇 %
          </Link>
          에서 볼 수 있어요.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>상위 몇 %면 연봉이 얼마?</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} text-left`}>기준</th>
                <th className={`${th} text-right`}>연봉(총급여)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {CUTS.map((c) => (
                <tr key={c.p}>
                  <td className={`${td} font-medium text-slate-700`}>
                    {c.p === 50 ? "상위 50% (중위)" : `상위 ${c.p}%`}
                  </td>
                  <td className={`${td} text-right font-semibold text-indigo-600`}>{man(c.salary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>연봉별 상위 %</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} text-left`}>연봉</th>
                <th className={`${th} text-right`}>상위</th>
                <th className={`${th} text-right`}>더 받는 사람</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {BY_SALARY.map((r) => (
                <tr key={r.salary}>
                  <td className={`${td} font-medium text-slate-700`}>{wonFull(r.salary)}</td>
                  <td className={`${td} text-right font-semibold text-indigo-600`}>{fmtTop(r.top)}%</td>
                  <td className={`${td} text-right`}>
                    약 {Math.round((TOTAL_WORKERS * r.top) / 100 / 10_000).toLocaleString()}만 명
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>계산 방법과 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            국세청 자료는 근로자를 총급여 순으로 줄 세워 구간(상위 1%까지 0.1%, 그 아래 1%)마다
            인원과 총급여 합계를 공개합니다. 구간마다 1인 평균을 구해 이어 붙인 값으로 추정하므로
            구간 경계 근처에서는 소폭 차이가 있을 수 있습니다.
          </li>
          <li>
            1년 중 일부만 일한 사람(중도 입·퇴사, 아르바이트)도 포함돼 있어, 1년 내내 일한
            직장인끼리만 비교하면 같은 연봉의 순위는 이보다 조금 낮게 나옵니다.
          </li>
          <li>
            총급여는 비과세 소득을 뺀 세전 금액입니다. 자료가 매년 2월 전후로 새로 공개되면
            갱신합니다.
          </li>
          <li>
            원자료:{" "}
            <a href={SALARY_RANK_SOURCE.url} className={link} target="_blank" rel="noopener">
              공공데이터포털 {SALARY_RANK_SOURCE.name}
            </a>
            · 계산 기준은{" "}
            <Link href="/data-sources" className={link}>
              데이터 출처와 계산 기준
            </Link>
          </li>
        </ul>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
