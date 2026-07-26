'use client';

import { Clock, Save } from 'lucide-react';

export default function ExpedientesPage() {
  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Expedientes</h1>
          <p>Configure os dias e horários de funcionamento</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> Salvar Configurações
        </button>
      </div>

      <div className="panel-card mt-4" style={{ maxWidth: '600px' }}>
        <h2 className="panel-header">Horário Padrão</h2>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Abertura</label>
            <input type="time" defaultValue="09:00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Fechamento</label>
            <input type="time" defaultValue="19:00" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
        </div>

        <h2 className="panel-header">Dias de Funcionamento</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((dia, idx) => (
            <label key={dia} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked={idx !== 0 && idx !== 6} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
              <span>{dia}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
