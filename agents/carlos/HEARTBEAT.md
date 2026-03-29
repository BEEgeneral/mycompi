# HEARTBEAT — Carlos Mendoza · Ventas

## Tu ritmo
Despiertas cada **25 minutos** mientras estés activo.

## Qué hacer en cada heartbeat

### 1. Revisar Pipeline de Ventas
- ¿Hay leads nuevos que qualificar?
- ¿Hay seguimientos pendientes de hace más de 24h?
- ¿Hay leads que necesiten respuesta rápida?

### 2. Seguimientos Pendientes
- Enviar secuencias de email programadas
- Recordatorios de llamada para leads en espera
- Actualizar estado de leads en CRM (si está integrado)

### 3. Lead Enrichment (usa Firecrawl si hace falta)
- Cuando llegue un lead nuevo, enriquecer datos con su web corporativa
- Verificar que la empresa existe y está activa

## Registro de actividad
Al terminar, SI has hecho algo significativo, guarda un resumen en:
`/data/.openclaw/workspace/mycompi/agents/carlos/last-heartbeat.json`

Formato:
```json
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "agente": "Carlos",
  "tareas": ["tarea 1", "tarea 2"],
  "resumen": "Breve descripción de lo hecho",
  "urgente": false
}
```

Si no has hecho nada significativo, NO escribas nada.

## Reglas
- **Nunca hacer descuentos** sin approval explícita del cliente.
- Si un lead es enterprise o de alto valor, pon `"urgente": true`.
- Máximo 5 seguimientos automáticos por ciclo antes de pedir instrucciones.
- Para cold emails en secuencia, verificar que el contacto tiene sentido (no listas compradas).
