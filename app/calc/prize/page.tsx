import type { Metadata } from "next";
import Link from "next/link";
import PrizeCalculator from "../PrizeCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "당첨금 실수령액 계산기 — 복권 세금 계산",
  description:
    "로또·복권 당첨금의 세금과 세후 실수령액을 계산합니다. 3억원 이하 22%, 초과분 33% 기준.",
  keywords: ["당첨금 실수령액", "로또 세금 계산기", "복권 세금", "로또 실수령"],
  alternates: { canonical: "/calc/prize" },
};

const FAQ = [
  {
    q: "복권 당첨금 세율은 어떻게 되나요?",
    a: "3억원 이하 부분은 22%(소득세 20% + 지방소득세 2%), 3억원 초과 부분은 33%(소득세 30% + 지방소득세 3%)가 과세됩니다.",
  },
  {
    q: "1등에 당첨되면 실제로 얼마를 받나요?",
    a: "예를 들어 당첨금이 20억원이면 대략 6억6천만원가량이 세금으로 빠져 세후 약 13억4천만원을 받습니다. 금액이 클수록 세금 비중이 커집니다.",
  },
  {
    q: "당첨금은 어디서 받나요?",
    a: "소액은 판매점이나 은행, 고액(1등 등)은 농협은행 본점 등 지정 지급처에서 신분증·당첨 복권을 지참해 수령합니다. 세금은 지급 시 원천징수됩니다.",
  },
];

export default function PrizeCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <PrizeCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          로또·복권 당첨금은 &lsquo;기타소득&rsquo;으로 분류되어 세금이
          부과됩니다. 3억원을 기준으로 이하 22%, 초과분 33%가 적용되어, 세전
          당첨금과 실제 손에 쥐는 금액(세후 실수령액)은 꽤 차이가 나요. 세전
          금액을 넣으면 세금과 실수령액을 바로 확인할 수 있습니다.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
