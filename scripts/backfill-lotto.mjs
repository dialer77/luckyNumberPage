// 로또 전 회차 백필 스크립트 — 한국 IP(개인 PC)에서 실행.
//
// 동행복권이 해외/데이터센터 IP를 차단하므로 Vercel 서버에선 못 긁습니다.
// 대신 이 스크립트를 "내 컴퓨터(한국)"에서 실행해 전 회차를 Upstash에 저장하면,
// 사이트는 Upstash만 읽으므로 어디서든 실데이터가 보입니다.
//
// 실행:
//   1) 프로젝트 폴더에 .env 파일 생성 후 아래 두 값 입력
//        UPSTASH_REDIS_REST_URL=...
//        UPSTASH_REDIS_REST_TOKEN=...
//      (Vercel → Settings → Environment Variables 에서 복사.
//       KV_REST_API_URL / KV_REST_API_TOKEN 이름이어도 자동 인식)
//   2) node --env-file=.env scripts/backfill-lotto.mjs
//
// 매주 토요일 이후 다시 실행하면 새 회차만 추가됩니다(기존 것은 건너뜀).

import { Redis } from "@upstash/redis";

const url =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

if (!url || !token) {
  console.error(
    "❌ Upstash 환경변수가 없습니다. .env 에 UPSTASH_REDIS_REST_URL / _TOKEN 를 넣고\n" +
      "   node --env-file=.env scripts/backfill-lotto.mjs 로 실행하세요."
  );
  process.exit(1);
}

const redis = new Redis({ url, token });
const API =
  "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=";

function estimatePrizes(first) {
  return { prize2: Math.max(0, Math.round(first * 0.025)), prize3: 1_500_000 };
}

async function fetchDraw(n) {
  try {
    const res = await fetch(API + n, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    const j = await res.json();
    if (j.returnValue !== "success") return null;
    const firstWinAmount = Number(j.firstWinamnt) || 0;
    const { prize2, prize3 } = estimatePrizes(firstWinAmount);
    return {
      drwNo: Number(j.drwNo),
      drwNoDate: String(j.drwNoDate),
      numbers: [j.drwtNo1, j.drwtNo2, j.drwtNo3, j.drwtNo4, j.drwtNo5, j.drwtNo6].map(Number),
      bonus: Number(j.bnusNo),
      firstWinAmount,
      firstWinnerCount: Number(j.firstPrzwnerCo) || 0,
      prize2,
      prize3,
    };
  } catch (e) {
    return null;
  }
}

// 최신 회차 추정 후 실제 존재 확인
const ROUND1 = Date.UTC(2002, 11, 7);
const WEEK = 7 * 24 * 3600 * 1000;
let latest = Math.floor((Date.now() - ROUND1) / WEEK) + 1;
while (latest > 0 && !(await fetchDraw(latest))) latest--;
console.log(`최신 회차: ${latest}`);

let saved = 0;
let skipped = 0;
for (let n = latest; n >= 1; n--) {
  if (await redis.get(`lotto:${n}`)) {
    skipped++;
    continue;
  }
  const d = await fetchDraw(n);
  if (d) {
    await redis.set(`lotto:${n}`, d);
    saved++;
    if (saved % 50 === 0) console.log(`  저장 ${saved}건...`);
  }
  await new Promise((r) => setTimeout(r, 120)); // 동행복권 서버 배려
}

console.log(`✅ 완료. 새로 저장 ${saved}건, 기존 ${skipped}건. 최신 ${latest}회`);
