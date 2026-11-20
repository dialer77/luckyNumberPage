// RSS 피드 — 네이버 서치어드바이저 등 검색엔진이 새 글·새 회차를 빨리 수집하도록 제출한다.
// 최근 회차 당첨번호 + 가이드 글을 최신순으로 내보낸다.

import { GUIDES } from "@/lib/guides";
import { SITE } from "@/lib/brand";
import { getLiveRecent } from "@/lib/lotto-live";
import { formatKRW, afterTax } from "@/lib/lotto-data";
import { drawTime } from "@/lib/lotto-schedule";

export const revalidate = 3600;

const RECENT_ROUNDS_IN_FEED = 10;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

type Item = { title: string; link: string; description: string; date: Date };

export async function GET() {
  const draws = await getLiveRecent(RECENT_ROUNDS_IN_FEED);

  const roundItems: Item[] = draws.map((d) => {
    const prize =
      d.firstWinnerCount > 0
        ? `1등 ${d.firstWinnerCount}명, 1게임당 ${formatKRW(d.firstWinAmount)}(세후 약 ${formatKRW(afterTax(d.firstWinAmount))}).`
        : "1등 당첨자 없음(다음 회차로 이월).";
    return {
      title: `제${d.drwNo}회 로또 당첨번호 (${d.drwNoDate})`,
      link: `${SITE.url}/lotto/${d.drwNo}`,
      description: `당첨번호 ${d.numbers.join(", ")} + 보너스 ${d.bonus}. ${prize}`,
      date: new Date(drawTime(d.drwNo)),
    };
  });

  const guideItems: Item[] = GUIDES.map((g) => ({
    title: g.title,
    link: `${SITE.url}/guide/${g.slug}`,
    description: g.description,
    date: new Date(`${g.updated}T09:00:00+09:00`),
  }));

  const items = [...roundItems, ...guideItems].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  const lastBuild = items[0]?.date ?? new Date();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(SITE.name)}</title>
<link>${SITE.url}</link>
<description>${esc(SITE.description)}</description>
<language>ko</language>
<lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
<atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items
  .map(
    (it) => `<item>
<title>${esc(it.title)}</title>
<link>${it.link}</link>
<guid isPermaLink="true">${it.link}</guid>
<description>${esc(it.description)}</description>
<pubDate>${it.date.toUTCString()}</pubDate>
</item>`
  )
  .join("\n")}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
