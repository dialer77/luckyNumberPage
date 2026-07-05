import type { Metadata } from "next";
import Link from "next/link";
import LoanCalculator from "../LoanCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "대출 원리금 계산기 — 월 상환액·총 이자 계산",
  description:
    "대출금액·금리·기간을 넣으면 원리금균등·원금균등 월 상환액과 총 이자, 월별 상환 스케줄을 계산합니다.",
  keywords: ["대출 원리금 계산기", "원리금균등", "원금균등", "대출 이자 계산", "월 상환액 계산기"],
  alternates: { canonical: "/calc/loan" },
};

const FAQ = [
  {
    q: "원리금균등과 원금균등은 뭐가 다른가요?",
    a: "원리금균등은 매월 상환액(원금+이자)이 일정합니다. 원금균등은 매월 갚는 원금이 일정하고 이자는 잔액에 따라 줄어들어, 초반 상환액이 크고 점점 줄어듭니다. 총 이자는 보통 원금균등이 더 적습니다.",
  },
  {
    q: "만기일시상환은 무엇인가요?",
    a: "대출 기간 동안 이자만 내다가 만기에 원금을 한 번에 갚는 방식입니다. 매월 부담은 가장 적지만 원금이 줄지 않아 총 이자는 가장 많습니다.",
  },
  {
    q: "월 상환액은 어떻게 계산되나요?",
    a: "원리금균등의 월 상환액 = 원금 × 월이율 × (1+월이율)^개월 ÷ ((1+월이율)^개월 − 1) 입니다. 월이율은 연 금리를 12로 나눈 값이에요.",
  },
  {
    q: "총 이자를 줄이려면?",
    a: "금리를 낮추거나, 기간을 줄이거나, 원금균등 방식을 택하면 총 이자가 줄어듭니다. 여유가 될 때 중도상환하는 것도 방법입니다.",
  },
];

export default function LoanPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <LoanCalculator />

      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>대출 원리금 계산기</b>는 대출금액·금리·기간을 바탕으로 매월 얼마를
          갚아야 하는지, 그리고 전체 기간 동안 이자가 총 얼마인지 계산합니다.
          같은 조건이라도 상환방식(원리금균등·원금균등·만기일시)에 따라 월
          부담과 총 이자가 달라지므로, 대출 전에 비교해 보는 것이 좋습니다.
        </p>
        <p className="mt-2">
          월별 상환 스케줄에서 매 회차의 원금·이자·잔액이 어떻게 변하는지도 확인할
          수 있어요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
