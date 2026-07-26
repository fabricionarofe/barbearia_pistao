'use client';
import { useState, useEffect } from 'react';

export default function StoreStatusToggle({ initialStatus, initialReturnTime }) {
  const [status, setStatus] = useState(initialStatus || 'open');
  const [returnTime, setReturnTime] = useState(initialReturnTime || '');
  
  const [tempStatus, setTempStatus] = useState(null);
  const [tempReturnTime, setTempReturnTime] = useState('');
  
  const [loading, setLoading] = useState(false);

  const updateStatus = async (newStatus, newReturnTime = null) => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_status: newStatus, return_time: newReturnTime })
      });
      
      if (res.ok) {
        setStatus(newStatus);
        setReturnTime(newReturnTime);
        setTempStatus(null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status', error);
      alert('Erro ao alterar status');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (newStatus) => {
    if (newStatus === 'open' || newStatus === 'closed') {
      updateStatus(newStatus, null);
    } else {
      // Abre o modal/input de hora
      setTempStatus(newStatus);
      
      // Sugere uma hora à frente (ex: +1 hora) se estiver vazio
      if (!returnTime && !tempReturnTime) {
        const d = new Date();
        d.setHours(d.getHours() + 1);
        d.setMinutes(0);
        setTempReturnTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
      } else {
        setTempReturnTime(returnTime || tempReturnTime);
      }
    }
  };

  const confirmTempStatus = () => {
    if (!tempReturnTime) {
      alert("Por favor, informe a hora de retorno.");
      return;
    }
    updateStatus(tempStatus, tempReturnTime);
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'open': return { text: 'A barbearia está ABERTA para agendamentos.', color: 'text-green-500' };
      case 'closed': return { text: 'A barbearia está FECHADA no momento.', color: 'text-red-500' };
      case 'lunch_break': return { text: `Em pausa para o almoço. Retorno programado para as ${returnTime}.`, color: 'text-yellow-600' };
      case 'emergency': return { text: `Imprevisto. Retorno programado para as ${returnTime}.`, color: 'text-orange-500' };
      default: return { text: '', color: '' };
    }
  };

  const info = getStatusInfo();

  return (
    <div className="panel-card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>Status da Barbearia</h2>
          <p style={{ fontWeight: '500' }} className={info.color}>
            {info.text}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={() => handleStatusClick('open')} 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', border: '1px solid #22c55e', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: status === 'open' && !tempStatus ? '#22c55e' : 'transparent',
              color: status === 'open' && !tempStatus ? 'white' : '#22c55e'
            }}
          >
            Abrir
          </button>
          
          <button 
            onClick={() => handleStatusClick('closed')} 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', border: '1px solid #ef4444', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: status === 'closed' && !tempStatus ? '#ef4444' : 'transparent',
              color: status === 'closed' && !tempStatus ? 'white' : '#ef4444'
            }}
          >
            Fechar
          </button>
          
          <button 
            onClick={() => handleStatusClick('lunch_break')} 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', border: '1px solid #eab308', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: (status === 'lunch_break' && !tempStatus) || tempStatus === 'lunch_break' ? '#eab308' : 'transparent',
              color: (status === 'lunch_break' && !tempStatus) || tempStatus === 'lunch_break' ? 'white' : '#eab308'
            }}
          >
            Pausa Almoço
          </button>
          
          <button 
            onClick={() => handleStatusClick('emergency')} 
            disabled={loading}
            style={{
              padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', border: '1px solid #f97316', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: (status === 'emergency' && !tempStatus) || tempStatus === 'emergency' ? '#f97316' : 'transparent',
              color: (status === 'emergency' && !tempStatus) || tempStatus === 'emergency' ? 'white' : '#f97316'
            }}
          >
            Imprevisto
          </button>
        </div>
      </div>
      
      {tempStatus && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--muted)' }}>
              Que horas a barbearia voltará a funcionar?
            </label>
            <input 
              type="time" 
              value={tempReturnTime}
              onChange={(e) => setTempReturnTime(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--card-bg)', color: 'white', width: '100%', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
             <button 
              onClick={() => setTempStatus(null)} 
              disabled={loading}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'transparent', border: '1px solid var(--card-border)', color: 'white', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              onClick={confirmTempStatus} 
              disabled={loading}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'black', fontWeight: '600', border: 'none', cursor: 'pointer' }}
            >
              {loading ? 'Salvando...' : 'Confirmar Retorno'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
