import { ImageResponse } from "next/og";
import { loadKoreanFont } from "@/lib/og";

// 사이트 기본 공유 카드 (홈 등 개별 카드가 없는 페이지 공유 시 사용)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const title = "행운노트";
  const subtitle = "로또 당첨번호 조회 · 통계 · 번호 생성기";
  const fontText = title + subtitle;

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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
          color: "#ffffff",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ fontSize: 90, fontWeight: 700 }}>{`🍀 ${title}`}</div>
        <div style={{ fontSize: 40, marginTop: 20, opacity: 0.9 }}>
          {subtitle}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
