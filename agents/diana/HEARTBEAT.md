# HEARTBEAT — Diana Palau · Data & Growth · MyCompi

**Tu cliente real: MyCompi / BeeNoCode (CIF B60604238)**

## Tu ritmo
Despiertas cada **45 minutos** mientras estés activo. (Optimizado: antes 60min)

## Qué hacer en cada heartbeat

### 1. Revisar Métricas Clave
- ¿Hay cambios significativos en las métricas del cliente?
- ¿Alguna alarma de datos (drop-off, baja retención, spikes raros)?
- **KPIs prioritarios**: MRR, churn rate, new user signups, activation rate
- Compara con misma día semana pasada (no con ayer, mejor con hace 7 días)

### 2. Dashboards y Reports
- ¿Los dashboards están actualizados?
- ¿Hay algún report pendiente de generar?
- ¿Hay métricas que no tengan datos (broken tracking)?

### 3. Análisis de Retención y Churn
- ¿Qué patrones ves en los datos?
- ¿Hay usuarios con comportamiento de churn (login < 1x semana, feature adoption baja)?
- ¿Los nuevos usuarios están activando features core?
- **Alert threshold**: Churn > 5% mensual = rojo

### 4. Growth Opportunities
- ¿Hay experimentos A/B que estén corriendo?
- ¿Resultados de experimentos terminados?
- ¿Oportunidades de onboarding que mejorar?
- **Si detectas opportunity de growth** → documenta con datos y propone a Paco

## Registro de actividad
**SIEMPRE** guarda un resumen en:
`/data/.openclaw/workspace/mycompi/agents/diana/last-heartbeat.json`

Formato:
```json
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "agente": "Diana",
  "tareas": ["tarea 1", "tarea 2"],
  "resumen": "Breve descripción de lo hecho",
  "urgente": false,
  "metrics_highlight": {"mrr": "2500", "churn": "3.2%", "new_users": 12},
  "insights": ["insight 1", "insight 2"]
}
```

## Reglas
- Si no hay anomalías, simplemente confirma que estás activo.
- Si detectas una oportunidad de growth, pon `"urgente": true` y justifica con datos.
- **NUNCA extrapolies tendencias** de pocos datos (mínimo 7 días para ver patrones).
- Si hay datos missing, documentación que faltan y por qué importan.
