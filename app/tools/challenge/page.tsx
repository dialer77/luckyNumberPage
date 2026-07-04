import type { Metadata } from "next";
import ChallengeClient from "./ChallengeClient";
import { getLiveLatest } from "@/lib/lotto-live";

export const metadata: Metadata = {
  title: "1등 도전 시뮬레이터",
  description:
    "최신 회차 당첨번호를 목표로 무작위 번호를 뽑아 몇 번 만에 1등이 나오는지 도전해 보세요.",
  alternates: { canonical: "/tools/challenge" },
};

export const revalidate = 3600;

export default async function ChallengePage() {
  const target = await getLiveLatest();
  return <ChallengeClient target={target} />;
}
