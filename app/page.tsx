import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "./components/NumberBall";
import Faq from "./components/Faq";
import { formatKRW, afterTax } from "@/lib/lotto-data";
import { getLiveLatest } from "@/lib/lotto-live";
import { SITE, SUB_BRANDS } from "@/lib/brand";

export const metadata: Metadata = {
  title: "만약에, 얼마? — 로또·투자·세금을 재미로 계산",
  description:
    "로또에 당첨되면 세후 얼마? 그때 그 주식을 샀으면 지금 얼마? 연봉 실수령은? 로또 당첨번호 조회부터 투자 시뮬레이션, 돈 계산기까지 '만약에 얼마?'를 한곳에서 확인하세요.",
  alternates: { canonical: "/" },
};

// 홈에서 바로 가는 인기 기능 (색인된 알짜 페이지로 내부링크 집중)
const HIGHLIGHTS = [
  { href: "/lotto/list", emoji: "📜", title: "회차별 당첨번호", desc: "1회부터 최신회까지 번호로 검색·조회" },
  { href: "/lotto/trends", emoji: "📈", title: "회차별 추이 대시보드", desc: "역대 당첨금·당첨자·번호합 그래프" },
  { href: "/stats", emoji: "📊", title: "번호 출현 통계", desc: "어떤 번호가 자주 나왔는지 한눈에" },
  { href: "/calc/prize", emoji: "🧾", title: "당첨금 실수령 계산기", desc: "세금 떼고 실제로 받는 금액" },
  { href: "/calc/take-home", emoji: "💵", title: "연봉 실수령액 계산기", desc: "4대보험·세금 뗀 월급" },
  { href: "/invest", emoji: "📉", title: "그때샀으면", desc: "그때 주식·코인 샀으면 지금 얼마?" },
];

// 대표 가이드 (색인된 콘텐츠로 내부링크)
const TOP_GUIDES = [
  { href: "/guide/lotto-tax", label: "로또 당첨금 세금과 실수령액 완벽 정리" },
  { href: "/guide/lotto-claim-process", label: "로또 1등 당첨되면? 수령 절차 총정리" },
  { href: "/guide/compound-interest", label: "복리의 힘: 왜 빨리 시작할수록 유리한가" },
  { href: "/guide/salary-net-pay", label: "연봉 실수령액, 왜 생각보다 적을까?" },
];

const SITE_FAQ = [
  {
    q: "만약에는 어떤 사이트인가요?",
    a: "'만약에 ~하면, 얼마?'라는 궁금증을 재미로 확인하는 정보 사이트입니다. 로또 당첨번호·통계, 그때 투자했으면 얼마가 됐을지 시뮬레이션, 당첨금·연봉·복리 등 돈 계산기, 그리고 관련 가이드 글을 한곳에서 제공합니다.",
  },
  {
    q: "이용 요금이 있나요? 회원가입이 필요한가요?",
    a: "모든 기능은 무료이며 회원가입 없이 바로 이용할 수 있습니다. 로또 번호 저장 같은 일부 기능도 별도 가입 없이 브라우저에서 동작합니다.",
  },
  {
    q: "로또 번호를 판매하거나 당첨을 보장하나요?",
    a: "아닙니다. 이 사이트는 공개된 추첨 결과와 데이터를 정리해 보여줄 뿐, 복권을 판매·알선하지 않으며 당첨을 보장하지 않습니다. 각 추첨은 서로 독립적입니다.",
  },
  {
    q: "계산 결과는 정확한가요?",
    a: "세율·시세·공제 등은 대표값을 사용한 참고용 추정치입니다. 실제 금액은 조건에 따라 달라질 수 있으니 중요한 결정에는 공식 자료를 함께 확인하세요.",
  },
];

// 우산 허브 홈. 최신 회차를 실데이터로 가져오므로 ISR로 주기 갱신.
export const revalidate = 3600;

export default async function HomePage() {
  const latest = await getLiveLatest();

  return (
    <div className="space-y-12">
      {/* ── 히어로: 우산 브랜드 ── */}
      <section className="relative pt-6 text-center">
        {/* 뒤 글로우 */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-400/25 blur-3xl"
        />
        <div className="text-5xl drop-shadow-sm">{SITE.emoji}</div>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            만약에, 얼마?
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-pretty text-sm leading-relaxed text-slate-500">
          로또에 당첨되면, 그때 그 주식을 샀으면, 세금을 떼면 —
          <br />
          <b className="text-slate-700">&lsquo;만약에 얼마?&rsquo;</b>를 재미로
          확인하는 곳이에요.
        </p>
      </section>

      {/* ── 서브브랜드 진입 카드 ── */}
      <section className="grid gap-4 sm:grid-cols-3">
        {SUB_BRANDS.map((brand) =>
          brand.status === "live" && brand.href ? (
            <Link
              key={brand.key}
              href={brand.href}
              className="group flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-950/5 transition hover:-translate-y-1 hover:shadow-lg hover:ring-indigo-200"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-2xl ring-1 ring-indigo-100 transition group-hover:bg-indigo-100">
                {brand.emoji}
              </div>
              <div className="mt-3 font-bold">{brand.name}</div>
              <div className="mt-1 text-sm text-slate-500">{brand.tagline}</div>
              <div className="mt-3 text-sm font-medium text-indigo-600 opacity-0 transition group-hover:opacity-100">
                바로가기 →
              </div>
            </Link>
          ) : (
            <div
              key={brand.key}
              className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-white/50 p-5"
            >
              <div className="text-3xl grayscale">{brand.emoji}</div>
              <div className="mt-2 font-bold text-slate-500">
                {brand.name}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-400">
                  준비 중
                </span>
              </div>
              <div className="mt-1 text-sm text-slate-400">{brand.tagline}</div>
            </div>
          )
        )}
      </section>

      {/* ── 행운노트 스포트라이트: 최신 회차 ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">
          🍀 이번 주 로또 당첨번호
        </h2>
        <Link
          href={`/lotto/${latest.drwNo}`}
          className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 hover:ring-indigo-200"
        >
          <div className="text-xs text-slate-400">
            제 {latest.drwNo}회 · {latest.drwNoDate}
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
      </section>

      {/* ── 사이트 소개 문단 ── */}
      <section className="rounded-2xl bg-white p-6 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          &lsquo;만약에 얼마?&rsquo;를 숫자로 확인하는 곳
        </h2>
        <p className="mt-2">
          <b>{SITE.name}</b>는 누구나 한 번쯤 궁금해하는 돈에 대한{" "}
          &lsquo;만약에&rsquo;를 실제 숫자로 계산해 주는 사이트입니다. 로또 1등에
          당첨되면 세금을 떼고 얼마가 남는지, 몇 년 전 그 주식이나 코인을 샀다면
          지금 얼마가 됐을지, 내 연봉의 실수령 월급은 얼마인지 — 복잡한 계산을
          입력 몇 번으로 확인할 수 있어요.
        </p>
        <p className="mt-2">
          로또는 역대 회차 당첨번호 조회와 번호별 출현 통계, 회차별 당첨금 추이
          같은 데이터를, 투자는 &lsquo;그때 샀으면&rsquo; 시뮬레이션을, 머니
          계산기는 당첨금·연봉·복리·대출·물가 등 실생활 계산을 다룹니다. 모든
          기능은 무료이고 회원가입도 필요 없습니다.
        </p>
      </section>

      {/* ── 이런 걸 할 수 있어요 (인기 기능) ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">이런 걸 할 수 있어요</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {HIGHLIGHTS.map((h) => (
            <Link
              key={h.href}
              href={h.href}
              className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-200"
            >
              <span className="text-2xl">{h.emoji}</span>
              <div>
                <div className="font-semibold">{h.title}</div>
                <div className="mt-0.5 text-sm text-slate-500">{h.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 인기 가이드 ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-500">📚 인기 가이드</h2>
        <div className="divide-y divide-slate-100 rounded-2xl bg-white ring-1 ring-slate-100">
          {TOP_GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-slate-50"
            >
              <span className="font-medium text-slate-700">{g.label}</span>
              <span className="shrink-0 text-indigo-500">→</span>
            </Link>
          ))}
          <Link
            href="/guide"
            className="flex items-center justify-center p-3 text-sm font-medium text-indigo-600 hover:bg-slate-50"
          >
            가이드 전체 보기 →
          </Link>
        </div>
      </section>

      {/* ── 사이트 FAQ ── */}
      <Faq items={SITE_FAQ} />
    </div>
  );
}
