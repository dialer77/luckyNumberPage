import type { Metadata } from "next";
import Link from "next/link";
import CompoundCalculator from "../CompoundCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "복리 계산기 — 복리 이자·수익 회차별 계산",
  description:
    "시작금·복리 이율·횟수만 넣으면 회차별 이자와 누적 수익, 최종 금액을 계산합니다. 복리 효과를 한눈에 확인하세요.",
  keywords: ["복리 계산기", "복리 이자 계산", "복리 수익", "복리 효과", "이자 계산기"],
  alternates: { canonical: "/calc/compound" },
};

const FAQ = [
  {
    q: "복리는 단리와 어떻게 다른가요?",
    a: "단리는 원금에만 이자가 붙지만, 복리는 이미 쌓인 이자에도 다시 이자가 붙습니다. 그래서 기간이 길수록 복리가 단리보다 훨씬 많아집니다.",
  },
  {
    q: "복리 계산 공식은 무엇인가요?",
    a: "최종금액 = 시작금 × (1 + 이율)^횟수 입니다. 예를 들어 1,000만원을 회당 5%로 10회 복리하면 약 1,629만원이 됩니다.",
  },
  {
    q: "'회'는 무엇을 의미하나요?",
    a: "복리가 적용되는 단위입니다. 연 복리면 '년', 월 복리면 '월'로 해석하면 됩니다. 이 계산기는 회차별로 이자와 누적 수익을 표로 보여줍니다.",
  },
  {
    q: "왜 빨리 시작할수록 유리한가요?",
    a: "복리에서 가장 큰 변수는 기간입니다. 같은 금액·이율이라도 회차(기간)가 늘어날수록 수익이 기하급수적으로 커지기 때문입니다.",
  },
];

export default function CompoundCalcPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <CompoundCalculator />

      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>복리</b>는 원금뿐 아니라 그동안 쌓인 이자에도 다시 이자가 붙는
          방식입니다. 시간이 지날수록 이자가 이자를 낳아 눈덩이처럼 불어나기
          때문에, 투자·저축에서 &lsquo;복리의 힘&rsquo;이라고 불립니다.
        </p>
        <p className="mt-2">
          이 계산기는 회차별로 이번 회차 수익·누적 잔액·시작 대비 수익을 표로
          보여줘, 복리가 어떻게 커지는지 한눈에 확인할 수 있어요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
