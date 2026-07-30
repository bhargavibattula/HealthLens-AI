import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const userId = user?.id || '00000000-0000-0000-0000-000000000000';

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ patients: data });
}

export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const body = await req.json();
  const name = (body.name || '').trim();
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  let ownerId = user?.id;

  if (!ownerId) {
    // Check if demo user exists in auth users or create one via service client
    const { data: usersData } = await supabase.auth.admin.listUsers();
    if (usersData?.users && usersData.users.length > 0) {
      ownerId = usersData.users[0].id;
    } else {
      const { data: newUser } = await supabase.auth.admin.createUser({
        email: 'demo@carecompanion.ai',
        password: 'Password123!',
        email_confirm: true
      });
      ownerId = newUser?.user?.id;
    }
  }

  if (!ownerId) {
    return NextResponse.json({ error: 'Could not resolve user ID for patient' }, { status: 500 });
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({ owner_id: ownerId, name, relation: body.relation || null })
    .select()
    .single();

  if (error) {
    console.error('API /api/patients POST error details:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: error.message || error }, { status: 500 });
  }

  return NextResponse.json({ patient: data });
}
