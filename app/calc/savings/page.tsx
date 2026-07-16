import type { Metadata } from "next";
import Link from "next/link";
import SavingsCalculator from "../SavingsCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "적금·예금 계산기 — 세후 만기 수령액",
  description:
    "정기적금·정기예금의 세전 이자와 세후(15.4% 과세) 만기 수령액을 간단히 계산해 보세요.",
  keywords: ["적금 계산기", "예금 계산기", "적금 이자 계산", "만기 수령액", "세후 이자"],
  alternates: { canonical: "/calc/savings" },
};

const FAQ = [
  {
    q: "적금 이자가 표시 금리보다 적은 이유는?",
    a: "적금은 매달 넣는 돈마다 이자가 붙는 기간이 다르기 때문입니다. 첫 달 넣은 돈은 12개월치, 마지막 달 넣은 돈은 1개월치 이자만 받아 실제 수익률은 표시 금리의 절반쯤 됩니다.",
  },
  {
    q: "적금과 예금 중 뭐가 유리한가요?",
    a: "같은 표시 금리라면 목돈을 한 번에 맡기는 예금의 실질 이자가 더 큽니다. 다만 목돈이 없으면 적금으로 모으는 게 현실적이에요.",
  },
  {
    q: "이자 세금은 얼마인가요?",
    a: "일반 과세 기준 이자소득세 15.4%(소득세 14% + 지방소득세 1.4%)가 원천징수됩니다. 이 계산기는 세후 수령액을 함께 보여줍니다.",
  },
];

export default function SavingsCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <SavingsCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>정기적금</b>은 매달 일정액을 나눠 넣는 저축, <b>정기예금</b>은 목돈을
          한 번에 맡기는 저축입니다. 같은 금리라도 이자가 붙는 방식이 달라 실제
          받는 이자가 차이 납니다. 이 계산기로 세전 이자와 세금(15.4%)을 뗀 세후
          만기 수령액을 미리 확인해 보세요.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
