'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, User, Utensils, CheckCircle } from 'lucide-react';

const DAYS = [
  { id: 1, name: 'Segunda-feira' },
  { id: 2, name: 'Terça-feira' },
  { id: 3, name: 'Quarta-feira' },
  { id: 4, name: 'Quinta-feira' },
  { id: 5, name: 'Sexta-feira' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' }
];

const TIME_OPTIONS = [];
for (let h = 6; h <= 23; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:00`);
  TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:30`);
}

export default function ExpedientesPage() {
  const [professionals, setProfessionals] = useState([]);
  const [selectedProfId, setSelectedProfId] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/professionals', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProfessionals(data);
          setSelectedProfId(data[0].id);
        } else {
          setLoading(false);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedProfId) return;

    setLoading(true);
    fetch(`/api/schedules?professional_id=${selectedProfId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSchedules(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedProfId]);

  const updateDaySchedule = (dayOfWeek, field, value) => {
    setSchedules(prev =>
      prev.map(item => {
        if (Number(item.day_of_week) === Number(dayOfWeek)) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (!selectedProfId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professional_id: selectedProfId,
          schedules
        })
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Erro ao salvar expedição.');
      }
    } catch (err) {
      alert('Erro de conexão ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const getScheduleForDay = (dayOfWeek) => {
    return schedules.find(s => Number(s.day_of_week) === Number(dayOfWeek)) || {
      day_of_week: dayOfWeek,
      is_active: dayOfWeek === 0 ? 0 : 1,
      start_time: '09:00',
      end_time: '19:00',
      has_break: 1,
      break_start: '12:00',
      break_end: '13:00'
    };
  };

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Expedientes Individuais</h1>
          <p>Configure os horários de trabalho e almoço para cada profissional da equipe</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedProfId}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }}
        >
          {saveSuccess ? (
            <>
              <CheckCircle size={18} /> Salvo com sucesso!
            </>
          ) : (
            <>
              <Save size={18} /> {saving ? 'Salvando...' : 'Salvar Expediente'}
            </>
          )}
        </button>
      </div>

      {/* Seleção do Profissional */}
      <div className="panel-card mt-4" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: '600' }}>Selecione o Profissional:</span>
        </div>
        {professionals.length === 0 ? (
          <span style={{ color: 'var(--muted)' }}>Nenhum profissional encontrado. Cadastre um profissional primeiro.</span>
        ) : (
          <select
            value={selectedProfId || ''}
            onChange={e => setSelectedProfId(Number(e.target.value))}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'white', fontSize: '1rem', minWidth: '220px', cursor: 'pointer' }}
          >
            {professionals.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Lista dos Dias da Semana */}
      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Carregando expedientes...</p>
        </div>
      ) : !selectedProfId ? (
        <div className="panel-card mt-4 empty-state">
          <p>Nenhum profissional selecionado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px' }}>
          {DAYS.map(day => {
            const sch = getScheduleForDay(day.id);
            const isActive = sch.is_active === 1 || sch.is_active === true;
            const hasBreak = sch.has_break === 1 || sch.has_break === true;

            return (
              <div
                key={day.id}
                style={{
                  backgroundColor: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Day Header with Toggle and Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActive ? '1rem' : '0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{day.name}</h3>
                    {isActive && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        {sch.start_time} — {sch.end_time}
                      </span>
                    )}
                    {isActive && hasBreak && (
                      <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '3px 10px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Utensils size={12} /> {sch.break_start} — {sch.break_end}
                      </span>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    {!isActive && <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Fechado</span>}
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => updateDaySchedule(day.id, 'is_active', e.target.checked ? 1 : 0)}
                      style={{
                        width: '44px',
                        height: '24px',
                        appearance: 'none',
                        backgroundColor: isActive ? 'var(--primary)' : '#333',
                        borderRadius: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    />
                  </label>
                </div>

                {/* Day Configuration Body when Active */}
                {isActive && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
                    {/* Expediente Hours */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted)', minWidth: '80px' }}>Expediente:</span>
                      <select
                        value={sch.start_time}
                        onChange={e => updateDaySchedule(day.id, 'start_time', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid var(--card-border)' }}
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>até</span>
                      <select
                        value={sch.end_time}
                        onChange={e => updateDaySchedule(day.id, 'end_time', e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid var(--card-border)' }}
                      >
                        {TIME_OPTIONS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Interval Checkbox */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                          type="checkbox"
                          checked={hasBreak}
                          onChange={e => updateDaySchedule(day.id, 'has_break', e.target.checked ? 1 : 0)}
                          style={{ accentColor: 'var(--primary)', width: '18px', height: '18px' }}
                        />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Utensils size={16} style={{ color: '#eab308' }} /> Adicionar intervalo (almoço)
                        </span>
                      </label>

                      {hasBreak && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', paddingLeft: '1.75rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Fechado das</span>
                          <select
                            value={sch.break_start}
                            onChange={e => updateDaySchedule(day.id, 'break_start', e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid var(--card-border)', fontSize: '0.85rem' }}
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>às</span>
                          <select
                            value={sch.break_end}
                            onChange={e => updateDaySchedule(day.id, 'break_end', e.target.value)}
                            style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: '#1a1a1a', color: 'white', border: '1px solid var(--card-border)', fontSize: '0.85rem' }}
                          >
                            {TIME_OPTIONS.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
