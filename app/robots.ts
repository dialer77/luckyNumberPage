import type { MetadataRoute } from "next";

// robots.txt 를 코드로 생성. 검색 크롤러 전체 허용 + sitemap 위치 안내.
// ⚠️ 배포 시 도메인을 실제 값으로 교체하세요.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://example.com/sitemap.xml",
  };
}
