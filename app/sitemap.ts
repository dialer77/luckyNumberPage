import type { MetadataRoute } from "next";
import { ASSETS } from "@/lib/invest-data";
import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/brand";
import { getLiveLatestNo } from "@/lib/lotto-live";

// sitemap.xml 을 코드로 자동 생성 → 검색엔진이 모든 페이지를 빠르게 수집.
// 하루마다 재생성해 새 회차(cron 갱신분)를 자동으로 색인에 포함.
export const revalidate = 86400;

const BASE_URL = SITE.url;

const ROUND1_UTC = Date.UTC(2002, 11, 7); // 1회차 추첨일 2002-12-07(토)
const WEEK = 7 * 24 * 3600 * 1000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/lotto",
    "/lotto/my",
    "/lotto/list",
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

  // 회차별 상세 페이지 — 1회부터 최신 회차까지 전부 색인.
  // 최신 회차 번호는 Upstash에서, 실패하면 날짜로 추정해 폴백.
  let latestNo: number;
  try {
    latestNo = await getLiveLatestNo();
  } catch {
    latestNo = Math.floor((Date.now() - ROUND1_UTC) / WEEK); // 보수적 추정
  }
  const drawPages = Array.from({ length: latestNo }, (_, i) => {
    const n = i + 1;
    return {
      url: `${BASE_URL}/lotto/${n}`,
      lastModified: new Date(ROUND1_UTC + (n - 1) * WEEK),
    };
  });

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
