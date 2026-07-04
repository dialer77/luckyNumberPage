import type { Metadata } from "next";
import NumberBall from "../components/NumberBall";
import { getNumberFrequency, getAllDraws } from "@/lib/lotto-data";

export const metadata: Metadata = {
  title: "번호 출현 통계",
  description: "역대 회차에서 각 번호가 몇 번 나왔는지 집계한 통계입니다.",
  alternates: { canonical: "/stats" },
};

export default function StatsPage() {
  const freq = getNumberFrequency();
  const totalDraws = getAllDraws().length;
  const maxCount = Math.max(...freq.map((f) => f.count), 1); // 막대 비율 계산용

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">번호 출현 통계</h1>
        <p className="mt-1 text-sm text-slate-500">
          최근 {totalDraws}개 회차 기준, 많이 나온 번호 순으로 정렬했습니다.
          각 추첨은 서로 독립적이므로 참고용으로 확인하세요.
        </p>
      </div>

      <ul className="space-y-2">
        {freq.map(({ number, count }) => (
          <li
            key={number}
            className="flex items-center gap-3 rounded-lg bg-white p-2 pr-4 shadow-sm ring-1 ring-slate-100"
          >
            <NumberBall n={number} size="sm" />
            {/* 출현 횟수를 막대로 시각화 */}
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm tabular-nums text-slate-500">
              {count}회
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
