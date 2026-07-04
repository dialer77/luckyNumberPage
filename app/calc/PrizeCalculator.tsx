"use client";
import { useState } from "react";
import { calcTax, afterTax, formatKRW } from "@/lib/lotto-data";
import { Card, Stat } from "./ui";

// 당첨금 실수령액 계산기
export default function PrizeCalculator() {
  const [amount, setAmount] = useState(2_000_000_000);
  const tax = calcTax(amount);
  const net = afterTax(amount);

  return (
    <Card
      title="🎯 당첨금 실수령액 계산기"
      desc="세전 당첨금을 넣으면 세금과 세후 실수령액을 계산합니다."
    >
      <label className="block text-sm text-slate-500">세전 당첨금 (원)</label>
      <input
        type="number"
        value={amount}
        min={0}
        step={1_000_000}
        onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      />
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="세전" value={formatKRW(amount)} />
        <Stat label="세금" value={`−${formatKRW(tax)}`} accent="loss" />
        <Stat label="실수령(세후)" value={formatKRW(net)} accent="gain" />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        * 복권 기준: 3억 이하 22%, 3억 초과분 33% (참고용 근사치).
      </p>
    </Card>
  );
}
