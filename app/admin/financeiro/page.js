'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Users, FileText, Download } from 'lucide-react';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function FinanceiroPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/financial?month=${selectedMonth}&year=${selectedYear}`, {
      headers: { 'ngrok-skip-browser-warning': 'true' }
    })
      .then(res => res.json())
      .then(resData => {
        setData(resData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth, selectedYear]);

  const handleExportPDF = () => {
    window.print();
  };

  const monthName = MONTH_NAMES[selectedMonth - 1];

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard Financeiro</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Acompanhe o faturamento e comissões • {monthName}/{selectedYear}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Seletor de Mês */}
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontWeight: '500', cursor: 'pointer' }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>

          {/* Seletor de Ano */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontWeight: '500', cursor: 'pointer' }}
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>

          {/* Exportar PDF */}
          <button
            onClick={handleExportPDF}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontWeight: '500', cursor: 'pointer' }}
          >
            <FileText size={18} /> Exportar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-grid mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* Card 1: Faturamento */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '500' }}>Faturamento Total</span>
                <div style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#22c55e' }}>
                R$ {(data?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Total recebido no mês</p>
            </div>

            {/* Card 2: Agendamentos */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '500' }}>Atendimentos</span>
                <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Calendar size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'white' }}>
                {data?.appointmentCount || 0}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Cortes e serviços realizados</p>
            </div>

            {/* Card 3: Ticket Médio */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '500' }}>Ticket Médio</span>
                <div style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#a855f7' }}>
                R$ {(data?.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Valor médio por atendimento</p>
            </div>

            {/* Card 4: Comissões */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)', fontWeight: '500' }}>Comissões a Pagar</span>
                <div style={{ color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Users size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f97316' }}>
                R$ {(data?.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Total a pagar em comissões aos barbeiros</p>
            </div>
          </div>

          {/* Comissões por Profissional */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 className="panel-header" style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Comissões por Profissional — {monthName}/{selectedYear}
            </h2>

            {!data?.profSummaries || data.profSummaries.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Nenhum atendimento finalizado neste período.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.profSummaries.map((prof, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: '8px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid var(--card-border)',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255, 215, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 'bold' }}>
                        {prof.prof_name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>{prof.prof_name}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                          {prof.count} atendimentos • Taxa: {prof.commission_rate}%
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Faturamento Bruto</span>
                        <strong style={{ fontSize: '0.95rem', color: 'white' }}>
                          R$ {prof.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Comissão a Pagar</span>
                        <strong style={{ fontSize: '1.05rem', color: '#f97316' }}>
                          R$ {prof.total_commission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
