import type { MetadataRoute } from "next";
import { getAllDraws } from "@/lib/lotto-data";
import { ASSETS } from "@/lib/invest-data";
import { SITE } from "@/lib/brand";

// sitemap.xml 을 코드로 자동 생성 → 검색엔진이 모든 페이지를 빠르게 수집.
const BASE_URL = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/lotto",
    "/lotto/my",
    "/lotto/list",
    "/stats",
    "/tools/generator",
    "/tools/challenge",
    "/invest",
    "/invest/dividend",
    "/calc",
    "/calc/prize",
    "/calc/compound",
    "/calc/salary",
    "/calc/savings",
    "/about",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date("2026-07-04"),
  }));

  // 회차별 상세 페이지
  const drawPages = getAllDraws().map((d) => ({
    url: `${BASE_URL}/lotto/${d.drwNo}`,
    lastModified: new Date(d.drwNoDate),
  }));

  // 자산별 "그때샀으면" 페이지
  const assetPages = ASSETS.map((a) => ({
    url: `${BASE_URL}/invest/${a.key}`,
    lastModified: new Date("2026-07-04"),
  }));

  return [...staticPages, ...drawPages, ...assetPages];
}
