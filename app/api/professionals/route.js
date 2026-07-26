import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const professionals = await db.all('SELECT * FROM professionals WHERE is_active = 1');
    return NextResponse.json(professionals);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar profissionais' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, phone } = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO professionals (name, phone) VALUES (?, ?)',
      [name, phone]
    );
    return NextResponse.json({ id: result.lastID, name, phone, is_active: 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
  }
}
