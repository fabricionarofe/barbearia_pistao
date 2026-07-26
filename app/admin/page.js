import { Calendar, Users, Scissors, Package, Plus, Clock, Check, X } from 'lucide-react';
import Link from 'next/link';
import { openDb } from '../../lib/db';

import StoreStatusToggle from './components/StoreStatusToggle';

export const metadata = {
  title: 'Dashboard - Admin',
};

// Force dynamic rendering so it always fetches fresh data on load
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const db = await openDb();
  
  // Obter status da loja
  let statusRow = await db.get("SELECT value FROM settings WHERE key = 'store_status'");
  let timeRow = await db.get("SELECT value FROM settings WHERE key = 'return_time'");
  if (!statusRow) {
    let oldStatus = await db.get("SELECT value FROM settings WHERE key = 'is_open'");
    const initialStatus = (oldStatus && oldStatus.value === 'false') ? 'closed' : 'open';
    await db.run("INSERT INTO settings (key, value) VALUES ('store_status', ?)", [initialStatus]);
    statusRow = { value: initialStatus };
  }
  const initialStatus = statusRow.value;
  const initialReturnTime = timeRow ? timeRow.value : '';

  // Get metrics
  const today = new Date().toISOString().split('T')[0];
  const { count: appointmentsToday } = await db.get('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?', [today]) || { count: 0 };
  const { count: clientsCount } = await db.get('SELECT COUNT(*) as count FROM clients') || { count: 0 };
  const { count: professionalsCount } = await db.get('SELECT COUNT(*) as count FROM professionals') || { count: 0 };
  const { count: servicesCount } = await db.get('SELECT COUNT(*) as count FROM services') || { count: 0 };
  
  // Get recent upcoming appointments
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

      <StoreStatusToggle initialStatus={initialStatus} initialReturnTime={initialReturnTime} />

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

      <div className="main-cards-grid">
        <div className="panel-card">
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

        <div className="panel-card">
          <h2 className="panel-header">Ações Rápidas</h2>
          
          <div className="action-list">
            <Link href="/admin/agendamentos" className="action-item">
              <Calendar size={20} />
              Ver Agendamentos
            </Link>
            <Link href="/admin/clientes" className="action-item">
              <Users size={20} />
              Gerenciar Clientes
            </Link>
            <Link href="/admin/profissionais" className="action-item">
              <Scissors size={20} />
              Gerenciar Profissionais
            </Link>
            <Link href="/admin/servicos" className="action-item">
              <Package size={20} />
              Configurar Serviços
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
