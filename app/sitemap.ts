import type { MetadataRoute } from "next";
import { getAllDraws } from "@/lib/lotto-data";

// sitemap.xml 을 코드로 자동 생성 → 검색엔진이 모든 페이지를 빠르게 수집.
// ⚠️ 배포 시 BASE_URL 을 실제 도메인으로 교체하세요.
const BASE_URL = "https://example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/lotto", "/stats", "/tools/generator", "/about"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date("2026-07-03"),
    })
  );

  // 회차별 상세 페이지도 전부 sitemap에 포함
  const drawPages = getAllDraws().map((d) => ({
    url: `${BASE_URL}/lotto/${d.drwNo}`,
    lastModified: new Date(d.drwNoDate),
  }));

  return [...staticPages, ...drawPages];
}
