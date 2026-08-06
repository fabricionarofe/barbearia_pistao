import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET() {
  try {
    const db = await openDb();
    const now = new Date();

    // 1. Métricas do Mês Atual
    const monthStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;

    const monthApps = await db.all(
      `SELECT a.*, s.price as service_price, s.name as service_name, p.name as prof_name
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN professionals p ON a.professional_id = p.id
       WHERE a.appointment_date LIKE ? AND a.status != 'cancelled'`,
      [`${monthStr}%`]
    );

    const monthlyCount = monthApps.length;
    let monthlyRevenue = 0;
    const profCounts = {};
    const serviceCounts = {};

    monthApps.forEach(a => {
      monthlyRevenue += a.service_price || 0;
      if (a.prof_name) profCounts[a.prof_name] = (profCounts[a.prof_name] || 0) + 1;
      if (a.service_name) serviceCounts[a.service_name] = (serviceCounts[a.service_name] || 0) + 1;
    });

    let topProf = { name: 'Nenhum', count: 0 };
    Object.entries(profCounts).forEach(([name, count]) => {
      if (count > topProf.count) topProf = { name, count };
    });

    let topServ = { name: 'Nenhum', count: 0 };
    Object.entries(serviceCounts).forEach(([name, count]) => {
      if (count > topServ.count) topServ = { name, count };
    });

    // 2. Tendência dos Últimos 30 Dias (Line Chart)
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateIso = d.toISOString().split('T')[0];
      const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      const countRow = await db.get(
        `SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ? AND status != 'cancelled'`,
        [dateIso]
      );

      dailyTrend.push({
        dateIso,
        label: dayLabel,
        count: countRow ? countRow.count : 0
      });
    }

    // 3. Horários Mais Populares (Bar Chart)
    const allApps = await db.all(
      `SELECT appointment_time FROM appointments WHERE status != 'cancelled'`
    );

    const hourCountsMap = {};
    allApps.forEach(a => {
      if (a.appointment_time) {
        const h = a.appointment_time.substring(0, 5);
        hourCountsMap[h] = (hourCountsMap[h] || 0) + 1;
      }
    });

    const defaultHours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];
    const popularHours = defaultHours.map(h => ({
      hour: h,
      count: hourCountsMap[h] || 0
    }));

    return NextResponse.json({
      monthlyCount,
      monthlyRevenue,
      topProf,
      topServ,
      dailyTrend,
      popularHours
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatórios' }, { status: 500 });
  }
}
