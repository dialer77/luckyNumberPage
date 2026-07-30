import type { Metadata } from "next";
import Link from "next/link";
import TrendChart, { type TrendPoint } from "./TrendChart";
import Faq from "../../components/Faq";
import { getAllLiveDraws } from "@/lib/lotto-live";
import { formatKRW, DRAW_BASELINE } from "@/lib/lotto-data";
import { SITE } from "@/lib/brand";

export const metadata: Metadata = {
  title: "회차별 당첨금·당첨자 추이 — 전 회차 데이터 대시보드",
  description:
    "역대 로또 1등 당첨금, 1등 당첨자 수, 당첨번호 합계가 회차에 따라 어떻게 변해왔는지 그래프로 확인하세요. 전 회차 데이터를 집계한 시각 대시보드입니다.",
  keywords: ["로또 당첨금 추이", "로또 통계", "1등 당첨금 그래프", "로또 당첨자 수", "당첨번호 합계"],
  alternates: { canonical: "/lotto/trends" },
};

// 과거 회차는 불변 → 하루 단위 ISR 캐시. 새 회차만 반영.
export const revalidate = 86400;

const FAQ = [
  {
    q: "1등 당첨금은 왜 회차마다 다른가요?",
    a: "1등 당첨금은 정해진 금액이 아니라, 그 회차 총 판매액의 일정 비율(1등 배당금)을 1등 당첨자 수로 나눈 값입니다. 그래서 판매가 많고 당첨자가 적은 회차일수록 1인당 당첨금이 커지고, 이월(당첨자 0)이 있으면 다음 회차 금액이 크게 뜁니다.",
  },
  {
    q: "당첨번호 합계에 '이론상 평균'이 있나요?",
    a: "1~45에서 6개를 뽑을 때 합계의 기대값은 138입니다(1~45 평균 23 × 6). 실제 회차의 합계는 이 138을 중심으로 위아래로 흩어지며, 대부분 100~170 사이에 분포합니다.",
  },
  {
    q: "이 그래프로 다음 회차를 예측할 수 있나요?",
    a: "아닙니다. 각 추첨은 서로 독립적이라 과거 추이가 미래를 결정하지 않습니다. 이 대시보드는 지금까지의 경향을 한눈에 보는 통계 자료이며, 당첨을 예측하거나 보장하지 않습니다.",
  },
];

export default async function TrendsPage() {
  const draws = await getAllLiveDraws(); // 회차 오름차순

  // 시리즈 데이터 구성
  const prizePts: TrendPoint[] = draws.map((d) => ({
    drwNo: d.drwNo,
    date: d.drwNoDate,
    value: d.firstWinAmount,
  }));
  const winnerPts: TrendPoint[] = draws.map((d) => ({
    drwNo: d.drwNo,
    date: d.drwNoDate,
    value: d.firstWinnerCount,
  }));
  const sumPts: TrendPoint[] = draws.map((d) => ({
    drwNo: d.drwNo,
    date: d.drwNoDate,
    value: d.numbers.reduce((s, n) => s + n, 0),
  }));

  const total = draws.length;
  const avgPrize = Math.round(
    prizePts.reduce((s, p) => s + p.value, 0) / (total || 1)
  );
  const avgWinner =
    Math.round((winnerPts.reduce((s, p) => s + p.value, 0) / (total || 1)) * 10) / 10;
  const maxPrize = prizePts.reduce((a, b) => (b.value > a.value ? b : a), prizePts[0]);
  const maxWinner = winnerPts.reduce((a, b) => (b.value > a.value ? b : a), winnerPts[0]);

  return (
    <div className="space-y-6">
      {/* 구조화 데이터: 데이터셋 성격 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "로또 회차별 당첨금·당첨자·합계 추이",
            description:
              "역대 로또 1등 당첨금, 1등 당첨자 수, 당첨번호 합계의 회차별 추이 집계.",
            creator: { "@type": "Organization", name: SITE.name },
            url: `${SITE.url}/lotto/trends`,
            inLanguage: "ko-KR",
          }),
        }}
      />

      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">회차별 추이 대시보드</h1>
        <p className="mt-1 text-sm text-slate-500">
          전 회차 데이터를 집계했습니다. 그래프 위에 마우스를 올리면(모바일은
          터치) 해당 회차의 값을 볼 수 있어요.
        </p>
      </div>

      {/* 요약 통계 타일 */}
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <dt className="text-slate-500">집계 회차</dt>
          <dd className="mt-1 text-lg font-bold">{total.toLocaleString()}회</dd>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <dt className="text-slate-500">평균 1등 당첨금</dt>
          <dd className="mt-1 text-lg font-bold">{formatKRW(avgPrize)}</dd>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4 shadow-sm ring-1 ring-indigo-100">
          <dt className="text-slate-500">역대 최고 1등 당첨금</dt>
          <dd className="mt-1 text-lg font-bold text-indigo-600">
            {formatKRW(maxPrize.value)}
          </dd>
          <dd className="text-xs text-slate-400">{maxPrize.drwNo}회</dd>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <dt className="text-slate-500">평균 1등 당첨자</dt>
          <dd className="mt-1 text-lg font-bold">{avgWinner}명</dd>
        </div>
      </dl>

      {/* 차트 1: 1등 당첨금 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          1등 1게임당 당첨금 추이
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          회차별 1등 1인 당첨금. 이월·판매액에 따라 큰 폭으로 변동합니다.
          점선은 전체 평균({formatKRW(avgPrize)}).
        </p>
        <div className="mt-3">
          <TrendChart
            data={prizePts}
            format="krw"
            baseline={{ value: avgPrize, label: "평균" }}
          />
        </div>
      </section>

      {/* 차트 2: 1등 당첨자 수 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">1등 당첨자 수 추이</h2>
        <p className="mt-1 text-xs text-slate-500">
          회차별 1등 당첨자 수. 당첨자가 많을수록 1인당 당첨금은 줄어듭니다.
          최다는 {maxWinner.drwNo}회 {maxWinner.value}명. 점선은 평균({avgWinner}명).
        </p>
        <div className="mt-3">
          <TrendChart
            data={winnerPts}
            format="count"
            accent="#0ea5e9"
            baseline={{ value: avgWinner, label: "평균" }}
          />
        </div>
      </section>

      {/* 차트 3: 당첨번호 합계 */}
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">당첨번호 합계 추이</h2>
        <p className="mt-1 text-xs text-slate-500">
          회차별 당첨번호 6개의 합계. 점선은 이론상 평균({DRAW_BASELINE.sum}).
          대부분 100~170 사이에 분포합니다.
        </p>
        <div className="mt-3">
          <TrendChart
            data={sumPts}
            format="sum"
            accent="#10b981"
            baseline={{ value: DRAW_BASELINE.sum, label: `이론 평균 ${DRAW_BASELINE.sum}` }}
          />
        </div>
      </section>

      {/* 해설 */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">이 데이터를 읽는 법</h2>
        <p className="mt-2">
          1등 당첨금은 &lsquo;정해진 상금&rsquo;이 아니라 그 회차 판매액과 당첨자
          수로 결정됩니다. 그래서 당첨금 그래프의 큰 봉우리는 대개 이월(당첨자
          0)이 있었거나 판매가 많고 당첨자가 적었던 회차입니다. 당첨자 수
          그래프와 함께 보면, 당첨자가 적은 회차에서 당첨금이 치솟는 반대 관계가
          보입니다.
        </p>
        <p className="mt-2">
          당첨번호 합계는 이론상 평균 {DRAW_BASELINE.sum}을 중심으로 흩어집니다.
          특정 합계 구간이 &lsquo;유리하다&rsquo;는 뜻은 아니며, 각 추첨은 서로
          독립적이라 과거 추이로 미래를 예측할 수는 없습니다. 자세한 확률 이야기는{" "}
          <Link href="/guide/lotto-probability" className="text-indigo-600 hover:underline">
            로또 확률 가이드
          </Link>
          에서 다룹니다.
        </p>
        <p className="mt-2 text-slate-400">
          회차별 상세는{" "}
          <Link href="/lotto/list" className="text-indigo-600 hover:underline">
            회차별 당첨번호
          </Link>
          , 번호별 출현은{" "}
          <Link href="/stats" className="text-indigo-600 hover:underline">
            출현 통계
          </Link>
          에서 확인하세요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
