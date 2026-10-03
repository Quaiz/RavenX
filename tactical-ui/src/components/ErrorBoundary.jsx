import React from 'react';

export class WindowErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[RavenX] Error in module ${this.props.moduleId}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-black/90 font-mono text-red-500">
          <div className="text-[12px] font-bold tracking-widest uppercase mb-2 text-red-400">
            // TELEMETRY FAULT: {this.props.moduleId || 'UNKNOWN'}
          </div>
          <div className="text-[10px] text-white/60 mb-4 max-w-[320px] break-words font-mono bg-red-950/30 p-2 border border-red-900/50">
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500 text-white text-[10px] uppercase tracking-widest font-bold transition-all"
          >
            REINITIALIZE MODULE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("[RavenX Fatal] Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#ff4444', backgroundColor: '#05070a', fontFamily: 'monospace', height: '100vh', width: '100vw', overflow: 'auto', zIndex: 99999, position: 'fixed', top: 0, left: 0 }}>
          <h2 style={{ borderBottom: '1px solid #ff4444', paddingBottom: '10px', fontSize: '18px', letterSpacing: '0.1em' }}>
            [FATAL SYSTEM CRASH]
          </h2>
          <div style={{ marginTop: '20px', fontSize: '13px' }}>
            <strong>ERROR: </strong>
            <span style={{ color: '#fff' }}>{this.state.error ? this.state.error.toString() : "INTERNAL SYSTEM FAULT DETECTED."}</span>
          </div>
          <details open style={{ whiteSpace: 'pre-wrap', marginTop: '16px', backgroundColor: '#180505', padding: '12px', border: '1px solid #ff4444', color: '#ffaaaa', fontSize: '11px', maxHeight: '400px', overflow: 'auto' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>DIAGNOSTIC STACK TRACE</summary>
            <br />
            {this.state.error?.stack || (this.state.errorInfo && this.state.errorInfo.componentStack) || 'No stack trace available.'}
          </details>
          <button 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.reload(true);
            }}
            style={{ marginTop: '24px', padding: '12px 20px', backgroundColor: '#ff4444', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', fontSize: '14px', letterSpacing: '0.1em' }}
          >
            PURGE CACHE & REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
