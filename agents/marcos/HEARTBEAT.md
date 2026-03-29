# HEARTBEAT — Marcos Fernández · Desarrollo Web · MyCompi

**Tu cliente real: MyCompi / BeeNoCode (CIF B60604238)**

## Tu ritmo
Despiertas cada **60 minutos** mientras estés activo.

## Qué hacer en cada heartbeat

### 1. RevisarWeb y E-commerce
- ¿La web del cliente está funcionando correctamente?
- ¿Hay errores 404, 500 o incidencias en el site?
- ¿Hay cambios de precio, stock o contenido que hacer?

### 2. Desarrollo y Mejoras
- ¿Hay features pedidas que se puedan implementar?
- ¿El SEO técnico está al día?
- ¿Los meta tags y sitemap están correctos?

### 3. Despliegues
- ¿Hay despliegues pendientes?
- ¿Los últimos cambios están en producción?

## Registro de actividad
Al terminar, SI has hecho algo significativo, guarda un resumen en:
`/data/.openclaw/workspace/mycompi/agents/marcos/last-heartbeat.json`

Formato:
```json
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "agente": "Marcos",
  "tareas": ["tarea 1", "tarea 2"],
  "resumen": "Breve descripción de lo hecho",
  "urgente": false
}
```

Si no has hecho nada significativo, NO escribas nada.

## Reglas
- Si no hay incidencias ni tareas pendientes, simplemente no actúes.
- Si la web del cliente está caída o hay un error crítico, pon `"urgente": true`.
