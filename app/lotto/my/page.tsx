import type { Metadata } from "next";
import Link from "next/link";
import MyNumbers from "./MyNumbers";
import { getLatestDraw } from "@/lib/lotto-data";

export const metadata: Metadata = {
  title: "내 번호 당첨확인 — 저장한 로또번호 자동 대조",
  description:
    "내 로또 번호를 저장해두면 매주 최신 회차와 자동으로 대조해 당첨 여부를 알려줍니다. 회원가입 없이 이용하세요.",
  alternates: { canonical: "/lotto/my" },
};

export default function MyNumbersPage() {
  const latest = getLatestDraw();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lotto" className="text-sm text-indigo-600 hover:underline">
          ← 행운노트
        </Link>
        <h1 className="mt-2 text-2xl font-bold">⭐ 내 번호 당첨확인</h1>
        <p className="mt-1 text-sm text-slate-500">
          내 번호를 저장해두면 매주 최신 회차와 자동으로 대조해 드려요.
        </p>
      </div>
      <MyNumbers latest={latest} />
    </div>
  );
}
