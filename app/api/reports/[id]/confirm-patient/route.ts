import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { patientId } = await req.json();
  if (!patientId) return NextResponse.json({ error: 'patientId is required' }, { status: 400 });

  // Verify both the report and the target patient belong to this user.
  const { data: report } = await supabase.from('reports').select('id').eq('id', params.id).single();
  if (!report) return NextResponse.json({ error: 'Report not found' }, { status: 404 });

  const { data: patient } = await supabase.from('patients').select('id').eq('id', patientId).single();
  if (!patient) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

  const service = createServiceClient();
  const { error } = await service
    .from('reports')
    .update({ patient_id: patientId, needs_patient_confirmation: false, status: 'done' })
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
