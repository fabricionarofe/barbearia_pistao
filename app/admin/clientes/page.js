'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Plus } from 'lucide-react';

export default function ClientesPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/clients', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setClients(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Clientes</h1>
          <p>Gerencie a sua base de clientes</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Novo Cliente
        </button>
      </div>

      <div className="panel-card mt-4">
        {loading ? (
          <div className="empty-state">
            <p>Carregando clientes...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={32} />
            </div>
            <p className="empty-text">Nenhum cliente cadastrado ainda.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--muted)' }}>Nome</th>
                  <th style={{ padding: '1rem', color: 'var(--muted)' }}>WhatsApp</th>
                  <th style={{ padding: '1rem', color: 'var(--muted)' }}>E-mail</th>
                  <th style={{ padding: '1rem', color: 'var(--muted)' }}>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{client.name}</td>
                    <td style={{ padding: '1rem' }}>{client.phone}</td>
                    <td style={{ padding: '1rem', color: 'var(--muted)' }}>{client.email || '-'}</td>
                    <td style={{ padding: '1rem', color: 'var(--muted)' }}>{new Date(client.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
