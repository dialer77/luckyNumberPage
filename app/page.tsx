import Link from "next/link";
import NumberBall from "./components/NumberBall";
import { getLatestDraw, formatKRW, afterTax } from "@/lib/lotto-data";

// 홈(허브) 페이지 — Server Component.
// 최신 회차를 크게 보여주고, 여기서 다른 엔진(조회/통계/생성기)으로
// 자연스럽게 이동하도록 카드 배치 = 기획서 §4의 "클릭 도미노" UX.

export default function HomePage() {
  const latest = getLatestDraw();

  return (
    <div className="space-y-10">
      {/* ── 히어로: 최신 회차 ── */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm text-slate-500">
          제 {latest.drwNo}회 · {latest.drwNoDate} 추첨
        </p>
        <h1 className="mt-1 text-xl font-bold">최신 당첨번호</h1>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {latest.numbers.map((n) => (
            <NumberBall key={n} n={n} size="lg" />
          ))}
          <span className="mx-1 text-slate-400">+</span>
          <NumberBall n={latest.bonus} size="lg" />
        </div>

        <p className="mt-4 text-sm text-slate-600">
          1등 {latest.firstWinnerCount}명 · 1게임당 세전{" "}
          <span className="font-semibold">
            {formatKRW(latest.firstWinAmount)}
          </span>{" "}
          → 세후{" "}
          <span className="font-semibold text-indigo-600">
            {formatKRW(afterTax(latest.firstWinAmount))}
          </span>
        </p>

        <Link
          href={`/lotto/${latest.drwNo}`}
          className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          이 회차 상세 보기 →
        </Link>
      </section>

      {/* ── 기능 카드들 (엔진 간 이동 유도) ── */}
      <section className="grid gap-4 sm:grid-cols-2">
        <FeatureCard
          href="/lotto"
          emoji="📜"
          title="회차별 당첨번호"
          desc="역대 회차를 한눈에 조회"
        />
        <FeatureCard
          href="/stats"
          emoji="📊"
          title="번호 출현 통계"
          desc="어떤 번호가 자주 나왔나"
        />
        <FeatureCard
          href="/tools/generator"
          emoji="🎲"
          title="번호 생성기"
          desc="무작위 행운 번호 뽑기"
        />
        <FeatureCard
          href="/tools/challenge"
          emoji="🎯"
          title="1등 도전 시뮬레이터"
          desc="몇 번 만에 1등이 나올까?"
        />
      </section>
    </div>
  );
}

// 작은 재사용 컴포넌트: 기능 카드 하나.
function FeatureCard({
  href,
  emoji,
  title,
  desc,
}: {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-2xl">{emoji}</div>
      <h2 className="mt-2 font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </Link>
  );
}
