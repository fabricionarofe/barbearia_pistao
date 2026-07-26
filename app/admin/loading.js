import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex-center" style={{ height: '100%', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <Loader2 size={40} className="spinner" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>Carregando dados...</p>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
