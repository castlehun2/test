export const q1Scores: Record<string, number> = {
  '사용안함': 0,
  '월1-2회': 2,
  '주1-2회': 5,
  '주3회+': 8,
  '거의매일': 10,
};

export const q2Scores: Record<string, number> = {
  '단순요약': 5,
  '초안작성': 10,
  '기획구조': 15,
  '분석/의사결정': 18,
  '자동화설계': 20,
};

export const q3Scores: Record<string, number> = {
  '없음': 0,
  '개인참고': 8,
  '보고서반영': 15,
  '템플릿보유': 20,
  '프로세스자동화': 25,
};

export const q5Scores: Record<string, number> = {
  '낮음': 0,
  '보통': 2,
  '높음': 5,
};

export type SurveyPayload = {
  name: string;
  team?: string;
  role?: string;
  q1_frequency: string;
  q2_depth: string;
  q3_application: string;
  q4_system_items: string[];
  q5_literacy: string;
  q5_prompt: string;
  q5_validation: string;
  q5_security: string;
};

export function getLevel(score: number): string {
  if (score <= 30) return 'Beginner';
  if (score <= 55) return 'Intermediate';
  if (score <= 75) return 'Advanced';
  if (score <= 90) return 'Strategist';
  return 'Builder';
}

export function calculateScore(payload: SurveyPayload): { score_total: number; level: string } {
  const q1 = q1Scores[payload.q1_frequency] ?? 0;
  const q2 = q2Scores[payload.q2_depth] ?? 0;
  const q3 = q3Scores[payload.q3_application] ?? 0;
  const q4 = Math.min((payload.q4_system_items?.length ?? 0) * 5, 25);
  const q5 =
    (q5Scores[payload.q5_literacy] ?? 0) +
    (q5Scores[payload.q5_prompt] ?? 0) +
    (q5Scores[payload.q5_validation] ?? 0) +
    (q5Scores[payload.q5_security] ?? 0);

  const score_total = q1 + q2 + q3 + q4 + q5;
  return { score_total, level: getLevel(score_total) };
}

export function recommendedTrack(level: string): string {
  switch (level) {
    case 'Beginner':
      return 'Track A: AI 기초 활용 루틴 만들기';
    case 'Intermediate':
      return 'Track B: 업무 문서/보고서 생산성 고도화';
    case 'Advanced':
      return 'Track C: 분석·의사결정 워크플로우 설계';
    case 'Strategist':
      return 'Track D: 팀 적용 전략 & 거버넌스';
    default:
      return 'Track E: 자동화 빌더 과정';
  }
}
