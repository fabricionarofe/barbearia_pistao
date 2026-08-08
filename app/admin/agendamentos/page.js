'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Check, X, CheckCircle, AlertCircle, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleWhatsAppClick = (appt) => {
    let phone = appt.client_phone.replace(/\D/g, '');
    
    if (phone.length <= 9) {
      phone = '61' + phone;
    }
    
    if (phone && !phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    const formattedDate = appt.appointment_date.split('-').reverse().join('/');
    const message = `Seu agendamento está confirmado para o dia ${formattedDate} às ${appt.appointment_time}, aguardamos você!`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

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
              <div key={appt.id} className="appointment-card">
                <div className="appointment-info">
                  <div className="appointment-icon">
                    <Clock size={20} />
                  </div>
                  <div className="appointment-details">
                    <h3>
                      {appt.client_name} - {appt.client_phone} {getStatusBadge(appt.status)}
                    </h3>
                    <p>
                      <Calendar size={14} /> {appt.appointment_date.split('-').reverse().join('/')} às {appt.appointment_time}
                      <span className="dot-separator">•</span>
                      <Scissors size={14} /> {appt.service_name} ({appt.professional_name})
                    </p>
                  </div>
                </div>
                <div className="appointment-actions">
                  <button onClick={() => handleWhatsAppClick(appt)} className="btn-action" title="Enviar WhatsApp" style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}>
                    <MessageCircle size={16} /> <span className="action-text">WhatsApp</span>
                  </button>
                  {appt.status === 'pending' && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'confirmed')} className="btn-action btn-confirm" title="Confirmar Agendamento">
                      <CheckCircle size={16} /> Confirmar
                    </button>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'completed')} className="btn-action btn-complete" title="Marcar como Concluído">
                      <Check size={16} /> Concluir
                    </button>
                  )}
                  {(appt.status === 'pending' || appt.status === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus(appt.id, 'cancelled')} className="btn-action btn-cancel" title="Cancelar Agendamento">
                      <X size={18} /> <span className="cancel-text">Cancelar</span>
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
