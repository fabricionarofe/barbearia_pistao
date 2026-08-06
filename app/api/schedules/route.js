import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professional_id');

    if (!professionalId) {
      return NextResponse.json({ error: 'professional_id é obrigatório' }, { status: 400 });
    }

    const db = await openDb();
    const rows = await db.all(
      'SELECT * FROM professional_schedules WHERE professional_id = ? ORDER BY day_of_week ASC',
      [professionalId]
    );

    // Mapear dias da semana de 0 a 6 (0 = Domingo, 1 = Segunda... 6 = Sábado)
    const schedulesByDay = {};
    rows.forEach(r => {
      schedulesByDay[r.day_of_week] = r;
    });

    const fullSchedule = [];
    for (let day = 0; day <= 6; day++) {
      if (schedulesByDay[day]) {
        fullSchedule.push(schedulesByDay[day]);
      } else {
        fullSchedule.push({
          professional_id: Number(professionalId),
          day_of_week: day,
          is_active: day === 0 ? 0 : 1,
          start_time: '09:00',
          end_time: '19:00',
          has_break: 1,
          break_start: '12:00',
          break_end: '13:00'
        });
      }
    }

    return NextResponse.json(fullSchedule);
  } catch (error) {
    console.error('Erro ao buscar expediente:', error);
    return NextResponse.json({ error: 'Erro ao buscar expediente' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { professional_id, schedules } = await request.json();
    if (!professional_id || !Array.isArray(schedules)) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    const db = await openDb();

    for (const item of schedules) {
      const {
        day_of_week,
        is_active = 1,
        start_time = '09:00',
        end_time = '19:00',
        has_break = 0,
        break_start = '12:00',
        break_end = '13:00'
      } = item;

      // Verificar se já existe
      const existing = await db.get(
        'SELECT id FROM professional_schedules WHERE professional_id = ? AND day_of_week = ?',
        [professional_id, day_of_week]
      );

      if (existing) {
        await db.run(
          `UPDATE professional_schedules 
           SET is_active = ?, start_time = ?, end_time = ?, has_break = ?, break_start = ?, break_end = ? 
           WHERE id = ?`,
          [is_active ? 1 : 0, start_time, end_time, has_break ? 1 : 0, break_start, break_end, existing.id]
        );
      } else {
        await db.run(
          `INSERT INTO professional_schedules (professional_id, day_of_week, is_active, start_time, end_time, has_break, break_start, break_end)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [professional_id, day_of_week, is_active ? 1 : 0, start_time, end_time, has_break ? 1 : 0, break_start, break_end]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar expediente:', error);
    return NextResponse.json({ error: 'Erro ao salvar expediente' }, { status: 500 });
  }
}
