import type { Metadata } from "next";
import Link from "next/link";
import SalaryRankCalculator from "../SalaryRankCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "내 연봉 상위 몇 % 계산기 — 대한민국 근로소득 순위",
  description:
    "내 연봉이 대한민국 직장인 중 상위 몇 %인지 알려줍니다. 연봉만 넣으면 대략적인 소득 순위를 바로 확인하세요.",
  keywords: ["연봉 상위 몇퍼", "연봉 순위", "근로소득 상위", "내 연봉 백분위", "연봉 상위 계산기"],
  alternates: { canonical: "/calc/salary-rank" },
};

const FAQ = [
  {
    q: "연봉 상위 %는 어떻게 정해지나요?",
    a: "국세청이 공개하는 근로소득 분포를 기준으로, 내 연봉보다 높은 사람의 비율을 대략 추정합니다. 예를 들어 상위 10%라면, 나보다 연봉이 높은 사람이 약 10%라는 뜻입니다.",
  },
  {
    q: "얼마면 상위 10%인가요?",
    a: "대략 연봉 9천만원 안팎부터 상위 10% 수준으로 봅니다. 상위 1%는 대략 2억원대 후반 이상입니다. (근사치)",
  },
  {
    q: "세전 기준인가요?",
    a: "세전 연봉(총급여) 기준의 근사입니다. 실수령액이 궁금하면 연봉 실수령액 계산기를 이용해 보세요.",
  },
];

export default function SalaryRankPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SalaryRankCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          내 연봉이 남들과 비교해 어느 정도인지 궁금할 때가 있죠. 이 계산기는
          대한민국 근로소득 분포를 바탕으로 <b>내 연봉이 상위 몇 %</b>인지 대략
          알려줍니다. 재미로 확인하고, 세후 실수령이 궁금하면{" "}
          <Link href="/calc/take-home" className="text-indigo-600 hover:underline">
            연봉 실수령액 계산기
          </Link>
          도 함께 써보세요.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
