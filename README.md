# 🔮 만약에 (manyage.com)

> **만약에 ~하면, 얼마?** — 로또·투자·계산으로 '만약에 얼마?'를 재미로 확인하는 곳

**🌐 사이트: [manyage.com](https://manyage.com)**

로또에 당첨되면 세후로 얼마인지, 그때 그 주식을 샀다면 지금 얼마가 됐을지, 세금을 떼면 실수령이 얼마인지 —
공개된 데이터를 바탕으로 다양한 &lsquo;만약에&rsquo;를 계산해 보여주는 정보 서비스입니다.

---

## 구성

우산 브랜드 **만약에** 아래에 세 개의 서브브랜드가 있습니다.

### 🍀 [행운노트](https://manyage.com/lotto) — 로또·복권
- [회차별 당첨번호 조회](https://manyage.com/lotto/list) (회차별 상세 페이지, 세후 실수령액 포함)
- [내 번호 당첨확인](https://manyage.com/lotto/my) — 번호를 저장해두면 최신 회차와 자동 대조
- [번호 출현 통계](https://manyage.com/stats) · [번호 생성기](https://manyage.com/tools/generator)
- [1등 도전 시뮬레이터](https://manyage.com/tools/challenge) — 몇 번 만에 1등이 나올까?
- [오늘의 랭킹](https://manyage.com/ranking) — 서버가 대신 돌려주는 하루 한 번 챌린지

### 📈 [그때샀으면](https://manyage.com/invest) — 투자 시뮬레이션
- 주식·코인·금을 **그때 샀다면 지금 얼마?** (일시불 / 적립식 DCA)
- 코인은 CoinGecko, 미국주식·금은 Twelve Data **실시간 시세** 반영
- [고배당 ETF 배당 계산기](https://manyage.com/invest/dividend) — 배당 재투자(복리), 목표 배당 역산

### 🧮 [머니계산기](https://manyage.com/calc) — 돈 계산 10종
[연봉 실수령액](https://manyage.com/calc/take-home) · [복리](https://manyage.com/calc/compound) ·
[대출 원리금](https://manyage.com/calc/loan) · [적금·예금](https://manyage.com/calc/savings) ·
[물가(인플레이션)](https://manyage.com/calc/inflation) · [평단가·물타기](https://manyage.com/calc/average) ·
[퇴직금](https://manyage.com/calc/severance) · [이직 연봉](https://manyage.com/calc/salary) ·
[내 연봉 상위 몇 %](https://manyage.com/calc/salary-rank) · [당첨금 실수령액](https://manyage.com/calc/prize)

### 📚 [가이드](https://manyage.com/guide)
로또 세금, 복리의 힘, 고배당 ETF, 물가와 돈의 가치 등 알아두면 좋은 이야기.

---

## 기술 스택

- **Next.js 16** (App Router, Turbopack) · **TypeScript** · **Tailwind CSS v4**
- **Vercel** 배포 (서울 리전 `icn1`, ISR)
- **Upstash Redis** — 랭킹·시세 캐시·로또 데이터
- **CoinGecko / Twelve Data** — 코인·주식·금 실시간 시세
- 공유 카드(OG 이미지) 동적 생성 · sitemap/robots · JSON-LD(FAQ·Article) SEO

## 로컬 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

### 환경변수 (선택)

없어도 동작합니다. 없으면 예시 데이터로 폴백해요.

| 변수 | 용도 |
|---|---|
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | 랭킹·캐시 (`KV_REST_API_*` 도 인식) |
| `COINGECKO_API_KEY` | 코인 실시간 시세 (무료 Demo 키) |
| `TWELVEDATA_API_KEY` | 미국주식·금 실시간 시세 (무료 키) |

### 로또 데이터 수집

동행복권 API는 데이터센터 IP를 차단하므로 서버에서 직접 수집할 수 없습니다.
한국 가정용 IP(개인 PC)에서 아래 스크립트를 실행해 Upstash에 적재합니다.

```bash
node --env-file=.env scripts/backfill-lotto.mjs
```

---

## 안내

본 사이트는 공개된 데이터를 정리해 제공하는 정보 서비스입니다.
복권 구매를 알선하거나 당첨을 보장하지 않으며, 투자·수익 계산 결과 또한 참고용으로 실제 수익을 보장하지 않습니다.
