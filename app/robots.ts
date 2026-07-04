import type { MetadataRoute } from "next";
import { SITE } from "@/lib/brand";

// robots.txt 를 코드로 생성. 검색 크롤러 전체 허용 + sitemap 위치 안내.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
