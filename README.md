# MyCompi

Plataforma SaaS de equipos de agentes IA para PYMES españolas.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Express.js + Prisma ORM |
| Base de datos | PostgreSQL (Neon) |
| Landing / Auth | React + Vite + Tailwind CDN |
| Admin panel | React + Vite (builds to `public/admin/`) |
| Email | Resend API |
| Pagos | Stripe |
| Deploy | Render |

## Estructura del proyecto

```
mycompi/
├── src/
│   ├── index.js              # Entry point Express
│   ├── routes/
│   │   ├── auth.js            # Login, register, activate, recover
│   │   ├── stripe.js          # Checkout, webhook, portal
│   │   ├── chat.js            # Interacciones cliente-Orquestador
│   │   ├── digest.js          # Daily digest emails
│   │   ├── admin.js          # Admin panel API
│   │   ├── agentes.js         # Agentes
│   │   ├── clientes.js        # Clientes
│   │   └── trabajos.js        # Trabajos
│   ├── services/
│   │   ├── agentLoader.js     # Carga y gestión de agentes
│   │   └── digestService.js   # Generador de emails digest
│   ├── lib/
│   │   ├── db.js              # Prisma client
│   │   └── resetTokens.json   # Tokens de password reset
│   └── models/
│       └── db.js
├── agents/                    # Agentes (SOUL.md, IDENTITY.md, etc.)
│   ├── atencion-cliente/
│   ├── marketing/
│   ├── ventas/
│   ├── operaciones/
│   ├── data/
│   ├── marcos-desarrollo/
│   ├── orquestador/
│   ├── policia-tokens/
│   └── personal-asistente/
├── landing/                   # Frontend landing (React + Vite)
│   ├── src/
│   │   ├── pages/             # Login, Register, Dashboard, Checkout, Activar
│   │   ├── sections/          # Hero, Services, Team, Hiring, Pricing, FAQ
│   │   └── components/        # Navbar, Footer
│   └── public/
├── admin-panel/               # Admin panel (React + Vite)
│   └── src/
│       ├── components/
│       │   ├── HierarchyView.jsx
│       │   ├── SpendChart.jsx
│       │   └── AgentDetail.jsx
│       └── App.jsx
├── prisma/
│   └── schema.prisma           # Modelos de BD
└── public/                    # Build output (Express static)
    ├── index.html
    ├── admin/
    └── assets/
```

## Modelos de base de datos

```
Usuario          — users por cliente (email, password, rol)
Cliente          — empresa con plan, stripeCustomerId, activo
Agente           — agentes operativos por cliente
Trabajo          — tareas asignadas
Pago             — historial de pagos
Documento        — documentos subeidos
InteraccionChat  — aprendizaje del chat cliente-Orquestador
Mensaje          — mensajes internos entre agentes
```

## API Endpoints

### Auth
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registrar novo cliente |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual (Bearer JWT) |
| POST | `/api/auth/activar` | Activar cuenta post-pago Stripe |
| POST | `/api/auth/forgot-password` | Solicitar reset de contraseña |
| POST | `/api/auth/reset-password` | Resetear con token |

### Stripe
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/stripe/config` | Public key Stripe |
| POST | `/api/stripe/create-checkout` | Crear sesión de pago |
| GET | `/api/stripe/subscription` | Estado suscripción (auth) |
| POST | `/api/stripe/cancel` | Cancelar suscripción (auth) |
| POST | `/api/stripe/portal` | Abrir portal Stripe (auth) |
| POST | `/api/stripe/webhook` | Webhook Stripe (raw body) |

### Chat
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/chat/interaccion` | Gardar interacción cliente |
| GET | `/api/chat/interacciones` | Listar últimas (auth) |
| POST | `/api/chat/interaccion/:id/acepta` | Confirmar aceptación |
| POST | `/api/chat/interaccion/:id/rechaza` | Rechazar |
| POST | `/api/chat/interaccion/:id/resultado` | Marcar resultado |

### Admin
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/admin/agentes` | Listar todos os agentes |
| GET | `/api/admin/agentes/:id` | Detalle dun axente |
| GET | `/api/admin/agentes/:id/archivos` | Arquivos de axente |
| PUT | `/api/admin/agentes/:id/archivos/:file` | Gardar arquivo |
| GET | `/api/admin/metrics/dashboard` | Métricas de gasto |

### Orchestrator
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/orchestrator/daily-digest` | Enviar digest diario |
| GET | `/api/orchestrator/digest/preview` | Preview do digest |

## Variables de entorno

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
FRONTEND_URL=https://mycompi.onrender.com
PORT=3000
```

## Comandos

```bash
npm install              # Instalar dependencias
npm run dev              # Desarrollo (puerto 3458)
npm run build:landing     # Build landing → public/
npm run build:admin       # Build admin → public/admin/
npm run build:chat        # Build chat → public/chat/
npx prisma migrate dev   # Migrar BD (desarrollo)
npx prisma migrate deploy # Migrar BD (producción)
npx prisma generate      # Generar cliente Prisma
```

## Deployment

- **Render**: `render.yaml` define o servizo web
- Build command: `npm install && npx prisma migrate deploy && npm run build && npx prisma generate`
- Static files servidos por Express desde `public/`
- Admin en `/admin/`, landing en `/`
