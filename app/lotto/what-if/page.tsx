import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, cache } from "react";
import Faq from "../../components/Faq";
import WhatIfSimulator, { type QuickPick } from "./WhatIfSimulator";
import {
  averageReturn,
  formatDateKo,
  formatExpected,
  formatRate,
  formatWon,
  packDraws,
  parseSmokAll,
  simulate,
  ticketPrice,
  weeksToYears,
  type HistoryDraw,
} from "@/lib/lotto-history";

// 전 회차 데이터: 공개 데이터셋 smok95/lotto 의 all.json(약 430KB, 원 출처 동행복권).
// 1시간마다 다시 받아 새 회차를 반영한다. 원본 주소가 실패하면 같은 저장소의 jsDelivr 미러로 한 번 더 시도.
const SOURCES = [
  "https://raw.githubusercontent.com/smok95/lotto/main/results/all.json",
  "https://cdn.jsdelivr.net/gh/smok95/lotto@main/results/all.json",
];

export const revalidate = 3600;

// generateMetadata와 페이지가 같은 결과를 쓰도록 한 번의 렌더링 안에서 공유.
const loadDraws = cache(async (): Promise<HistoryDraw[] | null> => {
  for (const url of SOURCES) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const draws = parseSmokAll(await res.json());
      if (draws.length > 0) return draws;
    } catch {
      // 다음 주소로
    }
  }
  return null;
});

const DESCRIPTION =
  "로또 번호 6개를 고르면 1회(2002년)부터 최신 회차까지 매주 그 번호로 1게임씩 샀을 때의 등수별 당첨 횟수, 총 구매액, 실제 당첨금 합계와 회수율을 계산합니다.";

export async function generateMetadata(): Promise<Metadata> {
  const draws = await loadDraws();
  const n = draws?.length ?? 0;
  return {
    title:
      n > 0
        ? `내 번호로 1회부터 샀다면? — 로또 역대 ${n.toLocaleString("ko-KR")}회 당첨 성적`
        : "내 번호로 1회부터 샀다면? — 로또 역대 당첨 성적",
    description: DESCRIPTION,
    alternates: { canonical: "/lotto/what-if" },
  };
}

const EXAMPLE_PICK = [1, 2, 3, 4, 5, 6];

const card =
  "rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100";
const h2 = "text-base font-bold text-slate-800";
const link = "text-indigo-600 hover:underline";

function SimulatorFallback() {
  return (
    <div className="flex min-h-[22rem] items-center justify-center rounded-2xl bg-white p-6 text-sm text-slate-400 shadow-sm ring-1 ring-slate-100">
      번호 선택 도구를 준비하는 중…
    </div>
  );
}

export default async function WhatIfPage() {
  const draws = await loadDraws();

  const header = (
    <div>
      <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
        ← 행운노트
      </Link>
      <h1 className="mt-2 text-2xl font-bold">🕰️ 내 번호로 1회부터 샀다면?</h1>
    </div>
  );

  if (!draws) {
    return (
      <div className="space-y-6">
        {header}
        <div className="rounded-2xl bg-rose-50 p-5 text-sm leading-relaxed text-rose-700 ring-1 ring-rose-100">
          역대 당첨 데이터를 지금 불러오지 못했어요. 잠시 후 다시 열어 주세요. 그동안 회차별
          당첨번호는{" "}
          <Link href="/lotto/list" className="font-medium underline">
            회차별 당첨번호
          </Link>
          에서 볼 수 있습니다.
        </div>
      </div>
    );
  }

  const first = draws[0];
  const last = draws[draws.length - 1];
  const oldPrice = draws.filter((d) => ticketPrice(d.no) === 2_000);
  const lastOld = oldPrice[oldPrice.length - 1];
  const firstNew = draws.find((d) => ticketPrice(d.no) === 1_000);
  const noFirst = draws.filter((d) => d.prizes[0] === 0).length;
  const noSecond = draws.filter((d) => d.prizes[1] === 0).length;

  // 본문 예시 — 화면의 계산기와 같은 함수(lib/lotto-history.ts)로 계산
  const ex = simulate(EXAMPLE_PICK, draws);
  const exWins = ex.ranks.filter((s) => s.count > 0);
  const avg = averageReturn(draws);
  const games = draws.length.toLocaleString("ko-KR");
  const lastNo = last.no; // 회차 번호는 사이트 다른 페이지처럼 쉼표 없이(제1251회)

  const quickPicks: QuickPick[] = [
    { label: "1·2·3·4·5·6", pick: EXAMPLE_PICK },
    { label: `제${lastNo}회 당첨번호`, pick: last.numbers },
  ];

  const faq = [
    {
      q: "1회부터 매주 1게임씩 샀다면 돈은 얼마나 들었나요?",
      a: `1게임 가격이 제${lastOld?.no ?? 87}회까지는 2,000원, 제${firstNew?.no ?? 88}회(${firstNew ? formatDateKo(firstNew.date) : "2004년 8월 7일"})부터 1,000원이라, 제${first.no}회부터 제${lastNo}회까지 ${games}게임을 사면 총 ${formatWon(ex.spent)}입니다. 어떤 번호를 골랐든 구매액은 같아요.`,
    },
    {
      q: "당첨금은 세금을 뗀 금액인가요?",
      a: "아니요. 회차마다 발표된 1게임당 세전 당첨금을 그대로 더했습니다. 200만원 이하는 세금이 없지만, 200만원을 넘으면 당첨금 전체에 22%, 3억원을 넘는 부분에는 33%가 붙어 실제로 받는 돈은 더 적습니다. 4·5등도 지금의 고정 금액이 아니라 그 회차의 실제 금액(4등은 400회까지 회차마다 달랐고, 5등은 87회까지 1만원)을 썼어요.",
    },
    {
      q: "과거 성적이 좋은 번호를 고르면 앞으로도 유리한가요?",
      a: "아닙니다. 매 추첨은 서로 독립적이라 과거에 많이 당첨된 조합이 다음에 더 잘 나오지 않습니다. 어떤 6개 번호든 1등 확률은 1/8,145,060으로 같고, 이 페이지의 결과는 지난 기록을 다시 계산해 본 참고 자료일 뿐입니다.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        {header}
        <p className="mt-1 text-sm text-slate-500">
          로또 제{first.no}회({formatDateKo(first.date)})부터 최신 제{lastNo}회(
          {formatDateKo(last.date)})까지, 매주 같은 번호로 1게임씩 샀다면 몇 번 당첨되고 얼마를
          받았을지 실제 당첨번호와 당첨금으로 계산해요.
        </p>
      </div>

      {/* ?n= 쿼리를 읽는 계산기는 브라우저에서 그린다(본문은 서버에서 그대로 렌더) */}
      <Suspense fallback={<SimulatorFallback />}>
        <WhatIfSimulator packed={packDraws(draws)} quickPicks={quickPicks} />
      </Suspense>

      {/* 무엇을 계산하나 */}
      <section className={card}>
        <h2 className={h2}>무엇을, 어떤 가정으로 계산하나요</h2>
        <p className="mt-2">
          고른 6개 번호를 제{first.no}회부터 제{lastNo}회까지 {games}번의 추첨 결과와 하나씩
          대조해, 그 번호로 <b>매주 1게임씩 빠짐없이</b> 샀다면 어떤 성적이 나왔을지 셉니다.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <b>등수</b>: 6개 일치 1등, 5개 + 보너스 번호 2등, 5개 3등, 4개 4등, 3개 5등.
            보너스 번호는 5개를 맞혔을 때만 쓰입니다.
          </li>
          <li>
            <b>구매액</b>: 1게임 가격이 시기마다 달라, 제{lastOld?.no ?? 87}회(
            {lastOld ? formatDateKo(lastOld.date) : "2004년 7월 31일"})까지는 2,000원, 제
            {firstNew?.no ?? 88}회부터는 1,000원으로 더합니다. 그래서 {games}게임의 총 구매액은{" "}
            {formatWon(ex.spent)}입니다.
          </li>
          <li>
            <b>당첨금</b>: 그 회차에 실제로 발표된 등수별 1게임당 <b>세전</b> 금액입니다.
            4등은 400회까지 회차마다 금액이 달랐고 401회부터 5만원, 5등은 87회까지 1만원,
            88회부터 5천원이라 이것도 회차별 실제 금액을 씁니다.
          </li>
          <li>
            <b>회수율</b>: 총 당첨금 ÷ 총 구매액. 100%보다 낮으면 쓴 돈보다 적게 돌려받았다는
            뜻입니다.
          </li>
        </ul>
      </section>

      {/* 예시 — 함수로 계산한 실제 결과 */}
      <section className={card}>
        <h2 className={h2}>예시: 1·2·3·4·5·6을 1회부터 샀다면</h2>
        <p className="mt-2">
          &lsquo;이렇게 나올 리 없다&rsquo;는 느낌을 주는 1·2·3·4·5·6으로 제{first.no}회부터 제
          {lastNo}회까지 {games}주 동안 매주 1게임씩 샀다면 총 {formatWon(ex.spent)}을 쓰게
          됩니다.{" "}
          {exWins.length > 0 ? (
            <>
              이 기간에{" "}
              {exWins
                .map((s) => `${s.rank}등 ${s.count}번(합계 ${formatWon(s.total)})`)
                .join(", ")}
              에 당첨됐고
              {ex.ranks.slice(0, 3).every((s) => s.count === 0) && " 1~3등은 한 번도 없어서"}
              {" "}당첨금 합계는 <b>{formatWon(ex.totalPrize)}</b>, 회수율은{" "}
              <b>{formatRate(ex.returnRate)}</b>입니다.
            </>
          ) : (
            <>이 기간에 5등 이상은 한 번도 나오지 않아 회수율은 0%입니다.</>
          )}
        </p>
        <p className="mt-2">
          아무 번호나 골랐을 때의 이론상 평균 횟수는 같은 {games}게임에서 5등{" "}
          {formatExpected(ex.ranks[4].expected)}번, 4등 {formatExpected(ex.ranks[3].expected)}번,
          3등 {formatExpected(ex.ranks[2].expected)}번입니다. 이 조합에서 가장 많이 맞힌 개수는{" "}
          {ex.bestMatch}개({ex.bestMatchDraws.length}번)였고, 당첨 없이 가장 길게 이어진 기간은{" "}
          {ex.longestDrought.length.toLocaleString("ko-KR")}주(약{" "}
          {weeksToYears(ex.longestDrought.length)}년, 제{ex.longestDrought.fromNo}회~제
          {ex.longestDrought.toNo}회)였습니다.
        </p>
        <p className="mt-2">
          비교를 위해 무작위 조합 하나를 1회부터 매주 샀을 때의 평균(기댓값)도 계산해 보면,
          회차마다 &lsquo;등수별 조합 수 × 실제 1게임당 금액 ÷ 8,145,060&rsquo;을 더한 회수율이{" "}
          {formatRate(avg.rate)}입니다. 다만 이 평균의 상당 부분은 극소수 조합만 받는 1~3등
          몫이라, 4·5등만 따지면 {formatRate(avg.lowerOnlyRate)}입니다. 1~3등에 한 번도 당첨되지
          않은 조합의 회수율은 대체로 이 근처에서 오르내립니다.
        </p>
        <p className="mt-2">
          <Link href={`/lotto/what-if?n=${EXAMPLE_PICK.join(",")}`} className={link}>
            이 예시를 계산기로 직접 보기 →
          </Link>
        </p>
      </section>

      {/* 한계와 고지 */}
      <section className={card}>
        <h2 className={h2}>결과를 볼 때 알아둘 점</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            이 계산은 <b>이미 끝난 추첨</b>에 번호를 대 본 것일 뿐, 앞으로의 당첨 가능성과는
            관계가 없습니다. 매 추첨은 서로 독립적이고, 어떤 6개 번호든 1등 확률은{" "}
            <b>1/8,145,060</b>으로 같습니다. 과거 성적이 좋았던 번호가 다음에 더 잘 나오지
            않습니다.
          </li>
          <li>
            실제 발표 금액을 그대로 썼습니다. 내가 그 회차에 샀다면 당첨자가 한 명 늘어
            1~3등 1게임당 금액은 조금 줄었을 것입니다.
          </li>
          <li>
            1등 당첨자가 없던 회차가 {noFirst}번, 2등이 없던 회차가 {noSecond}번 있어 그 회차의
            해당 등수 금액은 기록이 없습니다. 고른 번호가 그런 회차에서 그 등수에 해당하면 횟수에는
            넣고 금액 합계에서는 뺍니다.
          </li>
          <li>
            모든 금액은 세전입니다. 200만원을 넘는 당첨금에는 세금이 붙으니 실제 받는 금액은{" "}
            <Link href="/calc/prize" className={link}>
              당첨금 실수령액 계산기
            </Link>
            로 확인하세요.
          </li>
          <li>
            당첨번호·당첨금은 공개 데이터셋 smok95/lotto(원 출처 동행복권)를 1시간마다 다시 받아
            씁니다. 최종 확인은 동행복권 공식 결과로 하세요.
          </li>
        </ul>
        <p className="mt-2">
          이 페이지는 지난 결과를 재미로 다시 계산해 보는 참고 자료이며, 복권 구매를 권하지
          않습니다. 복권은 여윳돈으로 소액만 즐기시고, 도박 문제로 어려움이 있다면
          한국도박문제예방치유원(국번 없이 1336)에서 상담받을 수 있습니다.
        </p>
      </section>

      {/* 관련 링크 */}
      <section className={card}>
        <h2 className={h2}>함께 보면 좋은 페이지</h2>
        <ul className="mt-2 space-y-1.5">
          <li>
            <Link href="/guide/lotto-probability" className={link}>
              로또 1등 확률과 번호 고르기의 진실
            </Link>{" "}
            — 8,145,060은 어떻게 나온 숫자일까
          </li>
          <li>
            <Link href="/lotto/list" className={link}>
              회차별 당첨번호
            </Link>{" "}
            — 1회부터 최신 회차까지 당첨번호·당첨금
          </li>
          <li>
            <Link href="/stats" className={link}>
              번호 출현 통계
            </Link>{" "}
            — 최근 50회 동안 어떤 번호가 자주 나왔나
          </li>
          <li>
            <Link href="/lotto/my" className={link}>
              내 번호 당첨확인
            </Link>{" "}
            — 번호를 저장해 두고 매주 최신 회차와 대조
          </li>
        </ul>
      </section>

      <Faq items={faq} />
    </div>
  );
}
