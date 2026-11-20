// IndexNow — 새 회차·새 글 URL을 빙 등 IndexNow 참여 검색엔진에 바로 알린다.
//
// 키는 비밀이 아니다. 검색엔진이 https://manyage.com/<키>.txt 를 읽어 사이트 소유를
// 확인하는 공개 값이라 public/ 에 같은 이름의 파일이 있어야 한다.
// 프로덕션 배포(VERCEL_ENV=production)에서만 보낸다.
//
// ⚠️ 서버 전용.

import { SITE } from "./brand";

export const INDEXNOW_KEY = "381b3ecdb40ff9b063e0095a4552929f";

/** paths 예: ["/lotto/1251", "/lotto/list"] */
export async function notifyIndexNow(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  if (process.env.VERCEL_ENV !== "production") return;
  const host = new URL(SITE.url).host;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE.url}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${SITE.url}${p}`),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // 알림 실패는 사이트 동작과 무관 — 다음 회차 때 다시 보낸다.
  }
}
