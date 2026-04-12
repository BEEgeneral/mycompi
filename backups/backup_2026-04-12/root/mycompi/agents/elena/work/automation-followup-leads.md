# Automatización: Follow-up para Leads Calientes (Carlos)

## Descripción
Sistema automatizado de follow-up para leads que interactúan con contenido de Enzo o responden a outbound de Carlos.

## Trigger
- Lead visita web 2+ veces en 7 días
- Lead abre 2+ emails de la secuencia
- Lead descarga contenido o completa form

## Secuencia de Follow-up
```
Día 0 → Email inicial (Carlos ya lo hace manualmente)
Día 3 → Email follow-up #1 (AUTOMÁTICO)
Día 7 → Email follow-up #2 (AUTOMÁTICO)  
Día 14 → Alert a Carlos: "Este lead necesita atención manual"
```

## Herramienta
**N8N** (recomendado) o Zapier

## Email Templates

### Follow-up #1 (Día 3)
**Subject:** ¿Te perdiste algo? 😄
**Body:**
> Hola {{lead_name}},
> Te vi navegando por nuestra web hace unos días — ¿tienes alguna pregunta sobre cómo podemos ayudar a {{company}}?
> Dejo aquí un caso real: [link]
> Un saludo,
> Carlos

### Follow-up #2 (Día 7)
**Subject:** Sigo aquí 👋
**Body:**
> Hola {{lead_name}},
> Te comparto 3 formas en las que hemos ayudado a empresas como la tuya:
> 1. [Caso 1]
> 2. [Caso 2]
> 3. [Caso 3]
> ¿Hablamos 15 min esta semana?
> Un saludo,
> Carlos

## Estado
⏳ Pendiente de aprobación de Paco/Alberto para proceder con implementación en N8N.

## Metadata
- Job ID: 08e215da-2e6b-4090-a1fd-916e7be10055
- Fecha diseño: 2026-04-01
- Prioridad: CRITICA
- Cliente: AlberBee (cmnct80rm0007r9tkodlpaghf)
