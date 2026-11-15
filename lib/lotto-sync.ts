// 로또 데이터 동기화 — 공개 데이터셋 smok95/lotto(GitHub) → Upstash.
//
// smok95는 토요일 추첨(20:35) 직후 세 번 갱신된다(2026-11 관측).
//   ① 20:40경 당첨번호만(당첨금 칸이 비어 있음)
//   ② 20:47경 등수별 당첨금·당첨자 수
//   ③ 21:00경 자동/수동 구분·당첨 판매점
// raw.githubusercontent.com 의 브랜치 주소(main)는 CDN이 5분 동안 캐시하고 쿼리로도
// 우회되지 않는다. 그래서 git refs로 main의 최신 커밋 SHA를 받아 SHA 고정 주소로 읽는다
// (SHA 주소는 내용이 안 바뀌니 캐시돼도 항상 그 시점 최신).
//
// 저장 규칙
//   · 당첨금까지 나온 회차만 lotto:{n} 에 저장한다 → 기존 페이지에 0원이 뜨지 않는다.
//   · 번호만 나온 상태는 lotto:pending 에 따로 둬서 실시간 카드에서만 보여 준다.
//
// ⚠️ 서버 전용.

import { revalidatePath } from "next/cache";
import { redis as defaultRedis } from "./redis";
import type { LottoDraw } from "./lotto-data";
import { expectedLatestNo } from "./lotto-schedule";

const REPO = "smok95/lotto";
const SYNC_LOCK_SEC = 20; // 방문자가 몰려도 smok95 확인은 20초에 한 번만

type Smok = {
  draw_no: number;
  numbers: number[];
  bonus_no: number;
  date: string;
  divisions?: { prize?: number; winners?: number }[];
};

/** 번호만 발표되고 당첨금은 아직인 회차 */
export type PendingDraw = Pick<
  LottoDraw,
  "drwNo" | "drwNoDate" | "numbers" | "bonus"
>;

export type SyncResult = {
  ok: boolean;
  latestNo: number; // 당첨금까지 저장된 최신 회차
  added: number[]; // 이번에 새로 저장한 회차
  pending: PendingDraw | null;
  error?: string;
};

type RedisClient = NonNullable<typeof defaultRedis>;
// 테스트에서 가짜 저장소·과거 커밋·시각을 넣을 수 있게 열어 둔 옵션(실서비스는 기본값).
type SyncOptions = { client?: RedisClient | null; ref?: string; now?: number };

const num = (x?: number) => (typeof x === "number" ? x : 0);

// 1등이 없는 이월 회차도 있으니 2등 금액까지 본다(2등은 매 회차 나온다).
function prizesReady(r: Smok): boolean {
  const d = r.divisions ?? [];
  return num(d[0]?.prize) > 0 || num(d[1]?.prize) > 0;
}

// smok95 형식 → 사이트 LottoDraw 형식
export function toDraw(r: Smok): LottoDraw {
  const d = r.divisions ?? [];
  return {
    drwNo: r.draw_no,
    drwNoDate: String(r.date).slice(0, 10), // YYYY-MM-DD
    numbers: r.numbers as LottoDraw["numbers"],
    bonus: r.bonus_no,
    firstWinAmount: num(d[0]?.prize),
    firstWinnerCount: num(d[0]?.winners),
    prize2: num(d[1]?.prize),
    prize3: num(d[2]?.prize),
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// git 스마트 HTTP의 refs 목록(수백 바이트)에서 main 브랜치 커밋 SHA를 읽는다.
// GitHub API와 달리 시간당 60회 제한이 없다. 실패하면 null → main 주소로 폴백.
async function latestCommitSha(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://github.com/${REPO}.git/info/refs?service=git-upload-pack`,
      {
        cache: "no-store",
        headers: { "User-Agent": "git/2 manyage-lotto-sync" },
        signal: AbortSignal.timeout(4000),
      }
    );
    if (!res.ok) return null;
    const m = (await res.text()).match(/([0-9a-f]{40}) refs\/heads\/main/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** smok95 최신 상태를 읽어 Upstash에 반영한다. */
export async function syncLotto(opts: SyncOptions = {}): Promise<SyncResult> {
  const redis = opts.client === undefined ? defaultRedis : opts.client;
  if (!redis) {
    return { ok: false, latestNo: 0, added: [], pending: null, error: "no redis" };
  }

  const storedRaw = await redis.get<number>("lotto:latestNo");
  let complete =
    typeof storedRaw === "number" ? storedRaw : Number(storedRaw) || 0;

  const sha = opts.ref ?? (await latestCommitSha());
  const base = `https://raw.githubusercontent.com/${REPO}/${sha ?? "main"}/results`;
  const latest = await fetchJson<Smok>(`${base}/latest.json`);
  if (!latest?.draw_no) {
    return {
      ok: false,
      latestNo: complete,
      added: [],
      pending: null,
      error: "latest fetch failed",
    };
  }
  const newest = latest.draw_no;
  const added: number[] = [];

  // 사이에 빠진 회차가 있으면(보통 없음) 순서대로 채우고, 못 채우면 거기서 멈춘다.
  // 추적을 잃었으면(complete=0) 최신 회차 하나만 확실히 채운다.
  if (complete > 0) {
    for (let n = complete + 1; n < newest; n++) {
      const r = await fetchJson<Smok>(`${base}/${n}.json`);
      if (!r?.draw_no || !prizesReady(r)) break;
      await redis.set(`lotto:${n}`, toDraw(r)); // 과거 회차는 안 변하므로 영구 저장
      added.push(n);
      complete = n;
    }
  }

  let pending: PendingDraw | null = null;
  if (newest > complete) {
    if (prizesReady(latest)) {
      if (complete === 0 || complete === newest - 1) {
        await redis.set(`lotto:${newest}`, toDraw(latest));
        added.push(newest);
        complete = newest;
      }
    } else {
      // 번호만 나온 상태 — 당첨금이 나오면 다음 동기화 때 정식 저장된다.
      pending = {
        drwNo: newest,
        drwNoDate: String(latest.date).slice(0, 10),
        numbers: latest.numbers as LottoDraw["numbers"],
        bonus: latest.bonus_no,
      };
      await redis.set("lotto:pending", pending, { ex: 3 * 24 * 3600 });
    }
  }

  if (added.length > 0) await redis.set("lotto:latestNo", complete); // 만료 없이 영구
  if (complete >= newest) await redis.del("lotto:pending");

  return { ok: true, latestNo: complete, added, pending };
}

/**
 * 방문 시 호출용: 다음 회차가 나왔어야 할 시각이 지났는데 아직 저장되지 않았을 때만
 * 동기화한다. 20초 잠금으로 동시에 몰린 요청은 한 번만 smok95를 확인한다.
 */
export async function syncIfDue(opts: SyncOptions = {}): Promise<SyncResult> {
  const redis = opts.client === undefined ? defaultRedis : opts.client;
  if (!redis) {
    return { ok: false, latestNo: 0, added: [], pending: null, error: "no redis" };
  }
  const storedRaw = await redis.get<number>("lotto:latestNo");
  const stored =
    typeof storedRaw === "number" ? storedRaw : Number(storedRaw) || 0;
  if (stored >= expectedLatestNo(opts.now)) {
    return { ok: true, latestNo: stored, added: [], pending: null };
  }

  const locked = await redis.set("lotto:sync:lock", 1, {
    nx: true,
    ex: SYNC_LOCK_SEC,
  });
  if (locked !== "OK") {
    // 방금 다른 요청이 확인함 → 저장된 상태만 돌려준다.
    const pending = await redis.get<PendingDraw>("lotto:pending");
    return {
      ok: true,
      latestNo: stored,
      added: [],
      pending: pending && pending.drwNo > stored ? pending : null,
    };
  }
  return syncLotto({ ...opts, client: redis });
}

/**
 * 새 회차가 저장되면 최신 회차를 보여 주는 페이지 캐시를 비운다.
 * (Route Handler에서 부르면 다음 방문 때 새로 만들어진다.)
 */
export function revalidateLottoPages(added: number[]) {
  if (added.length === 0) return;
  for (const p of [
    "/",
    "/lotto",
    "/lotto/list",
    "/lotto/my",
    "/lotto/trends",
    "/stats",
    "/tools/challenge",
    "/sitemap.xml",
  ]) {
    revalidatePath(p);
  }
  for (const n of added) {
    revalidatePath(`/lotto/${n}`); // 미리 방문돼 404로 캐시됐을 수 있음
    revalidatePath(`/lotto/${n - 1}`); // '다음 회차' 링크 갱신
  }
}
