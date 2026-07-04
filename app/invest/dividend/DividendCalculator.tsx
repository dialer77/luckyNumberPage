"use client";
// 고배당 ETF 배당 재투자 계산기.

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import {
  DIVIDEND_ETFS,
  FREQ_LABEL,
  simulateDividend,
  type Freq,
} from "@/lib/dividend-data";

const FREQS: Freq[] = ["monthly", "quarterly", "yearly"];

export default function DividendCalculator() {
  const [etfKey, setEtfKey] = useState(DIVIDEND_ETFS[0].key);
  const [initial, setInitial] = useState(10_000_000);
  const [contribution, setContribution] = useState(500_000);
  const [contribFreq, setContribFreq] = useState<Freq>("monthly");
  const [dividendYield, setDividendYield] = useState(DIVIDEND_ETFS[0].yield);
  const [payoutFreq, setPayoutFreq] = useState<Freq>("quarterly");
  const [years, setYears] = useState(10);
  const [reinvest, setReinvest] = useState(true);

  function selectEtf(key: string) {
    setEtfKey(key);
    const etf = DIVIDEND_ETFS.find((e) => e.key === key);
    if (etf) setDividendYield(etf.yield);
  }

  const result = simulateDividend({
    initial,
    contribution,
    contributionFreq: contribFreq,
    dividendYield,
    payoutFreq,
    years,
    reinvest,
  });
  const profit = result.finalValue - result.totalContribution;

  return (
    <div className="space-y-5">
      {/* ETF 선택 */}
      <Field label="어떤 고배당 ETF">
        <div className="flex flex-wrap gap-2">
          {DIVIDEND_ETFS.map((e) => (
            <Chip key={e.key} active={e.key === etfKey} onClick={() => selectEtf(e.key)}>
              {e.name}
              <span className="ml-1 text-xs opacity-70">{e.yield}%</span>
            </Chip>
          ))}
        </div>
      </Field>

      {/* 입력 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="시작 금액 (원)" value={initial} step={1_000_000} onChange={setInitial} />
        <NumberField label="배당수익률 (연 %)" value={dividendYield} step={0.1} onChange={setDividendYield} />
        <NumberField label="추가 납입 (원)" value={contribution} step={100_000} onChange={setContribution} />
        <SelectField label="추가 납입 주기" value={contribFreq} onChange={setContribFreq} />
        <SelectField label="배당 지급 주기" value={payoutFreq} onChange={setPayoutFreq} />
        <NumberField label="보유 기간 (년)" value={years} step={1} onChange={setYears} />
      </div>

      {/* 재투자 토글 */}
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={reinvest}
          onChange={(e) => setReinvest(e.target.checked)}
          className="h-4 w-4"
        />
        배당 재투자 (복리)
      </label>

      {/* 결과 */}
      <section className="rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">{years}년 뒤 예상</div>
        <div className="mt-2 text-3xl font-extrabold text-indigo-600">
          {formatKRW(result.finalValue)}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="총 납입금" value={formatKRW(result.totalContribution)} />
          <Stat label="총 배당금" value={formatKRW(result.totalDividend)} accent="gain" />
          <Stat label="순수익" value={`+${formatKRW(profit)}`} accent="gain" />
          <Stat
            label="마지막 해 연 배당"
            value={formatKRW(result.lastYearDividend)}
            accent="gain"
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">
          마지막 해엔 매달 약{" "}
          <b>{formatKRW(Math.round(result.lastYearDividend / 12))}</b>씩 배당이
          들어오는 셈이에요.
        </p>
        <div className="mt-4">
          <ShareButton
            payload={{
              e: "💰",
              t: "고배당 ETF 배당",
              v: formatKRW(result.finalValue),
              s: `${years}년 뒤 · 연 배당 ${formatKRW(result.lastYearDividend)}`,
            }}
          />
        </div>
      </section>

      <p className="text-xs text-slate-400">
        * 배당율은 예시값이며, 주가 변동(시세차익/손실)은 제외하고 배당과 그
        재투자만 반영한 단순 모델입니다.
      </p>
    </div>
  );
}

// ── UI ──
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-500">{label}</div>
      {children}
    </div>
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

function SelectField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Freq;
  onChange: (f: Freq) => void;
}) {
  return (
    <div>
      <label className="block text-sm text-slate-500">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Freq)}
        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
      >
        {FREQS.map((f) => (
          <option key={f} value={f}>
            {FREQ_LABEL[f]}
          </option>
        ))}
      </select>
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

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gain";
}) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div
        className={`mt-1 text-sm font-bold tabular-nums ${
          accent === "gain" ? "text-indigo-600" : "text-slate-800"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
