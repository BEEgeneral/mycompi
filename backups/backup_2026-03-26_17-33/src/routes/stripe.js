/**
 * stripe.js — Pagos y suscripciones con Stripe
 * Webhook para dar de alta clientes automáticamente
 */
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth');
const { Resend } = require('resend');
const prisma = require('../lib/db');

// Lazy init — solo se crea cuando se llama una ruta, no al cargar el módulo
let _stripe = null;
function getStripe() {
  if (!_stripe) _stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

const RESEND = new Resend(process.env.RESEND_API_KEY);

// ─────────────────────────────────────────
// GET PUBLISHABLE KEY
// GET /api/stripe/config
// ─────────────────────────────────────────
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// ─────────────────────────────────────────
// CREATE SUBSCRIPTION CHECKOUT
// POST /api/stripe/create-checkout
// ─────────────────────────────────────────
router.post('/create-checkout', async (req, res) => {
  const { planId, email, nombre, empresa } = req.body;
  if (!planId || !email) return res.status(400).json({ error: 'Faltan datos' });

  const prices = {
    basico: 'price_1TEXi9FnOlGTfuoBl8zSYAZL',
    profesional: 'price_1TEXiAFnOlGTfuoBgSv2DSR8',
    enterprise: 'price_1TEXiAFnOlGTfuoBetVGAB8Q',
  };

  const priceId = prices[planId];
  if (!priceId) return res.status(400).json({ error: 'Plan no válido' });

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/checkout/cancelado`,
      metadata: { planId, nombre: nombre || '', empresa: empresa || '' },
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// STRIPE WEBHOOK
// POST /api/stripe/webhook
// Raw body requerido — no usar express.json() en esta ruta
// ─────────────────────────────────────────
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📦 Stripe webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        await handleSubscriptionUpdated(sub);
        break;
      }
    }
  } catch (err) {
    console.error(`Error processing webhook ${event.type}:`, err);
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────

async function handleCheckoutCompleted(session) {
  const { customer_email, metadata, customer: stripeCustomerId } = session;
  if (!customer_email) return;

  const planId = metadata?.planId || 'basico';
  const nombre = metadata?.nombre || customer_email.split('@')[0];
  const empresa = metadata?.empresa || '';

  const planMap = {
    basico: 'BASICO',
    profesional: 'EQUIPO',
    enterprise: 'DIRECCION',
  };
  const plan = planMap[planId] || 'BASICO';

  console.log(`🎉 Nuevo cliente: ${customer_email} - Plan: ${plan}`);

  // Buscar si el cliente ya existe
  let cliente = await prisma.cliente.findUnique({
    where: { email: customer_email }
  });

  if (!cliente) {
    // Crear cliente nuevo
    cliente = await prisma.cliente.create({
      data: {
        email: customer_email,
        nombre: nombre,
        empresa: empresa || null,
        plan: plan,
        stripeCustomerId: stripeCustomerId,
        activo: true,
      }
    });

    // Crear usuario owner associated
    await prisma.usuario.create({
      data: {
        email: customer_email,
        nombre: nombre,
        rol_platform: 'CLIENT',
        clienteId: cliente.id,
        // La contraseña se seteará via email de bienvenida
        passwordHash: '__pending_activation__',
      }
    });

    console.log(`✅ Cliente ${customer_email} creado con ID ${cliente.id}`);

    // Enviar email de bienvenida
    await enviarEmailBienvenida(customer_email, nombre);
  } else {
    // Actualizar cliente existente
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        plan,
        stripeCustomerId,
        activo: true,
      }
    });
    console.log(`🔄 Cliente ${customer_email} actualizado a plan ${plan}`);
  }
}

async function handleSubscriptionDeleted(sub) {
  const customer = await prisma.cliente.findFirst({
    where: { stripeCustomerId: sub.customer }
  });
  if (!customer) {
    console.log(`⚠️ Subscription deleted for unknown customer: ${sub.customer}`);
    return;
  }

  await prisma.cliente.update({
    where: { id: customer.id },
    data: { activo: false, plan: 'BASICO' }
  });

  console.log(`❌ Suscripción cancelada para ${customer.email}`);
  await enviarEmailSuscripcionCancelada(customer.email, customer.nombre);
}

async function handlePaymentFailed(invoice) {
  const customer = await prisma.cliente.findFirst({
    where: { stripeCustomerId: invoice.customer }
  });
  if (!customer) return;

  console.log(`⚠️ Pago fallido para ${customer.email}`);
  // Notificar al cliente por email
  await enviarEmailPagoFallido(customer.email, customer.nombre);
}

async function handleSubscriptionUpdated(sub) {
  // Si renueva o cambia de plan
  const customer = await prisma.cliente.findFirst({
    where: { stripeCustomerId: sub.customer }
  });
  if (!customer) return;

  const planId = sub.items?.data?.[0]?.price?.metadata?.planId;
  const planMap = {
    basico: 'BASICO',
    profesional: 'EQUIPO',
    enterprise: 'DIRECCION',
  };
  if (planId && planMap[planId]) {
    await prisma.cliente.update({
      where: { id: customer.id },
      data: { plan: planMap[planId], activo: true }
    });
    console.log(`🔄 Plan actualizado para ${customer.email}: ${planMap[planId]}`);
  }
}

// ─────────────────────────────────────────
// EMAILS DE BIENVENIDA / NOTIFICACIÓN
// ─────────────────────────────────────────

async function enviarEmailBienvenida(email, nombre) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`📧 Email bienvenida (simulado) para ${email}`);
    return;
  }

  try {
    await RESEND.emails.send({
      from: 'MyCompi <noreply@mycompi.es>',
      to: email,
      subject: 'Bienvenido a MyCompi — Activa tu cuenta',
      html: `
        <h1>¡Bienvenido a MyCompi, ${nombre}!</h1>
        <p>Tu cuenta ha sido creada. Para activar tu contraseña, pulsa el botón:</p>
        <a href="${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/activar?email=${encodeURIComponent(email)}" style="background:#4f46e5;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">Activar mi cuenta</a>
        <p style="color:#666;font-size:14px;margin-top:24px;">Si no solicitaste esta cuenta, ignora este email.</p>
      `,
    });
    console.log(`📧 Email bienvenida enviado a ${email}`);
  } catch (err) {
    console.error(`Error enviando email bienvenida a ${email}:`, err.message);
  }
}

async function enviarEmailSuscripcionCancelada(email, nombre) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await RESEND.emails.send({
      from: 'MyCompi <noreply@mycompi.es>',
      to: email,
      subject: 'Tu suscripción en MyCompi ha sido cancelada',
      html: `<h1>Hola ${nombre},</h1><p>Tu suscripción ha sido cancelada. Si crees que es un error, contacta con nosotros.</p>`,
    });
  } catch (err) {
    console.error('Error email cancelación:', err.message);
  }
}

async function enviarEmailPagoFallido(email, nombre) {
  if (!process.env.RESEND_API_KEY) return;
  try {
    await RESEND.emails.send({
      from: 'Mycompi <noreply@mycompi.es>',
      to: email,
      subject: 'Aviso — Pago fallido en MyCompi',
      html: `<h1>Hola ${nombre},</h1><p>No hemos podido procesar tu pago. Por favor, revisa tus datos de pago en tu cuenta.</p>`,
    });
  } catch (err) {
    console.error('Error email pago fallido:', err.message);
  }
}

// ─────────────────────────────────────────
// SUBSCRIPTION STATUS (autenticado)
// GET /api/stripe/subscription
// ─────────────────────────────────────────
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email: req.usuario.email }
    });
    if (!cliente?.stripeCustomerId) {
      return res.json({ subscription: null });
    }

    const subscriptions = await getStripe().subscriptions.list({
      customer: cliente.stripeCustomerId,
      limit: 1,
    });

    const sub = subscriptions.data[0];
    if (!sub) return res.json({ subscription: null });

    res.json({
      subscription: {
        id: sub.id,
        status: sub.status,
        planId: sub.metadata?.planId,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      }
    });
  } catch (err) {
    console.error('Stripe subscription error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// CANCELAR SUSCRIPCIÓN
// POST /api/stripe/cancel
// ─────────────────────────────────────────
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email: req.usuario.email }
    });
    if (!cliente?.stripeCustomerId) {
      return res.status(400).json({ error: 'No hay suscripción activa' });
    }

    const subscriptions = await getStripe().subscriptions.list({
      customer: cliente.stripeCustomerId,
      limit: 1,
    });

    const sub = subscriptions.data[0];
    if (!sub) return res.status(400).json({ error: 'No se encontró suscripción' });

    const deleted = await getStripe().subscriptions.cancel(sub.id);
    res.json({ ok: true, status: deleted.status });
  } catch (err) {
    console.error('Stripe cancel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// CUSTOMER PORTAL
// POST /api/stripe/portal
// ─────────────────────────────────────────
router.post('/portal', authMiddleware, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { email: req.usuario.email }
    });
    if (!cliente?.stripeCustomerId) {
      return res.status(400).json({ error: 'No hay cuenta de Stripe' });
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: cliente.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
