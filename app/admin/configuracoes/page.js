'use client';

import { Settings, Save, Store, Palette, Globe } from 'lucide-react';

export default function ConfiguracoesPage() {
  return (
    <>
      <div className="page-header flex justify-between align-center">
        <div>
          <h1>Configurações</h1>
          <p>Ajustes gerais do seu sistema</p>
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> Salvar Alterações
        </button>
      </div>

      <div className="main-cards-grid mt-4">
        <div className="panel-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Store size={20} color="var(--primary)" />
            <h2 className="panel-header" style={{ margin: 0 }}>Dados do Negócio</h2>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Nome da Barbearia</label>
            <input type="text" defaultValue="Barbearia do Paulo" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Telefone de Contato</label>
            <input type="text" defaultValue="(11) 99999-9999" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--muted)' }}>Endereço</label>
            <input type="text" defaultValue="Rua das Flores, 123 - Centro" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }} />
          </div>
        </div>

        <div className="action-list">
          <div className="panel-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Palette size={20} color="var(--primary)" />
              <h2 className="panel-header" style={{ margin: 0 }}>Aparência</h2>
            </div>
            <div className="empty-state" style={{ padding: '1rem 0' }}>
              <p className="empty-text">Tema Dark configurado por padrão.</p>
            </div>
          </div>

          <div className="panel-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Globe size={20} color="var(--primary)" />
              <h2 className="panel-header" style={{ margin: 0 }}>Integrações</h2>
            </div>
            <div className="empty-state" style={{ padding: '1rem 0' }}>
              <p className="empty-text">Nenhuma integração ativa.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
