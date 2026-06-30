import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
// Side-effect: registra los listeners de instalación PWA al arranque, para capturar
// `beforeinstallprompt` antes de que el usuario navegue (ver installStore).
import './features/pwa/installStore';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No se encontró el elemento #root en index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Registro del service worker (solo en producción; en dev interferiría con el HMR de Vite).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* el fallo de registro del SW no debe romper la app */
    });
  });
}
