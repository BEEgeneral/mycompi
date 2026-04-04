/**
 * MyCompi API — Cloudflare Worker (Hono)
 */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';

import authRouter from './routes/auth';
import agentesRouter from './routes/agentes';
import trabajosRouter from './routes/trabajos';
import approvalsRouter from './routes/approvals';
import auditRouter from './routes/audit';
import pagosRouter from './routes/pagos';
import notificacionesRouter from './routes/notificaciones';
import adminMetricsRouter from './routes/admin-metrics';
import stripeWebhookRouter from './routes/stripe-webhook';
import chatRouter from './routes/chat';

export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
  MINIMAX_API_KEY: string;
  AGENT_API_KEY: string;
  OWNER_KEY: string;
  CHAT_SESSION: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

app.use('*', secureHeaders());
app.use('*', cors({ origin: '*', credentials: true }));

app.get('/health', (c) => c.json({ status: 'ok', ts: Date.now() }));
app.get('/api/health', (c) => c.json({ status: 'ok', ts: Date.now() }));

app.route('/api/stripe/webhook', stripeWebhookRouter);
app.route('/api/auth', authRouter);

app.route('/api/agentes', agentesRouter);
app.route('/api/trabajos', trabajosRouter);
app.route('/api/approvals', approvalsRouter);
app.route('/api/audit', auditRouter);
app.route('/api/pagos', pagosRouter);
app.route('/api/notificaciones', notificacionesRouter);
app.route('/api/admin/metrics', adminMetricsRouter);
app.route('/api/chat', chatRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
