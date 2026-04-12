# Incidencias — MyCompi / BeeNoCode

> Registro de incidencias operacionales. Cada incidencia documentada: qué pasó, cuándo, cómo se resolvió, y cómo prevenirla.
> Meta: detectar patrones (misma incidencia >3 veces = automatización potencial).

---

## 📋 Plantilla estándar

```
### [YYYY-MM-DD] — [Título breve]

**Severidad:** 🟢 Baja / 🟡 Media / 🔴 Alta
**Detectada por:** [agente/sistema]
**Afecta:** [cliente/sistema/proceso]
**Estado:** 🔍 Abierta / ✅ Resuelta / ⚠️ Monitorizando

**Descripción:**
[Qué pasó]

**Root cause:**
[Por qué pasó]

**Resolución:**
[Cómo se resolvió]

**Prevención:**
[Cómo evitar que se repita]
```

---

## 🔍 Incidencias registradas

---

### 2026-04-03 — Script laura_feedback.js falla con error de schema

**Severidad:** 🟡 Media
**Detectada por:** Marcos (heartbeat 2026-04-03 20:37 UTC)
**Afecta:** Scripts de análisis de feedback en /data/.openclaw/workspace/mycompi/
**Estado:** 🔍 Abierta

**Descripción:**
El script `laura_feedback.js` falla al ejecutarse con el error: `PrismaClientKnownRequestError: The column 'Trabajo.ejecutor' does not exist in the current database.`. El script intenta hacer `prisma.trabajo.update()` con un campo `ejecutor` que no existe en el schema de la BD Neon.

**Root cause:**
El schema de Prisma no está sincronizado con la BD real. El campo `ejecutor` fue eliminado o nunca existió en la BD, pero el script lo referencia.

**Resolución:**
Pendiente — se necesita revisar el schema de Prisma (`schema.prisma`) y el estado actual de la BD para determinar si el campo debe existir o si el script debe usar otro campo.

**Prevención:**
Antes de ejecutar scripts que modifican datos, verificar que el schema de Prisma coincide con la BD usando `npx prisma validate` y `npx prisma db pull`.

---

### 2026-04-03 — Web MyCompi returning 404 en todos los endpoints

**Severidad:** 🔴 Alta
**Detectada por:** Marcos (heartbeat 2026-04-03 06:35 UTC)
**Afecta:** https://srv-d6up1mvfte5s73df21k0.onrender.com (producción)
**Estado:** ⚠️ Monitorizando

**Descripción:**
La web de producción de MyCompi/BeeNoCode devuelve HTTP 404 en todos los endpoints, incluyendo `/health`. El hosting es Render (Frankfurt). El SSL sigue vigente.

**Root cause:**
El dominio antiguo `srv-d6up1mvfte5s73df21k0.onrender.com` ya no está en uso. MyCompi ahora usa `mycompi.com` que apunta correctamente al landing page en `/public`.

**Resolución:**
Verificado 2026-04-03 10:36 UTC — mycompi.com responde 200 OK con el landing page correcto. El subdomain antiguo de Render no se usa.

**⚠️ REAPERTURA 2026-04-03 22:32 UTC:**
Sitio vuelve a estar caído. mycompi.com → HTTP 404. mycompi.onrender.com → sin respuesta (timeout). Mismo patrón que la incidencia original. Problema no resuelto definitivamente. Posible root cause: static middleware de Express no sirve archivos desde /public en producción. Necesita revisión de cómo se hace el chdir() o app.use(express.static()) en src/index.js.

**Prevención:**
Revisar configuración de Express static middleware y paths en producción.

---

### 2026-04-03 — Site DOWN persistente (reapertura)

**Severidad:** 🔴 Alta
**Detectada por:** Marcos (heartbeat 2026-04-03 22:32 UTC)
**Afecta:** https://mycompi.com y https://mycompi.onrender.com
**Estado:** 🔍 Abierta — FIX APLICADO, pendiente deploy manual

**Descripción:**
Tras aparente resolución parcial (mycompi.com respondía 200 brevemente), el sitio vuelve a estar caído. mycompi.com → HTTP 404. mycompi.onrender.com → curl timeout. Express responde HTTP (código 404) pero no sirve contenido estático.

**Root cause (confirmado):**
Express static middleware usa path relativo `'public'` en `express.static('public')` y `sendFile('index.html', { root: 'public' })`. En producción, Render puede usar un CWD diferente al esperado, causando que los archivos estáticos no se encuentren.

**Fix aplicado (2026-04-04 07:35 UTC):**
```javascript
// ANTES (problemático):
app.use(express.static('public'));
res.sendFile('index.html', { root: 'public' });

// DESPUÉS (correcto):
app.use(express.static(path.join(__dirname, '../public')));
res.sendFile('index.html', { root: path.join(__dirname, '../public') });
```
Commit: `a4ead9a` en branch `main` de https://github.com/BEEgeneral/mycompi

**Resolución:**
⚠️ Necesario deploy manual en Render Dashboard — trigger automático de Git no funciona (API retorna 400). El fix está en GitHub listo para desplegar.

**Prevención:**
No usar paths relativos para serve estático. Usar siempre `path.join(__dirname, '../public')`.

---

### [2026-04-04] — HTTPS caído en mycompi.es

**Severidad:** 🟡 Media
**Detectada por:** Marcos (heartbeat)
**Afecta:** SEO, confianza de usuarios, accesibilidad
**Estado:** 🔍 Abierta

**Descripción:**
El dominio mycompi.es responde correctamente por HTTP (200 OK) pero HTTPS falla — SSL handshake no completa. El certificado SSL existe y es válido según verificación con openssl, pero el servidor no responde correctamente en puerto 443.

**Root cause:**
No determinado aún. Possible: (1) servicio HTTPS en Render no configurado o caído, (2) Cloudflare/proxy no configurado para HTTPS, (3) firewall bloqueando 443.

**Resolución:**
Pendiente — incidencia en curso.

**Prevención:**
Monitorización activa de SSL con UptimeRobot. Alerts automáticas si HTTPS cae de nuevo.
