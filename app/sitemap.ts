import type { MetadataRoute } from "next";
import { getAllDraws } from "@/lib/lotto-data";
import { SITE } from "@/lib/brand";

// sitemap.xml 을 코드로 자동 생성 → 검색엔진이 모든 페이지를 빠르게 수집.
const BASE_URL = SITE.url;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/lotto",
    "/stats",
    "/tools/generator",
    "/tools/challenge",
    "/invest",
    "/calc",
    "/about",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date("2026-07-04"),
  }));

  // 회차별 상세 페이지도 전부 sitemap에 포함
  const drawPages = getAllDraws().map((d) => ({
    url: `${BASE_URL}/lotto/${d.drwNo}`,
    lastModified: new Date(d.drwNoDate),
  }));

  return [...staticPages, ...drawPages];
}
