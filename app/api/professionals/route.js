import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const professionals = await db.all('SELECT * FROM professionals WHERE is_active = 1');
    const profServices = await db.all('SELECT * FROM professional_services');

    const result = professionals.map(prof => {
      const services = profServices
        .filter(ps => ps.professional_id === prof.id)
        .map(ps => ps.service_id);
      return {
        ...prof,
        service_ids: services
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    return NextResponse.json({ error: 'Erro ao buscar profissionais' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    const resProf = await db.run(
      `INSERT INTO professionals (name, phone, commission_rate, bio, specialties, photo_url, instagram_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, phone, Number(commission_rate) || 0, bio, specialties, photo_url, instagram_url]
    );

    const professionalId = resProf.lastID;

    // Inserir serviços vinculados
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await db.run(
          'INSERT INTO professional_services (professional_id, service_id) VALUES (?, ?)',
          [professionalId, serviceId]
        );
      }
    }

    // Inicializar expediente padrão (Segunda a Sábado, 09:00 - 19:00, Almoço 12:00 - 13:00)
    for (let day = 0; day <= 6; day++) {
      const isActive = day === 0 ? 0 : 1; // Domingo inativo por padrão
      await db.run(
        `INSERT INTO professional_schedules (professional_id, day_of_week, is_active, start_time, end_time, has_break, break_start, break_end)
         VALUES (?, ?, ?, '09:00', '19:00', 1, '12:00', '13:00')`,
        [professionalId, day, isActive]
      );
    }

    return NextResponse.json({
      id: professionalId,
      name,
      phone,
      commission_rate,
      bio,
      specialties,
      photo_url,
      instagram_url,
      service_ids,
      is_active: 1
    });
  } catch (error) {
    console.error('Erro ao criar profissional:', error);
    return NextResponse.json({ error: 'Erro ao criar profissional' }, { status: 500 });
  }
}
