'use client';

import { DollarSign, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function FinanceiroPage() {
  return (
    <>
      <div className="page-header">
        <h1>Financeiro</h1>
        <p>Acompanhe o faturamento da sua barbearia</p>
      </div>

      <div className="summary-grid mt-4">
        <div className="summary-card">
          <div className="summary-info">
            <h3>Faturamento Hoje</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="summary-icon">
            <DollarSign size={24} />
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-info">
            <h3>Faturamento Mensal</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="summary-icon">
            <Activity size={24} />
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-info">
            <h3>Despesas</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="summary-icon" style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <ArrowDownRight size={24} />
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-info">
            <h3>Lucro Estimado</h3>
            <p>R$ 0,00</p>
          </div>
          <div className="summary-icon" style={{ color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <ArrowUpRight size={24} />
          </div>
        </div>
      </div>

      <div className="panel-card mt-4">
        <h2 className="panel-header">Últimas Transações</h2>
        <div className="empty-state">
          <div className="empty-icon">
            <DollarSign size={32} />
          </div>
          <p className="empty-text">Nenhuma transação registrada no período.</p>
        </div>
      </div>
    </>
  );
}
