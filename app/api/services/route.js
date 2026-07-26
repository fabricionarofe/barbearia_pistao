import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const services = await db.all('SELECT * FROM services WHERE is_active = 1');
    return NextResponse.json(services);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, description, price, duration_minutes } = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO services (name, description, price, duration_minutes) VALUES (?, ?, ?, ?)',
      [name, description, price, duration_minutes]
    );
    return NextResponse.json({ id: result.lastID, name, description, price, duration_minutes, is_active: 1 });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar serviço' }, { status: 500 });
  }
}
