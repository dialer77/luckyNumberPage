"use client";
// 주식 평단가·물타기 계산기 — 여러 번 매수한 평균 단가와 손익 계산.

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import { Card } from "./ui";

const won = (n: number) => `${Math.round(n).toLocaleString()}원`;

type Buy = { qty: number; price: number };

export default function AverageCalculator() {
  const [buys, setBuys] = useState<Buy[]>([
    { qty: 10, price: 70000 },
    { qty: 10, price: 60000 },
  ]);
  const [current, setCurrent] = useState(65000);

  function update(i: number, key: keyof Buy, v: number) {
    setBuys((prev) => prev.map((b, j) => (j === i ? { ...b, [key]: Math.max(0, v) } : b)));
  }
  function add() {
    setBuys((prev) => [...prev, { qty: 0, price: 0 }]);
  }
  function remove(i: number) {
    setBuys((prev) => (prev.length > 1 ? prev.filter((_, j) => j !== i) : prev));
  }

  const totalQty = buys.reduce((s, b) => s + b.qty, 0);
  const totalCost = buys.reduce((s, b) => s + b.qty * b.price, 0);
  const avg = totalQty > 0 ? totalCost / totalQty : 0;
  const value = totalQty * current;
  const profit = value - totalCost;
  const returnPct = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const gain = profit >= 0;

  return (
    <Card
      title="📊 평단가·물타기 계산기"
      desc="여러 번 나눠 산 주식·코인의 평균 매입가와 손익을 계산합니다. 추가 매수(물타기)도 아래에 한 줄 더하면 돼요."
    >
      {/* 매수 내역 */}
      <div className="space-y-2">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-slate-400">
          <span>수량</span>
          <span>매수 단가 (원)</span>
          <span className="w-8" />
        </div>
        {buys.map((b, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-2">
            <input
              type="number"
              value={b.qty}
              min={0}
              onChange={(e) => update(i, "qty", Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <input
              type="number"
              value={b.price}
              min={0}
              step={100}
              onChange={(e) => update(i, "price", Number(e.target.value))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
            <button
              onClick={() => remove(i)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-rose-500"
              aria-label="삭제"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={add}
          className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
        >
          + 매수 추가 (물타기)
        </button>
      </div>

      {/* 평단가 결과 */}
      <section className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">평균 매입가</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">{won(avg)}</div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>총 {totalQty.toLocaleString()}주</span>
          <span>총 매입 {formatKRW(totalCost)}</span>
        </div>
      </section>

      {/* 현재가 → 손익 */}
      <div className="mt-4">
        <label className="text-sm text-slate-500">현재가 (원)</label>
        <input
          type="number"
          value={current}
          min={0}
          step={100}
          onChange={(e) => setCurrent(Math.max(0, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Mini label="평가금액" value={formatKRW(value)} />
          <Mini
            label="평가손익"
            value={`${gain ? "+" : ""}${formatKRW(profit)}`}
            color={gain ? "text-indigo-600" : "text-rose-500"}
          />
          <Mini
            label="수익률"
            value={`${gain ? "+" : ""}${returnPct.toFixed(1)}%`}
            color={gain ? "text-indigo-600" : "text-rose-500"}
          />
        </div>
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "📊",
            t: "평단가 계산",
            v: `평단 ${won(avg)}`,
            s: `${totalQty}주 · 수익률 ${gain ? "+" : ""}${returnPct.toFixed(0)}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 수수료·세금은 반영하지 않은 단순 계산입니다.
      </p>
    </Card>
  );
}

function Mini({
  label,
  value,
  color = "text-slate-800",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-sm font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
