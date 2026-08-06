'use client';

import { useState } from 'react';
import { Share2, TrendingUp, Clock, DollarSign, Calendar, Award, Scissors } from 'lucide-react';

export default function DashboardChartsAndShare({
  monthlyCount = 0,
  monthlyRevenue = 0,
  topProf = { name: 'Nenhum', count: 0 },
  topServ = { name: 'Nenhum', count: 0 },
  dailyTrend = [],
  popularHours = []
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const handleShareWhatsApp = () => {
    const bookingUrl = typeof window !== 'undefined' ? `${window.location.origin}/agendar` : '';
    const text = encodeURIComponent(
      `💈 *Barbearia do Paulo* - Agende seu horário de forma rápida e fácil acessando nosso link:\n${bookingUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Render Line Chart
  const renderLineChart = () => {
    if (!dailyTrend || dailyTrend.length === 0) return null;

    const maxVal = Math.max(...dailyTrend.map(t => t.count), 5);
    const width = 600;
    const height = 200;
    const padding = 30;

    const points = dailyTrend.map((t, idx) => {
      const x = padding + (idx / (dailyTrend.length - 1)) * (width - padding * 2);
      const y = height - padding - (t.count / maxVal) * (height - padding * 2);
      return { x, y, ...t };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    return (
      <div style={{ width: '100%', overflowX: 'auto', position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '450px' }}>
          {[0, 0.5, 1].map((ratio, idx) => {
            const y = height - padding - ratio * (height - padding * 2);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#333" strokeDasharray="3 3" />
                <text x={5} y={y + 4} fill="#888" fontSize="10">{val}</text>
              </g>
            );
          })}

          <path d={areaD} fill="rgba(234, 179, 8, 0.08)" />
          <path d={pathD} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.label === pt.label ? 6 : 4}
              fill="#eab308"
              stroke="#121212"
              strokeWidth="2"
              style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}

          {points.filter((_, idx) => idx % 6 === 0 || idx === points.length - 1).map((pt, idx) => (
            <text key={idx} x={pt.x - 12} y={height - 8} fill="#888" fontSize="10">
              {pt.label}
            </text>
          ))}
        </svg>

        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              backgroundColor: '#1e1e1e',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '0.4rem 0.7rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 10
            }}
          >
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>{hoveredPoint.label}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              Atendimentos: {hoveredPoint.count}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render Bar Chart
  const renderBarChart = () => {
    if (!popularHours || popularHours.length === 0) return null;
    const maxVal = Math.max(...popularHours.map(h => h.count), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.75rem' }}>
        {popularHours.map((item, idx) => {
          const pct = (item.count / maxVal) * 100;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '45px', fontSize: '0.8rem', color: 'var(--muted)', textAlign: 'right' }}>{item.hour}</span>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', height: '22px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <div
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '6px'
                  }}
                >
                  {item.count > 0 && (
                    <span style={{ fontSize: '0.7rem', color: '#000', fontWeight: 'bold' }}>{item.count}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
      {/* Botão de Compartilhar Link no WhatsApp no Topo do Dashboard */}
      <button
        onClick={handleShareWhatsApp}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.9rem 1.5rem',
          borderRadius: '12px',
          backgroundColor: '#25D366',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.3)',
          width: '100%'
        }}
      >
        <Share2 size={20} /> Compartilhar Link de Agendamento no WhatsApp
      </button>

      {/* Relatórios e Indicadores do Mês */}
      <div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '500' }}>Faturamento no Mês</span>
            <div style={{ color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e', margin: 0 }}>
            R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '500' }}>Atendimentos no Mês</span>
            <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(255,215,0,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
              <Calendar size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>{monthlyCount}</h2>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '500' }}>Barbeiro Destaque</span>
            <div style={{ color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
              <Award size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{topProf.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{topProf.count} atendimentos</span>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: '500' }}>Serviço Top</span>
            <div style={{ color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
              <Scissors size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>{topServ.name}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{topServ.count} realizados</span>
        </div>
      </div>

      {/* Gráfico 1: Atendimentos nos Últimos 30 dias */}
      <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <TrendingUp size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Atendimentos - Últimos 30 dias</h2>
        </div>
        {renderLineChart()}
      </div>

      {/* Gráfico 2: Horários Mais Populares */}
      <div className="panel-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>Horários Mais Populares</h2>
        </div>
        {renderBarChart()}
      </div>
    </div>
  );
}
