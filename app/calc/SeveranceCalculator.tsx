"use client";
// 퇴직금 계산기 (근사).
// 퇴직금 = 1일 평균임금 × 30 × (재직일수 / 365)
// 1일 평균임금 ≈ 월 평균급여 ÷ 30.42 (365/12)

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

export default function SeveranceCalculator() {
  const [monthly, setMonthly] = useState(3_500_000); // 월 평균급여(세전, 상여 포함 환산)
  const [years, setYears] = useState(3);
  const [months, setMonths] = useState(0);

  const totalDays = years * 365 + months * 30.42;
  const dailyWage = monthly / 30.42; // 1일 평균임금 근사
  const severance = Math.round((dailyWage * 30 * totalDays) / 365);
  const serviceStr = `${years}년${months > 0 ? ` ${months}개월` : ""}`;

  return (
    <Card
      title="🧳 퇴직금 계산기"
      desc="월 평균급여와 근속기간으로 예상 퇴직금을 계산합니다. (세전, 근사)"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberInput label="월 평균급여 (원)" value={monthly} step={100_000} onChange={setMonthly} />
        <NumberInput label="근속 (년)" value={years} step={1} onChange={setYears} />
        <NumberInput label="근속 (개월)" value={months} step={1} onChange={setMonths} />
      </div>

      <section className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">예상 퇴직금 (세전)</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">
          {formatKRW(severance)}
        </div>
        <div className="mt-1 text-sm text-slate-500">근속 {serviceStr} 기준</div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="1일 평균임금" value={formatKRW(Math.round(dailyWage))} />
        <Stat label="총 재직일수" value={`${Math.round(totalDays).toLocaleString()}일`} />
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🧳",
            t: "퇴직금 계산",
            v: formatKRW(severance),
            s: `근속 ${serviceStr} · 월급 ${formatKRW(monthly)}`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 법정 퇴직금(1일 평균임금 × 30 × 재직일수/365) 근사입니다. 평균임금 산정
        방식·상여·수당·퇴직소득세에 따라 실제와 다를 수 있어요(위 금액은 세전).
      </p>
    </Card>
  );
}
