import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../../components/NumberBall";
import LottoSearch from "../../components/LottoSearch";
import Faq from "../../components/Faq";
import { getLiveRecent, getLiveLatestNo } from "@/lib/lotto-live";

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
  title: "회차별 당첨번호 조회 — 1회부터 최신회까지",
  description:
    "역대 로또 당첨번호를 회차 번호로 검색해 조회하세요. 1회부터 최신 회차까지 당첨번호·보너스·1등 당첨금과 세후 실수령액을 확인할 수 있습니다.",
  alternates: { canonical: "/lotto/list" },
};

export const revalidate = 3600;

export default async function LottoListPage() {
  const [draws, latestNo] = await Promise.all([
    getLiveRecent(30),
    getLiveLatestNo(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">회차별 당첨번호</h1>
        <p className="mt-1 text-sm text-slate-500">
          1회부터 최신 {latestNo}회까지 조회할 수 있어요. 아래에서 회차 번호로
          바로 찾거나, 최신 회차부터 훑어보세요.
        </p>
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
          를 참고하세요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
