import { whatCanYouBuy, formatKRW } from "@/lib/lotto-data";

// "이 돈이면 뭘 할 수 있나" 카드 — 재미(공유) 요소.
// 금액을 받아서 아파트/차/항공권 등으로 환산해 보여줍니다.
// Server Component (계산만 하고 상호작용 없음).

export default function WhatCanYouBuy({ amount }: { amount: number }) {
  const items = whatCanYouBuy(amount);

  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
      <h2 className="text-lg font-bold">💭 이 돈이면?</h2>
      <p className="mt-1 text-sm text-slate-500">
        세후 <span className="font-semibold">{formatKRW(amount)}</span> 기준으로
        환산해 봤어요.
      </p>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100"
          >
            <span className="text-2xl">{it.emoji}</span>
            <div>
              <div className="text-sm text-slate-500">{it.label}</div>
              <div className="font-bold text-indigo-600">{it.text}</div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-slate-400">
        * 가격은 대략적인 예시값입니다.
      </p>
    </section>
  );
}
