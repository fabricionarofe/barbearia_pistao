'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, Award, Scissors, Clock, TrendingUp } from 'lucide-react';

export default function RelatoriosPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    fetch('/api/reports', { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Calcular pontos para o SVG Line Chart
  const renderLineChart = () => {
    if (!data?.dailyTrend || data.dailyTrend.length === 0) return null;

    const trend = data.dailyTrend;
    const maxVal = Math.max(...trend.map(t => t.count), 5);

    const width = 600;
    const height = 220;
    const padding = 35;

    const points = trend.map((t, idx) => {
      const x = padding + (idx / (trend.length - 1)) * (width - padding * 2);
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
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = height - padding - ratio * (height - padding * 2);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#333" strokeDasharray="3 3" />
                <text x={10} y={y + 4} fill="#888" fontSize="10">{val}</text>
              </g>
            );
          })}

          {/* Area under line */}
          <path d={areaD} fill="rgba(234, 179, 8, 0.08)" />

          {/* Line */}
          <path d={pathD} fill="none" stroke="#eab308" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
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

          {/* X Axis Labels (sample every 5th) */}
          {points.filter((_, idx) => idx % 5 === 0 || idx === points.length - 1).map((pt, idx) => (
            <text key={idx} x={pt.x - 12} y={height - 10} fill="#888" fontSize="10">
              {pt.label}
            </text>
          ))}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#1e1e1e',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '0.5rem 0.8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 10
            }}
          >
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted)' }}>{hoveredPoint.label}</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              Atendimentos: {hoveredPoint.count}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Render Bar Chart for Popular Hours
  const renderBarChart = () => {
    if (!data?.popularHours) return null;
    const hours = data.popularHours;
    const maxVal = Math.max(...hours.map(h => h.count), 1);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
        {hours.map((item, idx) => {
          const pct = (item.count / maxVal) * 100;
          return (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ width: '50px', fontSize: '0.85rem', color: 'var(--muted)', textAlign: 'right' }}>{item.hour}</span>
              <div style={{ flex: 1, backgroundColor: '#1a1a1a', height: '24px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
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
                    paddingRight: '8px'
                  }}
                >
                  {item.count > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#000', fontWeight: 'bold' }}>{item.count}</span>
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
    <>
      <div className="page-header">
        <h1>Relatórios & Gráficos</h1>
        <p>Acompanhe o desempenho da barbearia com gráficos detalhados</p>
      </div>

      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Carregando relatórios...</p>
        </div>
      ) : (
        <>
          {/* Top Metrics Grid */}
          <div className="summary-grid mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Card 1 */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Atendimentos do Mês</span>
                <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(255,215,0,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
                  <Calendar size={18} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{data?.monthlyCount || 0}</h2>
            </div>

            {/* Card 2 */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Faturamento do Mês</span>
                <div style={{ color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e' }}>
                R$ {(data?.monthlyRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>

            {/* Card 3 */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Profissional Destaque</span>
                <div style={{ color: '#a855f7', backgroundColor: 'rgba(168,85,247,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
                  <Award size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{data?.topProf?.name || 'Sem registros'}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{data?.topProf?.count || 0} atendimentos</span>
            </div>

            {/* Card 4 */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Serviço Mais Vendido</span>
                <div style={{ color: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', padding: '0.4rem', borderRadius: '6px' }}>
                  <Scissors size={18} />
                </div>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>{data?.topServ?.name || 'Sem registros'}</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{data?.topServ?.count || 0} realizados</span>
            </div>
          </div>

          {/* Gráfico 1: Atendimentos nos Últimos 30 dias */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Atendimentos — Últimos 30 dias</h2>
            </div>
            {renderLineChart()}
          </div>

          {/* Gráfico 2: Horários Mais Populares */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: 0 }}>Horários Mais Populares</h2>
            </div>
            {renderBarChart()}
          </div>
        </>
      )}
    </>
  );
}
