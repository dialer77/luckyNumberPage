import type { Metadata } from "next";
import Link from "next/link";
import DividendCalculator from "./DividendCalculator";
import TargetDividend from "./TargetDividend";
import Faq from "../../components/Faq";

export const metadata: Metadata = {
  title: "고배당 ETF 배당 계산기 — 배당 재투자 복리",
  description:
    "고배당 ETF에 시작 금액과 매월 납입, 배당율·기간을 넣어 배당 재투자(복리)로 얼마가 되는지 계산해 보세요.",
  alternates: { canonical: "/invest/dividend" },
};

const FAQ = [
  {
    q: "배당 재투자가 왜 중요한가요?",
    a: "받은 배당으로 다시 주식을 사면, 그 주식이 또 배당을 낳는 복리 효과가 생깁니다. 기간이 길수록 재투자한 경우와 안 한 경우의 차이가 눈덩이처럼 벌어집니다. 이 계산기는 배당을 자동 재투자한다고 가정해 최종 금액을 보여줍니다.",
  },
  {
    q: "배당률은 어떻게 정하나요?",
    a: "ETF마다 배당률이 다르고 매년 변동합니다. 국내 고배당·미국 배당성장 ETF는 대체로 연 2~7% 범위가 많습니다. 정확한 값은 해당 ETF의 최근 분배금 기준으로 확인해 입력하세요.",
  },
  {
    q: "세금은 반영되나요?",
    a: "이 계산기는 세전 기준의 대략적인 추정입니다. 실제로는 배당소득세(약 15.4%)가 원천징수되고, 연간 금융소득이 크면 금융소득종합과세 대상이 될 수 있어 실수령이 줄어듭니다. 참고용으로만 활용하세요.",
  },
  {
    q: "'월 배당 목표'는 무엇인가요?",
    a: "매달 받고 싶은 배당금(예: 월 50만원)을 정하면, 목표 배당률 기준으로 필요한 투자 원금이 얼마인지 역산해 보여줍니다. 배당 파이어(FIRE)를 계획할 때 기준점으로 쓰기 좋습니다.",
  },
];

export default function DividendPage() {
  return (
    <div className="space-y-6">
      <Link href="/invest" className="text-sm text-indigo-600 hover:underline">
        ← 그때샀으면
      </Link>
      <div>
        <h1 className="text-2xl font-bold">💰 고배당 ETF 배당 계산기</h1>
        <p className="mt-1 text-sm text-slate-500">
          시작 금액과 추가 납입, 배당율·주기·기간을 넣으면 배당을 재투자(복리)해
          얼마가 되는지 계산해 드려요.
        </p>
      </div>
      <DividendCalculator />
      <TargetDividend />

      {/* 설명 문단 — 콘텐츠 보강 */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          배당 재투자, 시간이 만드는 복리
        </h2>
        <p className="mt-2">
          고배당 ETF의 매력은 &lsquo;받는 배당을 다시 투자&rsquo;할 때 커집니다.
          배당으로 주식을 더 사면 다음 배당이 늘고, 그 배당이 또 주식을 사는
          선순환이 복리를 만듭니다. 초반에는 차이가 작지만 10년·20년이 지나면
          재투자 여부에 따라 최종 자산이 크게 벌어집니다.
        </p>
        <p className="mt-2">
          다만 배당률은 고정이 아니고, 배당소득세(약 15.4%)와 ETF 보수도
          실제 수익을 갉아먹습니다. 계산기 결과는 세전 기준의 대략치이니
          참고용으로 보세요. 배당 투자의 개념과 전략은{" "}
          <Link href="/guide/dividend-etf" className="text-indigo-600 hover:underline">
            고배당 ETF로 &lsquo;월 배당&rsquo; 만들기
          </Link>{" "}
          가이드에서 더 자세히 다룹니다.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
