import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    // Status válidos: pending, confirmed, completed, cancelled
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }
    
    const db = await openDb();
    
    await db.run(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar agendamento' }, { status: 500 });
  }
}
