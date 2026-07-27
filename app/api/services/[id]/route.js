import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { name, description, price, duration_minutes } = await request.json();
    const db = await openDb();
    
    await db.run(
      'UPDATE services SET name = ?, description = ?, price = ?, duration_minutes = ? WHERE id = ?',
      [name, description, price, duration_minutes, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar serviço' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await openDb();
    
    // Soft delete
    await db.run('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao remover serviço' }, { status: 500 });
  }
}
