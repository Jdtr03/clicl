import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreacionContenido from './pages/CreacionContenido';
import CrecimientoAds from './pages/CrecimientoAds';

/**
 * Helper component to scroll to top on route change
 * and fire Meta Pixel PageView on each navigation
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Fire Meta Pixel PageView on every route change
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    // If there is a hash (e.g. #auditoria), scroll to that element
    if (hash) {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
            const offset = 96; // navbar height
            const top = element.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
            return;
        }
    }
    // Otherwise scroll to top
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
        <Route path="/crecimiento-ads" element={<CrecimientoAds />} />
      </Routes>
    </Router>
  );
}

export default App;
