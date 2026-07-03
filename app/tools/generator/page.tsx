"use client";
// ↑ 이 지시문이 핵심!
// 버튼 클릭 같은 "상호작용/상태(useState)"가 필요한 컴포넌트는
// Client Component 여야 합니다. 파일 맨 위에 "use client" 를 붙이면 됩니다.
//
// Flutter 대응:
//   useState  ≈  StatefulWidget 의 상태 변수 + setState()
//   onClick   ≈  버튼의 onPressed
// 지금까지 만든 다른 페이지들은 상호작용이 없어서 Server Component였고,
// 이 페이지만 Client Component입니다. (필요한 곳만 client로)

import { useState } from "react";
import NumberBall from "../../components/NumberBall";

// 1~45 중 서로 다른 6개를 무작위로 뽑아 오름차순 정렬해서 반환
function pickSix(): number[] {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const picked: number[] = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]); // 뽑은 건 풀에서 제거 → 중복 방지
  }
  return picked.sort((a, b) => a - b);
}

export default function GeneratorPage() {
  // history = 지금까지 뽑은 결과들의 목록 (최신이 배열 앞쪽).
  // 각 원소는 번호 6개짜리 배열.
  const [history, setHistory] = useState<number[][]>([]);

  // 새로 뽑기: 기존 목록 앞에 새 결과를 붙임.
  // ...prev 로 이전 목록을 그대로 유지하며 새 항목만 추가 (누적).
  function draw() {
    setHistory((prev) => [pickSix(), ...prev]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🎲 행운 번호 생성기</h1>
        <p className="mt-1 text-sm text-slate-500">
          버튼을 누르면 1~45 중 6개를 무작위로 뽑아 아래에 차곡차곡 쌓아둡니다.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={draw}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {history.length ? "다시 뽑기" : "번호 뽑기"}
        </button>
        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="rounded-lg px-4 py-2.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            기록 지우기
          </button>
        )}
      </div>

      {/* 뽑은 기록 목록 — 최신이 위. 번호가 클수록 아래로 쌓임. */}
      {history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((set, i) => {
            // 최신 뽑기가 몇 번째인지 표시 (전체 개수 - 현재 인덱스)
            const seq = history.length - i;
            return (
              <li
                key={seq}
                className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <span className="w-8 shrink-0 text-sm font-medium text-slate-400">
                  #{seq}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {set.map((n) => (
                    <NumberBall key={n} n={n} size="md" />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
          아직 뽑은 번호가 없어요. 버튼을 눌러보세요.
        </p>
      )}
    </div>
  );
}
