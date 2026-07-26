'use client';

import { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash, X } from 'lucide-react';

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProfessionals = () => {
    fetch('/api/professionals', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setProfessionals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const openModal = (prof = null) => {
    if (prof) {
      setEditingProf(prof);
      setFormData({ name: prof.name, phone: prof.phone || '' });
    } else {
      setEditingProf(null);
      setFormData({ name: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProf(null);
    setFormData({ name: '', phone: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const method = editingProf ? 'PUT' : 'POST';
    const url = editingProf ? `/api/professionals/${editingProf.id}` : '/api/professionals';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        fetchProfessionals();
        closeModal();
      } else {
        alert('Erro ao salvar profissional.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este profissional?')) return;
    
    try {
      const res = await fetch(`/api/professionals/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfessionals();
      } else {
        alert('Erro ao remover profissional.');
      }
    } catch (err) {
      alert('Erro de conexão.');
    }
  };

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Profissionais</h1>
          <p>Gerencie a sua equipe de barbeiros</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <div key={prof.id} className="action-item" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => openModal(prof)} style={{ padding: '0.5rem', color: 'var(--muted)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <Edit size={18} />
                  </button>
                  <button onClick={() => handleDelete(prof.id)} style={{ padding: '0.5rem', color: '#ef4444', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
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
              <h2>{editingProf ? 'Editar Profissional' : 'Novo Profissional'}</h2>
              <button onClick={closeModal} style={{ color: 'var(--muted)' }}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome Completo *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>WhatsApp</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white' }}
                  />
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
