"use client";
// 내 월급, 내 나이대에서 상위 몇 % — 국가데이터처 2024년 임금근로일자리 소득 자료 기준.

import { useState } from "react";
import {
  AGE_GROUPS,
  BAND_LABELS,
  WAGE_SOURCE,
  getAgeGroup,
  wageTopPercent,
  type WageRank,
} from "@/lib/wage-by-age";
import ShareButton from "@/app/components/ShareButton";
import { Card } from "./ui";

type Mode = "month" | "year";
type Sex = "all" | "male" | "female";

const PRESETS: Record<Mode, number[]> = {
  month: [200, 300, 400, 500, 700], // 만원
  year: [3000, 4000, 5000, 7000, 10000], // 만원
};

function rankLabel(r: WageRank): string {
  // 0.1% 미만이거나 맨 위 구간(끝이 없음)이면 "이내"로만 말한다
  if (r.openTop || r.topPercent < 0.1) return `상위 ${Math.max(0.1, r.topPercent).toFixed(1)}% 이내`;
  return `상위 ${r.topPercent < 10 ? r.topPercent.toFixed(1) : Math.round(r.topPercent)}%`;
}

const manLabel = (m: number) =>
  m >= 10000 ? `${(m / 10000).toLocaleString()}억` : `${m.toLocaleString()}만원`;

export default function SalaryByAgeCalculator() {
  const [ageKey, setAgeKey] = useState("30-34");
  const [mode, setMode] = useState<Mode>("month");
  const [amount, setAmount] = useState(300); // 만원(월급 또는 연봉)
  const [sex, setSex] = useState<Sex>("all");

  const group = getAgeGroup(ageKey) ?? AGE_GROUPS[0];
  const all = AGE_GROUPS[0];
  const monthly = mode === "month" ? amount : amount / 12;

  const rank = wageTopPercent(group, monthly);
  const rankAll = wageTopPercent(all, monthly);
  const topStr = rankLabel(rank);
  const allStr = rankLabel(rankAll);
  const rankInHundred = Math.max(1, Math.ceil(rank.topPercent));

  const median = sex === "all" ? group.median : group[sex].median;
  const mean = sex === "all" ? group.mean : group[sex].mean;
  const sexLabel = sex === "male" ? "남성 " : sex === "female" ? "여성 " : "";
  const vsMedian = median > 0 ? monthly / median - 1 : 0;
  const maxShare = Math.max(...group.share);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setAmount(next === "year" ? Math.round((amount * 12) / 100) * 100 : Math.round(amount / 12));
    setMode(next);
  }

  const tab = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm transition ${
      active ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-indigo-300"
    }`;

  return (
    <Card
      title="📊 내 월급, 내 나이대에서 상위 몇 %?"
      desc={`나이대와 세전 월급(또는 연봉)을 넣으면 국가데이터처 ${WAGE_SOURCE.year}년 임금근로일자리 소득 자료로 같은 나이대에서 어느 정도인지 알려줍니다.`}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="age-group" className="block text-sm text-slate-500">
            나이대
          </label>
          <select
            id="age-group"
            value={ageKey}
            onChange={(e) => setAgeKey(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400"
          >
            {AGE_GROUPS.filter((g) => g.key !== "all").map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
            <option value="all">전체 나이</option>
          </select>
        </div>
        <div>
          <span className="block text-sm text-slate-500">비교할 중위값</span>
          <div className="mt-1 flex gap-2">
            {(
              [
                ["all", "전체"],
                ["male", "남성"],
                ["female", "여성"],
              ] as [Sex, string][]
            ).map(([k, label]) => (
              <button key={k} onClick={() => setSex(k)} className={tab(sex === k)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => switchMode("month")} className={tab(mode === "month")}>
          월급으로 입력
        </button>
        <button onClick={() => switchMode("year")} className={tab(mode === "year")}>
          연봉으로 입력
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS[mode].map((m) => (
          <button
            key={m}
            onClick={() => setAmount(m)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              amount === m
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
            }`}
          >
            {manLabel(m)}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <label htmlFor="wage-amount" className="text-sm text-slate-500">
          {mode === "month" ? "세전 월급 (만원)" : "세전 연봉 (만원) — 12로 나눠 월급으로 비교"}
        </label>
        <input
          id="wage-amount"
          type="number"
          value={amount}
          min={0}
          step={mode === "month" ? 10 : 100}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      {/* 결과 */}
      <section className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 text-center ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">
          {group.key === "all" ? "전체 근로자" : group.label} 중 월 {Math.round(monthly).toLocaleString()}만원은
        </div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">{topStr}</div>
        <div className="mt-2 text-sm text-slate-500">
          같은 나이대 100명 중 <b className="text-slate-700">{rankInHundred}등</b> 안쪽
          {group.key !== "all" && (
            <>
              {" "}· 전체 근로자 기준으로는 <b className="text-slate-700">{allStr}</b>
            </>
          )}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {group.label} {sexLabel}중위 월 {median.toLocaleString()}만원보다{" "}
          <b className={vsMedian >= 0 ? "text-indigo-600" : "text-rose-500"}>
            {vsMedian >= 0 ? "+" : ""}
            {Math.round(vsMedian * 100)}%
          </b>{" "}
          · 평균 {mean.toLocaleString()}만원
        </div>
      </section>

      {/* 구간 분포 */}
      <div className="mt-5">
        <div className="text-sm font-medium text-slate-700">
          {group.key === "all" ? "전체 근로자" : group.label} 월급 분포
        </div>
        <ul className="mt-2 space-y-1">
          {BAND_LABELS.map((label, i) => {
            const mine = i === rank.band;
            return (
              <li key={label} className="flex items-center gap-2 text-xs">
                <span className={`w-24 shrink-0 text-right ${mine ? "font-bold text-indigo-600" : "text-slate-500"}`}>
                  {label}
                </span>
                <span className="relative h-3.5 flex-1 overflow-hidden rounded bg-slate-100">
                  <span
                    className={`absolute inset-y-0 left-0 rounded ${mine ? "bg-indigo-500" : "bg-slate-300"}`}
                    style={{ width: `${(group.share[i] / maxShare) * 100}%` }}
                  />
                </span>
                <span className={`w-14 shrink-0 tabular-nums ${mine ? "font-bold text-indigo-600" : "text-slate-500"}`}>
                  {group.share[i].toFixed(1)}%{mine ? " ←" : ""}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "📊",
            t: `${group.key === "all" ? "전체 근로자" : group.label} 중 내 월급`,
            v: topStr,
            s: `세전 월 ${Math.round(monthly).toLocaleString()}만원 · 국가데이터처 ${WAGE_SOURCE.year}년 자료`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * {WAGE_SOURCE.year}년 12월에 일한 임금근로일자리의 세전 월 보수(실비 성격 비과세 제외) 분포로
        추정했습니다. 연봉으로 넣으면 12로 나눈 값으로 비교합니다. 월 1,000만원 이상은 구간 끝이 없어
        &quot;상위 몇 % 이내&quot;로만 표시합니다. 성별을 고르면 비교할 중위·평균만 바뀝니다.
      </p>
    </Card>
  );
}
