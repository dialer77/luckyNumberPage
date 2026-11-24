import type { Metadata } from "next";
import Link from "next/link";
import SalaryByAgeCalculator from "../SalaryByAgeCalculator";
import Faq from "../../components/Faq";
import { AGE_GROUPS, WAGE_SOURCE, wageAtTopPercent } from "@/lib/wage-by-age";

export const metadata: Metadata = {
  title: "나이대별 월급 순위 — 내 월급, 내 나이대에서 상위 몇 %?",
  description:
    "국가데이터처 2024년 임금근로일자리 소득 자료로 20대·30대·40대·50대 나이대별 중위·평균 월급과 상위 10% 기준을 정리하고, 내 월급이 같은 나이대에서 상위 몇 %인지 계산합니다.",
  keywords: ["나이대별 월급", "연령별 평균 월급", "30대 평균 월급", "40대 평균 연봉", "나이별 연봉 순위", "중위 월급"],
  alternates: { canonical: "/calc/salary-by-age" },
};

// 이 페이지의 숫자는 모두 lib/wage-by-age.ts(국가데이터처 원자료)에서 빌드 때 가져오거나 계산한다.
const ALL = AGE_GROUPS[0];
const AGES = AGE_GROUPS.filter((g) => g.key !== "all");
const ROWS = [...AGES, ALL].map((g) => ({
  g,
  top10: wageAtTopPercent(g, 10),
  top30: wageAtTopPercent(g, 30),
}));
const byKey = (k: string) => AGE_GROUPS.find((g) => g.key === k)!;
const peakMedian = AGES.reduce((a, b) => (b.median > a.median ? b : a));
const peakMean = AGES.reduce((a, b) => (b.mean > a.mean ? b : a));
const man = (m: number | null) => (m === null ? "1,000만원 이상" : `${Math.round(m).toLocaleString()}만원`);
const yearMan = (m: number) => `${(Math.round((m * 12) / 10) * 10).toLocaleString()}만원`;

const g30 = byKey("30-34");
const g35 = byKey("35-39");
const g40 = byKey("40-44");
const g20 = byKey("20-24");
const g25 = byKey("25-29");
const g50 = byKey("50-54");

const FAQ = [
  {
    q: "이 순위는 어떤 자료로 계산하나요?",
    a: `${WAGE_SOURCE.name} 보도자료의 '연령별 소득'·'성·연령별 소득' 표입니다. ${WAGE_SOURCE.year}년 12월에 하루 이상 일한 임금근로일자리의 세전 월 보수를 나이대별로 10개 소득 구간 비중, 평균, 중위값으로 공개한 자료로, 구간 안에서는 고르게 분포한다고 보고 이어서 상위 %를 추정합니다. 공식 중위값은 그대로 맞춥니다.`,
  },
  {
    q: "30대·40대 중위 월급은 얼마인가요?",
    a: `세전 월 기준으로 30~34세 중위 ${g30.median}만원(평균 ${g30.mean}만원), 35~39세 중위 ${g35.median}만원(평균 ${g35.mean}만원), 40~44세 중위 ${g40.median}만원(평균 ${g40.mean}만원)입니다. 연으로 환산하면 30대 초반 중위는 약 ${yearMan(g30.median)}입니다.`,
  },
  {
    q: "월급이 가장 높은 나이대는 언제인가요?",
    a: `중위값은 ${peakMedian.label}(${peakMedian.median}만원), 평균은 ${peakMean.label}(${peakMean.mean}만원)가 가장 높습니다. 50대부터는 평균은 높게 유지되지만 중위는 빠르게 내려갑니다. 고소득층과 저소득층이 함께 있어 같은 나이대 안의 격차가 크다는 뜻입니다(50~54세 평균 ${g50.mean}만원, 중위 ${g50.median}만원).`,
  },
  {
    q: "연봉으로 넣어도 되나요?",
    a: "네. 자료가 세전 월 단위 보수라서 연봉을 12로 나눠 비교합니다. 상여금이 있다면 연봉에 포함해 넣는 편이 가깝고, 출장비·유류비 같은 실비 성격의 비과세 수당은 빼고 넣으세요.",
  },
  {
    q: "연봉 상위 % 계산기와 결과가 다른 이유는?",
    a: "연봉 상위 % 계산기는 국세청이 1년 치 연말정산 총급여로 사람 단위로 줄 세운 자료이고, 이 계산기는 12월 한 달의 일자리 단위 월 보수 자료입니다. 한 사람이 두 곳에서 일하면 일자리 2개로 따로 잡히고, 단시간 근로도 함께 들어 있어 같은 금액이라도 순위가 조금 다르게 나옵니다.",
  },
];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";
const th = "px-3 py-2 font-medium whitespace-nowrap";
const td = "px-3 py-1.5 text-right tabular-nums whitespace-nowrap";

export default function SalaryByAgePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryByAgeCalculator />

      <section className={card}>
        <p>
          같은 월급이라도 20대와 40대에게 의미가 다릅니다. 국가데이터처 자료로 보면{" "}
          {WAGE_SOURCE.year}년 임금근로자 전체의 세전 월급 중위값은 <b>{ALL.median}만원</b>, 평균은{" "}
          {ALL.mean}만원입니다. 나이대별 중위값은 20~24세 {g20.median}만원, 25~29세 {g25.median}만원에서
          꾸준히 올라 {peakMedian.label} {peakMedian.median}만원으로 가장 높고, 그 뒤로 내려갑니다. 위 계산기에
          나이대와 월급을 넣으면 같은 나이대 안에서 몇 번째쯤인지 볼 수 있어요.
        </p>
        <p className="mt-2 text-slate-500">
          나이와 상관없이 전체 직장인 중 순위는{" "}
          <Link href="/calc/salary-rank" className={link}>
            내 연봉 상위 몇 %
          </Link>
          , 세후로 손에 쥐는 돈은{" "}
          <Link href="/calc/take-home" className={link}>
            연봉 실수령액 계산기
          </Link>
          와{" "}
          <Link href="/calc/salary-table" className={link}>
            2026 연봉 실수령액 표
          </Link>
          에서 볼 수 있어요.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>나이대별 세전 월급 한눈에 보기</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} text-left`}>나이대</th>
                <th className={`${th} text-right`}>중위</th>
                <th className={`${th} text-right`}>평균</th>
                <th className={`${th} text-right`}>상위 30%</th>
                <th className={`${th} text-right`}>상위 10%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {ROWS.map(({ g, top10, top30 }) => (
                <tr key={g.key} className={g.key === "all" ? "bg-slate-50 font-medium" : undefined}>
                  <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">
                    {g.key === "all" ? "전체" : g.label}
                  </td>
                  <td className={`${td} font-semibold text-indigo-600`}>{g.median}만원</td>
                  <td className={td}>{g.mean}만원</td>
                  <td className={td}>{man(top30)}</td>
                  <td className={td}>{man(top10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          세전 월 보수 기준. 중위·평균은 공식 발표값, 상위 30%·10% 기준은 소득 구간 비중으로 추정한
          값입니다.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>남녀 중위 월급</h2>
        <div className="mt-3 overflow-x-auto rounded-lg ring-1 ring-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className={`${th} text-left`}>나이대</th>
                <th className={`${th} text-right`}>남성 중위</th>
                <th className={`${th} text-right`}>여성 중위</th>
                <th className={`${th} text-right`}>남성 평균</th>
                <th className={`${th} text-right`}>여성 평균</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {[...AGES, ALL].map((g) => (
                <tr key={g.key} className={g.key === "all" ? "bg-slate-50 font-medium" : undefined}>
                  <td className="px-3 py-1.5 font-medium whitespace-nowrap text-slate-700">
                    {g.key === "all" ? "전체" : g.label}
                  </td>
                  <td className={td}>{g.male.median}만원</td>
                  <td className={td}>{g.female.median}만원</td>
                  <td className={td}>{g.male.mean}만원</td>
                  <td className={td}>{g.female.mean}만원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3">
          20대까지는 남녀 차이가 크지 않다가 30대 후반부터 벌어집니다. 40~44세 중위값은 남성{" "}
          {g40.male.median}만원, 여성 {g40.female.median}만원입니다. 경력 단절, 근로 시간, 직종
          차이가 모두 섞인 값이라 같은 일을 하는 사람끼리의 임금 차이와는 다릅니다.
        </p>
      </section>

      <section className={card}>
        <h2 className={h2}>계산 방법과 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            &apos;소득&apos;은 회사가 지급한 세전 보수를 월 단위로 본 값입니다. 출장비·유류비처럼 실비로
            주는 비과세 수당은 빠져 있습니다.
          </li>
          <li>
            사람이 아니라 일자리 단위라, 두 곳에서 일하면 각각 따로 잡힙니다. 단시간·초단기 일자리도
            포함돼 있어 낮은 구간 비중이 높게 나옵니다.
          </li>
          <li>
            자료는 소득을 10개 구간(85만원 미만 ~ 1,000만원 이상)으로 나눠 비중만 공개해, 구간 안에서는
            고르게 퍼져 있다고 보고 추정합니다. 1,000만원 이상 구간은 끝이 없어 &quot;상위 몇 %
            이내&quot;로만 표시합니다.
          </li>
          <li>
            나이는 그해 12월 31일 기준입니다. 다음 해 자료가 나오면(보통 2월) 갱신합니다.
          </li>
          <li>
            원자료:{" "}
            <a href={WAGE_SOURCE.url} className={link} target="_blank" rel="noopener">
              {WAGE_SOURCE.name} (정책브리핑 보도자료)
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
