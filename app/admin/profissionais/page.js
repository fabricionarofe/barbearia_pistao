'use client';

import { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash } from 'lucide-react';

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/professionals', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProfessionals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Profissionais</h1>
          <p>Gerencie a sua equipe de barbeiros</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Novo Profissional
        </button>
      </div>

      <div className="panel-card mt-4">
        {loading ? (
          <div className="empty-state">
            <p>Carregando profissionais...</p>
          </div>
        ) : professionals.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Scissors size={32} />
            </div>
            <p className="empty-text">Nenhum profissional cadastrado.</p>
          </div>
        ) : (
          <div className="action-list">
            {professionals.map(prof => (
              <div key={prof.id} className="action-item flex-between" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Scissors size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{prof.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      {prof.phone || 'Sem número cadastrado'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{ padding: '0.5rem', color: 'var(--muted)', borderRadius: '8px' }}>
                    <Edit size={18} />
                  </button>
                  <button style={{ padding: '0.5rem', color: '#ef4444', borderRadius: '8px' }}>
                    <Trash size={18} />
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
