"use client";
// 이직 연봉 계산기 — 월 실수령 비교 + 누적 소득 차이(복리).

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { calcTakeHome, type TakeHome } from "@/lib/salary";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

export default function SalaryCalculator() {
  const [current, setCurrent] = useState(40_000_000); // 현재 연봉
  const [next, setNext] = useState(50_000_000); // 이직 후 연봉
  const [raise, setRaise] = useState(4); // 연 인상률 %
  const [years, setYears] = useState(10); // 비교 기간

  // 월 실수령 계산
  const thCur = calcTakeHome(current);
  const thNext = calcTakeHome(next);
  const monthlyNetDiff = thNext.monthlyNet - thCur.monthlyNet;

  // 누적 소득 차이 (매년 인상률만큼 복리로 오른다고 가정)
  const r = raise / 100;
  let sumCurrent = 0;
  let sumNext = 0;
  for (let t = 0; t < years; t++) {
    sumCurrent += current * Math.pow(1 + r, t);
    sumNext += next * Math.pow(1 + r, t);
  }
  sumCurrent = Math.round(sumCurrent);
  sumNext = Math.round(sumNext);
  const diff = sumNext - sumCurrent;

  return (
    <Card
      title="💼 이직 연봉 계산기"
      desc="연봉을 넣으면 월 실수령액을 계산하고, 이직으로 벌어지는 누적 소득 차이도 보여줍니다."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberInput label="현재 연봉 (원)" value={current} step={1_000_000} onChange={setCurrent} />
        <NumberInput label="이직 후 연봉 (원)" value={next} step={1_000_000} onChange={setNext} />
      </div>

      {/* 월 실수령 비교 */}
      <div className="mt-5">
        <div className="mb-2 text-sm font-semibold text-slate-500">
          월 실수령 비교
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PayColumn label="현재" th={thCur} />
          <PayColumn label="이직 후" th={thNext} highlight />
        </div>
        <div className="mt-3 rounded-xl bg-indigo-50 p-3 text-center text-sm ring-1 ring-indigo-100">
          이직 시 <b className="text-slate-700">월 실수령</b>이{" "}
          <b className={monthlyNetDiff >= 0 ? "text-indigo-600" : "text-rose-500"}>
            {monthlyNetDiff >= 0 ? "+" : ""}
            {formatKRW(monthlyNetDiff)}
          </b>{" "}
          달라져요
        </div>
      </div>

      {/* 누적 소득 차이 */}
      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
          누적 소득 차이
          <span className="flex items-center gap-1 text-xs font-normal text-slate-400">
            인상률
            <input
              type="number"
              value={raise}
              min={0}
              step={0.5}
              onChange={(e) => setRaise(Math.max(0, Number(e.target.value)))}
              className="w-14 rounded border border-slate-200 px-1.5 py-0.5 text-center"
            />
            % · 기간
            <input
              type="number"
              value={years}
              min={1}
              step={1}
              onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
              className="w-12 rounded border border-slate-200 px-1.5 py-0.5 text-center"
            />
            년
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="현재직 누적" value={formatKRW(sumCurrent)} />
          <Stat label="이직 누적" value={formatKRW(sumNext)} accent="gain" />
          <Stat label="누적 차이" value={`+${formatKRW(diff)}`} accent="gain" />
        </div>
      </div>

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "💼",
            t: "이직 연봉 계산",
            v: `월 실수령 +${formatKRW(monthlyNetDiff)}`,
            s: `${years}년 누적 +${formatKRW(diff)}`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 실수령액은 4대보험·소득세를 대략 반영한 근사치(본인 1인 기준)입니다.
        세액공제 등 세부는 생략해 실제와 다소 차이날 수 있어요. 누적 차이는 매년
        같은 인상률 가정의 단순 계산입니다.
      </p>
    </Card>
  );
}

// 한 연봉의 월 실수령 내역 컬럼
function PayColumn({
  label,
  th,
  highlight,
}: {
  label: string;
  th: TakeHome;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 ring-1 ${
        highlight ? "bg-indigo-50/60 ring-indigo-100" : "bg-slate-50 ring-slate-100"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs text-slate-400">
          연 {formatKRW(th.gross)}
        </span>
      </div>
      <div className="mt-1 text-lg font-bold text-slate-800">
        월 {formatKRW(th.monthlyNet)}
        <span className="ml-1 text-xs font-normal text-slate-400">실수령</span>
      </div>
      <dl className="mt-3 space-y-1 text-xs text-slate-500">
        <Row k="월 세전" v={formatKRW(th.monthlyGross)} />
        <Row k="4대보험" v={`−${formatKRW(Math.round(th.insurance / 12))}`} />
        <Row
          k={`세금 (${Math.round(th.topRate * 100)}% 구간)`}
          v={`−${formatKRW(Math.round((th.incomeTax + th.localTax) / 12))}`}
        />
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}
