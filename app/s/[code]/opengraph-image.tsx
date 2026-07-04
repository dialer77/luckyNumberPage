import { ImageResponse } from "next/og";
import { decodeShare } from "@/lib/share";
import { loadKoreanFont } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: PageProps<"/s/[code]">) {
  const { code } = await params;
  const p = decodeShare(code);
  if (!p) {
    return new ImageResponse(<div style={{ fontSize: 48 }}>Not found</div>, size);
  }

  const fontText = p.e + p.t + p.v + p.s + "만약에";

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
          {`🔮 만약에 · ${p.t}`}
        </div>
        <div style={{ fontSize: 96, marginTop: 20 }}>{p.e}</div>
        <div
          style={{
            fontSize: 86,
            fontWeight: 700,
            color: "#4f46e5",
            marginTop: 10,
          }}
        >
          {p.v}
        </div>
        <div style={{ fontSize: 34, color: "#334155", marginTop: 20 }}>{p.s}</div>
      </div>
    ),
    { ...size, fonts }
  );
}
