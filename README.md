# AI 모닝클럽 사전진단 웹앱

Next.js 14(App Router) + TypeScript + Tailwind + Supabase 기반 사전진단 설문/관리자 대시보드입니다.

## 1) 설치 및 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000/survey` 접속.

## 2) 환경변수

`.env.local` 예시:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD=change-me
```

- `ADMIN_PASSWORD`: `/admin` 접근 비밀번호
- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용됩니다.

## 3) Supabase SQL (테이블 생성)

```sql
create extension if not exists pgcrypto;

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team text,
  role text,
  submitted_at timestamptz default now(),
  q1_frequency text,
  q2_depth text,
  q3_application text,
  q4_system_items text[],
  q5_literacy text,
  q5_prompt text,
  q5_validation text,
  q5_security text,
  score_total int,
  level text
);
```

## 4) 화면

- `/survey`
  - 섹션형 점수화 설문
  - 프론트에서 실시간 점수/레벨 계산
  - 제출 시 결과(총점/레벨/추천트랙) 표시
  - 서버 저장 시에도 동일 점수/레벨 저장
- `/admin`
  - 간단한 비밀번호 로그인(`ADMIN_PASSWORD`)
  - 응답 리스트
  - 팀/직무/레벨 필터
  - 평균점수 카드
  - 레벨 분포 bar chart
  - 현재 필터 기준 CSV export

## 5) 점수/레벨 로직

`score_total = Q1+Q2+Q3+min(Q4count*5,25)+(Q5 4항목 합)`

- 레벨
  - 0-30 Beginner
  - 31-55 Intermediate
  - 56-75 Advanced
  - 76-90 Strategist
  - 91-100 Builder
