'use client';

import { BarChart2, PieChart, TrendingUp } from 'lucide-react';

export default function RelatoriosPage() {
  return (
    <>
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>Métricas e estatísticas do negócio</p>
      </div>

      <div className="main-cards-grid mt-4">
        <div className="panel-card">
          <h2 className="panel-header">Serviços Mais Realizados</h2>
          <div className="empty-state">
            <div className="empty-icon">
              <PieChart size={32} />
            </div>
            <p className="empty-text">Dados insuficientes para gerar o gráfico.</p>
          </div>
        </div>

        <div className="panel-card">
          <h2 className="panel-header">Crescimento Mensal</h2>
          <div className="empty-state">
            <div className="empty-icon">
              <TrendingUp size={32} />
            </div>
            <p className="empty-text">Dados insuficientes.</p>
          </div>
        </div>
      </div>
    </>
  );
}
