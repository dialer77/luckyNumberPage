import type { Metadata } from "next";
import Link from "next/link";
import ChallengeClient from "./ChallengeClient";
import Faq from "../../components/Faq";
import { getLiveLatest } from "@/lib/lotto-live";

export const metadata: Metadata = {
  title: "1등 도전 시뮬레이터 — 몇 번 만에 1등이 나올까",
  description:
    "최신 회차 당첨번호를 목표로 무작위 번호를 뽑아 몇 번 만에 1등이 나오는지 체험해 보세요. 로또 1등 확률(814만 분의 1)을 몸으로 느껴보는 시뮬레이터입니다.",
  alternates: { canonical: "/tools/challenge" },
};

const FAQ = [
  {
    q: "로또 1등 확률은 얼마나 되나요?",
    a: "1~45 중 6개를 모두 맞혀야 하므로, 경우의 수는 8,145,060가지입니다. 즉 1등 확률은 약 814만 분의 1로, 벼락에 맞을 확률보다도 낮다고 흔히 비유됩니다.",
  },
  {
    q: "이 시뮬레이터는 뭘 보여주나요?",
    a: "최신 회차 당첨번호를 '정답'으로 두고, 버튼을 누를 때마다 무작위 번호를 뽑아 몇 번 만에 6개가 모두 일치하는지 세어봅니다. 실제로는 수백만 번을 뽑아도 1등이 안 나올 수 있어, 확률의 크기를 체감하는 재미 요소입니다.",
  },
  {
    q: "여기서 뽑은 번호로 실제 로또를 사도 되나요?",
    a: "이 도구는 확률을 체험하는 놀이일 뿐, 특정 번호의 당첨 가능성을 높여주지 않습니다. 실제 구매용 번호가 필요하면 행운 번호 생성기를 참고하세요. 어떤 방식이든 당첨 확률은 동일합니다.",
  },
];

export const revalidate = 3600;

export default async function ChallengePage() {
  const target = await getLiveLatest();
  return (
    <div className="space-y-6">
      <ChallengeClient target={target} />

      {/* 확률 설명 — 콘텐츠 보강 */}
      <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed text-slate-600 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-base font-bold text-slate-800">
          814만 분의 1, 얼마나 큰 숫자일까
        </h2>
        <p className="mt-2">
          로또 1등은 1~45 중 6개를 모두 맞혀야 합니다. 이 경우의 수는{" "}
          <b>8,145,060가지</b>, 즉 1등 확률은 약 <b>814만 분의 1</b>입니다. 이
          시뮬레이터로 아무리 많이 뽑아봐도 좀처럼 1등이 나오지 않는 이유가 바로
          이 압도적인 경우의 수 때문입니다.
        </p>
        <p className="mt-2">
          한 가지 오해를 짚자면, &lsquo;자동&rsquo;과 &lsquo;수동&rsquo;, 또는
          특정 번호 조합에 따라 확률이 달라지지는 않습니다. 어떤 6개 조합이든 1등
          확률은 정확히 같습니다. 확률의 실제 이야기는{" "}
          <Link href="/guide/lotto-probability" className="text-indigo-600 hover:underline">
            로또 확률 가이드
          </Link>
          에서, 재미로 번호를 뽑아보려면{" "}
          <Link href="/tools/generator" className="text-indigo-600 hover:underline">
            행운 번호 생성기
          </Link>
          를 이용해 보세요.
        </p>
      </div>

      <Faq items={FAQ} />
    </div>
  );
}
