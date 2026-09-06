# FinMate

한국에 있는 외국인 유학생을 위한 금융 앱입니다. "목적을 증명하면 한도가 열린다"는 컨셉으로,
학비 납부·해외송금·계좌개설·월세보증금이라는 4가지 실제 지출 상황에서 사용자가 서류(목적)를 증명하면
그만큼 이체 한도가 열리는 흐름을 구현했습니다.

## 무엇이 실제로 동작하는가

- **회원가입/로그인/세션 관리**: Supabase Auth (이메일 + 비밀번호)
- **데이터 저장**: Supabase Postgres — 프로필, 금융여권 등급/한도/체크리스트, 보유 서류 상태가
  전부 DB에 실제로 저장되고 Row Level Security로 사용자별 데이터가 격리됩니다.
- **비즈니스 로직**: 체크리스트 완료 → 등급 상승, 증빙 제출 → 즉시 한도 상향, 거래 완료 → 금융여권
  반영 같은 규칙은 브라우저가 아니라 Next.js API Route(서버)에서 계산·검증됩니다
  (`app/api/**/route.ts`). 클라이언트는 즉각적인 화면 반응을 위해 동일 로직을 낙관적으로
  미리 계산해 보여주고, 서버 응답이 도착하면 그 결과로 다시 맞춥니다.
- **다국어**: 한국어/영어/중국어/베트남어 — `lib/i18n`의 번역 사전을 전 화면이 실시간으로 참조합니다.

**Mock으로 남겨둔 부분**: 고지서/계약서 OCR 판독, 은행 지점·환율·정부기관 연동은 실제 제휴 없이는
구현이 불가능하므로 그럴듯한 지연시간과 결과로 흉내만 냅니다 (`lib/mock/*.ts`).

## 기술 스택

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS (다크 테마 디자인 시스템)
- Supabase (Postgres + Auth), `@supabase/ssr`로 서버/클라이언트 세션 연동
- React Context (`lib/state/AppStateContext.tsx`) — 서버에서 내려준 초기 상태를 들고 있다가
  각 액션이 호출되면 해당 API Route를 호출해 DB에 반영합니다.

## 실행 방법

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 무료 계정을 만들고 새 프로젝트를 생성합니다.
2. 좌측 메뉴 **SQL Editor** → New query에서 이 저장소의 [`supabase/schema.sql`](supabase/schema.sql)
   내용 전체를 붙여넣고 실행합니다. (테이블 3개 + RLS 정책 + 온보딩용 함수가 한 번에 생성됩니다.)
3. **Authentication → Providers → Email**에서 이메일 인증 여부를 정합니다.
   - 데모/개발 중에는 **Confirm email**을 꺼두면 가입 즉시 로그인되어 테스트가 편합니다.
   - 실제 제출용으로는 켜두는 것을 권장합니다 (가입 후 메일함의 링크를 눌러야 로그인 가능).
4. **Project Settings → API**에서 `Project URL`과 `anon public` 키를 복사합니다.

### 2. 환경 변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local`을 열어 위에서 복사한 값을 채워 넣습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 (모바일 너비 화면에 최적화되어 있습니다. 개발자 도구의
기기 툴바로 보는 것을 권장합니다). 처음 접속하면 `/signup`으로 이동해 계정을 만든 뒤
온보딩(언어 선택 → 프로필 입력)을 거쳐 앱을 사용하게 됩니다.

## 화면/API 구성

| 경로 | 설명 |
|---|---|
| `/signup`, `/login` | 이메일/비밀번호 회원가입, 로그인 |
| `/onboarding` | 언어 선택 → 프로필 입력 (최초 1회, 서버에 프로필/금융여권/서류상태 row 생성) |
| `/passport` | 금융여권 — 등급(S1~S4)과 다음 등급까지 남은 체크리스트, 납부 기록 |
| `/home` | 홈 대시보드 — 현재 한도, 4가지 빠른 실행, AI 질문 입력 |
| `/tuition` | 학비 납부: 고지서 업로드 → AI 판독(Mock) → 결과 확인 → 한도 개방 |
| `/remittance` | 해외송금: 정보 입력 → 한도 점검 → (부족 시) 증빙 제출 → 채널 비교 → 전송 추적 |
| `/account` | 계좌 개설: 보유 서류 체크 → 맞춤 안내 → 지점 찾기(Mock) → 창구 제시 카드 |
| `/deposit` | 월세·보증금: 계약서 업로드 → 등기 검증(Mock) → 위험 경고 → 보증금 보호 체크리스트 |
| `/ai` | FinMate AI — 카드형 답변 (질문 키워드 매칭, Mock) |
| `/profile`, `/more` | 내 정보, 더보기 (언어 전환, 로그아웃) |
| `POST /api/onboarding` | 프로필/금융여권(S1)/서류상태 row를 원자적으로 생성 |
| `POST /api/documents` | 보유 서류 상태 갱신 |
| `POST /api/passport/checklist` | 체크리스트 토글 + 등급 상승 판정 (서버 계산) |
| `POST /api/passport/unlock` | 증빙 제출에 따른 한도 즉시 상향 |
| `POST /api/passport/purpose-transaction` | 목적 거래 완료 반영 + 납부 기록 추가 |
| `POST /api/language` | 언어 설정 저장 |

## 데이터베이스 구조

`supabase/schema.sql` 참고. `profiles` / `financial_passports` / `document_flags` 세 테이블이
모두 `user_id`(= `auth.users.id`)를 기본키로 가지며, RLS로 각 사용자는 자기 자신의 행만 조회/수정할
수 있습니다.

## 프로젝트 구조 메모

- `app/(app)/*`: 로그인 + 온보딩 완료가 필요한 화면들 (라우트 그룹). `app/(app)/layout.tsx`가
  서버에서 세션과 DB 상태를 확인해 `AppStateProvider`에 초기값을 내려줍니다.
- `app/onboarding`, `app/login`, `app/signup`: 라우트 그룹 밖에 있어 `AppStateProvider` 없이
  동작합니다 (아직 프로필이 없거나 로그인 전 화면이라서).
- `middleware.ts`: 모든 요청에서 Supabase 세션을 갱신하고, 로그인하지 않은 사용자를 `/login`으로
  돌려보냅니다.
