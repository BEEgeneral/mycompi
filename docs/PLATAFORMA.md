# MyCompi — Documentación de Plataforma

> Última actualización: 2026-04-05

---

## 🏗️ Arquitectura General

```
Internet
  │
  ├── mycompi.com           → Cloudflare Pages (landing + admin + chat)
  │                              ├── /                → Landing pública
  │                              ├── /admin           → Panel admin (React)
  │                              └── /chat            → Panel chat (React)
  │
  ├── api.mycompi.com        → Cloudflare Worker (Hono) — PUERTO PRINCIPAL
  │                              └── 50+ endpoints API REST
  │
  └── api.mycompi.com (tunnel) → Backend Express.js en Render
                                   (acceso directo a BD Neon + lógica)
```

**Nota:** El Worker de Cloudflare y el backend de Render comparten la misma API en `api.mycompi.com`. El Worker actúa como gateway para rutas públicas; las rutas internas o que requieren acceso directo a BD se delegan al backend de Render via `fetch()` interno.

---

## ☁️ Cloudflare Worker (`mycompi-api`)

- **URL:** https://mycompi-api.beenocode.workers.dev
- **Dominio personalizado:** api.mycompi.com (Cloudflare proxy)
- **Wrangler config:** `workers/wrangler.toml`
- **Entry point:** `workers/src/index.ts`
- **Framework:** Hono.js
- **Secrets configurados (via `npx wrangler secret put`):**
  - `DATABASE_URL` — Connection string Neon PostgreSQL
  - `JWT_SECRET` — Para auth tokens
  - `JWT_REFRESH_SECRET` — Refresh tokens
  - `STRIPE_SECRET_KEY` — Pagos Stripe
  - `STRIPE_PUBLISHABLE_KEY` — Lado cliente
  - `STRIPE_WEBHOOK_SECRET` — Webhooks Stripe
  - `RESEND_API_KEY` — Envío de emails
  - `MINIMAX_API_KEY` — API MiniMax (Enzo coding)
  - `AGENT_API_KEY` — Auth entre agentes
  - `OWNER_KEY` — Clave de propietario
  - `RENDER_BACKEND_URL` — URL del backend Render (para proxys)

### ⚠️ Limitación Neon + Cloudflare Edge

**Problema:** Neon PostgreSQL bloquea conexiones entrantes desde Cloudflare Workers (IP blocklist en el tier de plan gratuito). Prisma v6 no puede ejecutar queries directamente desde el edge runtime sin Prisma Accelerate o driver adapters compatibles.

**Estado actual:**
- `/api/admin/metrics/business` ✅ — funciona via proxy fetch() al backend Render
- `/debug/prisma` ❌ — falla (Prisma sin driver adapter en edge)
- Routes que requieren BD directa: usan `fetch()` al backend Render como workaround

**Solución futura可能的:** Migrar a Supabase/Railway/Turso (sin blocklist en edge) o activar Prisma Accelerate.

### Routers disponibles

| Router | Archivo | Descripción |
|--------|---------|-------------|
| auth | `routes/auth.ts` | Login, registro, refresh tokens |
| agentes | `routes/agentes.ts` | CRUD de agentes (nombre, email, activo) |
| trabajos | `routes/trabajos.ts` | Gestión de trabajos con approval gates |
| approvals | `routes/approvals.ts` | Sistema de aprobaciones cliente |
| audit | `routes/audit.ts` | Logging de acciones y auditoría |
| pagos | `routes/pagos.ts` | Gestión de planes y suscripciones |
| notificaciones | `routes/notificaciones.ts` | Sistema de notificaciones |
| admin-metrics | `routes/admin-metrics.ts` | Métricas de negocio (proxy a Render) |
| stripe-webhook | `routes/stripe-webhook.ts` | Webhooks de Stripe |
| stripe-config | `routes/stripe-config.ts` | Configuración Stripe pública |
| chat | `routes/chat.ts` | Chat interactivo |
| debug | `routes/debug.ts` | Endpoints de diagnóstico |

---

## 🚀 Backend Express (Render)

- **URL:** https://mycompi.onrender.com
- **Servicio:** srv-d6up1mvfte5s73df21k0
- **Puerto:** 3000
- **Stack:** Express.js + Prisma 6.19.2 + Neon PostgreSQL
- **Carpeta:** `mycompi/src/`
- **Deploy:** Render auto-deploy desde git

### Variables de entorno (Render)

```
DATABASE_URL=postgresql://...@ep-mute-mud-agxfgf1q.../mycompi?sslmode=require
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://mycompi.com
RESEND_API_KEY=re_...
AGENT_API_KEY=<secret>
OPENCLAW_URL=https://openclaw-19kq.srv1493128.hstgr.cloud
OPENCLAW_TOKEN=<token>
```

### Endpoints principales

- `GET /api/admin/metrics/business` — Métricas de negocio (funciona 100%)
- `POST /api/auth/login` — Login
- `GET /api/agentes` — Lista agentes
- `POST /api/trabajos` — Crear trabajo
- `GET /api/notificaciones/interna` — Notificaciones internas
- `POST /api/audit/log` — Logging de auditoría

### Cron jobs en Render

| Job | Schedule | Script |
|-----|----------|--------|
| `compi-budget-alerts` | Cada hora | Budget alerts por agente |
| `compi-reset-mensual-tokens` | Día 1, 00:05 | Resetea tokens mensuales |
| `paco-morning-briefing` | 8h España | Briefing matutino director |

---

## 🗄️ Base de Datos (Neon PostgreSQL)

- **Plan:** Gratuito (Free Tier)
- **Endpoint:** `ep-mute-mud-agxfgf1q-pooler.c-2.eu-central-1.aws.neon.tech`
- **Base:** `mycompi`
- **Schema:** Prisma con las siguientes tablas principales:

### Tablas

- `Cliente` — Usuarios (AlberBEE + clientes de prueba)
- `Agente` — Los 7 Compis (Laura, Enzo, Carlos, Elena, Diana, Marcos, Valeria)
- `Trabajo` — Jobs con parentId, approval gates, budget tracking
- `AuditLog` — Log de acciones (CRUD, logins, errores)
- `TokenUsage` — Uso de tokens por agente
- `Notificacion` — Notificaciones push/email
- `Plan` — 3 planes: BASICO, PRO, EMPRESA
- `Suscripcion` — Suscripciones Stripe activas
- `ActivacionToken` — Tokens de activación cuenta

### Índices creados (2026-04-01)

```sql
CREATE INDEX AuditLog_clienteId ON "AuditLog"("clienteId");
CREATE INDEX AuditLog_agenteId ON "AuditLog"("agenteId");
CREATE INDEX AuditLog_accion ON "AuditLog"("accion");
CREATE INDEX AuditLog_creadoAt ON "AuditLog"("creadoAt");
CREATE INDEX TokenUsage_agenteId ON "TokenUsage"("agenteId");
CREATE INDEX TokenUsage_fecha ON "TokenUsage"("fecha");
CREATE INDEX TokenUsage_tipo ON "TokenUsage"("tipo");
```

### Budget tokens (FASE 2)

- `Agente.budgetTokensMes` — Límite mensual por agente (default 1M)
- `Agente.alertaPorcentaje` — Threshold de alerta (default 80%)
- `Agente.tokensUsadosMes` — Contador actual
- `Agente.ultimoResetTokens` — Fecha último reseteo

---

## 🌐 Landing y Paneles (Cloudflare Pages)

- **Landing:** https://mycompi.com (Cloudflare Pages, `landing/`)
- **Admin:** https://mycompi.com/admin (`admin-panel/build/`)
- **Chat:** https://mycompi.com/chat (`chat-panel/build/`)

### Stack frontend

- React 18 + Vite
- Tailwind CSS (CDN en landing)
- React Router v6
- API calls a `api.mycompi.com`

---

## 📡 OpenClaw Gateway

- **URL:** https://openclaw-19kq.srv1493128.hstgr.cloud
- **Token:** `Hw1BsofO0vUnuw1GoAKds5jOaQ42j6t2`
- **Agent ID:** main
- **Canal:** Hostinger VPS + tunnel Cloudflare
- **Sesiones:** Aisladas para heartbeats

### Heartbeats activos

| Job | Schedule | Agente |
|-----|----------|--------|
| `laura-heartbeat-20min` | :20, :40 | Laura |
| `enzo-heartbeat-30min` | :10, :40 | Enzo |
| `carlos-heartbeat-25min` | :05, :30, :55 | Carlos |
| `elena-heartbeat-30min` | :15, :45 | Elena |
| `diana-heartbeat-1h` | :30 | Diana |
| `marcos-heartbeat-1h` | :30 | Marcos |
| `valeria-heartbeat-30min` | :15, :45 | Valeria |
| `heartbeat-sync-notifications` | Cada hora | Notifications |
| `paco-morning-briefing` | 8h España | Director |
| `compi-backup-gitpush` | 8h, 20h KL | Backup |
| `agents-weekly-self-improve` | Dom 23h España | Automejora |
| `team-weekly-strategy-sync` | Dom 22h España | Estrategia |

---

## 📧 Email (Resend)

- **API Key:** `re_TRtcXVky_54TGjwu7juDeY9cbQFCW2Ahj`
- **Dominio:** mycompi.com (verificado en Resend)
- **Inbound:** info@mycompi.com → Cloudflare Email Routing → beenocode@gmail.com
- **Sending activo:** ✅ (todos los agentes pueden enviar)

---

## 💳 Pagos (Stripe)

- **Modo:** Test + Live (configurable por key)
- **Planes en BD:**
  - BASICO: €19/mes
  - PRO: €49/mes  
  - EMPRESA: €99/mes
- **Landing muestra:** €49/mes (plan único)
- **Webhook endpoint:** `POST /api/stripe/webhook`

---

## 📁 Archivos del proyecto

```
mycompi/
├── README.md              # README principal
├── SPEC.md                # Especificaciones técnicas
├── docs/
│   └── PLATAFORMA.md      # Este archivo
├── landing/               # Landing page (Cloudflare Pages)
├── admin-panel/           # Panel admin (React build → public/admin/)
├── chat-panel/            # Panel chat (React build → public/chat/)
├── workers/               # Cloudflare Worker API
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts       # Entry point Hono
│   │   ├── lib/prisma.ts  # Prisma client
│   │   └── routes/        # 13 routers
│   └── package.json
├── src/                   # Backend Express.js (Render)
│   ├── index.js           # Server Express
│   ├── routes/            # Routes Express
│   └── ...
├── prisma/
│   ├── schema.prisma      # Schema completo
│   └── migrations/        # Migraciones aplicadas
├── shared/                # Archivos compartidos entre agentes
│   ├── strategy-proposals.md
│   ├── sprint-backlog.md
│   ├── weekly-report.md
│   └── quality-standards.md
├── agents/                # Docs e instrucciones de agentes
├── scripts/               # Scripts de cron y utilities
├── public/                # Build outputs (admin, chat)
├── render.yaml            # Deploy config Render
└── paperclip-*.json       # Config Paperclip por agente
```

---

## 🔴 Incidencias conocidas

| Fecha | Incidencia | Estado |
|-------|-----------|--------|
| 2026-04-02 | Landing mycompi.com sin respuesta (DNS/hosting) | ⚠️ Pendiente |
| 2026-04-05 | Prisma+Neon no funciona en Cloudflare Edge | ⚠️ Workaround activo |
| 2026-04-02 | Backup desactualizado desde 26/mar | ⚠️ Pendiente |
| 2026-04-01 | OPENCLAW_TOKEN no configurado en Render | ⚠️ Pendiente |

---

## 🆕 Implementado recientemente (2026-04-02 a 2026-04-05)

- ✅ Landing rediseñada con paleta #2D3261/#D1E0F3/#FFD154
- ✅ Precio único €49/mes en toda la landing
- ✅ 7 Compis vs ~10.300€/mes empleados tradicionales (comparativa)
- ✅ 4 páginas legales con CIF B60604238
- ✅ BusinessMetricsTab con ROI card y agent activity grid
- ✅ Endpoint GET /api/admin/metrics/business (datos reales Neon)
- ✅ Email domain mycompi.com verificado en Resend
- ✅ Cloudflare Worker deployado y operativo
- ✅ Proxy admin-metrics → Render (workaround Neon edge blocklist)

---

*Documento mantenido por Compi. Actualizar tras cada cambio significativo de infraestructura.*
