import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const MAX_SIZE_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const patientId = formData.get('patientId') as string | null;

  if (!file || !patientId) {
    return NextResponse.json({ error: 'A file and patientId are required' }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'File is too large (max 15MB)' }, { status: 400 });
  }

  // Verify the patient belongs to this user — RLS on this select enforces it.
  const { data: patient } = await supabase
    .from('patients')
    .select('id')
    .eq('id', patientId)
    .single();
  if (!patient) {
    return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
  }

  const service = createServiceClient();
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${user.id}/${patientId}/${crypto.randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await service.storage
    .from('reports')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: report, error: insertError } = await service
    .from('reports')
    .insert({
      patient_id: patientId,
      owner_id: user.id,
      storage_path: path,
      file_type: file.type,
      status: 'processing'
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ report });
}
