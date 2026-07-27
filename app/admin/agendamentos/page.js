'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Check, X, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = () => {
    fetch('/api/appointments', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
      } else {
        alert('Erro ao atualizar agendamento.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#eab308', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>Pendente</span>;
      case 'confirmed':
        return <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>Confirmado</span>;
      case 'completed':
        return <span style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>Concluído</span>;
      case 'cancelled':
        return <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 'bold' }}>Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Agendamentos</h1>
          <p>Gerencie todos os horários marcados</p>
        </div>
      </div>

      <div className="panel-card mt-4">
        {loading ? (
          <div className="empty-state">
            <p>Carregando agendamentos...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={32} />
            </div>
            <p className="empty-text">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="action-list">
            {appointments.map(appt => (
              <div key={appt.id} className="action-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {appt.client_name} - {appt.client_phone} {getStatusBadge(appt.status)}
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <Calendar size={14} /> {appt.appointment_date.split('-').reverse().join('/')} às {appt.appointment_time}
                      <span style={{ margin: '0 0.5rem' }}>•</span>
                      <Scissors size={14} /> {appt.service_name} ({appt.professional_name})
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {appt.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'confirmed')} style={{ padding: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }} title="Confirmar Agendamento">
                      <CheckCircle size={16} /> Confirmar
                    </button>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'completed')} style={{ padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 'bold' }} title="Marcar como Concluído">
                      <Check size={16} /> Concluir
                    </button>
                  )}
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'cancelled')} style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }} title="Cancelar Agendamento">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
