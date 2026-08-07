'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Scissors, Award, Calendar, DollarSign, User, Sparkles } from 'lucide-react';

export default function RelatoriosPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calcular estatísticas da curva de 30 dias
  const maxDailyCount = data?.dailyTrend ? Math.max(...data.dailyTrend.map(d => d.count), 1) : 1;
  const maxMonthlyRevenue = data?.monthlyComparison ? Math.max(...data.monthlyComparison.map(d => d.revenue), 1) : 1;
  const maxHourCount = data?.popularHours ? Math.max(...data.popularHours.map(h => h.count), 1) : 1;

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Relatórios e Inteligência de Negócio</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Análise de tendência de agendamentos, serviços mais lucrativos e horários de pico
          </p>
        </div>
      </div>

      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Gerando inteligência de relatórios...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
          {/* SEÇÃO 1: GRÁFICO 1 - Tendência de Atendimentos nos Últimos 30 Dias */}
          <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} style={{ color: 'var(--primary)' }} /> Volume de Atendimentos (Últimos 30 Dias)
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Evolução diária de agendamentos concluídos na barbearia
                </p>
              </div>
            </div>

            {/* SVG Line & Bar Chart */}
            <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '1.5rem' }}>
              {data?.dailyTrend?.map((item, idx) => {
                const heightPercent = Math.max((item.count / maxDailyCount) * 100, 4);
                return (
                  <div
                    key={idx}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}
                    title={`${item.label}: ${item.count} cortes (R$ ${item.revenue})`}
                  >
                    <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '4px', opacity: item.count > 0 ? 1 : 0 }}>
                      {item.count > 0 ? item.count : ''}
                    </span>
                    <div
                      style={{
                        width: '100%',
                        maxWdith: '18px',
                        height: `${heightPercent}%`,
                        backgroundColor: item.count > 0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }}
                    />
                    {idx % 4 === 0 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--muted)', marginTop: '6px', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEÇÃO 2: DUAS COLUNAS (Comparativo 6 Meses & Horários de Pico) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Gráfico 2: Comparativo Mensal de Faturamento (6 Meses) */}
            <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={20} style={{ color: '#22c55e' }} /> Comparativo de Faturamento (6 Meses)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Receita total gerada em cada um dos últimos meses
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                {data?.monthlyComparison?.map((m, idx) => {
                  const barPercent = Math.max((m.revenue / maxMonthlyRevenue) * 100, 5);
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{m.label}</span>
                        <span style={{ fontWeight: 'bold', color: '#22c55e' }}>
                          R$ {m.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({m.count} cortes)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${barPercent}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: '5px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico 3: Horários de Pico / Maior Movimento */}
            <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: '#a855f7' }} /> Horários de Pico
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Horários de maior procura pelos clientes
              </p>

              {!data?.popularHours || data.popularHours.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum dado registrado.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.popularHours.slice(0, 6).map((h, idx) => {
                    const barPercent = Math.max((h.count / maxHourCount) * 100, 10);
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ width: '50px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                          {h.hour}
                        </span>
                        <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${barPercent}%`, height: '100%', backgroundColor: '#a855f7', borderRadius: '4px' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', minWidth: '60px', textAlign: 'right' }}>
                          {h.count} agend.
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SEÇÃO 3: RANKING DE SERVIÇOS E RANKING DE BARBEIROS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Ranking de Serviços Mais Vendidos */}
            <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scissors size={20} style={{ color: '#f97316' }} /> Serviços Mais Populares
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Distribuição de preferência e receita por tipo de serviço
              </p>

              {!data?.popularServices || data.popularServices.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum serviço registrado.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {data.popularServices.map((service, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600' }}>{service.name}</span>
                        <span style={{ color: 'var(--muted)' }}>
                          <strong>{service.count}x</strong> (R$ {service.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${service.percentage}%`, height: '100%', backgroundColor: '#f97316', borderRadius: '4px' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ranking de Desempenho da Equipe */}
            <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: 'var(--primary)' }} /> Ranking de Barbeiros
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
                Classificação por faturamento gerado e total de cortes
              </p>

              {!data?.topProfessionals || data.topProfessionals.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Nenhum profissional registrado.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {data.topProfessionals.map((prof, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        backgroundColor: '#1a1a1a',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: idx === 0 ? '#EAB308' : idx === 1 ? '#94a3b8' : '#b45309', minWidth: '20px' }}>
                          #{idx + 1}
                        </span>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,215,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {prof.photo_url ? (
                            <img src={prof.photo_url} alt={prof.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <User size={20} style={{ color: 'var(--primary)' }} />
                          )}
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.95rem', display: 'block' }}>{prof.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{prof.count} cortes realizados</span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#22c55e', display: 'block' }}>
                          R$ {prof.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
