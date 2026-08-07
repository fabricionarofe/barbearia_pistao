'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Users, FileText, ArrowUpRight, ArrowDownRight, Wallet, Scissors, Search, User } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredTransactions = (data?.transactions || []).filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.clientName?.toLowerCase().includes(term) ||
      t.profName?.toLowerCase().includes(term) ||
      t.serviceName?.toLowerCase().includes(term) ||
      t.date?.includes(term)
    );
  });

  return (
    <>
      <div className="page-header flex justify-between align-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Dashboard Financeiro</h1>
          <p style={{ color: 'var(--muted)', marginTop: '4px' }}>
            Faturamento, cálculo automático de comissões e margem de lucro • {monthName}/{selectedYear}
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
            <FileText size={18} /> Exportar Relatório
          </button>
        </div>
      </div>

      {loading ? (
        <div className="panel-card mt-4 empty-state">
          <p>Carregando dados financeiros...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards (5 Métricas Principais) */}
          <div className="summary-grid mt-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Card 1: Faturamento Bruto */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Faturamento Bruto</span>
                <div style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: '#22c55e' }}>
                R$ {(data?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Total cobrado dos clientes</p>
            </div>

            {/* Card 2: Comissões a Pagar */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Comissões da Equipe</span>
                <div style={{ color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Users size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: '#f97316' }}>
                R$ {(data?.totalCommissions || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Total a repassar aos barbeiros</p>
            </div>

            {/* Card 3: Lucro Líquido da Casa */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Lucro Líquido Barbearia</span>
                <div style={{ color: 'var(--primary)', backgroundColor: 'rgba(255, 215, 0, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Wallet size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                R$ {(data?.netProfit || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Receita mantida pela barbearia</p>
            </div>

            {/* Card 4: Ticket Médio */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Ticket Médio</span>
                <div style={{ color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: '#a855f7' }}>
                R$ {(data?.averageTicket || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Média de gasto por cliente</p>
            </div>

            {/* Card 5: Atendimentos */}
            <div className="summary-card" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '500' }}>Atendimentos</span>
                <div style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                  <Calendar size={20} />
                </div>
              </div>
              <h2 style={{ fontSize: '1.65rem', fontWeight: 'bold', color: 'white' }}>
                {data?.appointmentCount || 0}
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>Cortes e serviços concluídos</p>
            </div>
          </div>

          {/* Comissões Detalhadas por Profissional */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <h2 className="panel-header" style={{ fontSize: '1.15rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Comissões por Profissional — {monthName}/{selectedYear}
            </h2>

            {!data?.profSummaries || data.profSummaries.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Nenhum atendimento registrado neste período.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.profSummaries.map((prof, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center',
                      padding: '1.25rem',
                      borderRadius: '12px',
                      backgroundColor: '#1a1a1a',
                      border: '1px solid var(--card-border)',
                      flexWrap: 'wrap',
                      gap: '1.25rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255, 215, 0, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {prof.prof_photo ? (
                          <img src={prof.prof_photo} alt={prof.prof_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={24} style={{ color: 'var(--primary)' }} />
                        )}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 'bold', margin: 0 }}>{prof.prof_name}</h4>
                          <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#eab308', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>
                            {prof.commission_rate}% Comissão
                          </span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
                          {prof.count} atendimentos realizados no mês
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Faturamento Bruto</span>
                        <strong style={{ fontSize: '1rem', color: 'white' }}>
                          R$ {prof.total_revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Lucro da Casa</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>
                          R$ {prof.house_net.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'block' }}>Comissão a Pagar</span>
                        <strong style={{ fontSize: '1.15rem', color: '#f97316' }}>
                          R$ {prof.total_commission.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Extrato Detalhado de Transações do Mês */}
          <div className="panel-card mt-4" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="panel-header" style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: 0 }}>
                  Extrato Detalhado de Atendimentos
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '2px' }}>
                  Listagem completa de serviços prestados e cálculo individual de comissões
                </p>
              </div>

              {/* Search Bar */}
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar por cliente ou barbeiro..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: '#1a1a1a', color: 'white', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <p className="empty-text">Nenhuma transação encontrada.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--muted)' }}>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Data & Hora</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Cliente</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Profissional</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Serviço</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Valor Cobrado</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Comissão (%)</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Valor Comissão</th>
                      <th style={{ padding: '0.75rem 0.5rem' }}>Lucro Casa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '0.85rem 0.5rem', whiteSpace: 'nowrap' }}>
                          <div style={{ fontWeight: '600' }}>{item.date.split('-').reverse().join('/')}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.time}</div>
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          <div style={{ fontWeight: '500' }}>{item.clientName}</div>
                          {item.clientPhone && <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{item.clientPhone}</div>}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: '500', color: 'var(--primary)' }}>
                          {item.profName}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem' }}>
                          {item.serviceName}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                          R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', color: 'var(--muted)' }}>
                          {item.commissionRate}%
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 'bold', color: '#f97316' }}>
                          R$ {item.commissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.85rem 0.5rem', fontWeight: 'bold', color: 'white' }}>
                          R$ {item.houseNet.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
