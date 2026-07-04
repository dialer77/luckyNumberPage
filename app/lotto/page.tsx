import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../components/NumberBall";
import { getAllDraws } from "@/lib/lotto-data";
import { LOTTO_FEATURES } from "@/lib/brand";

// 행운노트(로또) 서브브랜드 랜딩 = 회차별 당첨번호 목록.
// Server Component (빌드 시 정적 생성 → SEO에 유리).
export const metadata: Metadata = {
  title: "행운노트 — 회차별 당첨번호 조회",
  description: "역대 로또 회차별 당첨번호를 최신순으로 조회합니다.",
};

export default function LottoListPage() {
  const draws = getAllDraws();
  // 이 페이지(/lotto)를 제외한 나머지 행운노트 기능들 (상단 바로가기)
  const others = LOTTO_FEATURES.filter((f) => f.href !== "/lotto");

  return (
    <div className="space-y-6">
      {/* 서브브랜드 헤더 */}
      <div>
        <h1 className="text-2xl font-bold">🍀 행운노트</h1>
        <p className="mt-1 text-sm text-slate-500">
          로또·복권 당첨번호 조회부터 1등 도전·랭킹까지.
        </p>
      </div>

      {/* 다른 기능 바로가기 */}
      <div className="flex flex-wrap gap-2">
        {others.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
          >
            {f.emoji} {f.title}
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold">회차별 당첨번호</h2>
        <p className="mt-1 text-sm text-slate-500">
          최신 회차부터 정리했습니다. 회차를 누르면 상세 정보를 볼 수 있어요.
        </p>
      </div>

      <ul className="space-y-3">
        {draws.map((draw) => (
          <li key={draw.drwNo}>
            <Link
              href={`/lotto/${draw.drwNo}`}
              className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
            >
              <div className="w-20 shrink-0">
                <div className="font-bold">{draw.drwNo}회</div>
                <div className="text-xs text-slate-400">{draw.drwNoDate}</div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {draw.numbers.map((n) => (
                  <NumberBall key={n} n={n} size="sm" />
                ))}
                <span className="mx-0.5 text-slate-300">+</span>
                <NumberBall n={draw.bonus} size="sm" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
