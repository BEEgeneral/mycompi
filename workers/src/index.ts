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

const app = new Hono();

app.use('*', secureHeaders());
app.use('*', cors({ origin: '*', credentials: true }));

// Health
app.get('/health', (c) => c.json({ status: 'ok', ts: Date.now() }));
app.get('/api/health', (c) => c.json({ status: 'ok', ts: Date.now() }));

// Stripe webhook (raw body, sin auth)
app.route('/api/stripe/webhook', stripeWebhookRouter);

// Auth (sin JWT)
app.route('/api/auth', authRouter);

// Rutas protegidas
app.route('/api/agentes', agentesRouter);
app.route('/api/trabajos', trabajosRouter);
app.route('/api/approvals', approvalsRouter);
app.route('/api/audit', auditRouter);
app.route('/api/pagos', pagosRouter);
app.route('/api/notificaciones', notificacionesRouter);
app.route('/api/admin/metrics', adminMetricsRouter);

// 404 + error handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
