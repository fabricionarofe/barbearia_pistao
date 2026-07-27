import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, phone } = await request.json();
    const db = await openDb();
    
    await db.run(
      'UPDATE professionals SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar profissional' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await openDb();
    
    // Usamos soft delete para não quebrar agendamentos passados
    await db.run('UPDATE professionals SET is_active = 0 WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover profissional' }, { status: 500 });
  }
}
