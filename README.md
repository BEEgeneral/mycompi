# MyCompi

Plataforma SaaS de equipos de agentes IA para PYMES españolas.

**Web:** https://mycompi.onrender.com

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Express.js + Prisma ORM |
| Base de datos | PostgreSQL (Neon) |
| Landing / Auth | React + Vite + Tailwind CDN |
| Admin panel | React + Vite (builds to `public/admin/`) |
| Chat panel | React + Vite (builds to `public/chat/`) |
| Email | Resend API |
| Pagos | Stripe |
| Web scraping | Firecrawl API |
| Deploy | Render |

## Arquitectura

```
Cliente paga en landing → Stripe webhook → crea cuenta → email bienvenida
                                                    ↓
                                    Cliente activa cuenta + entra al dashboard
                                                    ↓
                              Chat con Paco ← Orquestador (OpenClaw)
                                   ↕
                    ┌──────────────┼──────────────┐
                    ↓              ↓              ↓
               Laura          Enzo           Carlos
           (Atención          (Marketing)      (Ventas)
            Cliente)
                    ↕              ↕              ↕
                 Elena          Diana          Marcos
              (Operaciones)     (Data)      (Desarrollo)
```

## Planes

| Plan | Precio | Agentes |
|------|--------|---------|
| Básico | €10/mes | Laura (Atención Cliente) |
| Equipo | €49/mes | Laura + Enzo + Carlos + orquestador |
| Dirección | €147/mes | 6 agentes + orquestador + director |

## Estructura del proyecto

```
mycompi/
├── src/
│   ├── index.js              # Entry point Express
│   ├── routes/
│   │   ├── auth.js           # Login, register, activate, recover, refresh token
│   │   ├── stripe.js         # Checkout, webhook (3 eventos), portal
│   │   ├── email.js          # Inbound email webhook (Resend) + procesamiento IA
│   │   ├── chat.js           # Chat cliente ↔ Paco (OpenClaw)
│   │   ├── notificaciones.js # Notificaciones proactivas a clientes
│   │   ├── digest.js         # Daily digest emails (Harvard 5PM + morning briefing)
│   │   ├── admin.js          # Admin API (métricas, agentes, notificaciones owner)
│   │   └── cola.js           # Cola de tareas asíncronas
│   ├── services/
│   │   ├── agentLoader.js    # Carga dinámica de agentes desde /agents
│   │   ├── digestService.js  # Generador de digest estructurado
│   │   └── toolRegistry.js  # Registry de herramientas (Firecrawl, etc.)
│   └── lib/
│       └── db.js             # Prisma client singleton
├── agents/                    # Agentes (SOUL.md, IDENTITY.md, SKILL.md, HEARTBEAT.md)
│   ├── paco/                 # Orquestador — chat directo con cliente
│   ├── laura/                # Atención al Cliente — 24/7, heartbeat 20min
│   ├── enzo/                 # Marketing — campaigns, SEO, contenido, heartbeat 30min
│   ├── carlos/               # Ventas — leads, cierre, enrichment, heartbeat 25min
│   ├── elena/                # Operaciones — automatizaciones, procesos
│   ├── diana/                # Data — métricas, reporting
│   ├── marcos/               # Desarrollo — web, e-commerce
│   ├── pelayo/               # Asistente personal de Alberto
│   └── policia-tokens/       # Auditor de gasto IA
├── landing/                   # Landing page pública (React + Vite)
├── admin-panel/               # Panel admin para Alberto (React + Vite)
├── chat-panel/                # Dashboard chat del cliente (React + Vite)
├── prisma/
│   └── schema.prisma          # Modelos: Cliente, Usuario, Agente, Pago, Notificacion, etc.
└── public/                    # Build output static
    ├── index.html             # Landing
    ├── admin/                  # Admin panel
    └── chat/                   # Chat panel
```

## Modelos de base de datos

```
Cliente             — empresa con plan, stripeCustomerId, activo, timezone
Usuario             — users por cliente (email, passwordHash, rol)
Agente             — agentes activos por cliente
Trabajo            — tareas en cola
Pago               — historial de pagos Stripe
Notificacion       — notificaciones proactivas (clienteId, agenteId, tipo, titulo, contenido)
InteraccionChat    — aprendizaje del chat cliente-Paco
Email              — emails recibidos/enviados con estado
Mensaje            — mensajes internos entre agentes
```

## Agentes — Heartbeats

Los heartbeats son trabajos cron que despiertan a los agentes periódicamente:

| Agente | Schedule | Estado |
|--------|----------|--------|
| Laura (Atención Cliente) | Cada 20 min | ✅ Activo |
| Enzo (Marketing) | Cada 30 min | ✅ Activo |
| Carlos (Ventas) | Cada 25 min | ✅ Activo (timeout 180s) |

Ver jobs activos: `openclaw cron list`

## Onboarding de un cliente nuevo

1. Cliente pulsa "Contratar" en landing → Checkout Stripe
2. Stripe webhook `checkout.session.completed` → crea Cliente + Usuario en BD
3. Stripe envía email de bienvenida con link de activación (`/activar?token=...`)
4. Cliente activa cuenta, setea contraseña → accede a dashboard
5. Dashboard: Chat con Paco + acceso a agentes según plan

## Email transaccional

| Trigger | From | Asunto |
|---------|------|--------|
| Post-pago (nuevo cliente) | noreply@mycompi.com | "¡Bienvenido a MyCompi! Activa tu cuenta →" |
| Cancelación suscripción | noreply@mycompi.com | "Tu suscripción en MyCompi ha sido cancelada" |
| Pago fallido | noreply@mycompi.com | "Aviso — Pago fallido en MyCompi" |
| Inbound email | paco@mycompi.com | Respuesta de Paco |
| Digest 5PM | paco@mycompi.com | Resumen diario de actividad |
| Morning briefing | paco@mycompi.com | Briefing matutino |

## Inbound email (Resend webhook)

`POST /api/email/inbound` — Recibe emails de clientes, los procesa con sanitización anti-prompt-injection, y responde como Paco.

## API Endpoints principales

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar nuevo cliente |
| POST | `/api/auth/login` | No | Login (devuelve access + refresh token) |
| POST | `/api/auth/refresh` | No | Refrescar access token |
| GET | `/api/auth/me` | Bearer | Usuario actual |
| POST | `/api/auth/activar` | No | Activar cuenta con token |
| POST | `/api/auth/forgot-password` | No | Solicitar reset contraseña |
| POST | `/api/auth/reset-password` | No | Resetear con token |

### Stripe
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/stripe/config` | No | Public key Stripe |
| POST | `/api/stripe/create-checkout` | Bearer | Crear sesión de pago |
| GET | `/api/stripe/subscription` | Bearer | Estado suscripción |
| POST | `/api/stripe/cancel` | Bearer | Cancelar suscripción |
| POST | `/api/stripe/portal` | Bearer | Abrir portal Stripe |
| POST | `/api/stripe/webhook` | Stripe sig | Webhook (raw body) |

### Chat
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/chat` | Bearer | Historial de chat |
| POST | `/api/chat` | Bearer | Enviar mensaje (Paco/OpenClaw) |

### Notificaciones
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/notificaciones` | Bearer | Listar notificaciones del cliente |
| GET | `/api/notificaciones/no-leidas` | Bearer | Contar no leídas |
| PATCH | `/api/notificaciones/:id/leida` | Bearer | Marcar como leída |

### Admin (Alberto)
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/admin/notificaciones` | Owner | Todas las notificaciones |
| PATCH | `/api/admin/notificaciones/:id/leida` | Owner | Marcar leída |
| POST | `/api/admin/notificaciones/marcar-todas-leidas` | Owner | Marcar todas leídas |
| GET | `/api/admin/metrics/dashboard` | Owner | Métricas de gasto |

## Variables de entorno

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
OPENCLAW_URL=http://localhost:18789
OPENCLAW_TOKEN=...
FIRECRAP_API_KEY=fc_...
FRONTEND_URL=https://mycompi.onrender.com
PORT=3000
```

## Comandos

```bash
npm install              # Instalar dependencias
npm run dev             # Desarrollo (puerto 3000, --watch)
npm run build           # Build landing + admin + chat
npm run build:landing   # Solo landing
npm run build:admin     # Solo admin
npm run build:chat      # Solo chat
npx prisma migrate dev # Migrar BD (desarrollo)
npx prisma migrate deploy # Migrar BD (producción)
npx prisma generate     # Generar cliente Prisma
```

## Deployment

- **Render**: `render.yaml` define el servicio web
- Build command: `npm install && npx prisma migrate deploy && npm run build && npx prisma generate`
- Start command: `node src/index.js`
- Static files servidos por Express desde `public/`
- Admin en `/admin/`, chat en `/chat/`, landing en `/`

## Seguridad

- **Prompt injection emails**: Input sanitizado antes de construir prompts (límite 8000 chars, escape triple backtick, elimina script/event handlers)
- **JWT**: Access token (15min) + Refresh token (7 días) con rotación
- **Stripe webhook**: Verificado con signature
- **Password**: Hash con bcrypt, nunca se guarda en texto plano
- **CORS**: Configurado para frontend en producción

## Backup

Backup completo en: `/data/backups/backup_2026-03-29_04-46/`
Git bundle: `mycompi_88aabbe.bundle`

## Pendiente

- [ ] Test end-to-end email bienvenida post-pago (requiere Stripe CLI)
- [ ] Frontend: sidebar + ActividadTab en chat-panel (notificaciones proactivas para cliente)
- [ ] Verificar que inbound email de Resend funciona correctamente (test manual)
