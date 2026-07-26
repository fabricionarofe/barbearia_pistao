'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Scissors, MoreVertical, Calendar, Settings } from 'lucide-react';
import './globals.css';

export default function LandingPage() {
  const [showFab, setShowFab] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
      color: 'white',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Elementos decorativos */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(220,165,70,0.1) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(220,165,70,0.15) 0%, transparent 70%)', borderRadius: '50%', zIndex: 0 }} />

      <div style={{ zIndex: 1, textAlign: 'center', maxWidth: '600px', width: '100%' }}>
        <div style={{ 
          width: '100px', 
          height: '100px', 
          margin: '0 auto 2rem', 
          background: 'linear-gradient(45deg, var(--primary), #e8bd63)',
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(220, 165, 70, 0.3)'
        }}>
          <Scissors size={48} color="#000" />
        </div>
        
        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-1px' }}>Barbearia do Paulo</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: '1.6' }}>
          O seu estilo no momento certo. Agende seu horário com praticidade e exclusividade.
        </p>

        <Link href="/agendar" style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          backgroundColor: 'var(--primary)',
          color: '#000',
          padding: '1.2rem 2.5rem',
          borderRadius: '99px',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          textDecoration: 'none',
          boxShadow: '0 8px 25px rgba(220, 165, 70, 0.4)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(220, 165, 70, 0.5)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(220, 165, 70, 0.4)'; }}
        >
          <Calendar size={20} />
          Agendar Horário
        </Link>
      </div>

      {/* FAB - Floating Action Button */}
      <div className="fab-container" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50 }}>
        {showFab && (
          <div className="fab-menu" style={{ position: 'absolute', bottom: '60px', right: '0', display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--card-bg)', padding: '1rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--card-border)', width: '200px' }}>
            <Link href="/agendar" className="fab-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none', padding: '0.5rem', borderRadius: '8px', transition: 'background-color 0.2s' }}>
              <Calendar size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Agendar Horário</span>
            </Link>
            <div style={{ height: '1px', backgroundColor: 'var(--card-border)', margin: '0.25rem 0' }} />
            <Link href="/admin" className="fab-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', textDecoration: 'none', padding: '0.5rem', borderRadius: '8px', transition: 'background-color 0.2s' }}>
              <Settings size={18} color="var(--muted)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--muted)' }}>Painel Admin</span>
            </Link>
          </div>
        )}
        <button 
          className="fab-button"
          onClick={() => setShowFab(!showFab)}
          style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'black', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 165, 70, 0.4)', transition: 'transform 0.2s' }}
        >
          <MoreVertical size={24} />
        </button>
      </div>
    </div>
  );
}
