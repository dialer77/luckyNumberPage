"use client";
// 목표 배당 역산: "월 N원 배당 받으려면 얼마 필요? 매월 얼마씩 모으면 언제?"

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import {
  DIVIDEND_ETFS,
  requiredPrincipal,
  monthsToTarget,
} from "@/lib/dividend-data";

export default function TargetDividend() {
  const [etfKey, setEtfKey] = useState(DIVIDEND_ETFS[0].key);
  const [dividendYield, setDividendYield] = useState(DIVIDEND_ETFS[0].yield);
  const [target, setTarget] = useState(1_000_000); // 목표 월 배당
  const [initial, setInitial] = useState(0);
  const [monthly, setMonthly] = useState(1_000_000);

  function selectEtf(key: string) {
    setEtfKey(key);
    const etf = DIVIDEND_ETFS.find((e) => e.key === key);
    if (etf) setDividendYield(etf.yield);
  }

  const required = requiredPrincipal(target, dividendYield);
  const months = monthsToTarget(initial, monthly, dividendYield, target);
  const period =
    months == null
      ? "100년 이상"
      : months === 0
      ? "이미 달성"
      : `${Math.floor(months / 12)}년 ${months % 12}개월`;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <h2 className="font-bold">🎯 목표 배당 역산</h2>
      <p className="mt-1 text-sm text-slate-500">
        원하는 월 배당을 정하면, 필요한 원금과 매월 모아서 달성하는 기간을
        계산합니다.
      </p>

      {/* ETF 선택 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {DIVIDEND_ETFS.map((e) => (
          <button
            key={e.key}
            onClick={() => selectEtf(e.key)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              e.key === etfKey
                ? "bg-indigo-600 text-white"
                : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
            }`}
          >
            {e.name}
            <span className="ml-1 text-xs opacity-70">{e.yield}%</span>
          </button>
        ))}
      </div>

      {/* 입력 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <NumberField label="목표 월 배당 (원)" value={target} step={100_000} onChange={setTarget} />
        <NumberField label="배당수익률 (연 %)" value={dividendYield} step={0.1} onChange={setDividendYield} />
        <NumberField label="현재 모은 돈 (원)" value={initial} step={1_000_000} onChange={setInitial} />
        <NumberField label="매월 저축 (원)" value={monthly} step={100_000} onChange={setMonthly} />
      </div>

      {/* 결과 */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
          <div className="text-xs text-slate-500">필요한 원금</div>
          <div className="mt-1 text-lg font-bold text-indigo-600">
            {formatKRW(required)}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-500">달성까지 (배당 재투자)</div>
          <div className="mt-1 text-lg font-bold text-slate-800">{period}</div>
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 주가 변동은 제외, 배당 재투자만 반영한 단순 계산입니다.
      </p>
    </section>
  );
}

function NumberField({
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
