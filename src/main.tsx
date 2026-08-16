import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error listener to help debug deployment issues
window.addEventListener('error', (event) => {
  // Ignore benign, third-party, or extension-related script errors
  const message = event.message || '';
  const filename = event.filename || '';
  if (
    !message ||
    filename.includes('extension') || 
    filename.includes('chrome-extension') ||
    filename.includes('mock') ||
    message.includes('ResizeObserver')
  ) {
    return;
  }
  console.error('Global error caught:', event.error || message);
});

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  
  // Gracefully filter out empty reasons or benign third-party/iframe-specific rejections
  if (!reason) {
    event.preventDefault();
    return;
  }
  
  const msg = typeof reason === 'object' ? (reason.message || '') : String(reason);
  
  // Exclude benign WebSocket/Vite/Browser extension rejections that occur in the sandbox
  if (
    msg.includes('WebSocket') || 
    msg.includes('vite') || 
    msg.includes('extension') || 
    msg.includes('chrome-extension') ||
    msg.includes('ResizeObserver') ||
    msg.includes('inject')
  ) {
    event.preventDefault();
    return;
  }

  console.error('Unhandled promise rejection:', reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
