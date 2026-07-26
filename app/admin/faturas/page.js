'use client';

import { FileText, Download } from 'lucide-react';

export default function FaturasPage() {
  return (
    <>
      <div className="page-header">
        <h1>Faturas</h1>
        <p>Histórico de pagamentos e assinaturas do sistema</p>
      </div>

      <div className="panel-card mt-4">
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={32} />
          </div>
          <p className="empty-text">Nenhuma fatura disponível.</p>
        </div>
      </div>
    </>
  );
}
