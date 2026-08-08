import { Calendar, Users, Scissors, Package, Clock, DollarSign, BarChart2, QrCode } from 'lucide-react';
import Link from 'next/link';
import { openDb } from '../../lib/db';

import DashboardChartsAndShare from './components/DashboardChartsAndShare';

export const metadata = {
  title: 'Dashboard - Admin',
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await openDb();
  const now = new Date();

  // Quantidades básicas
  const today = new Date().toISOString().split('T')[0];
  const { count: appointmentsToday } = await db.get('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]) || { count: 0 };
  const { count: clientsCount } = await db.get('SELECT COUNT(*) as count FROM clients') || { count: 0 };
  const { count: professionalsCount } = await db.get('SELECT COUNT(*) as count FROM professionals WHERE is_active = 1') || { count: 0 };
  const { count: servicesCount } = await db.get('SELECT COUNT(*) as count FROM services WHERE is_active = 1') || { count: 0 };

  // Agendamentos do Mês Atual para os Relatórios do Dashboard
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

  // Tendência dos últimos 30 dias
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

  // Horários mais populares
  const allApps = await db.all(`SELECT appointment_time FROM appointments WHERE status != 'cancelled'`);
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

  // Agendamentos futuros recentes
  const upcomingAppointments = await db.all(`
    SELECT a.*, c.name as client_name, c.phone as client_phone, p.name as professional_name, s.name as service_name
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN professionals p ON a.professional_id = p.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date >= ?
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    LIMIT 5
  `, [today]);

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da sua barbearia</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-info">
            <h3>Agendamentos Hoje</h3>
            <p>{appointmentsToday}</p>
          </div>
          <div className="summary-icon">
            <Calendar size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <h3>Clientes Ativos</h3>
            <p>{clientsCount}</p>
          </div>
          <div className="summary-icon">
            <Users size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <h3>Profissionais</h3>
            <p>{professionalsCount}</p>
          </div>
          <div className="summary-icon">
            <Scissors size={24} />
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <h3>Serviços</h3>
            <p>{servicesCount}</p>
          </div>
          <div className="summary-icon">
            <Package size={24} />
          </div>
        </div>
      </div>

      {/* Atalhos Rápidos Grid (Igual ao Vídeo) */}
      <div className="panel-card mt-4">
        <h2 className="panel-header">Atalhos</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
          <Link href="/admin/agendamentos" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <Calendar size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Agenda</span>
          </Link>

          <Link href="/admin/clientes" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <Users size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Clientes</span>
          </Link>

          <Link href="/admin/profissionais" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <Scissors size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Equipe</span>
          </Link>

          <Link href="/admin/servicos" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <Package size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Serviços</span>
          </Link>

          <Link href="/admin/expedientes" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <Clock size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Horários</span>
          </Link>

          <Link href="/admin/financeiro" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <DollarSign size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Financeiro</span>
          </Link>

          <Link href="/admin/relatorios" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <BarChart2 size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>Relatórios</span>
          </Link>

          <Link href="/admin/qr-code" style={{ textDecoration: 'none', backgroundColor: '#1a1a1a', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'white' }}>
            <div style={{ padding: '0.6rem', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.1)', color: 'var(--primary)' }}>
              <QrCode size={20} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>QR Code</span>
          </Link>
        </div>
      </div>

      {/* Botão de WhatsApp e Seção de Gráficos Analíticos na página principal */}
      <DashboardChartsAndShare
        monthlyCount={monthlyCount}
        monthlyRevenue={monthlyRevenue}
        topProf={topProf}
        topServ={topServ}
        dailyTrend={dailyTrend}
        popularHours={popularHours}
      />

      {/* Próximos Agendamentos */}
      <div className="panel-card mt-4">
        <h2 className="panel-header">Próximos Agendamentos</h2>

        {upcomingAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={32} />
            </div>
            <p className="empty-text">Nenhum agendamento futuro</p>
            <Link href="/admin/agendamentos" className="btn-primary" style={{ display: 'inline-block' }}>Ver Todos</Link>
          </div>
        ) : (
          <div className="action-list">
            {upcomingAppointments.map(appt => (
              <div key={appt.id} className="action-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{appt.client_name} - {appt.client_phone}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                      <Calendar size={14} /> {appt.appointment_date.split('-').reverse().join('/')} às {appt.appointment_time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <Link href="/admin/agendamentos" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '500' }}>Ver todos os agendamentos →</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
