import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: reports, error } = await supabase
    .from('reports')
    .select('*, extracted_values(*)')
    .eq('patient_id', params.id)
    .order('report_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('patient_id', params.id)
    .eq('status', 'pending')
    .order('due_date', { ascending: true });

  const { data: trends } = await supabase.from('trends').select('*').eq('patient_id', params.id);

  return NextResponse.json({ reports, reminders, trends });
}
