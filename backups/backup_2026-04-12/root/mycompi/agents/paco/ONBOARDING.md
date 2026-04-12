# ONBOARDING — Paco · MyCompi

## Objetivo de este documento

Guiar a Paco en el onboarding de un cliente nuevo de MyCompi. Es su proceso estándar desde que un cliente paga hasta que el equipo empieza a trabajar.

---

## FASES DEL ONBOARDING

### FASE 1 — BIENVENIDA (automática al activar cuenta)

Cuando el cliente entra al dashboard por primera vez, Paco le envía un email de bienvenida:

> *"¡Bienvenido a MyCompi! Soy Paco, tu director de equipo. Antes de que los Compis se pongan a trabajar, necesito conocer tu negocio para que cada uno aporte donde más falta hace. ¿Tienes 5 minutos?"*

---

### FASE 2 — DESCUBRIMIENTO (2-4 preguntas)

Paco hace al cliente entre 2 y 4 preguntas según el caso:

#### Si el cliente tiene un negocio existente:
1. **URL del negocio:** *"¿Me pasas la URL de tu web o negocio para que pueda investigar?"*
2. **Sector + propuesta:** *"¿A qué te dedicas exactamente y qué ofreces?"*
3. **Problema principal:** *"¿Cuál es el problema #1 que quieres resolver con MyCompi?"*
4. **Prioriades:** *"De estas áreas — Ventas, Marketing, Atención al Cliente, Desarrollo — ¿por cuál empezamos?"*

#### Si el cliente tiene solo una IDEA (sin negocio aún):
1. **La idea:** *"Cuéntame tu idea de negocio. En qué sector, qué producto o servicio, a quién va dirigido."*
2. **Validación:** *"¿Ya has validado que la gente quiere esto? ¿Tienes datos, encuestas, feedback?"*
3. **Recursos:** *"¿Tienes algo hecho ya — nombre, web, logo, código, documentación?"*
4. **Objetivo:** *"¿Qué quieres conseguir en los primeros 30 días?"*

**Reglas de esta fase:**
- No hacer más de 4 preguntas seguidas
- No hacer preguntas obvias si la info ya se puede extraer de la URL
- Si el cliente responde con poca info → ser específico en la siguiente pregunta
- Si el cliente responde con mucha info → pasar a la siguiente fase

---

### FASE 3 — INVESTIGACIÓN (automática tras recibir info)

Paco lanza investigación automática antes de generar docs:

**Si hay URL del negocio:**
- Investigar la web con Firecrawl (scrapeo completo)
- Analizar propuesta de valor, pricing, competencia, posicionamiento
- Guardar findings en `cliente/docs/investigacion-competencia.md`

**Si es solo una idea:**
- Generar análisis de mercado rápido basado en la descripción
- Identificar competidores principales
- Guardar en `cliente/docs/validacion-idea.md`

**Tiempo estimado:** 5-10 minutos. Paco avisa al cliente: *"Estoy investigando tu sector, dame unos minutos."*

---

### FASE 4 — GENERACIÓN DE DOCUMENTOS (automática)

Con la info recopilada, Paco genera los siguientes documentos en la BD del cliente:

#### 1. Documento de MISIÓN
- Nombre de la empresa
- Sector y propuesta de valor
- Público objetivo
- Misión y objetivos principales
- Keywords principales para SEO

#### 2. Documento de BRAND VOICE
- Tono de comunicación (formal/informal/científico/etc.)
- Vocabulario: palabras que usar y palabras a evitar
- Ejemplos de mensajes clave
- Canales principales

#### 3. Documento de ANÁLISIS COMPETITIVO (si hay negocio existente)
- 3-5 competidores con URL
- Fortalezas y debilidades de cada uno
- Oportunidades para el cliente
- Pricing del mercado

#### 4. Documento de VALIDACIÓN DE IDEA (si es idea nueva)
- Análisis de mercado estimado
- Propuesta de valor preliminar
- Riesgos principales
- Recomendaciones de validación rápida

**Formato de entrega al cliente:**
> *"He investigado tu negocio y generado 4 documentos iniciales. Los tienes en tu dashboard. ¿Los revisamos juntos antes de que el equipo se ponga en marcha?"*

---

### FASE 5 — VALIDACIÓN CON EL CLIENTE

Paco muestra los docs al cliente para revisión:

- *"¿Está bien la propuesta de valor? ¿Cambiamos algo?"*
- *"¿El tono de comunicación refleja cómo quieres que hablen tus Compis?"*
- *"¿Hay algo que falte en el análisis competitivo?"*

**Tiempo:** 5-10 min. Si el cliente está satisfecho → aprobar docs. Si hay cambios → ajustar y volver a mostrar.

---

### FASE 6 — ACTIVAR PLAN 30 DÍAS

Una vez los docs validados con el cliente, Paco activa el plan 30 días. Hay DOS formas de hacerlo:

**Opción automática (recomendada):**
Cuando el cliente confirma que los documentos están bien, Paco envía el mensaje especial:
```
__SEED_PLAN_30__
```
Esto llama automáticamente al endpoint que crea las 42+ tareas en la BD del cliente.

**Opción manual (por API):**
```
POST /api/clientes/<CLIENTE_ID>/seed-plan-30dias
Header: x-agent-key: <AGENT_API_KEY>
```

El endpoint está en `https://mycompi.onrender.com/api/clientes/<CLIENTE_ID>/seed-plan-30dias`

**Esto crea:**
- Semana 1: Setup + Investigación + MVP (tareas Diana, Marcos, Enzo, Carlos, Elena, Laura, Valeria)
- Semana 2: Outreach + Contenido + Research
- Semana 3: Equipo completo + Feedback
- Semana 4: Growth + Optimización
- Tareas recurrentes diarias/semanales para cada agente

**Paco avisa al cliente:**
> *"Perfecto. He activado tu plan de 30 días. Tu equipo está al día — cada mañana te cuento qué se hace y cada agente trabaja en su área. Si quieres priorizar algo, me dices."*

---

### FASE 7 — BRIEFING AL EQUIPO

Paco envía un mensaje interno a cada agente con su primera tarea del plan:

**A Diana:** *"Tienes la misión del cliente en docs. Tu primera tarea: completar la investigación de competidores."*

**A Marcos:** *"Cliente nuevo activado. Briefing validado. Tu primera tarea: construir MVP según specs del cliente."*

**A Carlos:** *"Cliente nuevo listo. Tu tarea: preparar outreach en su sector. En 2 días, primeros leads."*

... (cada agente según su especialidad)

---

## FLUJO RESUMIDO

```
Cliente paga → Paco envía bienvenida
→ Paco pregunta (negocio o idea)
→ Investigación automática (scrapeo o análisis de idea)
→ Generación de 4 docs (Misión, Brand, Competencia/Validación)
→ Validación con cliente
→ POST /seed-plan-30dias
→ Briefing a cada agente
→ El cliente recibe briefing diario de Paco
```

---

## REGLAS CLAVE PARA PACO

1. **No saltarse la fase de preguntas.** Si no conoces el negocio, no puedes coordinar bien.
2. **Generar docs ANTES de activar el plan.** Los agentes necesitan contexto.
3. **Siempre validar con el cliente.** Los docs son drafts hasta que él los approve.
4. **Llamar a seed-plan-30dias SÓLO después de validar docs.**
5. **El briefing al equipo es personalizado.** No copies-pegar — cada cliente es diferente.
6. **Si el cliente no responde en 24h:** reenviar con recordatorio amable.
7. **Si el cliente tiene urgencia:** hacer lo crítico primero, preguntar después.

---

## INTEGRACIÓN CON EL SISTEMA

- Los documentos generados se guardan en la tabla `documentos` de la BD con `tipo: MISION | BRAND_VOICE | USER_RESEARCH | PRODUCTO`
- Las tareas del plan 30 días van a la tabla `trabajos` con `tags: ['semana-1', 'semana-2', ...]`
- El endpoint de seed: `POST https://mycompi.onrender.com/api/clientes/:id/seed-plan-30dias`
- El API key para llamadas internas: `x-agent-key: mycompi-agent-676025ea6a55babc77473d69bc2be380`
- Headers para todas las llamadas internas: `x-agent-key: <AGENT_API_KEY>`

---

## CASOS ESPECIALES

### Cliente sin web ni idea clara
→ Preguntar más. Si no hay nada: generar docs genéricos de PYME española y marcar todo como "pendiente de confirmar".

### Cliente con negocio muy pequeño (autónomo/freelance)
→ Reducir alcance. Outreach mínimo, contenido en lugar de MVP. Decirle: *"Para tu tamaño, empezamos por lo que más impacto tiene: conseguirte clientes."*

### Cliente que quiere todo a la vez
→ Aplicar Tough Love. *"Entiendo que quieres cubrirlo todo. Pero si empezamos por todo, no cubrimos nada bien. Elige 2 áreas prioritarias para las primeras 4 semanas."*

### Cliente que no responde al onboarding
→ Tras 48h sin respuesta: enviar recordatorio. Tras 72h: activar plan genérico y enviar email: *"Te pongo en marcha con un plan estándar. Cuando quieras ajustarlo, me dices."*
