import type { Metadata } from "next";
import Link from "next/link";
import AverageCalculator from "../AverageCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "주식 평단가·물타기 계산기 — 평균 매입가·손익",
  description:
    "여러 번 나눠 산 주식·코인의 평균 매입 단가와 수익률을 계산합니다. 추가 매수(물타기) 후 평단가도 바로 확인하세요.",
  keywords: ["평단가 계산기", "물타기 계산기", "주식 평균단가", "코인 평단가", "수익률 계산"],
  alternates: { canonical: "/calc/average" },
};

const FAQ = [
  {
    q: "평단가는 어떻게 계산하나요?",
    a: "평균 매입가 = 총 매입금액 ÷ 총 수량 입니다. 각 매수의 (수량 × 단가)를 모두 더한 뒤 총 수량으로 나눕니다.",
  },
  {
    q: "물타기는 무엇인가요?",
    a: "보유 종목이 하락했을 때 더 낮은 가격에 추가 매수해 평균 단가를 낮추는 것을 말합니다. 이 계산기에서 매수를 한 줄 더하면 새 평단가가 바로 계산됩니다.",
  },
  {
    q: "물타기를 하면 무조건 유리한가요?",
    a: "평단가는 낮아지지만 투자금과 손실 위험도 커집니다. 종목의 펀더멘털과 자금 여력을 함께 고려해야 합니다.",
  },
];

export default function AveragePage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>
      <AverageCalculator />
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>평단가(평균 매입 단가)</b>는 여러 번에 걸쳐 산 주식·코인의 1주당 평균
          매입 가격입니다. 현재가와 비교하면 지금 수익인지 손실인지, 수익률이
          몇 %인지 알 수 있어요. 하락 시 추가 매수(물타기)를 하면 평단가가
          낮아지지만 투자금도 늘어난다는 점을 함께 봐야 합니다.
        </p>
      </div>
      <Faq items={FAQ} />
    </div>
  );
}
