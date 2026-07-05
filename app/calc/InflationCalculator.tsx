"use client";
// 인플레이션(물가) 계산기 — 옛날 돈의 지금 가치 / 지금 돈의 옛날 가치.

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { PAST_YEARS, CURRENT_YEAR, toNow, toPast } from "@/lib/inflation";
import ShareButton from "@/app/components/ShareButton";
import { Card } from "./ui";

const AMOUNTS = [
  { v: 10_000, label: "1만원" },
  { v: 100_000, label: "10만원" },
  { v: 1_000_000, label: "100만원" },
  { v: 10_000_000, label: "1천만원" },
];

export default function InflationCalculator() {
  const [mode, setMode] = useState<"toNow" | "toPast">("toNow");
  const [amount, setAmount] = useState(100_000);
  const [year, setYear] = useState(1990);

  const res = mode === "toNow" ? toNow(amount, year) : toPast(amount, year);

  const headline =
    mode === "toNow"
      ? `${year}년 ${formatKRW(amount)}의 지금 가치는`
      : `지금 ${formatKRW(amount)}의 ${year}년 가치는`;

  return (
    <Card
      title="🏷️ 물가 계산기 (인플레이션)"
      desc="옛날 돈이 지금 얼마의 가치인지, 반대로 지금 돈이 옛날엔 얼마였는지 계산합니다."
    >
      {/* 모드 */}
      <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
        <Tab active={mode === "toNow"} onClick={() => setMode("toNow")}>
          그때 → 지금
        </Tab>
        <Tab active={mode === "toPast"} onClick={() => setMode("toPast")}>
          지금 → 그때
        </Tab>
      </div>

      {/* 금액 */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-500">금액</div>
        <div className="flex flex-wrap items-center gap-2">
          {AMOUNTS.map((a) => (
            <Chip key={a.v} active={a.v === amount} onClick={() => setAmount(a.v)}>
              {a.label}
            </Chip>
          ))}
          <input
            type="number"
            value={amount}
            min={0}
            step={10000}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
          <span className="text-sm text-slate-400">원</span>
        </div>
      </div>

      {/* 시점 */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-500">
          {mode === "toNow" ? "언제 기준" : "어느 시점과 비교"}
        </div>
        <div className="flex flex-wrap gap-2">
          {PAST_YEARS.map((y) => (
            <Chip key={y} active={y === year} onClick={() => setYear(y)}>
              {y}년
            </Chip>
          ))}
        </div>
      </div>

      {/* 결과 */}
      <section className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">{headline}</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">
          {formatKRW(res.value)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
          <span>{res.multiple.toFixed(2)}배</span>
          <span>누적 물가 {res.totalPct >= 0 ? "+" : ""}{res.totalPct.toFixed(0)}%</span>
          <span>연평균 {res.annualPct.toFixed(1)}%</span>
        </div>
      </section>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🏷️",
            t: "물가 계산기",
            v: formatKRW(res.value),
            s:
              mode === "toNow"
                ? `${year}년 ${formatKRW(amount)} → 지금`
                : `지금 ${formatKRW(amount)} → ${year}년`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 한국 소비자물가지수(2020=100)의 대략적인 값 기준입니다. {CURRENT_YEAR}
        년 기준으로 환산했으며 실제 지수와 다소 차이날 수 있어요.
      </p>
    </Card>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 font-medium transition ${
        active ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
      }`}
    >
      {children}
    </button>
  );
}
