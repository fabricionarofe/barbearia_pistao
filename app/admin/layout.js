'use client';

import { useState } from 'react';
import { Scissors, LayoutDashboard, Calendar, Users, Briefcase, DollarSign, BarChart2, Clock, FileText, QrCode, Settings, LogOut, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import '../globals.css';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Erro ao fazer logout', err);
    }
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="admin-layout">
      {/* Mobile Header / Hamburger */}
      <div className="mobile-admin-header">
        <div className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="logo-icon" style={{ width: '32px', height: '32px', background: 'transparent', padding: 0, overflow: 'hidden' }}>
            <img src="/img/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
          </div>
          <h2 style={{ fontSize: '1rem', margin: 0 }}>Barbearia</h2>
        </div>
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ gap: '6px', fontWeight: 'bold', fontSize: '0.85rem' }}>
          {isMobileMenuOpen ? (
            <>FECHAR <X size={24} /></>
          ) : (
            <>MENU <Menu size={24} /></>
          )}
        </button>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMenu}></div>
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon" style={{ background: 'transparent', padding: 0, overflow: 'hidden' }}>
            <img src="/img/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
          </div>
          <div className="logo-text">
            <h2>Barbearia</h2>
            <p style={{ textTransform: 'uppercase' }}>ANTONIO PAULO</p>
          </div>
          {/* Botão de fechar só aparece no mobile */}
          <button className="close-menu-btn" onClick={closeMenu} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--foreground)' }}>
            <X size={24} />
          </button>
        </div>

        <nav>
          <div className="nav-group">
            <div className="nav-label">Principal</div>
            <Link href="/admin" onClick={closeMenu} className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link href="/admin/agendamentos" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/agendamentos') ? 'active' : ''}`}>
              <Calendar size={18} />
              Agendamentos
              <span className="nav-badge">2</span>
            </Link>
            <Link href="/admin/clientes" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/clientes') ? 'active' : ''}`}>
              <Users size={18} />
              Clientes
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-label">Gestão</div>
            <Link href="/admin/profissionais" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/profissionais') ? 'active' : ''}`}>
              <Scissors size={18} />
              Profissionais
            </Link>
            <Link href="/admin/servicos" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/servicos') ? 'active' : ''}`}>
              <Briefcase size={18} />
              Serviços
            </Link>
            <Link href="/admin/financeiro" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/financeiro') ? 'active' : ''}`}>
              <DollarSign size={18} />
              Financeiro
            </Link>
            <Link href="/admin/relatorios" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/relatorios') ? 'active' : ''}`}>
              <BarChart2 size={18} />
              Relatórios
            </Link>
          </div>

          <div className="nav-group">
            <div className="nav-label">Configurações</div>
            <Link href="/admin/expedientes" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/expedientes') ? 'active' : ''}`}>
              <Clock size={18} />
              Expedientes
            </Link>
            <Link href="/admin/faturas" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/faturas') ? 'active' : ''}`}>
              <FileText size={18} />
              Faturas
            </Link>
            <Link href="/admin/qr-code" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/qr-code') ? 'active' : ''}`}>
              <QrCode size={18} />
              QR Code
            </Link>
            <Link href="/admin/configuracoes" onClick={closeMenu} className={`nav-item ${pathname?.startsWith('/admin/configuracoes') ? 'active' : ''}`}>
              <Settings size={18} />
              Configurações
            </Link>
          </div>
          
          <div className="nav-group" style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <button 
              onClick={handleLogout} 
              className="nav-item" 
              style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', textAlign: 'left' }}
            >
              <LogOut size={18} />
              Sair da Conta
            </button>
          </div>
        </nav>
      </aside>

      <main className="main-content">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="bottom-nav">
        <Link href="/admin" className={`bottom-nav-item ${pathname === '/admin' ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Início</span>
        </Link>
        <Link href="/admin/agendamentos" className={`bottom-nav-item ${pathname?.startsWith('/admin/agendamentos') ? 'active' : ''}`}>
          <div style={{ position: 'relative' }}>
            <Calendar size={20} />
            <span className="bottom-nav-badge">2</span>
          </div>
          <span>Agenda</span>
        </Link>
        <Link href="/admin/clientes" className={`bottom-nav-item ${pathname?.startsWith('/admin/clientes') ? 'active' : ''}`}>
          <Users size={20} />
          <span>Clientes</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)} className="bottom-nav-item">
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </div>
    </div>
  );
}
