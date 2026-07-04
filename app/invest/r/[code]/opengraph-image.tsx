import { ImageResponse } from "next/og";
import { decodeInvestShare, getAsset } from "@/lib/invest-data";
import { formatKRW } from "@/lib/lotto-data";
import { loadKoreanFont } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: PageProps<"/invest/r/[code]">) {
  const { code } = await params;
  const s = decodeInvestShare(code);
  if (!s) {
    return new ImageResponse(<div style={{ fontSize: 48 }}>Not found</div>, size);
  }
  const asset = getAsset(s.assetKey)!;
  const profit = s.nowValue - s.amount;
  const gain = profit >= 0;

  const headline = `그때 ${asset.name} 샀으면`;
  const valueLine = formatKRW(s.nowValue);
  const subLine = `${s.year}년 ${formatKRW(s.amount)} · 순손익 ${formatKRW(profit)}`;
  const fontText = headline + valueLine + subLine + "만약에 그때샀으면";

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
          📈 만약에 · 그때샀으면
        </div>
        <div style={{ fontSize: 60, fontWeight: 700, color: "#1e293b", marginTop: 10 }}>
          {`${asset.emoji} ${headline}`}
        </div>
        <div
          style={{
            fontSize: 86,
            fontWeight: 700,
            color: gain ? "#4f46e5" : "#f43f5e",
            marginTop: 20,
          }}
        >
          {valueLine}
        </div>
        <div style={{ fontSize: 34, color: "#334155", marginTop: 24 }}>
          {subLine}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
