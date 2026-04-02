# 🏗️ Stack Tecnológico — MyCompi

## Arquitectura General

```
[Usuario] 
    │
    ├─→ [Landing: mycompi.com] (React + Vite → Render CDN)
    ├─→ [Dashboard Admin: mycompi.com/admin] (React + Vite → Render CDN)
    └─→ [Chat Panel: mycompi.com/chat] (React + Vite → Render CDN)
              │
              │ HTTPS (Stripe webhook)
              ▼
    [Backend: Render] Express.js :3000
              │
    ┌─────────┼──────────────────────────────────┐
    │         │                                  │
    ▼         ▼                                  ▼
[Neon DB]  [OpenClaw Gateway]              [Stripe]
PostgreSQL  (VPS Hostinger)                  Pagos
sslmode    puerto 18789
              │
         [Compis Agents]
         (Laura, Enzo, Carlos,
          Elena, Diana, Marcos, 
          Valeria, Paco)
              │
              ▼
         [Resend API]
         Emails transaccionales
              │
              ▼
         [Amazon SES / Cloudflare Email]
         Email inbound @mycompi.com
```

---

## 🖥️ Frontend (3 apps React)

### Landing — `mycompi.com`
- **Stack:** React 18 + Vite 5, Tailwind CDN
- **Hosting:** Render (publicada en `public/`)
- **Build output:** `dist/` sirve archivos estáticos
- **Funcion:** Landing comercial, pricing, comparativa, FAQ
- **Fuente datos:** Solo contenido estático (pricing, agentes, FAQs)

### Admin Panel — `mycompi.com/admin`
- **Stack:** React + Vite, mismo repo
- **Hosting:** Misma build en `public/admin/`
- **Funcion:** Dashboard para clientes — gestionar agentes, trabajos, aprobaciones, costes
- **Auth:** JWT (almacenado en localStorage, enviado como `Authorization: Bearer <token>`)

### Chat Panel — `mycompi.com/chat`
- **Stack:** React + Vite, mismo repo
- **Hosting:** Misma build en `public/chat/`
- **Funcion:** Chat directo con el equipo de Compis
- **Auth:** JWT + `clienteId` del usuario

---

## ⚙️ Backend — Render (Express.js)

**URL producción:** `https://srv-d6up1mvfte5s73df21k0.onrender.com`  
**Puerto:** 3000  
**Fichero inicio:** `src/index.js`

### Routing principal (`src/routes/`)

| Ruta | Función |
|------|---------|
| `/api/auth/*` | Login, registro, refresh tokens |
| `/api/clientes/*` | CRUD clientes |
| `/api/agentes/*` | Gestión de agentes |
| `/api/trabajos/*` | Jobs / tareas con jerarquía padre/hijo |
| `/api/trabajos/:id/aprobar` | Approval gate (cliente aprueba job CRITICA) |
| `/api/trabajos/:id/rechazar` | Rechazar job |
| `/api/audit` | Registro de acciones (audit log) |
| `/api/audit/tokens` | Coste por agente |
| `/api/notificaciones` | Notificaciones proactivas al dashboard |
| `/api/notificaciones/interna` | Endpoint interno para scripts |
| `/api/email/*` | Sistema email (Paco como Orchestrator) |
| `/api/email/bandeja` | Bandeja de entrada admin |
| `/api/email/inbound` | Webhook de Resend (email recibido) |
| `/api/stripe/*` | Webhooks de pago, creación de sesiones |
| `/api/chat/*` | Chat con OpenClaw (pasa mensaje a Gateway) |
| `/api/onboarding-sequence/*` | Secuencia de onboarding |

### Middleware clave

- `authMiddleware` — valida JWT, injecta `req.clienteId` y `req.usuario`
- `rateLimiter` — protección DDoS (en `src/lib/rateLimiter.js`)
- `stripeWebhook` — raw body para verificar firma de Stripe

### Servicios (`src/services/`)

| Servicio | Qué hace |
|----------|---------|
| `agentLoader.js` | Carga config de agentes, los activa/desactiva |
| `agentWorker.js` | Ejecuta trabajos (llama a OpenClaw con prompt del agente) |
| `digestService.js` | Genera resúmenes semanales de actividad |
| `tokenController.js` | Controla budget tokens por agente |
| `toolRegistry.js` | Registry de tools disponibles para cada agente |
| `tareas.js` | Lógica de categorización y priorización de tareas |

---

## 🧠 OpenClaw Gateway (VPS Hostinger)

**URL:** `https://openclaw-19kq.srv1493128.hstgr.cloud`  
**Puerto:** 18789  
**Token:** `Hw1BsofO0vUnuw1GoAKds5jOaQ42j6t2`

### Función
Motor de agentes IA. Cada agente (Laura, Enzo, etc.) es un **cron job** que llama a OpenClaw con un prompt especializado y `clienteId` para que actúe en nombre del cliente.

### Comunicación Backend ↔ OpenClaw

```
Backend (Render)                    OpenClaw (Hostinger VPS)
      │                                      │
      │  POST /api/chat                      │
      │  Body: {                             │
      │    message: "...",                   │
      │    agenteId: "enzo",─────────────────────────→ Agente Enzo
      │    clienteId: "cmn3je5zq..."          │       (MiniMax M2.7)
      │  }                                   │       │
      │                                      │       │
      │  ←─── Respuesta del agente ──────────┘       │
      │
```

**Timeout:** 25 segundos por defecto (configurable por job)

### Agentes activos

| Agente | Specialty | Cron heartbeat |
|--------|-----------|----------------|
| Laura | Customer Success / Onboarding | cada 20min |
| Enzo | Coding / Development | cada 30min |
| Carlos | Sales / Marketing | cada 25min |
| Elena | Research / Data | cada 30min |
| Diana | Content / Writing | cada 60min |
| Marcos | Operations / Support | cada 60min |
| Valeria | Quality Assurance | cada 30min |
| Paco | Orchestrator / Email |email inbound |

---

## 🗄️ Base de Datos — Neon PostgreSQL

**Connection string:** `postgresql://neondb_owner:npg_xxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require`

- **ORM:** Prisma 6.x (`prisma.config.ts`)
- **Migraciones:** `npx prisma migrate deploy` (ejecuta en cada deploy via `render.yaml`)
- **Pool:** Neon usa connection pooler (puerto 5432)

### Tablas principales

```
Cliente ───1:N─── Usuario
  │
  ├─1:N─── Agente (config por cliente)
  ├─1:N─── Trabajo (jobs/hijos)
  ├─1:N─── Pago
  ├─1:N─── Email
  ├─1:N─── Notificacion
  ├─1:N─── Documento
  ├─1:N─── InteraccionChat
  └─1:1─── OnboardingSequence

Agente ───N:1─── Cliente
  │
  └─1:N─── Trabajo

Trabajo ──self─── parentId (jerarquía padre/hijo)
  │
  └─Flag: requiereAprobacion (boolean) → approval gate
```

### Índices creados (2026-04-01)
- `AuditLog`: `(clienteId, createdAt)`, `(agenteId, createdAt)`, `(tipoAccion)`, `(trabajoId)`
- `TokenUsage`: `(agenteId, fecha)`, `(clienteId, fecha)`, `(agenteId, tipo)`

---

## 💳 Pagos — Stripe

**Flujo:**
1. Cliente selecciona plan → `POST /api/stripe/crear-sesion`
2. Stripe Checkout redirige a Stripe-hosted page
3. Pago exitoso → Stripe webhook → `POST /api/stripe/webhook`
4. Webhook crea/actualiza `Cliente` + `Pago` en BD
5. Activate agentes para el cliente

**Planes en BD:**
- BASICO (sin agentes activos aún)
- PROFESIONAL (1 agente)
- EQUIPO (7 agentes — 49€/mes → el que se muestra en landing)

---

## 📧 Email — Resend + Cloudflare Email Routing

### Sending (emails salientes)
- **API:** Resend (`resend` npm package)
- **API Key:** `re_TRtcXVky_54TGjwu7juDeY9cbQFCW2Ahj`
- **Dominio verificado:** `mycompi.com` (EU-West-1)
- **Emails enviados:**
  - Bienvenida a nuevos usuarios
  - Notificaciones de trabajos completados
  - Respuestas de Paco (Orchestrator)

### Receiving (emails entrantes) — Configuración activa
- **MX:** `mycompi.com → feedback-smtp.eu-west-1.amazonses.com`
- **Recibido por:** Amazon SES → webhook → `POST /api/email/inbound`
- **Procesamiento:** Sanitización → prompt a Paco (OpenClaw) → respuesta guardada en BD → envío via Resend

### DNS en Cloudflare
```
A        mycompi.com        216.24.57.1  (→ Render)
MX       mycompi.com        feedback-smtp.eu-west-1.amazonses.com (10)
TXT      mycompi.com        v=spf1 ip4:75.102.58.50 +a +mx ...
TXT      _dmarc             v=DMARC1; p=none;
TXT      resend._domainkey  DKIM público de Resend
CNAME    www.mycompi.com    mycompi.onrender.com
```

---

## 🌐 DNS — Cloudflare + DonDominio

```
Registrador: DonDominio
  ↓ nameservers → Cloudflare (ns.cloudflare.com)
       ↓
  Zona: mycompi.com (Cloudflare)
       ├─ A / MX / TXT / CNAME → según sección anterior
       └─ Proxy: ON (Cloudflare CDN activo para mycompi.com)
```

- **Estado:** Nameservers actualizados ✅
- **CF Ray visible:** Sí (tráfico pasa por Cloudflare)
- **Propagación:** Completada ✅

---

## 🔐 Seguridad

### JWT Auth
- Access token: 15min expiry, almacenado en frontend (memory/variable idealmente)
- Refresh token: 7 días, httpOnly cookie
- Secrets: `JWT_SECRET` + `JWT_REFRESH_SECRET` en variables de entorno Render

### Rate Limiting
- Login: 5 intentos / 15 min por IP
- API general: 100 req/min por cliente
- Stripe webhook: sin límite (verificado por firma)

### Prompt Injection
- Sanitización de inputs en `email.js` (`sanitizarInputEmail`)
- Bloqueo de: null bytes, `<script>`, `javascript:`, inline event handlers
- Límite de longitud (8000 chars)
- Escape de triple backtick

### CSP Headers (en Render `render.yaml`)
```
default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.onrender.com
```

---

## 📁 Estructura de carpetas

```
mycompi/
├── src/
│   ├── index.js              # Entry point Express
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── agentes.js
│   │   ├── clientes.js
│   │   ├── trabajos.js
│   │   ├── email.js           # ← Sistema email + webhook inbound
│   │   ├── stripe.js
│   │   ├── chat.js
│   │   ├── audit.js
│   │   └── ...
│   ├── services/             # Lógica de negocio
│   │   ├── agentWorker.js     # ← Ejecuta trabajos con OpenClaw
│   │   ├── digestService.js
│   │   └── ...
│   └── lib/
│       ├── db.js             # Prisma client
│       └── ...
├── prisma/
│   └── schema.prisma
├── public/                   # Builds Vite
│   ├── index.html            # Landing
│   ├── admin/                # Admin panel
│   └── chat/                 # Chat panel
├── landing/                  # Fuente landing (Vite)
├── admin-panel/              # Fuente admin (Vite)
├── chat-panel/               # Fuente chat (Vite)
├── scripts/                  # Scripts standalone
│   ├── budget-alerts.js
│   ├── reset-mensual-tokens.js
│   └── heartbeat-notifications.js
└── shared/                   # Ficheros compartidos con OpenClaw
    ├── strategy-proposals.md
    ├── sprint-backlog.md
    └── weekly-report.md
```

---

## 🔄 Flujo típico: Cliente contrata → Compis se activan

```
1. Usuario → Stripe Checkout → Pago
2. Stripe webhook → /api/stripe/webhook
3. Backend → crea/activa Cliente + asigna Agentes en BD
4. Cron jobs (heartbeats) → OpenClaw → cada Compi trabaja
5. Resultados → /api/audit/log + /api/notificaciones
6. Cliente ve actividad en dashboard / recibe email de Paco
```

---

## 📊 Monitorización

- **Health check:** `GET /health` (Render)
- **Logs:** Render Dashboard → sección Logs
- **Errores:** `console.error` en backend → Render logs
- **Heartbeats:** OpenClaw jobs activos — si fallan, alerta en cron runs

---

## 🚀 Deploy

- **Plataforma:** Render (auto-deploy desde repo o manual)
- **Build:** `npm install && npx prisma generate && npm run build`
- **Start:** `npx prisma migrate deploy && node src/index.js`
- **Variables de entorno:** todas en Render Dashboard (DATABASE_URL, STRIPE_*, RESEND_API_KEY, OPENCLAW_URL, OPENCLAW_TOKEN, MINIMAX_API_KEY)

---

*Actualizado: 2026-04-02*
