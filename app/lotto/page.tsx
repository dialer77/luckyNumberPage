import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../components/NumberBall";
import Faq from "../components/Faq";
import { formatKRW, afterTax } from "@/lib/lotto-data";
import { getLiveLatest } from "@/lib/lotto-live";
import { LOTTO_FEATURES } from "@/lib/brand";

const LOTTO_FAQ = [
  {
    q: "로또 1등 당첨 확률은 얼마인가요?",
    a: "6개 번호를 모두 맞힐 확률은 1/8,145,060 입니다. 45개 숫자 중 6개를 고르는 모든 경우의 수예요.",
  },
  {
    q: "로또 당첨금에 세금이 붙나요?",
    a: "네. 복권 당첨금은 3억원 이하는 22%, 3억원 초과분은 33%가 과세됩니다. 실제 받는 세후 금액은 '당첨금 실수령액 계산기'에서 확인할 수 있어요.",
  },
  {
    q: "로또 추첨은 언제 하나요?",
    a: "매주 토요일 저녁에 추첨합니다. 이 사이트의 당첨번호는 추첨 후 자동으로 업데이트됩니다.",
  },
  {
    q: "내 번호가 당첨됐는지 어떻게 확인하나요?",
    a: "'내 번호 당첨확인'에 번호를 저장해두면 매주 최신 회차와 자동으로 대조해 몇 개 맞았는지·등수를 알려줍니다. 회원가입 없이 이용할 수 있어요.",
  },
];

// 행운노트 서브브랜드 "대문" — 기능들을 카드로 정리해 보여주는 랜딩.
export const metadata: Metadata = {
  title: "행운노트 — 로또·복권",
  description:
    "로또·복권 당첨번호 조회, 번호 통계, 번호 생성기, 1등 도전, 오늘의 랭킹을 한곳에서.",
  alternates: { canonical: "/lotto" },
};

export const revalidate = 3600;

export default async function LottoHomePage() {
  const latest = await getLiveLatest();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🍀 행운노트</h1>
        <p className="mt-1 text-sm text-slate-500">
          로또·복권 당첨번호부터 1등 도전·랭킹까지, 원하는 기능을 골라보세요.
        </p>
      </div>

      {/* 최신 회차 하이라이트 */}
      <Link
        href={`/lotto/${latest.drwNo}`}
        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
      >
        <div className="text-xs text-slate-400">
          제 {latest.drwNo}회 · {latest.drwNoDate} 최신 당첨번호
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {latest.numbers.map((n) => (
            <NumberBall key={n} n={n} size="md" />
          ))}
          <span className="mx-1 text-slate-300">+</span>
          <NumberBall n={latest.bonus} size="md" />
        </div>
        <div className="mt-3 text-sm text-slate-500">
          세후 실수령{" "}
          <span className="font-semibold text-indigo-600">
            {formatKRW(afterTax(latest.firstWinAmount))}
          </span>
        </div>
      </Link>

      {/* 기능 카드 */}
      <div className="grid gap-3 sm:grid-cols-2">
        {LOTTO_FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl">{f.emoji}</span>
            <div>
              <div className="font-semibold">{f.title}</div>
              <div className="mt-0.5 text-sm text-slate-500">{f.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <Faq items={LOTTO_FAQ} />
    </div>
  );
}
