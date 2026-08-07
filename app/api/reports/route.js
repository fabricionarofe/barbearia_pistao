import { NextResponse } from 'next/server';
import { openDb } from '../../../lib/db';

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function GET() {
  try {
    const db = await openDb();

    // 1. Tendência diária dos últimos 30 dias (Faturamento e Quantidade)
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateIso = getLocalDateString(d);
      const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      const row = await db.get(
        `SELECT COUNT(*) as count, COALESCE(SUM(s.price), 0) as revenue 
         FROM appointments a 
         LEFT JOIN services s ON a.service_id = s.id 
         WHERE a.appointment_date = ? AND a.status != 'cancelled'`,
        [dateIso]
      );

      dailyTrend.push({
        date: dateIso,
        label: dayLabel,
        count: row ? row.count : 0,
        revenue: row ? row.revenue : 0
      });
    }

    // 2. Horários de Maior Movimento (Pico)
    const hourlyRows = await db.all(
      `SELECT appointment_time, COUNT(*) as count 
       FROM appointments 
       WHERE status != 'cancelled' 
       GROUP BY appointment_time 
       ORDER BY count DESC`
    );

    const popularHours = hourlyRows.map(r => ({
      hour: r.appointment_time,
      count: r.count
    }));

    // 3. Ranking de Serviços Mais Vendidos
    const serviceRows = await db.all(
      `SELECT s.name, COUNT(a.id) as count, COALESCE(SUM(s.price), 0) as revenue
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.status != 'cancelled'
       GROUP BY s.id, s.name
       ORDER BY count DESC`
    );

    const totalServiceCount = serviceRows.reduce((acc, curr) => acc + curr.count, 0);
    const popularServices = serviceRows.map(r => ({
      name: r.name,
      count: r.count,
      revenue: r.revenue,
      percentage: totalServiceCount > 0 ? Math.round((r.count / totalServiceCount) * 100) : 0
    }));

    // 4. Ranking de Profissionais por Desempenho
    const profRows = await db.all(
      `SELECT p.name, p.photo_url, COUNT(a.id) as count, COALESCE(SUM(s.price), 0) as revenue
       FROM appointments a
       JOIN professionals p ON a.professional_id = p.id
       JOIN services s ON a.service_id = s.id
       WHERE a.status != 'cancelled'
       GROUP BY p.id, p.name
       ORDER BY revenue DESC`
    );

    // 5. Comparativo Mensal dos Últimos 6 Meses
    const monthlyComparison = [];
    for (let m = 5; m >= 0; m--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - m);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const monthStr = month.toString().padStart(2, '0');
      const prefix = `${year}-${monthStr}`;

      const row = await db.get(
        `SELECT COUNT(*) as count, COALESCE(SUM(s.price), 0) as revenue 
         FROM appointments a 
         LEFT JOIN services s ON a.service_id = s.id 
         WHERE a.appointment_date LIKE ? AND a.status != 'cancelled'`,
        [`${prefix}%`]
      );

      const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      monthlyComparison.push({
        label: `${MONTH_NAMES_SHORT[month - 1]}/${year.toString().slice(2)}`,
        count: row ? row.count : 0,
        revenue: row ? row.revenue : 0
      });
    }

    return NextResponse.json({
      dailyTrend,
      popularHours,
      popularServices,
      topProfessionals: profRows,
      monthlyComparison
    });
  } catch (error) {
    console.error('Erro ao gerar relatórios:', error);
    return NextResponse.json({ error: 'Erro ao gerar relatórios' }, { status: 500 });
  }
}
