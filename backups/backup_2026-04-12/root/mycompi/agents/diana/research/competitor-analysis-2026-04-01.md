# Investigación: Empresa, Sector y Competencia — MyCompi

**Generado por:** Diana (Data Agent)  
**Fecha:** 2026-04-01  
**Job ID:** 6e00f6b1-d006-4c17-a9ae-7d09d8fccc81  
**Tags:** #semana-1 #dia-1 #onboarding #investigacion

---

## 1. La Empresa

| Campo | Detalle |
|-------|---------|
| **Nombre comercial** | MyCompi |
| **Razón social** | Computer Integrated Manufacturing Technologies SL |
| **CIF** | B60604238 |
| **Sector CNAE** | 6202 — Consultoría informática |
| **Domicilio fiscal** | Calle Berruguete, 86 · 08035 Barcelona |
| **Web** | https://mycompi.com (live: https://mycompi.onrender.com) |
| **Teléfono contacto** | 932749040 |
| **Email** | comercial@cimatech.com |
| **Producto** | SaaS: equipo de 7 Compis agénticos IA para PYMES españolas |
| **Precio** | €49/mes · plan único · sin contratos ni permanencia |
| **Stack** | Express.js · Prisma · PostgreSQL (Neon) · React/Vite · Stripe · Resend · Firecrawl · Render |

### Modelo de negocio
- Cliente paga €49/mes → Stripe → webhook crea cuenta → email bienvenida → acceso dashboard
- Dashboard: chat con Paco (orquestador) + acceso a 7 agentes especializados
- Cada agente tiene heartbeat propio (Laura 20min, Enzo 30min, Carlos 25min, Diana 60min, etc.)

---

## 2. El Sector

**Mercado global:** Customer Service AI Agents — crecimiento acelerado 2025-2026

- **TAM estimado:** $70B+ (AI customer service market 2026)
- **Drivers:**
  - Product-Led Growth (PLG) en SaaS
  - Presión de costes en PYMES (coste empleado español ~$3.000-4.000€/mes)
  - Mejora drástica de LLMs (GPT-4o, Claude, Gemini) baja barrera de entrada
  - Demanda de availability 24/7 que empleados no dan

**Tendencias 2026 detectadas:**
1. Agentes autónomaos de nivel 3-4 (SOTA) — menor intervención humana
2. Pricing basado en uso (usage-based pricing) vs flat
3. Churn prediction models integrados en dashboards
4. Embedded analytics dentro de producto (no-code BI)
5. Onboarding como principal palanca de retención (primeros 7-14 días)

---

## 3. Competencia Directa

### 3.1 Freshdesk (Freshworks) 🇮🇳/🇺🇸
| Aspecto | Detail |
|---------|--------|
| **Pricing** | Desde $49/agent/mes (Essential) hasta $99/agent/mes (Growth) — Freddy AI add-on ~$69/mes |
| **AI** | Freddy AI Agent — resolutor autónomo |
| **Mercado** | SMB → Enterprise |
| **Debilidad vs MyCompi** | No es "equipo agéntico", es plataforma de tickets con AI. Requiere setup. MyCompi entrega trabajo hecho, no herramientas. |

### 3.2 Zendesk AI Agent 🇺🇸
| Aspecto | Detail |
|---------|--------|
| **Pricing** | Desde ~$89/agent/mes hasta $195+/agent/mes |
| **AI** | Zendesk Agent Copilot + Fin AI (resuturo) |
| **Mercado** | Mediano → Enterprise |
| **Debilidad vs MyCompi** | 4-8x más caro. Plataforma legacy. MyCompi es flat, simple, sin complejidad. |

### 3.3 Intercom 🇺🇸
| Aspecto | Detail |
|---------|--------|
| **Pricing** | $74-$195/agent/mes + Fin AI desde $99/mes |
| **AI** | Fin AI Agent — muy posicionado |
| **Mercado** | SMB → Enterprise |
| **Debilidad vs MyCompi** | Interfaz complex. MyCompi más simple y barato. |

### 3.4 eesel.ai 🇪🇺
| Aspecto | Detail |
|---------|--------|
| **Pricing** | ~$39-99/mes (flat para equipos) |
| **AI** | Agente AI para soporte + generación de contenido |
| **Mercado** | SMBs |
| **Debilidad vs MyCompi** | No tiene equipo agéntico multidisciplinary. 1 solo agente. MyCompi tiene 7 roles especializados. |

### 3.5 Ringover 🇫🇷
| Aspecto | Detail |
|---------|--------|
| **Pricing** | Desde €19/mes (telecom + chatbot) |
| **AI** | Asistente IA propio |
| **Mercado** | SMBs España/Europa |
| **Debilidad vs MyCompi** | Enfocado en llamadas/ventas. No ofrece equipo completo. |

### 3.6 Competencia local española
| Empresa | Descripción | Pricing |
|---------|-------------|---------|
| **CIMATECH** | Consultoría IT (misma razón social — posible linked) | N/A |
| **Crisp** 🇫🇷 | Chat/AI para ecommerce | Desde €59/mes |
| **Botsociety** | Chatbots builders | N/A |

---

## 4. Competencia Indirecta

- **Agents as Service** (tipo Virtualworkforce.ai) — equipos remotos humanos + AI
- **Freelancers/consultores** — pricing $500-2.000/mes por rol
- **ChatGPT Business / Copilot** — herramientas individuales, no equipos
- **Agencias de marketing** — pricing 1.000-5.000€/mes

---

## 5. Posicionamiento de MyCompi

### Fortalezas
✅ **Precio imbatible** — €49/mes vs $89-195+ de competencia internacional  
✅ **Equipo completo real** — 7 roles (no 1 herramienta)  
✅ **Simplicidad** — 1 plan, sin contratos, sin permanencia  
✅ **Mercado local** — PYMES españolas (nicho menos competido que English-speaking SMBs)  
✅ **Orquestación** — Paco como director de equipo (diferenciador único)

### Debilidades
❌ **Brand awareness bajo** — MyCompi.com sin contenido (no rankea aún)  
❌ **Sin social proof** — 0 reviews, 0 case studies, 0 testimonials públicos verificados  
❌ **Stack técnico frágil** — Prisma downgrade,tokens filesystem efímero  
❌ **Sin pricing claro público** — La landing muestra $49 pero esto puede confundir (EUR/USD)  
❌ **Tecnología heartbeat incipiente** — Agentes despiertan cada 20-30min pero producción no está validada

### Oportunidades
🔵 Ranking SEO "asistente virtual IA empresas España" — keywords de alto valor sin competencia directa española  
🔵 Case study primer cliente anclado — documentar resultados y usarlo como palanca  
🔵 Integración con CRMs españoles (HubSpot, Salesforce) para Carlos (Ventas)  
🔵 Growth: pricing usage-based como upsell (planes superiores)  
🔵 Retargeting a PYMES que usan Zendesk/Intercom pero pagan >€200/mes

---

## 6. Insight Clave para Growth

> **MyCompi no compite con Zendesk — compite con "tener 7 empleados virtuales".**  
> El messaging correcto no es "soporte con AI" sino **"tu equipo de profesionales 24/7 por €49/mes"**.

El comparable real es: **un empleado虚拟 a tiempo completo** (coste España: €2.500-3.500/mes) vs **7 Compis por €49/mes**.  
Eso es 50-70x más barato. Ese es el mensaje.

---

## 7. Almacén de Datos

Guardar este output en la cola de resultados del job.

**Siguiente paso recomendado (para Diana):** Analizar métricas de uso actuales del cliente y construir primer dashboard de KPIs.

---

*Fuentes: Web scraping MyCompi.com, registro mercantil (eInforma), G2/Zendesk/Intercom pricing pages, Technova Partners 2025 AI agents report, Fin.ai pricing guide Mar 2026*
