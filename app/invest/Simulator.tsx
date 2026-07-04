"use client";
// "그때샀으면" 시뮬레이터 — 상호작용 필요 → Client Component.

import { useState } from "react";
import {
  ASSETS,
  PAST_YEARS,
  CURRENT_YEAR,
  simulateInvest,
} from "@/lib/invest-data";
import { formatKRW, whatCanYouBuy } from "@/lib/lotto-data";

const PRESET_AMOUNTS = [
  { v: 1_000_000, label: "100만원" },
  { v: 5_000_000, label: "500만원" },
  { v: 10_000_000, label: "1천만원" },
];

export default function Simulator() {
  const [assetKey, setAssetKey] = useState(ASSETS[0].key);
  const [year, setYear] = useState(PAST_YEARS[0]);
  const [amount, setAmount] = useState(1_000_000);

  const asset = ASSETS.find((a) => a.key === assetKey)!;
  const { nowValue, profit, multiple } = simulateInvest(asset, year, amount);
  const gain = profit >= 0;
  const buys = whatCanYouBuy(nowValue).slice(0, 3);

  return (
    <div className="space-y-5">
      {/* 자산 선택 */}
      <Field label="무엇을">
        <div className="flex flex-wrap gap-2">
          {ASSETS.map((a) => (
            <Chip
              key={a.key}
              active={a.key === assetKey}
              onClick={() => setAssetKey(a.key)}
            >
              {a.emoji} {a.name}
            </Chip>
          ))}
        </div>
      </Field>

      {/* 시점 선택 */}
      <Field label="언제">
        <div className="flex flex-wrap gap-2">
          {PAST_YEARS.map((y) => (
            <Chip key={y} active={y === year} onClick={() => setYear(y)}>
              {y}년
            </Chip>
          ))}
        </div>
      </Field>

      {/* 금액 */}
      <Field label="얼마">
        <div className="flex flex-wrap items-center gap-2">
          {PRESET_AMOUNTS.map((p) => (
            <Chip key={p.v} active={p.v === amount} onClick={() => setAmount(p.v)}>
              {p.label}
            </Chip>
          ))}
          <input
            type="number"
            value={amount}
            min={0}
            step={100000}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
          />
          <span className="text-sm text-slate-400">원</span>
        </div>
      </Field>

      {/* 결과 */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">
          {year}년에 <b className="text-slate-700">{asset.emoji} {asset.name}</b>
          에 <b className="text-slate-700">{formatKRW(amount)}</b>을 넣었다면,
          지금은
        </div>
        <div className="mt-2 text-3xl font-extrabold text-indigo-600">
          {formatKRW(nowValue)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className={gain ? "text-indigo-600" : "text-rose-500"}>
            {gain ? "▲" : "▼"} 순손익 {formatKRW(profit)}
          </span>
          <span className="text-slate-500">
            {multiple.toFixed(1)}배 ({((multiple - 1) * 100).toFixed(0)}%)
          </span>
        </div>

        {/* 이 돈이면? */}
        <div className="mt-4 border-t border-indigo-100 pt-4">
          <div className="text-xs text-slate-400">이 돈이면?</div>
          <ul className="mt-2 flex flex-wrap gap-2">
            {buys.map((b) => (
              <li
                key={b.label}
                className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 shadow-sm"
              >
                {b.emoji} {b.label} <b className="text-indigo-600">{b.text}</b>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="text-xs text-slate-400">
        * 시세는 대략적인 예시값(연도별 어림값)이며, {CURRENT_YEAR}년 기준
        환산입니다. 실제 투자 수익을 보장하지 않습니다.
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-500">{label}</div>
      {children}
    </div>
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
