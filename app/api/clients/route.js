import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const clients = await db.all('SELECT * FROM clients ORDER BY created_at DESC');
    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, phone, email } = await request.json();
    const db = await openDb();
    const result = await db.run(
      'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
      [name, phone, email]
    );
    return NextResponse.json({ id: result.lastID, name, phone, email });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}
