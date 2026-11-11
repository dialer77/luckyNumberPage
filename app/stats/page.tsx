import type { Metadata } from "next";
import Link from "next/link";
import NumberBall from "../components/NumberBall";
import Faq from "../components/Faq";
import { getLiveRecent, computeFrequency } from "@/lib/lotto-live";

const FAQ = [
  {
    q: "많이 나온 번호를 고르면 당첨 확률이 높아지나요?",
    a: "아닙니다. 로또는 매 회차가 서로 독립적인 추첨이라, 과거에 자주 나온 번호가 다음에 더 잘 나온다는 근거는 없습니다. 통계는 '지금까지의 경향'을 보여줄 뿐, 미래 확률을 바꾸지 않습니다. 재미와 참고용으로만 보세요.",
  },
  {
    q: "출현 통계는 몇 회차 기준인가요?",
    a: "이 페이지는 가장 최근 50개 회차를 기준으로 각 번호(1~45)가 당첨번호로 몇 번 나왔는지 집계하며, 새 회차가 추가되면 가장 오래된 회차가 빠집니다. 표본 구간이 짧으면 편차가 커 보일 수 있으니, 특정 번호가 많거나 적게 나온 것도 우연일 가능성이 큽니다. 1회부터의 전 회차 흐름은 회차별 추이 대시보드에서 볼 수 있습니다.",
  },
  {
    q: "'뜨거운 번호'와 '차가운 번호'가 뭔가요?",
    a: "흔히 최근에 자주 나온 번호를 뜨거운(hot) 번호, 오랫동안 안 나온 번호를 차가운(cold) 번호라고 부릅니다. 번호 선택의 재미 요소일 뿐 확률적 우위는 없습니다.",
  },
  {
    q: "보너스 번호도 통계에 포함되나요?",
    a: "이 통계는 당첨번호 6개를 기준으로 집계합니다. 보너스 번호는 2등 판정에만 쓰이는 별도 번호라, 출현 빈도 집계에서는 제외하는 것이 일반적입니다.",
  },
];

export const metadata: Metadata = {
  title: "로또 번호별 출현 횟수 통계 — 최근 50회 많이 나온 번호",
  description:
    "로또 1~45번 각 번호가 최근 50회 동안 당첨번호로 몇 번 나왔는지 많이 나온 순으로 정리했습니다. 매주 추첨 후 자동 갱신되며, 통계를 볼 때 알아둘 확률의 원리도 함께 안내합니다.",
  alternates: { canonical: "/stats" },
};

export const revalidate = 3600;

export default async function StatsPage() {
  const draws = await getLiveRecent(50);
  const freq = computeFrequency(draws);
  const totalDraws = draws.length;
  const maxCount = Math.max(...freq.map((f) => f.count), 1); // 막대 비율 계산용

  // 읽는 법 섹션용: 번호당 평균 출현 횟수와 최다·최소 번호(동률이면 모두 표시)
  const expected = ((totalDraws * 6) / 45).toFixed(1);
  const top = freq[0];
  const bottom = freq[freq.length - 1];
  const numsWith = (count: number) =>
    freq
      .filter((f) => f.count === count)
      .map((f) => f.number)
      .sort((a, b) => a - b)
      .join("·");
  const topNums = numsWith(top.count);
  const bottomNums = numsWith(bottom.count);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">로또 번호별 출현 통계</h1>
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

      {/* 통계 읽는 법과 한계 — 콘텐츠 보강 + 확률 오해 방지 */}
      <section className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          이 통계를 읽는 법과 한계
        </h2>
        <p className="mt-2">
          위 표는 최근 {totalDraws}개 회차의 당첨번호 6개(보너스 번호 제외)를
          번호별로 센 것입니다. 모두 {(totalDraws * 6).toLocaleString()}개 번호가
          나왔으니 번호 하나당 평균은 약 {expected}회이고, 이번 집계에서 가장 많이
          나온 번호는 {topNums}번({top.count}회), 가장 적게 나온 번호는{" "}
          {bottomNums}번({bottom.count}회)입니다.
        </p>
        <p className="mt-2">
          이 정도 차이는 무작위 추첨에서 자연스럽게 생깁니다.
          {totalDraws === 50 && (
            <>
              {" "}
              컴퓨터로 공정한 추첨 50회를 5만 번 반복해 보면, 가장 많이 나온 번호는
              보통 11~15회, 가장 적게 나온 번호는 1~3회였습니다.
            </>
          )}{" "}
          {totalDraws}회는 표본이 작아 몇 주만 지나도 순위가 크게 바뀌고, 전
          회차로 넓혀 봐도 번호별 차이는 우연의 범위 안에 있습니다(
          <Link href="/guide/lotto-number-frequency-test" className="text-indigo-600 hover:underline">
            자주 나온 번호를 고르면 유리할까? 직접 검증
          </Link>
          ).
        </p>
        <p className="mt-2">
          가장 중요한 전제는 <b>매 추첨이 서로 독립적</b>이라는 점입니다. 많이 나온
          번호가 다음에 더 잘 나오지도, 덜 나온 번호가 &lsquo;나올 때가 된&rsquo;
          것도 아닙니다. 그래서 이 표는 다음 회차 예측에 쓸 수 없고, 어떤 조합이든
          1등 확률은 8,145,060분의 1로 같습니다. 홀짝·합계처럼 &lsquo;자주 나오는
          모양&rsquo;도 마찬가지입니다(
          <Link href="/guide/lotto-odd-even-sum-distribution" className="text-indigo-600 hover:underline">
            홀짝·합계 분포 분석
          </Link>
          ).
        </p>
        <p className="mt-2">
          이 통계는 지난 결과를 기록한 참고 자료일 뿐, 복권 구매를 권하지
          않습니다. 번호는 좋아하는 숫자나{" "}
          <Link href="/tools/generator" className="text-indigo-600 hover:underline">
            무작위 생성기
          </Link>
          로 고르고, 복권은 여윳돈으로 소액만 즐기세요. 도박 문제로 어려움이
          있다면 한국도박문제예방치유원(국번 없이 1336)에서 상담받을 수 있습니다.
        </p>
        <p className="mt-2 text-slate-400">
          확률에 대한 더 자세한 이야기는{" "}
          <Link href="/guide/lotto-probability" className="text-indigo-600 hover:underline">
            &lsquo;로또 1등 확률과 번호 고르기의 진실&rsquo;
          </Link>{" "}
          가이드에서, 회차별 당첨금·당첨자 흐름은{" "}
          <Link href="/lotto/trends" className="text-indigo-600 hover:underline">
            추이 대시보드
          </Link>
          에서 확인하세요.
        </p>
      </section>

      <Faq items={FAQ} />
    </div>
  );
}
