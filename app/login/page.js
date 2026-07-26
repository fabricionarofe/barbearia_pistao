'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Scissors, Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import '../globals.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        // Redireciona para o admin após sucesso
        router.push('/admin');
        router.refresh(); // Para forçar recarregamento do layout
      } else {
        const data = await res.json();
        setError(data.error || 'Falha ao autenticar.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #121212 0%, #1a1a1a 100%)',
      padding: '1rem',
      color: 'white'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--card-border)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 1rem', 
            background: 'linear-gradient(45deg, var(--primary), #e8bd63)',
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 5px 15px rgba(220, 165, 70, 0.2)'
          }}>
            <Scissors size={36} color="#000" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Barbearia do Paulo</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Área de Gestão - Acesso Restrito</p>
        </div>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            backgroundColor: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid #ef4444', 
            padding: '1rem', 
            borderRadius: '12px', 
            marginBottom: '1.5rem',
            color: '#ef4444' 
          }}>
            <AlertCircle size={20} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>E-mail</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                <User size={18} />
              </div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail de acesso"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--muted)', marginBottom: '0.5rem' }}>Senha</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }}>
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                style={{
                  width: '100%',
                  padding: '1rem 1rem 1rem 3rem',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--card-border)'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '1rem',
              backgroundColor: 'var(--primary)',
              color: '#000',
              padding: '1rem',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
}
