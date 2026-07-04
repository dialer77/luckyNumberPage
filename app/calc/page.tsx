import type { Metadata } from "next";
import Link from "next/link";
import Faq from "../components/Faq";

export const metadata: Metadata = {
  title: "머니계산기 — 당첨금 실수령·복리 계산",
  description:
    "로또 당첨금 세후 실수령액, 복리 이자 등 돈과 관련된 계산기 모음.",
  alternates: { canonical: "/calc" },
};

const CALC_FAQ = [
  {
    q: "당첨금 실수령액은 어떻게 계산하나요?",
    a: "복권 당첨금은 3억원 이하 22%, 3억원 초과분 33%가 과세됩니다. 세전 금액을 넣으면 세금을 뺀 실수령액을 바로 보여줍니다.",
  },
  {
    q: "복리와 단리는 뭐가 다른가요?",
    a: "단리는 원금에만 이자가 붙고, 복리는 이자에도 이자가 붙습니다. 기간이 길수록 복리 효과가 커져요. 복리 계산기로 확인해 보세요.",
  },
  {
    q: "적금과 예금의 차이는 무엇인가요?",
    a: "적금은 매달 일정액을 나눠 넣는 방식, 예금은 목돈을 한 번에 예치하는 방식입니다. 같은 금리라도 이자 계산 방식이 달라요.",
  },
  {
    q: "이직하면 소득이 얼마나 차이나나요?",
    a: "연봉은 매년 인상률만큼 복리로 오르기 때문에, 이직으로 올린 연봉 차이도 시간이 갈수록 벌어집니다. 이직 연봉 계산기로 누적 차이를 볼 수 있어요.",
  },
];

// 머니계산기 "대문" — 계산기들을 카드로 정리.
const CALCULATORS = [
  {
    href: "/calc/prize",
    emoji: "🎯",
    title: "당첨금 실수령액 계산기",
    desc: "세전 당첨금 → 세금·세후 실수령액",
  },
  {
    href: "/calc/compound",
    emoji: "📈",
    title: "복리 계산기",
    desc: "원금이 복리로 불어나면 얼마?",
  },
  {
    href: "/calc/salary",
    emoji: "💼",
    title: "이직 연봉 계산기",
    desc: "이직으로 벌어지는 누적 소득 차이",
  },
  {
    href: "/calc/savings",
    emoji: "🏦",
    title: "적금·예금 계산기",
    desc: "세후 만기 수령액 계산",
  },
];

export default function CalcHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🧮 머니계산기</h1>
        <p className="mt-1 text-sm text-slate-500">
          필요한 계산기를 골라보세요. 계산기는 하나씩 늘어납니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CALCULATORS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="text-2xl">{c.emoji}</span>
            <div>
              <div className="font-semibold">{c.title}</div>
              <div className="mt-0.5 text-sm text-slate-500">{c.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <Faq items={CALC_FAQ} />
    </div>
  );
}
