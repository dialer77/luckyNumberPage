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
    a: "이 페이지는 최근 회차 구간을 기준으로 각 번호(1~45)가 당첨번호로 몇 번 나왔는지 집계합니다. 표본 구간이 짧으면 편차가 커 보일 수 있으니, 특정 번호가 많거나 적게 나온 것도 우연일 가능성이 큽니다.",
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
  title: "번호 출현 통계",
  description: "최근 회차에서 각 번호가 몇 번 나왔는지 집계한 통계입니다.",
  alternates: { canonical: "/stats" },
};

export const revalidate = 3600;

export default async function StatsPage() {
  const draws = await getLiveRecent(50);
  const freq = computeFrequency(draws);
  const totalDraws = draws.length;
  const maxCount = Math.max(...freq.map((f) => f.count), 1); // 막대 비율 계산용

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">번호 출현 통계</h1>
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

      {/* 통계 읽는 법 — 콘텐츠 보강 + 확률 오해 방지 */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          번호 출현 통계, 어떻게 읽어야 할까
        </h2>
        <p className="mt-2">
          위 표는 최근 {totalDraws}개 회차에서 각 번호가 당첨번호로 몇 번 나왔는지
          집계한 것입니다. 막대가 길수록 해당 구간에서 자주 나온 번호예요. 다만
          가장 중요한 전제는 <b>로또의 매 추첨은 서로 완전히 독립적</b>이라는
          점입니다. 지난주에 많이 나온 번호라고 해서 이번 주에 더 잘 나오는 것은
          아닙니다.
        </p>
        <p className="mt-2">
          그래서 이 통계는 &lsquo;미래를 맞히는 도구&rsquo;가 아니라, 지금까지의
          경향을 재미로 살펴보는 <b>참고 자료</b>로 보는 것이 맞습니다. 표본이 짧은
          구간에서는 번호 간 출현 횟수 차이가 커 보여도 대부분 우연의 범위 안에
          있습니다. 번호를 고를 때는 통계에 의존하기보다, 좋아하는 숫자나{" "}
          <Link href="/tools/generator" className="text-indigo-600 hover:underline">
            무작위 생성기
          </Link>
          를 활용하는 편이 마음 편합니다.
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
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
