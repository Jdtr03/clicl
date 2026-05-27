# 🚀 Guía de Deploy Automático → Hostinger via Git

Esta guía explica cómo conectar tu repositorio de GitHub con Hostinger para que **cada `git push` actualice el sitio automáticamente**.

---

## 📋 Resumen del flujo

```
Tu PC  →  git push  →  GitHub  →  GitHub Action  →  Hostinger
                                   (compila React)    (public_html/)
```

El proceso completo tarda **~2-3 minutos** desde que haces push hasta que el sitio está actualizado en producción.

---

## ✅ Lo que ya está configurado

- [x] Archivo `.htaccess` en `click-react/public/` → asegura que React Router funcione en Apache
- [x] Workflow `.github/workflows/deploy-hostinger.yml` → el automatizador de GitHub

Lo único que falta es configurar las **credenciales FTP** en GitHub para que el workflow pueda conectarse a Hostinger.

---

## 🔐 PASO 1 — Obtener las credenciales FTP de Hostinger

1. Ingresa al panel de **Hostinger**: [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. Selecciona tu dominio/hosting
3. En el menú lateral busca **"Archivos"** → **"Cuentas FTP"**
4. Anota o crea una cuenta FTP con estos datos:

| Dato | Ejemplo |
|------|---------|
| **Host FTP** | `ftp.tudominio.com` |
| **Usuario FTP** | `u123456789` o el nombre que creaste |
| **Contraseña FTP** | La contraseña que asignaste |

> ⚠️ **Importante**: La carpeta destino en el servidor es `public_html/`. El workflow ya está configurado para apuntar ahí.

---

## 🔑 PASO 2 — Agregar los secretos en GitHub

Los secretos permiten que el workflow use tus credenciales FTP sin exponerlas en el código.

1. Ve a tu repositorio en GitHub: `https://github.com/Jdtr03/clicl`
2. Haz clic en **Settings** (pestaña superior derecha)
3. En el menú izquierdo: **Secrets and variables** → **Actions**
4. Haz clic en el botón verde **"New repository secret"**
5. Crea los siguientes **3 secretos** uno por uno:

---

### Secreto 1 — FTP_HOST
- **Name**: `FTP_HOST`
- **Secret**: el host FTP de Hostinger (ej: `ftp.tudominio.com`)
- Clic en **"Add secret"**

### Secreto 2 — FTP_USERNAME
- **Name**: `FTP_USERNAME`
- **Secret**: tu usuario FTP
- Clic en **"Add secret"**

### Secreto 3 — FTP_PASSWORD
- **Name**: `FTP_PASSWORD`
- **Secret**: tu contraseña FTP
- Clic en **"Add secret"**

Al terminar deberías ver los 3 secretos listados:

```
FTP_HOST        ✅
FTP_USERNAME    ✅
FTP_PASSWORD    ✅
```

---

## ▶️ PASO 3 — Activar el primer deploy

Una vez configurados los secretos, el workflow se activa automáticamente con cada `git push` al branch `master`.

Para forzar el primer deploy **sin hacer cambios al código**:

```bash
# Opción A: Hacer un commit vacío para triggear el workflow
git commit --allow-empty -m "ci: trigger primer deploy a Hostinger"
git push
```

O si ya tienes cambios pendientes:

```bash
git add .
git commit -m "tu mensaje"
git push
```

---

## 📊 PASO 4 — Verificar que el deploy fue exitoso

1. Ve a tu repositorio en GitHub
2. Haz clic en la pestaña **"Actions"**
3. Verás el workflow **"🚀 Deploy a Hostinger"** corriendo
4. Si el ícono es ✅ verde → el deploy fue exitoso
5. Si es ❌ rojo → haz clic para ver el log de error

### Estados del workflow:

| Ícono | Significado |
|-------|-------------|
| 🟡 Amarillo | Corriendo (espera ~2-3 min) |
| ✅ Verde | Deploy exitoso |
| ❌ Rojo | Error (ver logs para diagnóstico) |

---

## 🌐 PASO 5 — Verificar el sitio en Hostinger

Una vez que el workflow esté ✅ verde:

1. Abre tu dominio en el navegador
2. Navega por las rutas del sitio (ej: `/creacion-contenido`, `/crecimiento-ads`)
3. Si las rutas cargan correctamente → **el `.htaccess` está funcionando bien**

---

## 🔧 Solución de problemas comunes

### ❌ Error: "530 Login authentication failed"
- **Causa**: Credenciales FTP incorrectas
- **Solución**: Verifica los secretos `FTP_USERNAME` y `FTP_PASSWORD` en GitHub Settings

### ❌ Error: "Could not connect to server"
- **Causa**: Host FTP incorrecto
- **Solución**: Verifica el valor de `FTP_HOST` (debe ser algo como `ftp.tudominio.com`, no la URL del sitio)

### ❌ El sitio carga pero las rutas dan error 404
- **Causa**: El `.htaccess` no está en `public_html/`
- **Solución**: Verifica que el archivo `dist/.htaccess` se haya subido. Si no, ve al Administrador de Archivos de Hostinger y créalo manualmente con el contenido de `click-react/public/.htaccess`

### ❌ El workflow no se activa al hacer push
- **Causa**: El archivo del workflow tiene errores de sintaxis o no está en la rama correcta
- **Solución**: Verifica que el archivo `.github/workflows/deploy-hostinger.yml` exista en el repositorio

---

## 📁 Estructura del proyecto relevante

```
click/
├── .github/
│   └── workflows/
│       └── deploy-hostinger.yml   ← El automatizador
├── click-react/
│   ├── public/
│   │   └── .htaccess              ← Soporte para React Router en Apache
│   ├── src/                       ← Código fuente React
│   ├── dist/                      ← Build generado (NO se sube a Git)
│   └── package.json
└── DEPLOY_HOSTINGER.md            ← Esta guía
```

---

## 🔄 Flujo de trabajo diario (después de la configuración)

```bash
# 1. Haz tus cambios en el código
# 2. Commitea normalmente
git add .
git commit -m "feat: descripción de tus cambios"

# 3. Sube a GitHub → esto dispara el deploy automático
git push

# 4. Espera ~2-3 min y verifica en GitHub Actions ✅
# 5. Tu sitio en Hostinger ya está actualizado 🎉
```

---

*Guía generada para el proyecto Click Media — Deploy automatizado con GitHub Actions + FTP*
