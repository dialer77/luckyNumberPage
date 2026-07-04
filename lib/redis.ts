import { Redis } from "@upstash/redis";

// Upstash Redis 클라이언트.
// 환경변수가 있을 때만 연결됩니다. 없으면 null → 랭킹 기능이 "준비 중"으로 표시.
// (덕분에 DB 없이도 사이트는 정상 빌드·배포됩니다.)
//
// Vercel 통합 방식에 따라 변수 이름이 두 가지라서 둘 다 인식하게 함:
//   · Upstash 네이티브 통합: UPSTASH_REDIS_REST_URL / _TOKEN
//   · Vercel KV(구) 통합:    KV_REST_API_URL / _TOKEN
//
// ⚠️ 이 파일은 서버 전용입니다. 클라이언트 컴포넌트에서 import 하지 마세요.
const url =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;
