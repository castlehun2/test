import { NextResponse } from 'next/server';
import { calculateScore, type SurveyPayload } from '@/lib/scoring';
import { getSupabaseServerClient } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SurveyPayload & { score_total?: number; level?: string };

    if (!body.name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const calculated = calculateScore(body);
    const score_total = body.score_total ?? calculated.score_total;
    const level = body.level ?? calculated.level;

    const supabase = getSupabaseServerClient();
    const { error } = await supabase.from('responses').insert({
      name: body.name,
      team: body.team || null,
      role: body.role || null,
      q1_frequency: body.q1_frequency,
      q2_depth: body.q2_depth,
      q3_application: body.q3_application,
      q4_system_items: body.q4_system_items,
      q5_literacy: body.q5_literacy,
      q5_prompt: body.q5_prompt,
      q5_validation: body.q5_validation,
      q5_security: body.q5_security,
      score_total,
      level,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, score_total, level });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'unexpected error' },
      { status: 500 },
    );
  }
}
