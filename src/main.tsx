import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: any) {
    console.error('[ErrorBoundary]', error?.message, error?.stack, info?.componentStack);
  }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error;
      return (
        <div style={{ minHeight: '100vh', background: '#070b13', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: 'sans-serif' }}>
          <img src="/favicon.png" alt="Facilita Aí" style={{ width: 64, borderRadius: 18, marginBottom: 24 }} />
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Algo deu errado</h1>
          <p style={{ color: '#f97316', fontSize: 12, marginBottom: 8, textAlign: 'center', maxWidth: 400, wordBreak: 'break-word' }}>{err?.message}</p>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 24, textAlign: 'center' }}>Recarregue a página para continuar.</p>
          <button onClick={() => window.location.reload()} style={{ background: '#FF7A00', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
