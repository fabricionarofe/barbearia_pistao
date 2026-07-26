'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
              <div key={appt.id} className="action-item flex-between" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{appt.client_name} - {appt.client_phone}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                      <Calendar size={14} /> {appt.appointment_date.split('-').reverse().join('/')} às {appt.appointment_time}
                      <span style={{ margin: '0 0.5rem' }}>•</span>
                      <Scissors size={14} /> {appt.service_name} ({appt.professional_name})
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', borderRadius: '8px' }} title="Concluir">
                    <Check size={18} />
                  </button>
                  <button style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px' }} title="Cancelar">
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
