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

    // Buscar agendamentos do mês que não estejam cancelados com dados de cliente, serviço e profissional
    const appointments = await db.all(
      `SELECT a.*, 
              s.price as service_price, s.name as service_name, 
              p.name as prof_name, p.photo_url as prof_photo, p.commission_rate,
              c.name as client_name, c.phone as client_phone
       FROM appointments a
       LEFT JOIN services s ON a.service_id = s.id
       LEFT JOIN professionals p ON a.professional_id = p.id
       LEFT JOIN clients c ON a.client_id = c.id
       WHERE a.appointment_date LIKE ? AND a.status != 'cancelled'
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [`${datePrefix}%`]
    );

    let totalRevenue = 0;
    let totalCommissions = 0;
    const profSummaryMap = {};

    const formattedTransactions = appointments.map(app => {
      const price = app.service_price || 0;
      const rate = app.commission_rate !== null && app.commission_rate !== undefined ? app.commission_rate : 50;
      const commission = price * (rate / 100);
      const houseNet = price - commission;

      totalRevenue += price;
      totalCommissions += commission;

      const profId = app.professional_id || 0;
      const profName = app.prof_name || 'Desconhecido';
      const profPhoto = app.prof_photo || '';

      if (!profSummaryMap[profId]) {
        profSummaryMap[profId] = {
          prof_id: profId,
          prof_name: profName,
          prof_photo: profPhoto,
          commission_rate: rate,
          count: 0,
          total_revenue: 0,
          total_commission: 0,
          house_net: 0
        };
      }

      profSummaryMap[profId].count += 1;
      profSummaryMap[profId].total_revenue += price;
      profSummaryMap[profId].total_commission += commission;
      profSummaryMap[profId].house_net += houseNet;

      return {
        id: app.id,
        date: app.appointment_date,
        time: app.appointment_time,
        clientName: app.client_name || 'Cliente',
        clientPhone: app.client_phone || '',
        profName,
        serviceName: app.service_name || 'Serviço',
        price,
        commissionRate: rate,
        commissionValue: commission,
        houseNet,
        status: app.status || 'completed'
      };
    });

    const appointmentCount = appointments.length;
    const averageTicket = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;
    const netProfit = totalRevenue - totalCommissions;
    const profSummaries = Object.values(profSummaryMap).sort((a, b) => b.total_revenue - a.total_revenue);

    return NextResponse.json({
      month,
      year,
      totalRevenue,
      totalCommissions,
      netProfit,
      appointmentCount,
      averageTicket,
      profSummaries,
      transactions: formattedTransactions
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 });
  }
}
