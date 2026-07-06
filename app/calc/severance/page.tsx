import type { Metadata } from "next";
import Link from "next/link";
import SeveranceCalculator from "../SeveranceCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "퇴직금 계산기 — 예상 퇴직금 간편 계산",
  description:
    "월 평균급여와 근속기간을 넣으면 예상 퇴직금을 바로 계산합니다. 법정 퇴직금 공식 기준의 근사치를 확인하세요.",
  keywords: ["퇴직금 계산기", "퇴직금 계산", "예상 퇴직금", "평균임금", "근속연수 퇴직금"],
  alternates: { canonical: "/calc/severance" },
};

const FAQ = [
  {
    q: "퇴직금은 어떻게 계산하나요?",
    a: "법정 퇴직금 = 1일 평균임금 × 30일 × (재직일수 ÷ 365) 입니다. 1년 이상 근무하면 대략 '한 달치 평균임금 × 근속연수' 정도가 됩니다.",
  },
  {
    q: "평균임금은 무엇인가요?",
    a: "퇴직 직전 3개월 동안 받은 총급여(상여·수당 포함 환산)를 그 기간의 일수로 나눈 1일치 임금입니다. 이 계산기는 월 평균급여를 기준으로 근사합니다.",
  },
  {
    q: "퇴직금에도 세금이 붙나요?",
    a: "네, 퇴직소득세가 부과됩니다. 다만 근속연수에 따라 공제가 커서 일반 소득세보다 세율이 낮은 편입니다. 이 계산기의 금액은 세전 기준입니다.",
  },
  {
    q: "1년 미만 근무하면 퇴직금이 없나요?",
    a: "법정 퇴직금은 계속근로기간 1년 이상일 때 발생합니다. 1년 미만이면 원칙적으로 지급 의무가 없습니다.",
  },
];

export default function SeverancePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SeveranceCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>퇴직금</b>은 1년 이상 근무한 근로자가 퇴직할 때 받는 급여로, 법정
          공식은 &lsquo;1일 평균임금 × 30 × (재직일수 ÷ 365)&rsquo;입니다.
          대략적으로는 <b>한 달치 평균임금 × 근속연수</b> 정도로 생각하면 됩니다.
          이직·퇴사 전에 예상 금액을 가늠해 두면 좋아요.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
