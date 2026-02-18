'use client';

import { FormEvent, useMemo, useState } from 'react';
import { calculateScore, recommendedTrack, type SurveyPayload } from '@/lib/scoring';

const q4Options = ['업무 자동화', '보고서 생성', '데이터 분석', '협업 지식관리', '보안/윤리 가이드'];
const q5Options = ['낮음', '보통', '높음'];

const initialForm: SurveyPayload = {
  name: '',
  team: '',
  role: '',
  q1_frequency: '사용안함',
  q2_depth: '단순요약',
  q3_application: '없음',
  q4_system_items: [],
  q5_literacy: '낮음',
  q5_prompt: '낮음',
  q5_validation: '낮음',
  q5_security: '낮음',
};

export default function SurveyPage() {
  const [form, setForm] = useState<SurveyPayload>(initialForm);
  const [submitted, setSubmitted] = useState<{ score: number; level: string; track: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const preview = useMemo(() => calculateScore(form), [form]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const result = calculateScore(form);
      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ...result }),
      });

      if (!res.ok) {
        throw new Error('저장에 실패했습니다. 환경변수를 확인하세요.');
      }

      setSubmitted({ score: result.score_total, level: result.level, track: recommendedTrack(result.level) });
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const toggleQ4 = (value: string) => {
    setForm((prev) => ({
      ...prev,
      q4_system_items: prev.q4_system_items.includes(value)
        ? prev.q4_system_items.filter((item) => item !== value)
        : [...prev.q4_system_items, value],
    }));
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">AI 모닝클럽 사전진단 설문</h2>
        <p className="mt-1 text-sm text-slate-600">사전진단 점수를 기반으로 추천 트랙을 제공합니다.</p>
      </section>

      {submitted && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-lg font-semibold">결과</h3>
          <p className="mt-2">총점: {submitted.score}점</p>
          <p>레벨: {submitted.level}</p>
          <p>추천 트랙: {submitted.track}</p>
        </section>
      )}

      <form onSubmit={onSubmit} className="space-y-6 rounded-lg bg-white p-5 shadow-sm">
        <section className="grid gap-4 md:grid-cols-3">
          <label className="text-sm font-medium">
            이름*
            <input
              required
              className="mt-1 w-full rounded-md border p-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            팀
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={form.team}
              onChange={(e) => setForm({ ...form, team: e.target.value })}
            />
          </label>
          <label className="text-sm font-medium">
            직무
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </label>
        </section>

        <section className="space-y-4">
          <h3 className="font-semibold">Q1~Q3</h3>
          {[
            ['q1_frequency', 'Q1. 생성형 AI 사용 빈도', ['사용안함', '월1-2회', '주1-2회', '주3회+', '거의매일']],
            ['q2_depth', 'Q2. 활용 깊이', ['단순요약', '초안작성', '기획구조', '분석/의사결정', '자동화설계']],
            ['q3_application', 'Q3. 업무 적용 수준', ['없음', '개인참고', '보고서반영', '템플릿보유', '프로세스자동화']],
          ].map(([key, label, options]) => (
            <label key={key} className="block text-sm font-medium">
              {label}
              <select
                className="mt-1 w-full rounded-md border p-2"
                value={form[key as keyof SurveyPayload] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              >
                {(options as string[]).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Q4. 현재 구축한/운영 중인 AI 시스템 항목 (복수 선택)</h3>
          <div className="grid gap-2 md:grid-cols-2">
            {q4Options.map((item) => (
              <label key={item} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.q4_system_items.includes(item)}
                  onChange={() => toggleQ4(item)}
                />
                {item}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Q5. 역량 진단 (각 0/2/5점)</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['q5_literacy', 'AI 리터러시'],
              ['q5_prompt', '프롬프트 구조화'],
              ['q5_validation', '결과 검증'],
              ['q5_security', '윤리/보안 인식'],
            ].map(([key, label]) => (
              <label key={key} className="text-sm font-medium">
                {label}
                <select
                  className="mt-1 w-full rounded-md border p-2"
                  value={form[key as keyof SurveyPayload] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                >
                  {q5Options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </section>

        <div className="rounded-md bg-slate-100 p-3 text-sm">
          현재 예상 점수: <span className="font-semibold">{preview.score_total}점</span> ({preview.level})
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          type="submit"
        >
          {saving ? '저장 중...' : '제출하기'}
        </button>
      </form>
    </div>
  );
}
