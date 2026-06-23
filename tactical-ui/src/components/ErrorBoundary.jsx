import React from 'react';

class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null, errorInfo: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true };
 }

 componentDidCatch(error, errorInfo) {
 this.setState({ error, errorInfo });
 console.error("Uncaught error:", error, errorInfo);
 }

 render() {
 if (this.state.hasError) {
 return (
 <div style={{ padding: '20px', color: '#ff3333', backgroundColor: '#05070a', fontFamily: 'monospace', height: '100vh', width: '100vw', overflow: 'auto', zIndex: 99999, position: 'fixed', top: 0, left: 0 }}>
 <h2 style={{ borderBottom: '1px solid #ff3333', paddingBottom: '10px' }}>[FATAL SYSTEM CRASH]</h2>
 <div style={{ marginTop: '20px' }}>
 <strong>ERROR:</strong> {import.meta.env.MODE === 'development' ? (this.state.error && this.state.error.toString()) :"INTERNAL SYSTEM FAULT DETECTED."}
 </div>
 {import.meta.env.MODE === 'development' && (
 <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', backgroundColor: '#220000', padding: '10px', border: '1px solid #ff3333' }}>
 <summary>STACK TRACE</summary>
 <br />
 {this.state.errorInfo && this.state.errorInfo.componentStack}
 </details>
 )}
 <button 
 onClick={() => {
 localStorage.clear();
 sessionStorage.clear();
 window.location.reload(true);
 }}
 style={{ marginTop: '30px', padding: '10px 20px', backgroundColor: '#ff3333', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer', width: '100%', fontSize: '16px' }}
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
