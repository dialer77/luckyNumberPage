"use client";
// 대출 원리금 계산기 — 원리금균등/원금균등/만기일시 + 월별 상환 스케줄.

import { useState } from "react";
import { formatKRW } from "@/lib/lotto-data";
import { computeLoan, LOAN_METHODS, type LoanMethod } from "@/lib/loan";
import ShareButton from "@/app/components/ShareButton";
import { Card, NumberInput, Stat } from "./ui";

const AMOUNTS = [
  { v: 10_000_000, label: "1천만" },
  { v: 50_000_000, label: "5천만" },
  { v: 100_000_000, label: "1억" },
  { v: 300_000_000, label: "3억" },
];

export default function LoanCalculator() {
  const [amount, setAmount] = useState(100_000_000);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);
  const [method, setMethod] = useState<LoanMethod>("equal");

  const res = computeLoan(amount, rate, years * 12, method);

  return (
    <Card
      title="🏦 대출 원리금 계산기"
      desc="대출금액·금리·기간·상환방식을 넣으면 월 상환액과 총 이자를 계산합니다."
    >
      {/* 상환방식 */}
      <div className="inline-flex flex-wrap rounded-lg bg-slate-100 p-1 text-sm">
        {LOAN_METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMethod(m.key)}
            className={`rounded-md px-3 py-1.5 font-medium transition ${
              method === m.key ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* 대출금액 프리셋 */}
      <div className="mt-4 flex flex-wrap gap-2">
        {AMOUNTS.map((a) => (
          <button
            key={a.v}
            onClick={() => setAmount(a.v)}
            className={`rounded-full px-3 py-1.5 text-sm transition ${
              amount === a.v
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:ring-indigo-300"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <NumberInput label="대출금액 (원)" value={amount} step={10_000_000} onChange={setAmount} />
        <NumberInput label="연 금리 (%)" value={rate} step={0.1} onChange={setRate} />
        <NumberInput label="기간 (년)" value={years} step={1} onChange={setYears} />
      </div>

      {/* 요약 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {method === "principal" ? (
          <Stat
            label="월 상환액(첫→마지막)"
            value={`${formatKRW(res.firstPayment)}→${formatKRW(res.lastPayment)}`}
          />
        ) : method === "bullet" ? (
          <Stat label="월 이자" value={formatKRW(res.firstPayment)} />
        ) : (
          <Stat label="월 상환액" value={formatKRW(res.firstPayment)} accent="gain" />
        )}
        <Stat label="총 이자" value={formatKRW(res.totalInterest)} accent="loss" />
        <Stat label="총 상환액" value={formatKRW(res.totalPayment)} />
      </div>

      {/* 상환 스케줄 */}
      {res.schedule.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-xl ring-1 ring-slate-100">
          {/* 모바일: 회차·상환액·잔액만 (세로 스크롤). 데스크톱: 원금·이자 열 추가 */}
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-2 py-2 text-left font-medium sm:px-3">회차</th>
                  <th className="px-2 py-2 text-right font-medium sm:px-3">상환액</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">원금</th>
                  <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">이자</th>
                  <th className="px-2 py-2 text-right font-medium sm:px-3">잔액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 tabular-nums">
                {res.schedule.map((row) => (
                  <tr key={row.month}>
                    <td className="px-2 py-2 text-slate-500 sm:px-3">{row.month}</td>
                    <td className="px-2 py-2 text-right font-medium text-slate-700 sm:px-3">
                      {formatKRW(row.payment)}
                    </td>
                    <td className="hidden px-3 py-2 text-right text-indigo-600 sm:table-cell">
                      {formatKRW(row.principal)}
                    </td>
                    <td className="hidden px-3 py-2 text-right text-rose-500 sm:table-cell">
                      {formatKRW(row.interest)}
                    </td>
                    <td className="px-2 py-2 text-right text-slate-400 sm:px-3">
                      {formatKRW(row.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4">
        <ShareButton
          payload={{
            e: "🏦",
            t: "대출 원리금",
            v:
              method === "equal"
                ? `월 ${formatKRW(res.firstPayment)}`
                : `총 이자 ${formatKRW(res.totalInterest)}`,
            s: `${formatKRW(amount)} · ${rate}% · ${years}년`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-slate-400">
        * 고정금리·매월 상환 가정의 단순 계산입니다. 중도상환수수료·수수료·변동금리
        등은 반영하지 않았어요.
      </p>
    </Card>
  );
}
