"use client";
// 어느 계산기 결과든 붙일 수 있는 공유 버튼.
// payload를 /s/[code] URL로 인코딩해 클립보드에 복사.

import { useState } from "react";
import { encodeShare, type SharePayload } from "@/lib/share";

export default function ShareButton({
  payload,
  label = "결과 공유 링크 복사",
}: {
  payload: SharePayload;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const path = `/s/${encodeShare(payload)}`;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      setCopied(true);
    } catch {
      window.open(path, "_blank");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={share}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {label}
      </button>
      {copied && <span className="text-sm text-indigo-600">복사됐어요! 🔗</span>}
    </div>
  );
}
