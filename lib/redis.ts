import { Redis } from "@upstash/redis";

// Upstash Redis 클라이언트.
// 환경변수(UPSTASH_REDIS_REST_URL / _TOKEN)가 있을 때만 연결됩니다.
// 아직 DB를 연결하지 않았으면 null → 랭킹 기능이 "준비 중"으로 표시됩니다.
// (덕분에 DB 없이도 사이트는 정상 빌드·배포됩니다.)
//
// ⚠️ 이 파일은 서버 전용입니다. 클라이언트 컴포넌트에서 import 하지 마세요.
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;
