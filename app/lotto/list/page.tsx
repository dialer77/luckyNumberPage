import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../../components/NumberBall";
import LottoSearch from "../../components/LottoSearch";
import Faq from "../../components/Faq";
import { getAllLiveDraws } from "@/lib/lotto-live";
import { formatKRW, type LottoDraw } from "@/lib/lotto-data";
import { SITE } from "@/lib/brand";

const FAQ = [
  {
    q: "지난 회차 당첨번호는 어떻게 찾나요?",
    a: "위 검색창에 회차 번호를 입력하면 해당 회차의 당첨번호 페이지로 바로 이동합니다. 1회부터 최신 회차까지 모두 조회할 수 있고, 각 회차 페이지에서 당첨번호·보너스·등수별 당첨금과 번호 구성 분석까지 볼 수 있습니다.",
  },
  {
    q: "몇 회차까지 조회할 수 있나요?",
    a: "2002년 제1회부터 가장 최근 회차까지 전부 조회됩니다. 새 회차는 매주 추첨 후 자동으로 갱신되어 목록과 검색에 반영됩니다.",
  },
  {
    q: "내가 산 번호가 당첨됐는지 확인하려면?",
    a: "'내 번호 당첨확인' 기능에 번호를 저장해두면 최신 회차와 자동으로 대조해 몇 등인지 알려줍니다. 회차별 당첨번호와 직접 비교해도 됩니다.",
  },
  {
    q: "당첨번호 데이터는 정확한가요?",
    a: "공개된 공식 추첨 결과를 정리해 보여줍니다. 다만 표시 오류나 갱신 지연이 있을 수 있으니, 실제 당첨 여부와 수령은 공식 기관 기준으로 확인하세요.",
  },
];

// 회차별 당첨번호 목록 (행운노트 대문에서 한 단계 들어온 페이지).
export const metadata: Metadata = {
  // 서치콘솔(2026-10): 유입 검색어가 전부 "로또 회차별 당첨번호 (전체보기)" 계열
  title: "로또 회차별 당첨번호 전체보기 — 1회부터 최신회까지 한눈에",
  description:
    "로또 1회부터 최신 회차까지 역대 당첨번호 전체를 연도별 표로 한눈에 보세요. 회차 검색, 보너스 번호, 1등 당첨금과 등수별 당첨금까지 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/list" },
};

export const revalidate = 3600;

export default async function LottoListPage() {
  // 전 회차를 한 번에 받아 최근 30회 카드 + 연도별 전체 표에 함께 사용
  const all = await getAllLiveDraws(); // 회차 오름차순
  const latestNo = all[all.length - 1]?.drwNo ?? 0;
  const latestDate = all[all.length - 1]?.drwNoDate ?? "";
  const draws = all.slice(-30).reverse();

  // 연도별 묶음 (최신 연도 먼저, 연도 안에서는 최신 회차 먼저)
  const byYear = new Map<string, LottoDraw[]>();
  for (const d of [...all].reverse()) {
    const y = d.drwNoDate.slice(0, 4);
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(d);
  }
  const years = [...byYear.keys()];

  return (
    <div className="space-y-6">
      {/* 구조화 데이터: 경로(빵부스러기) → 검색결과 계층 표시 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "행운노트", item: `${SITE.url}/lotto` },
              { "@type": "ListItem", position: 2, name: "회차별 당첨번호", item: `${SITE.url}/lotto/list` },
            ],
          }),
        }}
      />
      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">로또 회차별 당첨번호 전체보기</h1>
        <p className="mt-1 text-sm text-slate-500">
          1회부터 최신 {latestNo}회까지 조회할 수 있어요. 아래에서 회차 번호로
          바로 찾거나, 최신 회차부터 훑어보세요.
        </p>
        {latestDate && (
          <p className="mt-1 text-xs text-slate-400">
            최근 업데이트: 제 {latestNo}회({latestDate} 추첨) 결과까지 반영 · 매주
            추첨 다음 날 자동 갱신
          </p>
        )}
      </div>

      {/* 회차 검색 */}
      <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <LottoSearch latestNo={latestNo} />
        <p className="mt-2 text-xs text-slate-400">
          예: 1000 을 입력하면 제 1000회 당첨번호로 이동합니다.
        </p>
      </section>

      <h2 className="text-sm font-semibold text-slate-700">최근 30회</h2>
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

      {/* 전 회차 표 — "회차별 당첨번호 전체보기" 검색 의도에 직접 대응.
          연도별 접기(최신 연도만 펼침)로 모바일에서도 길지 않게. */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">
          전체 회차 당첨번호 (1회 ~ {latestNo}회, 연도별)
        </h2>
        {years.map((y, i) => {
          const rows = byYear.get(y)!;
          return (
            <details
              key={y}
              open={i === 0}
              className="rounded-xl bg-white shadow-sm ring-1 ring-slate-100"
            >
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold">
                {y}년{" "}
                <span className="font-normal text-slate-400">
                  ({rows[rows.length - 1].drwNo}회 ~ {rows[0].drwNo}회)
                </span>
              </summary>
              <table className="w-full border-t border-slate-100 text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400">
                    <th className="px-4 py-1.5 font-normal">회차</th>
                    <th className="py-1.5 font-normal">당첨번호 + 보너스</th>
                    <th className="hidden py-1.5 pr-4 text-right font-normal sm:table-cell">
                      1등 당첨금
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.drwNo} className="border-t border-slate-50">
                      <td className="px-4 py-1.5 whitespace-nowrap">
                        <Link href={`/lotto/${d.drwNo}`} className="font-medium text-indigo-600 hover:underline">
                          {d.drwNo}회
                        </Link>
                        <div className="text-xs text-slate-400">{d.drwNoDate.slice(5)}</div>
                      </td>
                      <td className="py-1.5 tabular-nums">
                        {d.numbers.join(" · ")}{" "}
                        <span className="text-slate-400">+ {d.bonus}</span>
                      </td>
                      <td className="hidden py-1.5 pr-4 text-right text-slate-500 sm:table-cell">
                        {d.firstWinAmount ? formatKRW(d.firstWinAmount) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          );
        })}
      </section>

      {/* 안내 문단 — 콘텐츠 보강 + 내부 링크 */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          회차별 당첨번호 조회 안내
        </h2>
        <p className="mt-2">
          로또는 2002년 12월 제1회 추첨을 시작으로 매주 토요일 추첨이 이어지고
          있습니다. 이 페이지에서는 1회부터 최신 {latestNo}회까지 어떤 회차든
          번호로 검색해 당첨번호를 확인할 수 있어요. 각 회차 상세 페이지에서는
          당첨번호 6개와 보너스 번호는 물론, <b>1~5등 등수별 당첨금</b>과 그
          회차만의 <b>번호 구성 분석(홀짝·고저·합계·연속·AC값)</b>까지 함께
          제공합니다.
        </p>
        <p className="mt-2">
          특정 번호가 얼마나 자주 나왔는지 궁금하다면{" "}
          <Link href="/stats" className="text-indigo-600 hover:underline">
            번호 출현 통계
          </Link>
          를, 당첨금 세금이 궁금하다면{" "}
          <Link href="/guide/lotto-tax" className="text-indigo-600 hover:underline">
            로또 세금 가이드
          </Link>
          를 참고하세요. 지난 복권을 확인하는 방법은{" "}
          <Link href="/guide/how-to-check-lotto-numbers" className="text-indigo-600 hover:underline">
            당첨번호 확인 방법 가이드
          </Link>
          에 정리해 두었습니다.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
