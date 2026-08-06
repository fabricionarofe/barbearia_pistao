'use client';

import { useState, useEffect } from 'react';
import { Scissors, Plus, Edit, Trash, X, Upload, CheckSquare, Square, User, Globe } from 'lucide-react';

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProf, setEditingProf] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    commission_rate: 50,
    bio: '',
    specialties: '',
    photo_url: '',
    instagram_url: '',
    service_ids: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resProfs, resServs] = await Promise.all([
        fetch('/api/professionals', { headers: { 'ngrok-skip-browser-warning': 'true' } }),
        fetch('/api/services', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      ]);

      const profsData = await resProfs.json();
      const servsData = await resServs.json();

      if (Array.isArray(profsData)) setProfessionals(profsData);
      if (Array.isArray(servsData)) setServices(servsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (prof = null) => {
    if (prof) {
      setEditingProf(prof);
      setFormData({
        name: prof.name || '',
        phone: prof.phone || '',
        commission_rate: prof.commission_rate !== undefined ? prof.commission_rate : 50,
        bio: prof.bio || '',
        specialties: prof.specialties || '',
        photo_url: prof.photo_url || '',
        instagram_url: prof.instagram_url || '',
        service_ids: prof.service_ids || []
      });
    } else {
      setEditingProf(null);
      setFormData({
        name: '',
        phone: '',
        commission_rate: 50,
        bio: '',
        specialties: '',
        photo_url: '',
        instagram_url: '',
        service_ids: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProf(null);
  };

  const toggleService = (serviceId) => {
    setFormData(prev => {
      const current = prev.service_ids || [];
      if (current.includes(serviceId)) {
        return { ...prev, service_ids: current.filter(id => id !== serviceId) };
      } else {
        return { ...prev, service_ids: [...current, serviceId] };
      }
    });
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
        fetchData();
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
        fetchData();
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
          <p>Gerencie sua equipe de barbeiros, comissões e especialidades</p>
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
              <div key={prof.id} className="action-item" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {prof.photo_url ? (
                      <img src={prof.photo_url} alt={prof.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <User size={28} style={{ color: 'var(--primary)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', margin: 0 }}>{prof.name}</h3>
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                        {prof.commission_rate}% Comissão
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                      {prof.phone || 'Sem WhatsApp'} {prof.specialties ? `• ${prof.specialties}` : ''}
                    </p>
                    {prof.service_ids && prof.service_ids.length > 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '2px' }}>
                        Atende: {services.filter(s => prof.service_ids.includes(s.id)).map(s => s.name).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openModal(prof)} style={{ padding: '0.6rem 0.8rem', color: 'var(--foreground)', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Edit size={16} /> Editar
                  </button>
                  <button onClick={() => handleDelete(prof.id)} style={{ padding: '0.6rem 0.8rem', color: '#ef4444', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Trash size={16} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="modal-content" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121212', borderRadius: '16px', border: '1px solid var(--card-border)', padding: '1.5rem' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{editingProf ? 'Editar Profissional' : 'Novo Profissional'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Foto do Profissional */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Foto do Profissional</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '12px', backgroundColor: '#1e1e1e', border: '1px dashed var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {formData.photo_url ? (
                      <img src={formData.photo_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Upload size={24} style={{ color: 'var(--muted)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      type="url"
                      placeholder="URL da imagem (ex: https://...)"
                      value={formData.photo_url}
                      onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                      style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do profissional"
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* Telefone */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
              </div>

              {/* Taxa de Comissão */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', fontWeight: '600' }}>Taxa de Comissão (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commission_rate}
                  onChange={e => setFormData({ ...formData, commission_rate: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Percentual que o profissional recebe por serviço realizado
                </span>
              </div>

              {/* Biografia */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', fontWeight: '600' }}>Biografia (perfil público)</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Conte um pouco sobre a experiência do profissional"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', resize: 'vertical' }}
                />
              </div>

              {/* Especialidades */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', fontWeight: '600' }}>Especialidades</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={e => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Corte degradê, Barba, Pigmentação"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Separe por vírgulas
                </span>
              </div>

              {/* Serviços que atende */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Serviços que atende</label>
                <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#1a1a1a', borderRadius: '8px', padding: '0.75rem', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {services.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Nenhum serviço cadastrado ainda.</span>
                  ) : (
                    services.map(s => {
                      const isSelected = (formData.service_ids || []).includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleService(s.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.6rem', borderRadius: '6px', cursor: 'pointer', backgroundColor: isSelected ? 'rgba(234, 179, 8, 0.1)' : 'transparent' }}
                        >
                          {isSelected ? (
                            <CheckSquare size={18} style={{ color: 'var(--primary)' }} />
                          ) : (
                            <Square size={18} style={{ color: 'var(--muted)' }} />
                          )}
                          <span style={{ fontSize: '0.9rem', flex: 1, color: isSelected ? 'white' : 'var(--muted)' }}>
                            {s.name} <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>({s.duration_minutes}min)</span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Se nenhum for marcado, o profissional atende todos os serviços.
                </span>
              </div>

              {/* Instagram URL */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600' }}>Instagram (URL)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={e => setFormData({ ...formData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/usuario"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white' }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ padding: '0.6rem 1.5rem', border: 'none', cursor: 'pointer' }}>
                  {isSubmitting ? 'Salvando...' : 'Salvar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
