import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getSupabaseServerClient, type ResponseRow } from '@/lib/supabase';

function escapeCsv(value: unknown): string {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export async function GET(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const team = searchParams.get('team');
  const role = searchParams.get('role');
  const level = searchParams.get('level');

  const supabase = getSupabaseServerClient();
  let query = supabase.from('responses').select('*').order('submitted_at', { ascending: false });

  if (team) query = query.eq('team', team);
  if (role) query = query.eq('role', role);
  if (level) query = query.eq('level', level);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data ?? []) as ResponseRow[];
  const headers = [
    'id',
    'name',
    'team',
    'role',
    'submitted_at',
    'q1_frequency',
    'q2_depth',
    'q3_application',
    'q4_system_items',
    'q5_literacy',
    'q5_prompt',
    'q5_validation',
    'q5_security',
    'score_total',
    'level',
  ];

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.name,
        row.team,
        row.role,
        row.submitted_at,
        row.q1_frequency,
        row.q2_depth,
        row.q3_application,
        row.q4_system_items.join('|'),
        row.q5_literacy,
        row.q5_prompt,
        row.q5_validation,
        row.q5_security,
        row.score_total,
        row.level,
      ]
        .map(escapeCsv)
        .join(','),
    ),
  ].join('\n');

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="responses.csv"',
    },
  });
}
