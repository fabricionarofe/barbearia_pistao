import { NextResponse } from 'next/server';
import { openDb } from '../../../../lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      phone = '',
      commission_rate = 50,
      bio = '',
      specialties = '',
      photo_url = '',
      instagram_url = '',
      service_ids = []
    } = body;

    const db = await openDb();

    await db.run(
      `UPDATE professionals 
       SET name = ?, phone = ?, commission_rate = ?, bio = ?, specialties = ?, photo_url = ?, instagram_url = ? 
       WHERE id = ?`,
      [name, phone, Number(commission_rate) || 0, bio, specialties, photo_url, instagram_url, id]
    );

    // Atualizar vínculo de serviços
    await db.run('DELETE FROM professional_services WHERE professional_id = ?', [id]);
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await db.run(
          'INSERT INTO professional_services (professional_id, service_id) VALUES (?, ?)',
          [id, serviceId]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    return NextResponse.json({ error: 'Erro ao atualizar profissional' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await openDb();

    // Soft delete para preservar histórico de agendamentos
    await db.run('UPDATE professionals SET is_active = 0 WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover profissional:', error);
    return NextResponse.json({ error: 'Erro ao remover profissional' }, { status: 500 });
  }
}
