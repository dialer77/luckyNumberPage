import Link from "next/link";
import NumberBall from "./components/NumberBall";
import { getLatestDraw, formatKRW, afterTax } from "@/lib/lotto-data";
import { SITE, SUB_BRANDS, LOTTO_FEATURES } from "@/lib/brand";

// 우산 허브 홈.
// 상단: "만약에" 브랜드 소개 → 그 아래 서브브랜드별 섹션.
// 라이브 서브브랜드(행운노트)는 기능을 펼쳐 보여주고,
// 준비 중 서브브랜드는 예고 카드로만 노출(빈 페이지를 만들지 않음).

export default function HomePage() {
  const latest = getLatestDraw();
  const live = SUB_BRANDS.filter((b) => b.status === "live");
  const soon = SUB_BRANDS.filter((b) => b.status === "soon");

  return (
    <div className="space-y-12">
      {/* ── 히어로: 우산 브랜드 ── */}
      <section className="text-center">
        <div className="text-4xl">{SITE.emoji}</div>
        <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">
          만약에, 얼마?
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
          로또에 당첨되면, 그때 그 주식을 샀으면, 세금을 떼면 —{" "}
          <b className="text-slate-700">&lsquo;만약에 얼마?&rsquo;</b>를 재미로
          확인하는 곳이에요.
        </p>
      </section>

      {/* ── 라이브 서브브랜드: 행운노트 ── */}
      {live.map((brand) => (
        <section key={brand.key} className="space-y-4">
          <div className="flex items-baseline gap-2">
            <h2 className="text-xl font-bold">
              {brand.emoji} {brand.name}
            </h2>
            <span className="text-sm text-slate-400">{brand.tagline}</span>
          </div>

          {/* 최신 회차 하이라이트 */}
          <Link
            href={`/lotto/${latest.drwNo}`}
            className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
          >
            <div className="text-xs text-slate-400">
              제 {latest.drwNo}회 · {latest.drwNoDate} 최신 당첨번호
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {latest.numbers.map((n) => (
                <NumberBall key={n} n={n} size="md" />
              ))}
              <span className="mx-1 text-slate-300">+</span>
              <NumberBall n={latest.bonus} size="md" />
            </div>
            <div className="mt-3 text-sm text-slate-500">
              세후 실수령{" "}
              <span className="font-semibold text-indigo-600">
                {formatKRW(afterTax(latest.firstWinAmount))}
              </span>
            </div>
          </Link>

          {/* 행운노트 기능 카드 */}
          <div className="grid gap-3 sm:grid-cols-2">
            {LOTTO_FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="mt-0.5 text-sm text-slate-500">{f.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* ── 준비 중 서브브랜드 예고 ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-400">곧 만나요</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {soon.map((brand) => (
            <div
              key={brand.key}
              className="rounded-xl border border-dashed border-slate-200 bg-white/50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl grayscale">{brand.emoji}</span>
                <div className="font-semibold text-slate-500">{brand.name}</div>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
                  준비 중
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{brand.tagline}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
