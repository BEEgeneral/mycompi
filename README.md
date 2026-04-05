# MyCompi

Plataforma SaaS de equipos de Compis agénticos para PYMES españolas. Cada cliente tiene un equipo de profesionales especializados que trabajan 24/7 para su negocio.

**Web:** https://mycompi.onrender.com

## Producto

**Precio único: €49/mes** — todo incluido (7 Compis agénticos especializados + director)

Un solo plan. Sin contratos, sin permanencia, sin sorpresas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Express.js + Prisma 6.19.2 |
| Base de datos | PostgreSQL (Neon) |
| Landing / Auth | React + Vite + Tailwind CDN |
| Admin panel | React + Vite (builds to `public/admin/`) |
| Chat panel | React + Vite (builds to `public/chat/`) |
| Email | Resend API |
| Pagos | Stripe (3 planes: Básico/Equipo/Dirección — todos a 49€ en landing) |
| Web scraping | Firecrawl API |
| Deploy | Render (service: srv-d6up1mvfte5s73df21k0) |

## Arquitectura

```
Cliente paga en landing → Stripe webhook → crea cuenta → email bienvenida
                                                    ↓
                                    Cliente activa cuenta + entra al dashboard
                                                    ↓
                              Chat con Paco ← Orquestador (OpenClaw)
                                   ↕
        ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
        ↓          ↓          ↓          ↓          ↓          ↓          ↓
     Laura     Enzo     Carlos     Elena     Diana     Marcos    (director)
  (Atención   (Marketing) (Ventas) (Ops)    (Data)   (Desarrollo)
  Cliente)
```

## Los 7 Compis agénticos

| Compi | Rol | Qué hace |
|-------|-----|----------|
| 🎯 Paco | Director / Orquestador | Coordina el equipo, te reporta cada semana |
| 💬 Laura | Atención al Cliente | Responde 24/7, escala cuando es necesario, raccoge feedback |
| 📊 Enzo | Marketing | Contenido, ads, SEO — hace crecer tu visibilidad |
| 💼 Carlos | Ventas | Captación, qualification y cierre de leads |
| ⚙️ Elena | Operaciones | Automatizaciones y conexión de herramientas |
| 📈 Diana | Data | Métricas, dashboards, análisis de retención |
| 💻 Marcos | Desarrollo | Tu web, landing y e-commerce siempre actualizadas |

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
│   │   ├── digest.js         # Daily digest emails
│   │   ├── admin.js          # Admin API (métricas, agentes, notificaciones owner)
│   │   └── cola.js           # Cola de tareas asíncronas
│   ├── services/
│   │   ├── agentLoader.js    # Carga dinámica de agentes desde /agents
│   │   ├── digestService.js  # Generador de digest estructurado
│   │   └── toolRegistry.js   # Registry de herramientas (Firecrawl, etc.)
│   └── lib/
│       ├── db.js             # Prisma client singleton
│       └── activationTokens.json  # Tokens de activación (filesystem efímero — issue)
├── agents/                    # Agentes (SOUL.md, IDENTITY.md, SKILL.md, HEARTBEAT.md)
│   ├── paco/                 # Orquestador — chat directo con cliente
│   ├── laura/                # Atención al Cliente — heartbeat 20min
│   ├── enzo/                 # Marketing — heartbeat 30min
│   ├── carlos/               # Ventas — heartbeat 25min
│   ├── elena/                # Operaciones
│   ├── diana/                # Data
│   ├── marcos/               # Desarrollo
│   ├── pelayo/               # Asistente personal de Alberto
│   └── policia-tokens/       # Auditor de gasto IA
├── landing/                   # Landing page pública (React + Vite + Tailwind)
│   └── src/sections/
│       ├── Hero.jsx
│       ├── Stats.jsx
│       ├── Services.jsx
│       ├── Pricing.jsx       # Plan único 49€/mes
│       ├── TeamPresentation.jsx
│       ├── Comparativa.jsx   # 7 Compis vs ~10.300€/mes empleados
│       ├── FAQ.jsx            # Grid + filtro por categoría
│       └── ...
├── admin-panel/               # Panel admin para Alberto (React + Vite)
├── chat-panel/                # Dashboard chat del cliente (React + Vite)
├── prisma/
│   └── schema.prisma          # Modelos: Cliente, Usuario, Agente, Pago, Notificacion, etc.
└── public/                    # Build output static
```

## Onboarding de un cliente nuevo

1. Cliente pulsa "Contratar" en landing → Checkout Stripe
2. Stripe webhook `checkout.session.completed` → crea Cliente + Usuario en BD
3. Email bienvenida enviado via Resend (requiere `RESEND_API_KEY` configurado en Render)
4. Cliente activa cuenta con token → accede al dashboard
5. Dashboard: Chat con Paco + acceso a agentes según plan

## API Endpoints principales

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar nuevo cliente |
| POST | `/api/auth/login` | Login (access + refresh token) |
| POST | `/api/auth/refresh` | Refrescar access token |
| POST | `/api/auth/activar` | Activar cuenta con token |
| POST | `/api/auth/forgot-password` | Solicitar reset contraseña |

### Stripe
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/stripe/create-checkout` | Crear sesión de pago |
| POST | `/api/stripe/webhook` | Webhook (raw body, verificado) |

### Chat
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/chat` | Historial de chat con Paco |
| POST | `/api/chat` | Enviar mensaje a Paco |

## Variables de entorno (.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_TRtcXVky_54TGjwu7juDeY9cbQFCW2Ahj
OPENCLAW_URL=http://localhost:18789
OPENCLAW_TOKEN=...
FIRECRAP_API_KEY=fc-661a99cbd41648e99db5ec72d4d94d4a
FRONTEND_URL=https://mycompi.onrender.com
PORT=3000
```

## Comandos

```bash
npm install                 # Instalar dependencias
npm run dev                # Desarrollo (puerto 3000)
npm run build              # Build landing + admin + chat
npm run build:landing      # Solo landing
npx prisma migrate deploy  # Migrar BD (producción)
npx prisma generate        # Generar cliente Prisma
```

## Deployment

- **Render**: service `srv-d6up1mvfte5s73df21k0`
- Build command: `npm install && npm run build && npx prisma migrate deploy && npx prisma generate`
- Start command: `node src/index.js`
- Webhook Stripe: `https://mycompi.onrender.com/api/stripe/webhook`

## Pendientes técnicos

- [ ] `RESEND_API_KEY` añadir como environment variable en Render Dashboard
- [ ] Email bienvenida post-pago: el código existe pero necesita `RESEND_API_KEY` en producción
- [ ] Activation tokens en JSON filesystem efímero → migrar a tabla Prisma
- [ ] Heartbeats de agentes (Laura 20min, Enzo 30min, Carlos 25min) — jobs cron en OpenClaw
- [ ] Mensajes proactivos al cliente (modelo BD + endpoints ya creados, frontend pendiente)
- [ ] Seguridad prompt injection — Alberto pidió que se le recuerde

## Seguridad

- **Prompt injection emails**: Input sanitizado (límite 8000 chars, escape triple backtick, elimina scripts)
- **JWT**: Access token (15min) + Refresh token (7 días) con rotación
- **Stripe webhook**: Verificado con signature
- **Password**: Hash con bcrypt

## Commits recientes del landing redesign

| Commit | Cambio |
|--------|--------|
| `7b1f695` | SEO meta tags con keywords IA/asistente virtual |
| `3d94439` | Reemplazar "agente/agentes IA" por "Compis agénticos" en toda la landing |
| `087d552` | Nueva sección Comparativa (7 Compis vs ~10.300€/mes empleados) |
| `d86eaee` | Hero subheadline "Todo por 49€/mes" (sin "desde") |
| `ee02070` | Eliminar botón "Conoce a tu equipo" (ancla rota) + pravatar |
| `d6656ec` | FAQ con grid + filtro por categoría (sin acordeón) |
| `232626b` | Hero headline "Tu equipo de Compis profesionales" |
| `de41947` | Precio único 49€ en toda la landing + fotos pravatar |
| `ba25b19` | Downgrade Prisma 7 → 6.19.2 |
| `c35dcd3` | Fix syntax error `}` extra en stripe.js |

## Backup

Backup completo en: `/data/.openclaw/workspace/backups/backup_2026-03-30_01-24/` (724MB)
Backup git: `mycompi/` del workspace ya hace sync automático