import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreacionContenido from './pages/CreacionContenido';
import EmbudoDigital from './pages/EmbudoDigital';

/**
 * Helper component to scroll to top on route change
 * and fire Meta Pixel PageView on each navigation
 */
// IDs de píxeles por ruta
const PIXEL_AUDITORIA = '1490197068692617';   // LandingPage - Clientes potenciales
const PIXEL_CONTENIDO  = '673387272426495';    // CreacionContenido - Suscripciones audiovisuales

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Disparar PageView solo al píxel correspondiente a la ruta actual
    if (typeof window.fbq === 'function') {
      if (pathname === '/') {
        window.fbq('trackSingle', PIXEL_AUDITORIA, 'PageView');
      } else if (pathname === '/creacion-contenido') {
        window.fbq('trackSingle', PIXEL_CONTENIDO, 'PageView');
      }
      // /embudo-digital no tiene píxel asignado
    }

    // Si hay un hash (ej. #auditoria), hacer scroll a ese elemento
    if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            const offset = 96; // altura del navbar
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
            return;
        }
    }
    // Si no hay hash, ir al tope
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/creacion-contenido" element={<CreacionContenido />} />
        <Route path="/embudo-digital" element={<EmbudoDigital />} />
      </Routes>
    </Router>
  );
}

export default App;
