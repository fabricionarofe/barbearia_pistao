'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash, X } from 'lucide-react';

export default function ServicosPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration_minutes: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({ 
        name: service.name, 
        description: service.description || '', 
        price: service.price, 
        duration_minutes: service.duration_minutes 
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration_minutes: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration_minutes: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const method = editingService ? 'PUT' : 'POST';
    const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes, 10)
        })
      });
      
      if (res.ok) {
        fetchServices();
        closeModal();
      } else {
        alert('Erro ao salvar serviço.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchServices();
      } else {
        alert('Erro ao remover serviço.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Serviços</h1>
          <p>Configure os serviços oferecidos na barbearia</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <div key={service.id} className="action-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => openModal(service)} style={{ padding: '0.5rem', color: 'var(--muted)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(service.id)} style={{ padding: '0.5rem', color: '#ef4444', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingService ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button onClick={closeModal} style={{ color: 'var(--muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome do Serviço *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Descrição</label>
                  <input 
                    type="text" 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Preço (R$) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Duração (min) *</label>
                    <input 
                      type="number" 
                      value={formData.duration_minutes}
                      onChange={e => setFormData({...formData, duration_minutes: e.target.value})}
                      required
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', color: 'white' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.5rem 1.5rem', border: 'none' }}>
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
