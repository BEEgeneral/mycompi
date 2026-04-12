require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const prisma = require('./src/lib/db');

const missionContent = `# Misión MyCompi / BeeNoCode

**Cliente:** AlberBEE (BeeNoCode)
**Fecha:** 2026-04-01
**Agente:** Diana Fabián

## Resumen ejecutivo

BeeNoCode opera MyCompi, una SaaS que vende equipos de 7 "Compis agénticos" especializados a PYMES españolas por 49€/mes (precio único, sin permanencia). El cliente actual es el propio BeeNoCode, lo que significa que el producto está en fase de validación interna.

## Modelo de negocio

- **Producto:** Equipo agéntico (7 especializados) + 1 director (Paco)
- **Precio:** 49€/mes todo incluido
- **Mercado:** PYMES españolas que necesitan digitalizarse
- **Propuesta de valor:** "Tu equipo de Compis profesionales por 49€/mes" vs ~10.300€/mes de empleados

## Estado actual

- MRR: 98€ (1 cliente real)
- Clientes registrados: 10 (9 son tests)
- Usuarios activos: 2
- Trial activo: 30 días desde 2026-03-31

## Notas Data

- Solo 1 cliente ha pagado (AlberBEE = BeeNoCode itself)
- 9 cuentas restantes son tests/seed data
- El MRR real es 98€/mes — prácticamente nada todavía
- Única fuente de pago: 2 suscripciones de 49€ (trial simulado)`;

const researchContent = `# Research Competencia MyCompi

**Fecha:** 2026-04-01
**Agente:** Diana Fabián

## Competidores directos (España - Agentes IA para PYMEs)

| Competidor | Web | Propuesta |
|------------|-----|-----------|
| Nemawashi AI | nemawashi.ai | Automatizaciones y agentes IA para PYMEs |
| Tur.ia Design | turiadesign.com | Agentes IA para negocio España & LATAM |
| Qyntix | qyntix.com | IA y software a medida, agentes, automatización |

## Competidores indirectos / Global players

- **Ringover** - Cloud contact center con IA
- **Zendesk** - CRM + soporte con IA (enterprise)
- **HubSpot** - Marketing/sales CRM con IA
- **Talkdesk** - Call center cloud con IA (enterprise)
- **noimos AI** - AI marketing agents para SMBs
- **MagicBlocks AI** - AI sales agents

## Diferenciadores MyCompi

✅ Precio fijo único (49€/mes) — predecible, simple
✅ 7 agentes especializados vs herramienta puntual
✅ Equipo con personalidades (Paco director, Laura atención...)
✅ Sin contratos ni permanencia
✅ Español nativo, pensado para PYMES españolas

## Debilidades

❌ Producto muy nuevo (marzo 2026)
❌ Sin case studies ni testimonials
❌ 9/10 clientes son tests
❌ MRR mínimo (98€)
❌ Dependencia de OpenClaw

## Tendencias de mercado 2026

- Product-led growth en SaaS
- Usage-based pricing
- Churn prediction con IA
- Onboarding experiments + feature flags
- Embedded analytics, real-time dashboards`;

async function main() {
  const id1 = uuidv4();
  const id2 = uuidv4();
  
  await prisma.$executeRaw`
    INSERT INTO "Documento" (id, "clienteId", titulo, tipo, contenido, "createdAt", "updatedAt", metadata)
    VALUES (
      ${id1},
      'cmn3je5zq0000e31xg8wru9iy',
      'Misión MyCompi / BeeNoCode',
      'MISION',
      ${missionContent},
      NOW(),
      NOW(),
      '{"agente": "Diana Fabián", "fuente": "investigación heartbeat 2026-04-01"}'
    )
  `;
  console.log('Document MISION created:', id1);

  await prisma.$executeRaw`
    INSERT INTO "Documento" (id, "clienteId", titulo, tipo, contenido, "createdAt", "updatedAt", metadata)
    VALUES (
      ${id2},
      'cmn3je5zq0000e31xg8wru9iy',
      'Research Competencia MyCompi',
      'USER_RESEARCH',
      ${researchContent},
      NOW(),
      NOW(),
      '{"agente": "Diana Fabián", "tipo": "competencia"}'
    )
  `;
  console.log('Document USER_RESEARCH created:', id2);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
