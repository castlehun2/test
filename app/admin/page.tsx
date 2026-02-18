import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabaseServerClient, type ResponseRow } from '@/lib/supabase';

type SearchParams = {
  team?: string;
  role?: string;
  level?: string;
  error?: string;
};

function LoginView({ hasError }: { hasError: boolean }) {
  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">관리자 로그인</h2>
      <p className="mt-2 text-sm text-slate-600">ADMIN_PASSWORD로 접근할 수 있습니다.</p>
      <form action="/admin/login" method="post" className="mt-4 space-y-3">
        <input
          type="password"
          name="password"
          className="w-full rounded-md border p-2"
          placeholder="비밀번호"
          required
        />
        {hasError && <p className="text-sm text-red-600">비밀번호가 올바르지 않습니다.</p>}
        <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">
          로그인
        </button>
      </form>
    </section>
  );
}

function statAverage(rows: ResponseRow[]): string {
  if (rows.length === 0) return '0.0';
  return (rows.reduce((sum, r) => sum + r.score_total, 0) / rows.length).toFixed(1);
}

const levels = ['Beginner', 'Intermediate', 'Advanced', 'Strategist', 'Builder'];

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const authenticated = isAdminAuthenticated();
  if (!authenticated) {
    return <LoginView hasError={searchParams.error === '1'} />;
  }

  const supabase = getSupabaseServerClient();
  let query = supabase.from('responses').select('*').order('submitted_at', { ascending: false });

  if (searchParams.team) query = query.eq('team', searchParams.team);
  if (searchParams.role) query = query.eq('role', searchParams.role);
  if (searchParams.level) query = query.eq('level', searchParams.level);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as ResponseRow[];
  const uniqueTeams = Array.from(new Set((rows.map((r) => r.team).filter(Boolean) as string[]))).sort();
  const uniqueRoles = Array.from(new Set((rows.map((r) => r.role).filter(Boolean) as string[]))).sort();

  const distribution = levels.map((level) => ({
    level,
    count: rows.filter((r) => r.level === level).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const queryString = new URLSearchParams(
    Object.entries(searchParams)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => [key, value as string]),
  ).toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold">관리자 대시보드</h2>
        <form action="/admin/logout" method="post">
          <button className="rounded-md border px-3 py-1 text-sm" type="submit">
            로그아웃
          </button>
        </form>
      </div>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <form className="grid gap-3 md:grid-cols-4">
          <select name="team" defaultValue={searchParams.team ?? ''} className="rounded-md border p-2 text-sm">
            <option value="">전체 팀</option>
            {uniqueTeams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
          <select name="role" defaultValue={searchParams.role ?? ''} className="rounded-md border p-2 text-sm">
            <option value="">전체 직무</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select name="level" defaultValue={searchParams.level ?? ''} className="rounded-md border p-2 text-sm">
            <option value="">전체 레벨</option>
            {levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white" type="submit">
            필터 적용
          </button>
        </form>
        <div className="mt-3 flex gap-3">
          <Link className="text-sm text-blue-600 underline" href="/admin">
            필터 초기화
          </Link>
          <a className="text-sm text-blue-600 underline" href={`/admin/export.csv${queryString ? `?${queryString}` : ''}`}>
            CSV 다운로드
          </a>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">응답 수</p>
          <p className="text-2xl font-semibold">{rows.length}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">평균 점수</p>
          <p className="text-2xl font-semibold">{statAverage(rows)}</p>
        </article>
        <article className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">최다 레벨</p>
          <p className="text-2xl font-semibold">
            {[...distribution].sort((a, b) => b.count - a.count)[0]?.level ?? '-'}
          </p>
        </article>
      </section>

      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold">레벨 분포</h3>
        <div className="space-y-2">
          {distribution.map((item) => (
            <div key={item.level} className="flex items-center gap-3 text-sm">
              <span className="w-24">{item.level}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                  aria-label={`${item.level}-${item.count}`}
                />
              </div>
              <span className="w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-x-auto rounded-lg bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold">응답 리스트</h3>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">제출시각</th>
              <th>이름</th>
              <th>팀</th>
              <th>직무</th>
              <th>점수</th>
              <th>레벨</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b">
                <td className="py-2">{new Date(row.submitted_at).toLocaleString('ko-KR')}</td>
                <td>{row.name}</td>
                <td>{row.team ?? '-'}</td>
                <td>{row.role ?? '-'}</td>
                <td>{row.score_total}</td>
                <td>{row.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
