'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash } from 'lucide-react';

export default function ServicosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = () => {
    fetch('/api/services', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setServices(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Serviços</h1>
          <p>Configure os serviços oferecidos na barbearia</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Novo Serviço
        </button>
      </div>

      <div className="panel-card mt-4">
        {loading ? (
          <div className="empty-state">
            <p>Carregando serviços...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={32} />
            </div>
            <p className="empty-text">Nenhum serviço cadastrado.</p>
          </div>
        ) : (
          <div className="action-list">
            {services.map(service => (
              <div key={service.id} className="action-item flex-between" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ padding: '0.5rem', backgroundColor: 'rgba(255,215,0,0.1)', borderRadius: '8px', color: 'var(--primary)' }}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600' }}>{service.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      R$ {service.price.toFixed(2)} • {service.duration_minutes} minutos
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
