import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();
    const month = parseInt(searchParams.get('month') || (now.getMonth() + 1), 10);
    const year = parseInt(searchParams.get('year') || now.getFullYear(), 10);

    const db = await openDb();

    // Formatar prefixo de data "YYYY-MM"
    const monthStr = month.toString().padStart(2, '0');
    const datePrefix = `${year}-${monthStr}`;

    // Buscar agendamentos do mês que não estejam cancelados
    const appointments = await db.all(
      `SELECT a.*, s.price as service_price, s.name as service_name, p.name as prof_name, p.commission_rate
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN professionals p ON a.professional_id = p.id
       WHERE a.appointment_date LIKE ? AND a.status != 'cancelled'`,
      [`${datePrefix}%`]
    );

    let totalRevenue = 0;
    let totalCommissions = 0;
    const profSummaryMap = {};

    appointments.forEach(app => {
      const price = app.service_price || 0;
      const rate = app.commission_rate !== null && app.commission_rate !== undefined ? app.commission_rate : 50;
      const commission = price * (rate / 100);

      totalRevenue += price;
      totalCommissions += commission;

      const profId = app.professional_id || 0;
      const profName = app.prof_name || 'Desconhecido';

      if (!profSummaryMap[profId]) {
        profSummaryMap[profId] = {
          prof_id: profId,
          prof_name: profName,
          commission_rate: rate,
          count: 0,
          total_revenue: 0,
          total_commission: 0
        };
      }

      profSummaryMap[profId].count += 1;
      profSummaryMap[profId].total_revenue += price;
      profSummaryMap[profId].total_commission += commission;
    });

    const appointmentCount = appointments.length;
    const averageTicket = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;
    const profSummaries = Object.values(profSummaryMap);

    return NextResponse.json({
      month,
      year,
      totalRevenue,
      appointmentCount,
      averageTicket,
      totalCommissions,
      profSummaries
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 });
  }
}
