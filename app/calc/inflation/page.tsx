import type { Metadata } from "next";
import Link from "next/link";
import InflationCalculator from "../InflationCalculator";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "물가 계산기 — 옛날 돈의 지금 가치 (인플레이션)",
  description:
    "그때 그 돈이 지금은 얼마의 가치일까? 한국 물가상승률(소비자물가지수)로 옛날 돈의 현재 가치를 계산해 보세요.",
  keywords: ["물가 계산기", "인플레이션 계산기", "옛날 돈 가치", "화폐 가치 계산", "물가상승률"],
  alternates: { canonical: "/calc/inflation" },
};

const FAQ = [
  {
    q: "옛날 돈의 지금 가치는 어떻게 계산하나요?",
    a: "소비자물가지수(CPI)의 비율로 환산합니다. 예를 들어 지금 물가가 그때의 2배라면, 그때 100만원은 지금 약 200만원의 가치를 가집니다.",
  },
  {
    q: "인플레이션이 뭔가요?",
    a: "물가가 오르면서 돈의 구매력이 떨어지는 현상입니다. 같은 1만원으로 살 수 있는 양이 시간이 지날수록 줄어드는 것이죠.",
  },
  {
    q: "한국의 연평균 물가상승률은 얼마인가요?",
    a: "시기에 따라 다르지만, 장기적으로 대체로 연 2~4% 수준입니다. 이 계산기에서 시점을 바꾸면 구간별 연평균 상승률을 확인할 수 있어요.",
  },
  {
    q: "왜 저축만 하면 손해라고 하나요?",
    a: "물가상승률보다 낮은 이자로만 돈을 두면, 명목 금액은 그대로여도 실제 구매력은 줄어들기 때문입니다. 그래서 물가 이상의 수익을 내는 것이 중요하다고 말합니다.",
  },
];

export default function InflationPage() {
  return (
    <div className="space-y-6">
      <Link href="/calc" className="text-sm text-indigo-600 hover:underline">
        ← 머니계산기
      </Link>

      <InflationCalculator />

      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <p>
          <b>인플레이션(물가상승)</b>은 시간이 지나면서 물가가 올라 돈의 가치가
          떨어지는 현상입니다. &lsquo;예전엔 짜장면이 얼마였는데&rsquo; 같은 말이
          바로 인플레이션이에요. 옛날 금액을 지금 가치로 환산해 보면, 돈의
          가치가 얼마나 변했는지 실감할 수 있습니다.
        </p>
        <p className="mt-2">
          그래서 물가상승률보다 낮은 수익만 내면 &lsquo;실질적으로&rsquo;는 돈이
          줄어드는 셈이라, 투자·저축에서 물가를 이기는 것이 중요합니다.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
