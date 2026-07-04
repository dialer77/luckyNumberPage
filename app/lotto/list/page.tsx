import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../../components/NumberBall";
import { getLiveRecent } from "@/lib/lotto-live";

// 회차별 당첨번호 목록 (행운노트 대문에서 한 단계 들어온 페이지).
export const metadata: Metadata = {
  title: "회차별 당첨번호 조회",
  description: "역대 로또 회차별 당첨번호를 최신순으로 조회합니다.",
  alternates: { canonical: "/lotto/list" },
};

export const revalidate = 3600;

export default async function LottoListPage() {
  const draws = await getLiveRecent(30);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">회차별 당첨번호</h1>
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
