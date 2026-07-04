"use client";
import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

// 복리 계산기
export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState(10_000_000);
  const [rate, setRate] = useState(5); // 연이율 %
  const [years, setYears] = useState(10);

  const future = Math.round(principal * Math.pow(1 + rate / 100, years));
  const interest = future - principal;

  return (
    <Card
      title="📈 복리 계산기"
      desc="원금이 매년 복리로 불어나면 얼마가 되는지 계산합니다."
    >
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
      <div className="mt-4">
        <ShareButton
          payload={{
            e: "📈",
            t: "복리 계산",
            v: formatKRW(future),
            s: `${years}년 · 이자 ${formatKRW(interest)}`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 연 1회 복리 기준 단순 계산 (세금·수수료 미반영).
      </p>
    </Card>
  );
}
