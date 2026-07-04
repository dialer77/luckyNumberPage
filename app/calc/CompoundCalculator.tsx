"use client";
import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

const MAX_ROWS = 600; // 표 렌더 상한 (성능)

// 복리 계산기 — 회차 단위별 수익 흐름을 보여줌.
export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState(10_000_000); // 시작금
  const [rate, setRate] = useState(5); // 회당 복리 이율 %
  const [count, setCount] = useState(10); // 복리 횟수

  const fullCount = Math.max(0, Math.floor(count)); // 입력한 전체 횟수
  const r = rate / 100;

  // 요약: 전체 횟수 기준 (공식으로 정확히)
  const finalBalance = Math.round(principal * Math.pow(1 + r, fullCount));
  const totalProfit = finalBalance - principal;
  const profitPct = principal > 0 ? (totalProfit / principal) * 100 : 0;

  // 표: 최대 MAX_ROWS 회차까지만 누적 계산해 표시
  const rowCount = Math.min(fullCount, MAX_ROWS);
  const rows: { k: number; interest: number; balance: number; profit: number }[] = [];
  let balance = principal;
  for (let k = 1; k <= rowCount; k++) {
    const interest = balance * r;
    balance += interest;
    rows.push({
      k,
      interest: Math.round(interest),
      balance: Math.round(balance),
      profit: Math.round(balance - principal),
    });
  }

  return (
    <Card
      title="📈 복리 계산기"
      desc="시작금이 매 회차 복리로 불어날 때, 회차별 수익과 누적 수익을 보여줍니다."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberInput label="시작금 (원)" value={principal} step={1_000_000} onChange={setPrincipal} />
        <NumberInput label="복리 이율 (회당 %)" value={rate} step={0.5} onChange={setRate} />
        <NumberInput label="복리 횟수 (회)" value={count} step={1} onChange={setCount} />
      </div>

      {/* 요약 */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="시작금" value={formatKRW(principal)} />
        <Stat label="총 수익" value={`+${formatKRW(totalProfit)}`} accent="gain" />
        <Stat label="최종 잔액" value={formatKRW(finalBalance)} accent="gain" />
        <Stat label="수익률" value={`+${profitPct.toFixed(1)}%`} accent="gain" />
      </div>

      {/* 회차별 표 */}
      {rows.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-100">
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">회차</th>
                  <th className="px-3 py-2 text-right font-medium">이번 회차 수익</th>
                  <th className="px-3 py-2 text-right font-medium">누적 잔액</th>
                  <th className="px-3 py-2 text-right font-medium">시작 대비 수익</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row) => (
                  <tr key={row.k} className="tabular-nums">
                    <td className="px-3 py-2 text-slate-500">{row.k}회</td>
                    <td className="px-3 py-2 text-right text-emerald-600">
                      +{formatKRW(row.interest)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-slate-700">
                      {formatKRW(row.balance)}
                    </td>
                    <td className="px-3 py-2 text-right text-indigo-600">
                      +{formatKRW(row.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {Math.floor(count) > MAX_ROWS && (
        <p className="mt-2 text-xs text-amber-600">
          표는 최대 {MAX_ROWS}회까지만 표시합니다. (요약 수치는 입력한 횟수 기준)
        </p>
      )}

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "📈",
            t: "복리 계산",
            v: formatKRW(finalBalance),
            s: `${fullCount}회 복리 · 수익 +${profitPct.toFixed(0)}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * &lsquo;회&rsquo;는 복리가 적용되는 단위입니다(연·월 등 자유롭게 해석).
        세금·수수료는 미반영한 단순 계산이에요.
      </p>
    </Card>
  );
}
