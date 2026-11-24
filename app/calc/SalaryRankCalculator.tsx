"use client";
// 내 연봉 상위 몇 % 계산기 — 국세청 2024년 귀속 근로소득 천분위 자료 기준.

import { useState } from "react";
import {
  salaryTopPercent,
  TOTAL_WORKERS,
  MEDIAN_SALARY,
  AVERAGE_SALARY,
  SALARY_RANK_SOURCE,
} from "@/lib/salary-rank";
import { wonFull } from "@/lib/salary";
import ShareButton from "@/app/components/ShareButton";
import { Card } from "./ui";

const PRESETS = [3000, 4000, 5000, 7000, 10000]; // 만원

function fmtTop(p: number): string {
  if (p < 1) return p.toFixed(2);
  if (p < 10) return p.toFixed(1);
  return Math.round(p).toString();
}

export default function SalaryRankCalculator() {
  const [salary, setSalary] = useState(50_000_000);

  const top = salaryTopPercent(salary);
  const topStr = fmtTop(top);
  const rankInHundred = Math.max(1, Math.ceil(top)); // 100명 중 몇 등쯤
  const aboveMe = Math.round((TOTAL_WORKERS * top) / 100 / 10_000); // 나보다 많이 받는 사람(만 명)
  const vsMedian = salary / MEDIAN_SALARY - 1;

  return (
    <Card
      title="🏆 내 연봉 상위 몇 %?"
      desc={`연봉을 넣으면 국세청 ${SALARY_RANK_SOURCE.year}년 근로소득 자료로 대한민국 직장인 중 상위 몇 %인지 알려줍니다.`}
    >
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

      <div className="mt-3">
        <label className="text-sm text-slate-500">연봉 (세전, 원)</label>
        <input
          type="number"
          value={salary}
          min={0}
          step={1_000_000}
          onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
        />
      </div>

      {/* 결과 */}
      <section className="mt-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-white p-6 text-center ring-1 ring-indigo-100">
        <div className="text-sm text-slate-500">연봉 {wonFull(salary)}는</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">상위 {topStr}%</div>
        <div className="mt-2 text-sm text-slate-500">
          직장인 100명 중 <b className="text-slate-700">{rankInHundred}등</b> 안쪽,
          나보다 많이 받는 사람은 약 <b className="text-slate-700">{aboveMe.toLocaleString()}만 명</b>
        </div>
        <div className="mt-1 text-xs text-slate-500">
          중위 연봉 {wonFull(Math.round(MEDIAN_SALARY / 10_000) * 10_000)}보다{" "}
          <b className={vsMedian >= 0 ? "text-indigo-600" : "text-rose-500"}>
            {vsMedian >= 0 ? "+" : ""}
            {Math.round(vsMedian * 100)}%
          </b>
        </div>
        {/* 게이지 */}
        <div className="mx-auto mt-4 h-2.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${Math.min(100, 100 - top)}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-400">하위 &nbsp;←&nbsp; 나 &nbsp;→&nbsp; 상위</div>
      </section>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🏆",
            t: "내 연봉 상위 %",
            v: `상위 ${topStr}%`,
            s: `연봉 ${wonFull(salary)} · 국세청 ${SALARY_RANK_SOURCE.year}년 자료`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 국세청 {SALARY_RANK_SOURCE.year}년 귀속 근로소득 연말정산 신고자{" "}
        {Math.round(TOTAL_WORKERS / 10_000).toLocaleString()}만 명의 총급여(비과세 제외 세전)
        분포로 추정했습니다. 평균 {wonFull(Math.round(AVERAGE_SALARY / 10_000) * 10_000)}.
        1년 중 일부만 일한 사람도 포함돼 있어 하위권 비율이 높게 나옵니다.
      </p>
    </Card>
  );
}
