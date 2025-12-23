import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(...args) {
    console.error('ErrorBoundary caught an error:', ...args);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#fff' }}>
          <div style={{ maxWidth: 640, textAlign: 'center' }}>
            <h2 style={{ color: '#0f172a', marginBottom: 12 }}>Algo deu errado</h2>
            <p style={{ color: '#374151' }}>Ocorreu um erro ao carregar a aplicação. Tente atualizar a página ou contate o suporte.</p>
            <pre style={{ textAlign: 'left', marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 8, color: '#111827' }}>{String(this.state.error)}</pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
