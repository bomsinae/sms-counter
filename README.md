# SMS Counter

Cloudflare Workers와 Durable Objects를 사용한 사번별 카운터 서비스입니다.

## 기능

- 사번(`sabun`)별로 독립적인 카운트 관리
- 30분마다 자동으로 카운트 리셋
- 수동 카운트 리셋 기능
- 영구 저장소를 통한 데이터 영속성

## API

### GET /get_count?sabun={사번}

사번의 현재 카운트를 조회하고 +1 증가시킵니다.

**요청 예시:**
```bash
curl "https://your-worker.workers.dev/get_count?sabun=1234"
```

**응답 예시:**
```json
{
  "sabun": "1234",
  "count": 5,
  "lastResetTime": "2025-11-20T07:30:00.000Z"
}
```

### PATCH /reset_count?sabun={사번}

사번의 카운트를 수동으로 0으로 리셋합니다.

**요청 예시:**
```bash
curl -X PATCH "https://your-worker.workers.dev/reset_count?sabun=1234"
```

**응답 예시:**
```json
{
  "sabun": "1234",
  "message": "Count reset to 0"
}
```

## 자동 리셋

각 사번의 카운트는 마지막 리셋 시간으로부터 **30분**이 경과하면 자동으로 0으로 초기화됩니다.

## 개발

### 필수 요구사항

- Node.js
- npm
- Cloudflare 계정

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버는 `http://localhost:8787`에서 실행됩니다.

### 배포

```bash
npm run deploy
```

### 타입 생성

```bash
npm run cf-typegen
```

## 기술 스택

- **Cloudflare Workers**: 서버리스 엣지 컴퓨팅
- **Durable Objects**: 영구 저장소 및 상태 관리
- **TypeScript**: 타입 안전성
- **Wrangler**: Cloudflare Workers CLI 도구

## 구조

- `src/index.ts`: Worker 및 Durable Object 구현
- `wrangler.jsonc`: Cloudflare Workers 설정
- `tsconfig.json`: TypeScript 설정
