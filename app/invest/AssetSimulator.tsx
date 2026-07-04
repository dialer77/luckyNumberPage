"use client";
// 특정 자산 하나에 대한 "그때 그랬다면" 시뮬레이터.
// 모드: 일시불(그때 한 번에) / 적립식(매주·매일 조금씩).
// 배당주는 배당 재투자(복리)까지 함께 계산.

import { useState } from "react";
import {
  getAsset,
  PAST_YEARS,
  CURRENT_YEAR,
  simulateInvest,
  simulateWithDividend,
  simulateDCA,
  type Asset,
} from "@/lib/invest-data";
import { formatKRW, whatCanYouBuy } from "@/lib/lotto-data";

const LUMP_AMOUNTS = [
  { v: 1_000_000, label: "100만원" },
  { v: 5_000_000, label: "500만원" },
  { v: 10_000_000, label: "1천만원" },
];
const WEEKLY_AMOUNTS = [
  { v: 5_000, label: "5천원" },
  { v: 10_000, label: "1만원" },
  { v: 50_000, label: "5만원" },
];

export default function AssetSimulator({ assetKey }: { assetKey: string }) {
  const asset = getAsset(assetKey);
  const [mode, setMode] = useState<"lump" | "dca">("lump");
  const [year, setYear] = useState(PAST_YEARS[0]);
  const [lumpAmount, setLumpAmount] = useState(1_000_000);
  const [weekly, setWeekly] = useState(5_000);
  const [freq, setFreq] = useState<"week" | "day">("week");

  if (!asset) return null;
  const isDividend = asset.category === "dividend";

  return (
    <div className="space-y-5">
      {/* 모드 토글 */}
      <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
        <TabButton active={mode === "lump"} onClick={() => setMode("lump")}>
          일시불
        </TabButton>
        <TabButton active={mode === "dca"} onClick={() => setMode("dca")}>
          적립식
        </TabButton>
      </div>

      {mode === "lump" ? (
        <LumpMode
          asset={asset}
          isDividend={isDividend}
          year={year}
          setYear={setYear}
          amount={lumpAmount}
          setAmount={setLumpAmount}
        />
      ) : (
        <DcaMode
          asset={asset}
          year={year}
          setYear={setYear}
          weekly={weekly}
          setWeekly={setWeekly}
          freq={freq}
          setFreq={setFreq}
        />
      )}

      <p className="text-xs text-slate-400">
        * 시세·배당은 대략적인 예시값이며 {CURRENT_YEAR}년 기준 환산입니다. 실제
        투자 수익을 보장하지 않습니다.
      </p>
    </div>
  );
}

// ── 일시불 모드 ──
function LumpMode({
  asset,
  isDividend,
  year,
  setYear,
  amount,
  setAmount,
}: {
  asset: Asset;
  isDividend: boolean;
  year: number;
  setYear: (n: number) => void;
  amount: number;
  setAmount: (n: number) => void;
}) {
  const a = asset;
  const div = simulateWithDividend(a, year, amount);
  const plain = simulateInvest(a, year, amount);
  const finalValue = isDividend ? div.totalValue : plain.nowValue;
  const profit = finalValue - amount;
  const gain = profit >= 0;
  const buys = whatCanYouBuy(finalValue).slice(0, 3);

  return (
    <div className="space-y-5">
      <Field label="언제 샀다면">
        <Chips
          items={PAST_YEARS.map((y) => ({ v: y, label: `${y}년` }))}
          value={year}
          onChange={setYear}
        />
      </Field>
      <Field label="얼마">
        <AmountRow presets={LUMP_AMOUNTS} value={amount} onChange={setAmount} step={100000} />
      </Field>

      <ResultCard
        headline={`${year}년에 ${a.emoji} ${a.name}에 ${formatKRW(amount)}`}
        value={finalValue}
        profit={profit}
        gain={gain}
        buys={buys}
      >
        {isDividend && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>시세차익 {formatKRW(div.priceValue)}</span>
            <span className="text-emerald-600">
              + 배당 재투자 {formatKRW(div.dividendBonus)}
            </span>
          </div>
        )}
      </ResultCard>
    </div>
  );
}

// ── 적립식(DCA) 모드 ──
function DcaMode({
  asset,
  year,
  setYear,
  weekly,
  setWeekly,
  freq,
  setFreq,
}: {
  asset: Asset;
  year: number;
  setYear: (n: number) => void;
  weekly: number;
  setWeekly: (n: number) => void;
  freq: "week" | "day";
  setFreq: (f: "week" | "day") => void;
}) {
  const a = asset;
  // 매일이면 주간 환산(≈ ×7). startYear부터 지금까지 적립.
  const weeklyAmount = freq === "day" ? weekly * 7 : weekly;
  const weeks = Math.max(0, Math.round((CURRENT_YEAR - year) * 52));
  const { invested, nowValue, profit } = simulateDCA(a, year, weeklyAmount, weeks);
  const gain = profit >= 0;
  const buys = whatCanYouBuy(nowValue).slice(0, 3);

  return (
    <div className="space-y-5">
      <Field label="언제부터">
        <Chips
          items={PAST_YEARS.map((y) => ({ v: y, label: `${y}년` }))}
          value={year}
          onChange={setYear}
        />
      </Field>
      <Field label="얼마나 자주">
        <div className="inline-flex rounded-lg bg-slate-100 p-1 text-sm">
          <TabButton active={freq === "week"} onClick={() => setFreq("week")}>
            매주
          </TabButton>
          <TabButton active={freq === "day"} onClick={() => setFreq("day")}>
            매일
          </TabButton>
        </div>
      </Field>
      <Field label={freq === "week" ? "매주 얼마" : "매일 얼마"}>
        <AmountRow presets={WEEKLY_AMOUNTS} value={weekly} onChange={setWeekly} step={1000} />
      </Field>

      <ResultCard
        headline={`${year}년부터 지금까지 ${a.emoji} ${a.name}를 ${
          freq === "week" ? "매주" : "매일"
        } ${formatKRW(weekly)}씩 (총 ${formatKRW(invested)} 투자)`}
        value={nowValue}
        profit={profit}
        gain={gain}
        buys={buys}
      />
    </div>
  );
}

// ── 공용 결과 카드 ──
function ResultCard({
  headline,
  value,
  profit,
  gain,
  buys,
  children,
}: {
  headline: string;
  value: number;
  profit: number;
  gain: boolean;
  buys: { emoji: string; label: string; text: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
      <div className="text-sm text-slate-500">{headline}, 지금은</div>
      <div className="mt-2 text-3xl font-extrabold text-indigo-600">
        {formatKRW(value)}
      </div>
      <div className="mt-2 text-sm">
        <span className={gain ? "text-indigo-600" : "text-rose-500"}>
          {gain ? "▲" : "▼"} 순손익 {formatKRW(profit)}
        </span>
      </div>
      {children}
      <div className="mt-4 border-t border-indigo-100 pt-4">
        <div className="text-xs text-slate-400">이 돈이면?</div>
        <ul className="mt-2 flex flex-wrap gap-2">
          {buys.map((b) => (
            <li key={b.label} className="rounded-md bg-white px-2 py-1 text-xs text-slate-600 shadow-sm">
              {b.emoji} {b.label} <b className="text-indigo-600">{b.text}</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── 작은 UI들 ──
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-500">{label}</div>
      {children}
    </div>
  );
}

function Chips({
  items,
  value,
  onChange,
}: {
  items: { v: number; label: string }[];
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Chip key={it.v} active={it.v === value} onClick={() => onChange(it.v)}>
          {it.label}
        </Chip>
      ))}
    </div>
  );
}

function AmountRow({
  presets,
  value,
  onChange,
  step,
}: {
  presets: { v: number; label: string }[];
  value: number;
  onChange: (n: number) => void;
  step: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <Chip key={p.v} active={p.v === value} onClick={() => onChange(p.v)}>
          {p.label}
        </Chip>
      ))}
      <input
        type="number"
        value={value}
        min={0}
        step={step}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-32 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-400"
      />
      <span className="text-sm text-slate-400">원</span>
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

function TabButton({
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
