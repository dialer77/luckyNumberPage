"use client";
// 내 로또번호 저장 + 최신 회차 자동 당첨확인.
// 회원가입 없이 브라우저 localStorage에 저장 → 진입장벽 0, 재방문 유도.

import { useEffect, useState } from "react";
import NumberBall from "../../components/NumberBall";
import { ballColor, type LottoDraw } from "@/lib/lotto-data";
import { rankName } from "@/lib/challenge";

const STORAGE_KEY = "myLottoNumbers";
const ALL = Array.from({ length: 45 }, (_, i) => i + 1);

// 저장한 6개 번호를 최신 회차와 대조해 등수 계산
function judge(set: number[], draw: LottoDraw): { match: number; rank: number } {
  const main = new Set(draw.numbers);
  const match = set.filter((n) => main.has(n)).length;
  const bonusHit = set.includes(draw.bonus);
  let rank = 0;
  if (match === 6) rank = 1;
  else if (match === 5) rank = bonusHit ? 2 : 3;
  else if (match === 4) rank = 4;
  else if (match === 3) rank = 5;
  return { match, rank };
}

export default function MyNumbers({ latest }: { latest: LottoDraw }) {
  const [saved, setSaved] = useState<number[][]>([]);
  const [picking, setPicking] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  // 최초 로드: localStorage에서 불러오기
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  // 변경 시 저장 (최초 로드 완료 후에만)
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [saved, loaded]);

  function toggle(n: number) {
    setPicking((prev) =>
      prev.includes(n)
        ? prev.filter((x) => x !== n)
        : prev.length < 6
        ? [...prev, n].sort((a, b) => a - b)
        : prev
    );
  }

  function save() {
    if (picking.length !== 6) return;
    setSaved((prev) => [picking, ...prev]);
    setPicking([]);
  }

  function remove(idx: number) {
    setSaved((prev) => prev.filter((_, i) => i !== idx));
  }

  function fillRandom() {
    const pool = [...ALL];
    const pick: number[] = [];
    for (let i = 0; i < 6; i++) {
      const j = Math.floor(Math.random() * pool.length);
      pick.push(pool.splice(j, 1)[0]);
    }
    setPicking(pick.sort((a, b) => a - b));
  }

  return (
    <div className="space-y-6">
      {/* 번호 선택 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">번호 등록</h2>
          <button
            onClick={fillRandom}
            className="text-sm text-indigo-600 hover:underline"
          >
            🎲 랜덤 채우기
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          1~45 중 6개를 골라 저장하세요. ({picking.length}/6)
        </p>

        <div className="mt-4 grid grid-cols-7 gap-1.5 sm:grid-cols-9">
          {ALL.map((n) => {
            const on = picking.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggle(n)}
                className={`flex h-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  on
                    ? `${ballColor(n)} shadow-sm`
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>

        <button
          onClick={save}
          disabled={picking.length !== 6}
          className="mt-4 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
        >
          이 번호 저장
        </button>
      </section>

      {/* 저장된 번호 + 당첨 결과 */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">
          내 번호 · 제 {latest.drwNo}회 대조 결과
        </h2>

        {saved.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
            아직 저장한 번호가 없어요. 위에서 번호를 골라 저장해 보세요.
          </p>
        ) : (
          <ul className="space-y-2">
            {saved.map((set, i) => {
              const { match, rank } = judge(set, latest);
              const win = rank >= 1;
              return (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {set.map((n) => (
                      <NumberBall key={n} n={n} size="sm" />
                    ))}
                  </div>
                  <span
                    className={`ml-auto rounded-full px-3 py-1 text-sm font-semibold ${
                      win
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {match}개 일치 · {rankName(rank)}
                  </span>
                  <button
                    onClick={() => remove(i)}
                    className="text-xs text-slate-400 hover:text-rose-500"
                  >
                    삭제
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-slate-400">
          * 번호는 이 브라우저에만 저장되며 서버로 전송되지 않습니다. 추첨일마다
          다시 방문하면 최신 회차로 자동 대조됩니다.
        </p>
      </section>
    </div>
  );
}
