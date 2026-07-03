import { ImageResponse } from "next/og";
import { decodeRun, rankName, formatBuyDuration } from "@/lib/challenge";
import { formatKRW } from "@/lib/lotto-data";
import { loadKoreanFont } from "@/lib/og";

// 도전 결과 공유 카드. 요청 시점에 생성(무한한 code라 미리 생성 불가).
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: PageProps<"/challenge-result/[code]">) {
  const { code } = await params;
  const r = decodeRun(code);

  if (!r) {
    return new ImageResponse(<div style={{ fontSize: 48 }}>Not found</div>, size);
  }

  const net = r.winnings - r.spent;
  const netPositive = net >= 0;
  const headline =
    r.mode === "until1"
      ? `${r.tries.toLocaleString()}번 만에 1등!`
      : `${r.tries.toLocaleString()}번 도전`;
  const duration = `주 5천원씩 ${formatBuyDuration(r.tries)}`;
  const netLine = `순이익 ${formatKRW(net)}`;
  const rankLine = `최고 ${rankName(r.bestRank)}`;
  const moneyLine = `구매 ${formatKRW(r.spent)} · 당첨 ${formatKRW(r.winnings)}`;

  const fontText =
    headline + duration + netLine + rankLine + moneyLine + "행운노트 도전결과";

  let fonts;
  try {
    const data = await loadKoreanFont(fontText);
    fonts = [{ name: "Noto Sans KR", data, weight: 700 as const }];
  } catch {
    fonts = undefined;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "70px",
          background: "linear-gradient(135deg, #eef2ff 0%, #ffffff 60%)",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ fontSize: 34, color: "#6366f1", fontWeight: 700 }}>
          🎯 행운노트 · 1등 도전 결과
        </div>
        <div
          style={{
            fontSize: 66,
            fontWeight: 700,
            color: "#1e293b",
            marginTop: 10,
          }}
        >
          {headline}
        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#ffffff",
              borderRadius: 20,
              padding: "24px 32px",
            }}
          >
            <div style={{ fontSize: 26, color: "#94a3b8" }}>{rankLine}</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: netPositive ? "#4f46e5" : "#f43f5e",
              color: "#ffffff",
              borderRadius: 20,
              padding: "24px 32px",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 700 }}>{netLine}</div>
          </div>
        </div>

        <div style={{ fontSize: 30, color: "#64748b", marginTop: 28 }}>
          {moneyLine}
        </div>
        <div style={{ fontSize: 34, color: "#334155", marginTop: 12 }}>
          {`🗓️ ${duration}`}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
