# Quality Standards — MyCompi

> Estándares de calidad para cada tipo de deliverable. Definidos por Valeria Sanz.

---

## Emails / Comunicación con Cliente

| Criterio | Mínimo | Ideal |
|----------|--------|-------|
| Ortografía | 0 errores obvios | Revisado 2x |
| Tono | Profesional | Personalizado al cliente |
| CTA | Al menos 1 | Claro y específico |
| Respuesta | < 24h | < 4h para urgente |

## Contenido Marketing

| Criterio | Mínimo | Ideal |
|----------|--------|-------|
| Factually correct | ✅ | Con fuentes |
| SEO | Title + meta | Title + meta + links internos |
| Imágenes | Sin derechos | Opt-in o created by AI |
| Links | Funcionan | Trackeados |

## Código / Features

| Criterio | Mínimo | Ideal |
|----------|--------|-------|
| Compila | ✅ | ✅ + tests passing |
| Smoke test | Pasa basic | Pasa full suite |
| Breaking changes | Documentados | 0 |
| Docs | README mínimo | README + comments + examples |

## Datos / Análisis

| Criterio | Mínimo | Ideal |
|----------|--------|-------|
| Source data | Referenciado | Linkado |
| Cálculos | Verificados 1x | Verificados 2x |
| Contexto | Suficiente para entender | Con charts/visualización |
| Conclusiones | Derivadas de datos | Derivadas + con acción sugerida |

## Automatizaciones

| Criterio | Mínimo | Ideal |
|----------|--------|-------|
| Funciona en prod | ✅ | ✅ en staging también |
| Rollback | Disponible | Testeado |
| Alerts | Configuradas | Configuradas + probadas |
| Logs | Disponibles | Clear + actionable |

---

## Bug Severity Classification

| Severity | Definición | SLA |
|----------|-----------|-----|
| 🔴 P1 - Blocker | Rompe flujo principal, afecta revenue | Resolver < 1h |
| 🟡 P2 - Medium | Rompe feature secundaria, workaround existe | Resolver < 24h |
| 🟢 P3 - Low | UX issue, no afecta funcionalidad | Resolver < 1 semana |

## Definition of Done

Para que un deliverable se considere "DONE":

1. ✅ Cumple los criterios mínimos de Quality Gate
2. ✅ Los tests pasan (o hay razón documentada para no tenerlos)
3. ✅ No hay blockers abiertos
4. ✅ El receptor sabe cómo usarlo
5. ✅ Si es código: en producción o con fecha de deploy confirmada
