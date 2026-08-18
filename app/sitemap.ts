import type { MetadataRoute } from "next";
import { ASSETS } from "@/lib/invest-data";
import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/brand";
import { getLiveLatestNo } from "@/lib/lotto-live";

// sitemap.xml 을 코드로 자동 생성 → 검색엔진이 핵심 페이지를 빠르게 수집.
// 하루마다 재생성해 새 회차(cron 갱신분)를 자동으로 색인에 포함.
export const revalidate = 86400;

const BASE_URL = SITE.url;

const ROUND1_UTC = Date.UTC(2002, 11, 7); // 1회차 추첨일 2002-12-07(토)
const WEEK = 7 * 24 * 3600 * 1000;

// 회차 상세는 "최근 N회"만 sitemap에 노출한다.
// 이유(2026-08 서치콘솔): 전 1232회를 올렸더니 신생 도메인의 적은 크롤링
// 예산 탓에 1,249개가 "발견됨-색인 안 됨"으로 보류 → 사이트 품질 신호가
// 깎임. 최근 회차에 크롤링을 집중시키고, 권위가 쌓이면 범위를 넓힌다.
// (과거 회차 페이지는 그대로 살아있어 검색·직접 접속·회차검색으로 접근 가능)
const RECENT_DRAWS_IN_SITEMAP = 120; // 약 2년치

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/lotto",
    "/lotto/my",
    "/lotto/list",
    "/lotto/trends",
    "/stats",
    "/ranking",
    "/tools/generator",
    "/tools/challenge",
    "/invest",
    "/invest/dividend",
    "/calc",
    "/calc/prize",
    "/calc/compound",
    "/calc/salary",
    "/calc/take-home",
    "/calc/savings",
    "/calc/inflation",
    "/calc/loan",
    "/calc/average",
    "/calc/severance",
    "/calc/salary-rank",
    "/guide",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date("2026-07-17"),
  }));

  // 회차별 상세 페이지 — 최근 N회만 sitemap에 노출(크롤링 예산 집중).
  // 최신 회차 번호는 Upstash에서, 실패하면 날짜로 추정해 폴백.
  let latestNo: number;
  try {
    latestNo = await getLiveLatestNo();
  } catch {
    latestNo = Math.floor((Date.now() - ROUND1_UTC) / WEEK); // 보수적 추정
  }
  const firstDraw = Math.max(1, latestNo - RECENT_DRAWS_IN_SITEMAP + 1);
  const drawPages = Array.from(
    { length: latestNo - firstDraw + 1 },
    (_, i) => {
      const n = firstDraw + i;
      return {
        url: `${BASE_URL}/lotto/${n}`,
        lastModified: new Date(ROUND1_UTC + (n - 1) * WEEK),
      };
    }
  );

  // 자산별 "그때샀으면" 페이지
  const assetPages = ASSETS.map((a) => ({
    url: `${BASE_URL}/invest/${a.key}`,
    lastModified: new Date("2026-07-17"),
  }));

  // 가이드 글
  const guidePages = GUIDES.map((g) => ({
    url: `${BASE_URL}/guide/${g.slug}`,
    lastModified: new Date(g.updated),
  }));

  return [...staticPages, ...drawPages, ...assetPages, ...guidePages];
}
