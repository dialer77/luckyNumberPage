"use client";
// 연봉 실수령액 계산기 (독립).

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { calcTakeHome } from "@/lib/salary";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput } from "./ui";

const PRESETS = [3000, 4000, 5000, 6000, 8000, 10000]; // 만원 단위

export default function TakeHomeCalculator() {
  const [salary, setSalary] = useState(40_000_000); // 연봉
  const [meal, setMeal] = useState(200_000); // 월 비과세(식대)

  const th = calcTakeHome(salary, meal);
  const netRatio = salary > 0 ? (th.net / salary) * 100 : 0;

  return (
    <Card
      title="💵 연봉 실수령액 계산기"
      desc="연봉을 넣으면 4대보험·세금을 뗀 월 실수령액을 계산합니다. (2026년 기준 근사)"
    >
      {/* 연봉 프리셋 */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((man) => (
          <button
            key={man}
            onClick={() => setSalary(man * 10000)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              salary === man * 10000
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
            }`}
          >
            {man >= 10000 ? `${man / 10000}억` : `${man}만원`}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <NumberInput label="연봉 (원)" value={salary} step={1_000_000} onChange={setSalary} />
        <NumberInput label="월 비과세·식대 (원)" value={meal} step={50_000} onChange={setMeal} />
      </div>

      {/* 결과: 월 실수령 */}
      <section className="mt-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">예상 월 실수령액</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">
          {formatKRW(th.monthlyNet)}
        </div>
        <div className="mt-1 text-sm text-slate-500">
          연 실수령 {formatKRW(th.net)} · 실수령률 {netRatio.toFixed(1)}%
        </div>
      </section>

      {/* 공제 내역 (월 기준) */}
      <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-100">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-50">
            <Tr k="월 세전" v={formatKRW(th.monthlyGross)} />
            <Tr k="국민연금·건강·고용 등 4대보험" v={`−${formatKRW(Math.round(th.insurance / 12))}`} minus />
            <Tr
              k={`소득세 (${Math.round(th.topRate * 100)}% 구간)`}
              v={`−${formatKRW(Math.round(th.incomeTax / 12))}`}
              minus
            />
            <Tr k="지방소득세" v={`−${formatKRW(Math.round(th.localTax / 12))}`} minus />
            <tr className="bg-indigo-50/50 font-semibold">
              <td className="px-3 py-2.5 text-slate-700">월 실수령</td>
              <td className="px-3 py-2.5 text-right tabular-nums text-indigo-600">
                {formatKRW(th.monthlyNet)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "💵",
            t: "연봉 실수령액",
            v: `월 ${formatKRW(th.monthlyNet)}`,
            s: `연봉 ${formatKRW(salary)} · 실수령률 ${netRatio.toFixed(0)}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 본인 1인·월 비과세 식대 기준의 근사치입니다. 4대보험(약 9.4%)과
        소득세(근로소득공제·누진세율·세액공제 반영)를 대략 계산했으며, 부양가족·
        추가 공제 등에 따라 실제와 다소 차이날 수 있습니다.
      </p>
    </Card>
  );
}

function Tr({ k, v, minus }: { k: string; v: string; minus?: boolean }) {
  return (
    <tr>
      <td className="px-3 py-2.5 text-slate-500">{k}</td>
      <td
        className={`px-3 py-2.5 text-right tabular-nums ${
          minus ? "text-rose-500" : "text-slate-700"
        }`}
      >
        {v}
      </td>
    </tr>
  );
}
