/**
 * stripe.js — Pagos y suscripciones con Stripe
 */
const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('./auth');
const prisma = require('../lib/db');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

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
// Body: { planId, email, nombre, empresa }
// ─────────────────────────────────────────
router.post('/create-checkout', async (req, res) => {
  const { planId, email, nombre, empresa } = req.body;
  if (!planId || !email) return res.status(400).json({ error: 'Faltan datos' });

  try {
    // Price IDs de Stripe (crear en dashboard o vía API)
    const prices = {
      basico: 'price_BASICO',       // €147/mes
      profesional: 'price_PROFESIONAL', // €597/mes
      enterprise: 'price_ENTERPRISE',   // €1320/mes
    };

    const priceId = prices[planId];
    if (!priceId) return res.status(400).json({ error: 'Plan no válido' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/checkout/cancelado`,
      metadata: { planId, nombre, empresa },
      subscription_data: {
        metadata: { planId, nombre, empresa },
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// GET SUBSCRIPTION STATUS
// GET /api/stripe/subscription
// ─────────────────────────────────────────
router.get('/subscription', requireAuth, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { email: req.usuario.email } });
    if (!cliente?.stripeCustomerId) {
      return res.json({ subscription: null });
    }

    const subscriptions = await stripe.subscriptions.list({
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
// CANCEL SUBSCRIPTION
// POST /api/stripe/cancel
// ─────────────────────────────────────────
router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { email: req.usuario.email } });
    if (!cliente?.stripeCustomerId) {
      return res.status(400).json({ error: 'No hay suscripción activa' });
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: cliente.stripeCustomerId,
      limit: 1,
    });

    const sub = subscriptions.data[0];
    if (!sub) return res.status(400).json({ error: 'No se encontró suscripción' });

    const deleted = await stripe.subscriptions.cancel(sub.id);
    res.json({ ok: true, status: deleted.status });
  } catch (err) {
    console.error('Stripe cancel error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// CREATE CUSTOMER PORTAL SESSION
// POST /api/stripe/portal
// ─────────────────────────────────────────
router.post('/portal', requireAuth, async (req, res) => {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { email: req.usuario.email } });
    if (!cliente?.stripeCustomerId) {
      return res.status(400).json({ error: 'No hay cuenta de Stripe' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: cliente.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'https://mycompi.onrender.com'}/#/dashboard`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe portal error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// STRIPE WEBHOOK
// POST /api/stripe/webhook
// ─────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('Checkout completed:', session.customer_email, session.metadata?.planId);
      // Aquí actualizas el cliente en la DB con stripeCustomerId y plan
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      console.log('Subscription cancelled:', sub.id);
      // Aquí marcas el cliente como inactivo
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log('Payment failed for customer:', invoice.customer);
      // Aquí notificar al cliente
      break;
    }
  }

  res.json({ received: true });
});

module.exports = router;
