'use client';

import { QrCode, Download, Share2 } from 'lucide-react';

export default function QRCodePage() {
  return (
    <>
      <div className="page-header">
        <h1>QR Code</h1>
        <p>Compartilhe o link de agendamento com seus clientes</p>
      </div>

      <div className="panel-card mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
        <div style={{ padding: '2rem', backgroundColor: 'white', borderRadius: '16px', marginBottom: '2rem' }}>
          {/* Placeholder for QR Code since we can't generate an actual image without a library easily */}
          <QrCode size={200} color="#000" />
        </div>
        
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Seu Link de Agendamento</h2>
        <div style={{ padding: '1rem', backgroundColor: 'var(--background)', border: '1px solid var(--card-border)', borderRadius: '8px', width: '100%', maxWidth: '400px', marginBottom: '2rem', userSelect: 'all', fontFamily: 'monospace' }}>
          https://barbearia-do-paulo.com.br/agendar
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Download size={18} /> Baixar Imagem
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '99px', fontWeight: '600', cursor: 'pointer' }}>
            <Share2 size={18} /> Compartilhar
          </button>
        </div>
      </div>
    </>
  );
}
