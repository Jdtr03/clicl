# Guía de Implementación: Meta Pixel en Click Productions

Para un proyecto basado en React como este, la forma más eficiente y profesional de implementar el Meta Pixel es utilizando la librería `react-facebook-pixel`. Esto permite manejar las transiciones de página de la SPA (Single Page Application) y rastrear eventos personalizados de forma sencilla.

## 🚀 Recomendaciones Estratégicas

1.  **Rastreo Automático de Páginas**: En React, las páginas no se "recargan" realmente. Debes asegurarte de que el Pixel registre un `PageView` cada vez que el usuario cambia de ruta.
2.  **Eventos Estándar**:
    *   `PageView`: En todas las visitas.
    *   `Lead`: Cuando alguien llega a la sección del calendario o hace clic en los botones de "Auditoría".
    *   `Contact`: En los clics a los enlaces de WhatsApp.
3.  **Variables de Entorno**: No guardes tu Pixel ID directamente en el código. Usa un archivo `.env` para mayor seguridad y flexibilidad entre entornos (desarrollo/producción).

---

## 🛠 Proceso de Implementación

### 1. Instalación
Ejecuta el siguiente comando en tu terminal:
```bash
npm install react-facebook-pixel
```

### 2. Configuración en `App.jsx`
Debes inicializar el Pixel en el componente principal de tu aplicación. 

```javascript
import React, { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

function App() {
  useEffect(() => {
    const options = {
      autoConfig: true,
      debug: false,
    };
    // Inicializa con tu ID de Pixel
    ReactPixel.init('TU_PIXEL_ID_AQUÍ', null, options);
    ReactPixel.pageView();
  }, []);

  // ... resto de tu App.jsx
}
```

### 3. Rastreo de Conversiones (Leads)
Para rastrear cuando alguien está interesado en una auditoría, puedes agregar el evento al hacer clic en los botones. Por ejemplo, en `CrecimientoAds.jsx`:

```javascript
import ReactPixel from 'react-facebook-pixel';

const handleAuditoriaClick = () => {
  ReactPixel.track('Lead', {
    content_name: 'Auditoría Crecimiento Ads',
    content_category: 'Consultoría'
  });
  // ... lógica existente para navegar o mostrar calendario
};
```

### 4. Integración con el Calendario (GoHighLevel)
Dado que el calendario está en un `iframe`, Meta Pixel no puede rastrear qué pasa dentro de él directamente. Mi recomendación es:
1.  Configurar GoHighLevel para redirigir a una **Página de Gracias** (ej. `/gracias`) tras completar la reserva.
2.  Rastrear el evento `CompleteRegistration` o `Schedule` en esa nueva página.

---

## 🔒 Consideraciones de Privacidad
*   Asegúrate de actualizar tu Política de Privacidad para mencionar el uso de Meta Pixel.
*   Si escalas a Europa, considera implementar un banner de cookies para cumplir con GDPR.

---

### ¿Por dónde empezamos?
Si tienes tu **Pixel ID** a mano, puedo ayudarte a crear el archivo `.env` e integrarlo ahora mismo en tu `App.jsx` para que quede funcionando.
