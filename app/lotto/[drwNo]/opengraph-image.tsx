import { ImageResponse } from "next/og";
import {
  getAllDraws,
  getDraw,
  afterTax,
  formatKRW,
  whatCanYouBuy,
} from "@/lib/lotto-data";
import { loadKoreanFont } from "@/lib/og";

// ─────────────────────────────────────────────────────────────
// 회차별 공유 카드(Open Graph 이미지).
// 카톡/트위터 등에 /lotto/1180 링크를 붙이면 이 이미지가 미리보기로 뜸.
// → 캡처·공유로 신규 유입을 만드는 "확산 엔진"(§4-②)의 핵심 장치.
//
// 파일명이 opengraph-image 면 Next.js가 자동으로 <meta og:image> 를 넣어줍니다.
// ─────────────────────────────────────────────────────────────

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 어떤 회차의 카드를 미리 만들지 (페이지와 동일하게)
export function generateStaticParams() {
  return getAllDraws().map((d) => ({ drwNo: String(d.drwNo) }));
}

// 번호 구간별 공 색상 (Tailwind 클래스는 여기서 못 쓰므로 hex로)
function ballStyle(n: number) {
  if (n <= 10) return { bg: "#facc15", color: "#422006" };
  if (n <= 20) return { bg: "#3b82f6", color: "#ffffff" };
  if (n <= 30) return { bg: "#ef4444", color: "#ffffff" };
  if (n <= 40) return { bg: "#6b7280", color: "#ffffff" };
  return { bg: "#22c55e", color: "#ffffff" };
}

export default async function Image({
  params,
}: PageProps<"/lotto/[drwNo]">) {
  const { drwNo } = await params;
  const draw = getDraw(Number(drwNo));

  if (!draw) {
    return new ImageResponse(<div style={{ fontSize: 48 }}>Not found</div>, size);
  }

  const net = afterTax(draw.firstWinAmount);
  const top = whatCanYouBuy(net)[0]; // 대표 비교 1개 (서울 아파트)
  const netText = formatKRW(net);

  const title = `제 ${draw.drwNo}회 당첨번호`;
  const subtitle = `세후 ${netText} · ${top.label} ${top.text}`;

  // 이미지에 등장하는 모든 한글을 폰트 subset 요청에 넘김
  const fontText = title + subtitle + "행운노트";

  let fonts;
  try {
    const data = await loadKoreanFont(fontText);
    fonts = [{ name: "Noto Sans KR", data, weight: 700 as const }];
  } catch {
    fonts = undefined; // 폰트 로드 실패해도 숫자는 렌더되도록 (크래시 방지)
  }

  const balls = [...draw.numbers, draw.bonus];

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
          🍀 행운노트
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            color: "#1e293b",
            marginTop: 8,
          }}
        >
          {title}
        </div>

        {/* 번호 공 */}
        <div style={{ display: "flex", gap: 18, marginTop: 40 }}>
          {balls.map((n, i) => {
            const s = ballStyle(n);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 96,
                  height: 96,
                  borderRadius: 96,
                  background: s.bg,
                  color: s.color,
                  fontSize: 44,
                  fontWeight: 700,
                  // 보너스 번호(마지막) 앞에 살짝 간격
                  marginLeft: i === 6 ? 24 : 0,
                }}
              >
                {n}
              </div>
            );
          })}
        </div>

        <div style={{ fontSize: 40, color: "#334155", marginTop: 44 }}>
          {subtitle}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
