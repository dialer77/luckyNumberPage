"use client";
// 이직 연봉 복리 계산기.
// 연봉은 매년 인상률만큼 복리로 늘어나므로, 이직으로 올린 연봉 차이도
// 시간이 지날수록 복리로 벌어집니다. 그 누적 격차를 계산.

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { Card, NumberInput, Stat } from "./ui";

export default function SalaryCalculator() {
  const [current, setCurrent] = useState(40_000_000); // 현재 연봉
  const [next, setNext] = useState(50_000_000); // 이직 후 연봉
  const [raise, setRaise] = useState(4); // 연 인상률 %
  const [years, setYears] = useState(10); // 비교 기간

  const r = raise / 100;
  // 매년 인상률만큼 복리로 오른다고 가정, 기간 동안 누적 소득 합
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
      desc="이직으로 올린 연봉은 매년 복리로 벌어집니다. 기간 동안 누적 소득 차이를 계산합니다."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberInput label="현재 연봉 (원)" value={current} step={1_000_000} onChange={setCurrent} />
        <NumberInput label="이직 후 연봉 (원)" value={next} step={1_000_000} onChange={setNext} />
        <NumberInput label="연 인상률 (%)" value={raise} step={0.5} onChange={setRaise} />
        <NumberInput label="비교 기간 (년)" value={years} step={1} onChange={setYears} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="현재직 누적" value={formatKRW(sumCurrent)} />
        <Stat label="이직 누적" value={formatKRW(sumNext)} accent="gain" />
        <Stat label="누적 차이" value={`+${formatKRW(diff)}`} accent="gain" />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        * 양쪽 모두 매년 같은 인상률로 오른다고 가정한 단순 계산 (세금 미반영).
      </p>
    </Card>
  );
}
