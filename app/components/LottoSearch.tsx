"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// 회차 번호로 바로 찾아가는 검색창. (실데이터 1회 ~ 최신회 전부 조회 가능)
export default function LottoSearch({ latestNo }: { latestNo: number }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(value.trim(), 10);
    if (!Number.isInteger(n) || n < 1 || n > latestNo) {
      setError(`1 ~ ${latestNo}회 사이의 번호를 입력하세요.`);
      return;
    }
    setError("");
    router.push(`/lotto/${n}`);
  }

  return (
    <form onSubmit={submit} className="space-y-1.5">
      <div className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder={`회차 검색 (1 ~ ${latestNo}회)`}
          aria-label="로또 회차 번호 검색"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          조회
        </button>
      </div>
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </form>
  );
}
