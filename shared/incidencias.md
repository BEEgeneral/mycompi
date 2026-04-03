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
**Estado:** ✅ Resuelta

**Descripción:**
La web de producción de MyCompi/BeeNoCode devuelve HTTP 404 en todos los endpoints, incluyendo `/health`. El hosting es Render (Frankfurt). El SSL sigue vigente.

**Root cause:**
El dominio antiguo `srv-d6up1mvfte5s73df21k0.onrender.com` ya no está en uso. MyCompi ahora usa `mycompi.com` que apunta correctamente al landing page en `/public`.

**Resolución:**
Verificado 2026-04-03 10:36 UTC — mycompi.com responde 200 OK con el landing page correcto. El subdomain antiguo de Render no se usa.

**Prevención:**
No requiere acción — el subdomain antiguo no es parte del setup activo.
