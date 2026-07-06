"use client";
// 내 연봉 상위 몇 % 계산기 (재미·확산형).

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { salaryTopPercent } from "@/lib/salary-rank";
import ShareButton from "@/app/components/ShareButton";
import { Card } from "./ui";

const PRESETS = [3000, 4000, 5000, 7000, 10000]; // 만원

export default function SalaryRankCalculator() {
  const [salary, setSalary] = useState(50_000_000);

  const top = salaryTopPercent(salary);
  const topStr = top < 1 ? top.toFixed(1) : Math.round(top).toString();
  // 100명 중 나보다 위(=상위 top%의 인원, 반올림)
  const above = Math.max(0, Math.round(top) - 0); // 대략 상위 몇 명
  const rankInHundred = Math.max(1, Math.round(top)); // 100명 중 상위 몇 등쯤

  return (
    <Card
      title="🏆 내 연봉 상위 몇 %?"
      desc="연봉을 넣으면 대한민국 근로소득 기준으로 대략 상위 몇 %인지 알려줍니다. (재미·참고용)"
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
        <label className="text-sm text-slate-500">연봉 (원)</label>
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
        <div className="text-sm text-slate-500">연봉 {formatKRW(salary)}는</div>
        <div className="mt-1 text-3xl font-extrabold text-indigo-600">
          상위 {topStr}%
        </div>
        <div className="mt-2 text-sm text-slate-500">
          직장인 100명 중 대략 <b className="text-slate-700">{rankInHundred}등</b>{" "}
          안쪽이에요
        </div>
        {/* 게이지 */}
        <div className="mx-auto mt-4 h-2.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            style={{ width: `${Math.min(100, 100 - top)}%` }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-400">
          하위 &nbsp;←&nbsp; 나 &nbsp;→&nbsp; 상위
        </div>
      </section>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🏆",
            t: "내 연봉 상위 %",
            v: `상위 ${topStr}%`,
            s: `연봉 ${formatKRW(salary)}`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 국세청 근로소득 분포를 참고한 대략적 추정입니다. 재미·참고용이며 실제와
        차이날 수 있어요.
      </p>
    </Card>
  );
}
