"use client";
// 적금/예금 계산기 (세전·세후).

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

const TAX = 0.154; // 일반과세 15.4%

export default function SavingsCalculator() {
  const [mode, setMode] = useState<"regular" | "deposit">("regular");
  const [monthly, setMonthly] = useState(500_000); // 적금 월납입
  const [principal, setPrincipal] = useState(10_000_000); // 예금 예치금
  const [rate, setRate] = useState(3.5);
  const [months, setMonths] = useState(12);

  // 적금(정기적금): 단리 관례 — 이자 = M×r×(n(n+1)/2)/12
  // 예금(정기예금): 단리 — 이자 = P×r×(n/12)
  const r = rate / 100;
  let totalIn: number;
  let interest: number;
  if (mode === "regular") {
    totalIn = monthly * months;
    interest = monthly * r * ((months * (months + 1)) / 2) / 12;
  } else {
    totalIn = principal;
    interest = principal * r * (months / 12);
  }
  const tax = interest * TAX;
  const net = totalIn + interest - tax;

  return (
    <Card
      title="🏦 적금·예금 계산기"
      desc="매월 납입(적금) 또는 목돈 예치(예금)의 세전·세후 만기 수령액을 계산합니다."
    >
      {/* 모드 */}
      <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
        <Tab active={mode === "regular"} onClick={() => setMode("regular")}>
          정기적금
        </Tab>
        <Tab active={mode === "deposit"} onClick={() => setMode("deposit")}>
          정기예금
        </Tab>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {mode === "regular" ? (
          <NumberInput label="매월 납입 (원)" value={monthly} step={100_000} onChange={setMonthly} />
        ) : (
          <NumberInput label="예치금 (원)" value={principal} step={1_000_000} onChange={setPrincipal} />
        )}
        <NumberInput label="연이율 (%)" value={rate} step={0.1} onChange={setRate} />
        <NumberInput label="기간 (개월)" value={months} step={1} onChange={setMonths} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="총 납입금" value={formatKRW(totalIn)} />
        <Stat label="세전 이자" value={`+${formatKRW(Math.round(interest))}`} accent="gain" />
        <Stat label="세금(15.4%)" value={`−${formatKRW(Math.round(tax))}`} accent="loss" />
        <Stat label="세후 수령액" value={formatKRW(Math.round(net))} accent="gain" />
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🏦",
            t: mode === "regular" ? "정기적금 계산" : "정기예금 계산",
            v: formatKRW(Math.round(net)),
            s: `${months}개월 · 세후 이자 ${formatKRW(Math.round(interest - tax))}`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 단리 기준 근사치이며 세금은 일반과세(15.4%)로 계산했습니다.
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
