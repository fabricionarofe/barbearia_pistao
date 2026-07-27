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
          <img 
            src="/img/logo.jpeg" 
            alt="Logo Barbearia" 
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              objectFit: 'cover' 
            }} 
          />
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
    </div>
  );
}
