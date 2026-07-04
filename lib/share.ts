// 범용 결과 공유 (모든 계산기가 공유).
// 결과를 base64url로 인코딩해 /s/[code] 로 공유 → 그 페이지가 OG 카드를 렌더.
//
// 브라우저(인코딩)·서버(디코딩) 모두에서 동작하도록 atob/btoa + TextEncoder만 사용.

export type SharePayload = {
  e: string; // 이모지
  t: string; // 제목
  v: string; // 큰 값
  s: string; // 부가 설명
};

function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(p: SharePayload): string {
  return b64urlEncode(JSON.stringify([p.e, p.t, p.v, p.s]));
}

export function decodeShare(code: string): SharePayload | null {
  try {
    const a = JSON.parse(b64urlDecode(code));
    if (!Array.isArray(a) || a.length !== 4) return null;
    return { e: String(a[0]), t: String(a[1]), v: String(a[2]), s: String(a[3]) };
  } catch {
    return null;
  }
}
