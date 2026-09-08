import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Prevent pinch-to-zoom and gesture zooming on mobile devices
if (typeof window !== 'undefined') {
  // Prevent Safari gesture zooming (gesturestart, gesturechange, gestureend)
  document.addEventListener('gesturestart', (e: Event) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e: Event) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e: Event) => e.preventDefault(), { passive: false });

  // Prevent multi-touch pinch zooming
  document.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Prevent double-tap to zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e: TouchEvent) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      const target = e.target as HTMLElement | null;
      if (!target || !['INPUT', 'TEXTAREA', 'SELECT', 'OPTION'].includes(target.tagName)) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, false);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
