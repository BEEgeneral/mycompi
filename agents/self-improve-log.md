# Self-Improve Log — MyCompi Agents

## Semana del 2026-03-23 al 2026-03-29

> **Nota inicial**: Esta semana no se registraron heartbeats con actividad (no hay archivos `last-heartbeat.json` ni entradas en `memory/`). Esto puede indicar que:
> 1. Los agentes no están teniendo actividad significativa que reportar
> 2. Los heartbeats no se están guardando correctamente
> 3. Los agentes no están despertando por falta de mensajes entrantes

---

### Laura
- ✅ **Lo que funcionó**: El formato existente de HEARTBEAT.md era funcional
- ❌ **Lo que no funcionó**: Frecuencia de 20min puede ser muy espaciada para atención al cliente
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **15 minutos** (respuesta más ágil)
  - Añadido campo `sentiment` en el registro
  - Añadida priorización explícita de tickets por urgencia
  - Añadida regla de tickets >48h sin respuesta como prioritarios
  - Añadida detección de patrones (mismo problema múltiples veces)

---

### Enzo
- ✅ **Lo que funcionó**: Research de competencia y campañas estaba bien estructurado
- ❌ **Lo que no funcionó**: Frecuencia de 30min demasiado lenta para marketing; falta de métricas concretas
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **25 minutos**
  - Añadidos **umbrales concretos** (CTR < 2%, CPC > 2€)
  - Añadido campo `campanas_activas` y `metricas_clave` en registro
  - Añadida regla de documentar todo para trazabilidad
  - Añadido requisito de análisis ROAS antes de proponer campañas

---

### Carlos
- ✅ **Lo que funcionó**: Pipeline y enrichment estaban bien
- ❌ **Lo que no funcionó**: No había reglas claras para leads fríos o que ya no responden
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **20 minutos**
  - Añadida priorización explícita Hot > Warm > Cold
  - Añadida regla: leads >48h sin respuesta = cambiar approche
  - Añadida regla: 5+ seguimientos sin respuesta → re-engagement list
  - Añadido tracking de `pipeline` y `conversion_actual`
  - Añadido análisis de engagement y objeciones recurrentes

---

### Elena
- ✅ **Lo que funcionó**: Estructura básica de operaciones era correcta
- ❌ **Lo que no funcionó**: No había health check de integrations ni documentation de incidencias
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **25 minutos**
  - Añadido **Health Check de Integrations** (Stripe, email, CRM, webhooks, backups)
  - Añadido campo `systems_status` y `automatizaciones_creadas`
  - Regla: incidencias aunque se resuelvan rápido = documentar
  - Regla: sistema >24h fallando = prioritario crítico

---

### Diana
- ✅ **Lo que funcionó**: Retención y growth estaban bien identificados
- ❌ **Lo que no funcionó**: Frecuencia de 60min demasiado lenta para data; falta de KPIs concretos
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **45 minutos**
  - Añadidos **KPIs prioritarios explícitos**: MRR, churn rate, new signups, activation rate
  - Añadido método de comparación con misma semana pasada
  - Añadido alert threshold: churn > 5% mensual = rojo
  - Añadido campo `insights` en registro
  - Regla: mínimo 7 días para ver patrones (no extrapolar de pocos datos)

---

### Marcos
- ✅ **Lo que funcionó**: Revisión de web y deployments estaba bien
- ❌ **Lo que no funcionó**: No había health check proactivo ni SEO técnico detallado
- 🔄 **Cambio aplicado**:
  - Frecuencia reducida a **45 minutos**
  - Añadido **Health Check proactivo** con UptimeRobot/status page
  - Añadido check de SSL, Core Web Vitals, sitemap
  - Añadido campo `site_status`, `errors_detected`, `deploys_pendientes`
  - Regla: **NUNCA hacer cambios en producción** sin rollback disponible
  - Regla: si no hay acceso a algo, pedir credenciales a Paco (no hacks)

---

## Recomendaciones Generales

1. **Verificar que los agentes están guardando `last-heartbeat.json`**: No se encontró ningún archivo de heartbeat esta semana
2. **Los heartbeat JSON deberían incluirse en `memory/` además de en cada carpeta de agente**
3. **Considerar añadir un dashboard agregado** quecentralice métricas de todos los agentes
4. **Posible problema**: Si los agentes no reciben mensajes, no despiertan. Verificar que tienen tareas activas.

---

*Generado automáticamente por Compi — 2026-03-30*
