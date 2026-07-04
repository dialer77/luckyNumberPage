"use client";
// 머니계산기 모음 — 상호작용 필요 → Client Component.

import { useState } from "react";
import { calcTax, afterTax, formatKRW } from "@/lib/lotto-data";

export default function Calculators() {
  return (
    <div className="space-y-6">
      <PrizeCalculator />
      <CompoundCalculator />
    </div>
  );
}

// ── 당첨금 실수령액 계산기 ──
function PrizeCalculator() {
  const [amount, setAmount] = useState(2_000_000_000);
  const tax = calcTax(amount);
  const net = afterTax(amount);

  return (
    <Card title="🎯 당첨금 실수령액 계산기" desc="세전 당첨금을 넣으면 세금과 세후 실수령액을 계산합니다.">
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

// ── 복리 계산기 ──
function CompoundCalculator() {
  const [principal, setPrincipal] = useState(10_000_000);
  const [rate, setRate] = useState(5); // 연이율 %
  const [years, setYears] = useState(10);

  const future = Math.round(principal * Math.pow(1 + rate / 100, years));
  const interest = future - principal;

  return (
    <Card title="📈 복리 계산기" desc="원금이 매년 복리로 불어나면 얼마가 되는지 계산합니다.">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberInput label="원금 (원)" value={principal} step={1_000_000} onChange={setPrincipal} />
        <NumberInput label="연이율 (%)" value={rate} step={0.5} onChange={setRate} />
        <NumberInput label="기간 (년)" value={years} step={1} onChange={setYears} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="원금" value={formatKRW(principal)} />
        <Stat label="이자" value={`+${formatKRW(interest)}`} accent="gain" />
        <Stat label="최종금액" value={formatKRW(future)} accent="gain" />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        * 연 1회 복리 기준 단순 계산 (세금·수수료 미반영).
      </p>
    </Card>
  );
}

// ── 공용 UI ──
function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="font-bold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function NumberInput({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        min={0}
        step={step}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gain" | "loss";
}) {
  const color =
    accent === "loss"
      ? "text-rose-500"
      : accent === "gain"
      ? "text-indigo-600"
      : "text-slate-800";
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-1 text-sm font-bold tabular-nums ${color}`}>
        {value}
      </div>
    </div>
  );
}
