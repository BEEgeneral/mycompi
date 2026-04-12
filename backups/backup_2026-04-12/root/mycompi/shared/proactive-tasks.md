# Tareas Proactivas Diarias — MyCompi
## Sistema de 100 Tasks adaptado para agentes

> Basado en: Martin Bell 100 Tasks Framework
> Documento completo: `/data/mycompi/shared/100-tasks.md`
> Este archivo = Qué ejecuta cada agente cada día laborable (cron: 6:00 UTC = 8h España)

---

## Formato de cada tarea

```json
{
  "id": "laura_task_001",
  "agente": "laura",
  "categoria": "KPIs / Reports / Customer",
  "tarea": "Nombre de la tarea según 100-tasks.md",
  "taskRef": "TASK 59 / TASK 61 / TASK 69-75",
  "descripcion": "Qué hacer",
  "mock": "output esperado si no hay datos reales",
  "frecuencia": "diaria|semanal|primera首发"
}
```

---

## LAURA — Customer Success & Analytics
**Área: TASK 59-61, 69-75, 86, 91-96**
**Foco: KPIs, Reports, Customer Success, Data-Driven Decisions**

### Diario (siempre)

#### laura_task_001 | KPIs Check
- **categoria:** Data & Analytics / TASK 59
- **descripcion:** Revisar los 20 KPIs principales del cliente (definidos en TASK 59) y detectar anomalías
- **output:** `{ anomalias: [], estado: "ok|warning|critical", resumen: "..." }`
- **mock:** `"0 anomalías — todos los KPIs en rango normal"`

#### laura_task_002 | Daily Report Generation
- **categoria:** Reporting / TASK 61
- **descripcion:** Generar daily report con métricas operativas del cliente
- **output:** `{ metricas: {}, incidentes: [], estado: "..." }`
- **mock:** `"0 incidentes operativos"`

#### laura_task_003 | Customer Health Check
- **categoria:** Customer Success / TASK 86
- **descripcion:** Verificar estado de salud de todos los clientes activos
- **output:** `{ clientes_saludables: N, clientes_en_riesgo: N, acciones: [...] }`
- **mock:** `"0 clientes en riesgo detectado"`

### Primera首发 de cada semana (lunes)

#### laura_task_004 | Weekly Report
- **categoria:** Reporting / TASK 61
- **descripcion:** Generar weekly report completo con análisis de progreso vs plan
- **taskRef:** TASK 61, TASK 69
- **output:** `{ progreso: {}, gaps: [], siguiente_semana: [...] }`

#### laura_task_005 | Customer NPS Review
- **categoria:** Customer / TASK 86
- **descripcion:** Revisar feedback de clientes de la última semana
- **output:** `{ nps_actual: X, tendencias: [...], acciones: [...] }`
- **mock:** `"Sin feedback nuevo en 7 días"`

#### laura_task_006 | Best Practices Check
- **categoria:** Best Practices / TASK 92-94
- **descripcion:** Verificar que los procesos del cliente siguen las best practices del área
- **output:** `{ compliant: true|false, gaps: [...], recomendaciones: [...] }`

### Primera首发 de cada mes

#### laura_task_007 | 20 KPIs Deep Dive
- **categoria:** Data & Analytics / TASK 59
- **descripcion:** Análisis profundo de los 20 KPIs: distribución, tendencias, anomalías
- **output:** `{ KPIs: [...], insights: [...], alertas: [...] }`

#### laura_task_008 | Financial Target Progress
- **categoria:** Finance / TASK 71
- **descripcion:** Analizar progreso vs objetivos financieros del mes
- **output:** `{ estado: "on-track|behind|ahead", varianzas: [...] }`

---

## ENZO — Marketing & Content
**Área: TASK 10-16, 51, 55, 62-66, 72, 85**
**Foco: Ideación, Contenido, Cross-Channel, PR, Launch**

### Diario (siempre)

#### enzo_task_001 | Content Audit
- **categoria:** Content / TASK 51
- **descripcion:** Auditar contenido existente del cliente y detectar oportunidades de republicación
- **output:** `{ posts_para_republicar: N, top_posts: [...], engagement_esperado: "..." }`
- **mock:** `"3 posts detectados para republicar esta semana"`

#### enzo_task_002 | Trending Topics
- **categoria:** Ideación / TASK 10-16
- **descripcion:** Detectar trending topics relevantes para el sector del cliente
- **output:** `{ topics: [...], relevancia: [...], oportunidad: "..." }`
- **mock:** `"3 trending topics detectados para esta semana"`

#### enzo_task_003 | Content Pipeline
- **categoria:** Content / TASK 51
- **descripcion:** Planificar contenido para los próximos 7 días
- **output:** `{ calendario: [...], ideas: [...], prioridades: [...] }`
- **mock:** `"3 ideas de contenido generadas para la semana"`

### Primera首发 de cada semana (martes)

#### enzo_task_004 | Cross-Channel Strategy Review
- **categoria:** Cross-Channel / TASK 55, TASK 72
- **descripcion:** Analizar performance por canal de marketing y proponer optimizaciones
- **output:** `{ canales_mejorados: [...], allocacion_recomendada: {...}, ROIs: {...} }`

#### enzo_task_005 | Competitive Content Analysis
- **categoria:** Competitive / TASK 11
- **descripcion:** Analizar contenido de competitors en redes y web
- **output:** `{ competitors: [...], contenido_exitoso: [...], diferenciacion: "..." }`

#### enzo_task_006 | PR Pipeline
- **categoria:** PR / TASK 63, TASK 85
- **descripcion:** Revisar pipeline de PR y oportunidades de cobertura mediática
- **output:** `{ medios_objetivo: [...], historias_candidatas: [...], next_action: "..." }`

### Primera首发 de cada mes

#### enzo_task_007 | Marketing Mix Analysis
- **categoria:** Analytics / TASK 72
- **descripcion:** Análisis completo de mix de canales: ROI, CAC, efectividad
- **output:** `{ mejor_canal: "...", peor_canal: "...", redistribucion: {...} }`

#### enzo_task_008 | Ideation Workshop Prep
- **categoria:** Ideation / TASK 14, TASK 15
- **descripcion:** Preparar materiales para design thinking workshop o ideation contest
- **output:** `{ challenge_brief: "...", temas: [...], participantes_objetivo: [...] }`

---

## CARLOS — Sales & Revenue
**Área: TASK 7-9, 29-32, 40, 54, 62, 67-68, 82**
**Foco: Org Design, Hiring, Sales Funnel, Revenue**

### Diario (siempre)

#### carlos_task_001 | Leads Pipeline Check
- **categoria:** Sales / TASK 54, TASK 82
- **descripcion:** Revisar funnel de ventas y detectar cuellos de botella
- **output:** `{ leads_nuevos: N, conversion_rate: X%, bottleneck: "...", acciones: [...] }`
- **mock:** `"0 leads fríos detectados esta semana"`

#### carlos_task_002 | Upsell Opportunities
- **categoria:** Revenue / TASK 83
- **descripcion:** Detectar oportunidades de upsell en clientes existentes
- **output:** `{ oportunidades: [...], potencial_revenue: X, prioridad: [...] }`
- **mock:** `"2 oportunidades de upsell detectadas"`

#### carlos_task_003 | Sales Funnel Health
- **categoria:** Sales / TASK 54, TASK 82
- **descripcion:** Verificar métricas del funnel: drop-off points, Stage-by-stage conversion
- **output:** `{ funnel: {...}, mayor_dropoff: "...", test_recomendado: "..." }`
- **mock:** `"Funnel saludable — sin anomalías"`

### Primera首发 de cada semana (miércoles)

#### carlos_task_004 | Competitive Sales Intel
- **categoria:** Competitive / TASK 11
- **descripcion:** Recopilar inteligencia competitiva: pricing, positioning, win/loss analysis
- **output:** `{ competitors: [...], our_advantages: [...], our_gaps: [...] }`

#### carlos_task_005 | Hiring Roadmap Status
- **categoria:** HR / TASK 9, TASK 31
- **descripcion:** Revisar estado del roadmap de hiring: abiertos, en proceso, closings
- **output:** `{ abiertos: N, en_proceso: N, cerrados_mes: N, priorities: [...] }`

#### carlos_task_006 | Org Chart Health Check
- **categoria:** Org Design / TASK 7, TASK 30
- **descripcion:** Verificar que la estructura orgánica está alineada con objetivos
- **output:** `{ gaps_identified: [...], recommendations: [...] }`

### Primera首发 de cada mes

#### carlos_task_007 | CAC:CLV Analysis
- **categoria:** Finance / TASK 83
- **descripcion:** Análisis de CAC vs CLV por segmento de cliente
- **output:** `{ ratio_actual: "X:Y", target: "1:3", segmentos_healthy: [...], action_needed: "..." }`

#### carlos_task_008 | Revenue Forecast
- **categoria:** Finance / TASK 71
- **descripcion:** Forecasting de revenue para el mes en curso
- **output:** `{ forecast: X, confidence: "high|medium|low", assumptions: [...] }`

---

## ELENA — Operations & HR
**Área: TASK 40-58, 76-90, 47-50, 52-53, 57, 87-89**
**Foco: Build & Optimize Operations, Automation, Workforce**

### Diario (siempre)

#### elena_task_001 | Operations Health Check
- **categoria:** Operations / TASK 79
- **descripcion:** Verificar métricas operativas: throughput, bottlenecks, errores
- **output:** `{ bottlenecks: [...], throughput: "...", issues: [], actions: [...] }`
- **mock:** `"0 cuellos de botella operativos"`

#### elena_task_002 | Process Automation Candidates
- **categoria:** Automation / TASK 87
- **descripcion:** Detectar procesos manuales que son candidatos a automatización
- **output:** `{ candidatos: [...], roi_estimado: {...}, prioridad: [...] }`
- **mock:** `"3 procesos candidatos para automatización"`

#### elena_task_003 | HR Dashboard Review
- **categoria:** HR / TASK 32
- **descripcion:** Revisar dashboard HR: headcount, hiring, retention, diversity
- **output:** `{ headcount_actual: N, objetivo: N, hiring_tiempo: X días, retention: X% }`
- **mock:** `"Headcount OK — 0 posiciones críticas abiertas"`

### Primera首发 de cada semana (jueves)

#### elena_task_004 | OKR Check-in
- **categoria:** OKRs / TASK 89
- **descripcion:** Verificar progreso de OKRs del equipo
- **output:** `{ objectives: [...], krs: [...], progress: X%, blockers: [...] }`

#### elena_task_005 | Supplier & Partner Review
- **categoria:** Operations / TASK 80
- **descripcion:** Revisar performance de suppliers y partners
- **output:** `{ suppliers: [...], slas_cumplidos: X%, issues: [...], next_review: "..." }`

#### elena_task_006 | Logistics & Distribution Check
- **categoria:** Logistics / TASK 47, TASK 53
- **descripcion:** Verificar estado de logística y canales de distribución
- **output:** `{ distribution_healthy: true|false, issues: [...], optimization: [...] }`

### Primera首发 de cada mes

#### elena_task_007 | Workforce Productivity Analysis
- **categoria:** Workforce / TASK 88
- **descripcion:** Análisis de productividad: output por persona, tiempo de ciclo, bottlenecks
- **output:** `{ productividad: {...}, mejores_practices: [...], improvements: [...] }`

#### elena_task_008 | Automation ROI Report
- **categoria:** Automation / TASK 87
- **descripcion:** Reporte de ROI de automatizaciones implementadas
- **output:** `{ automations_live: N, horas_ahorradas: X, roi: X%, next_candidates: [...] }`

#### elena_task_009 | Operating Model Review
- **categoria:** Operations / TASK 41, TASK 74
- **descripcion:** Revisar operating model y proponer optimizaciones basadas en datos
- **output:** `{ current_model_ok: true|false, redesign_needed: [...], priority: "..." }`

---

## DIANA — Finance & Strategy
**Área: TASK 1-6, 42, 59-61, 71, 75, 83, 90, 98-100**
**Foco: Strategy, Budget, Financial Targets, Fundraising**

### Diario (siempre)

#### diana_task_001 | Financial Health Pulse
- **categoria:** Finance / TASK 71
- **descripcion:** Check rápido de métricas financieras del día: cash flow, burn rate, runway
- **output:** `{ cash: X, burn: X/mes, runway: N meses, estado: "ok|warning|critical" }`
- **mock:** `"Cash OK — runway de 8 meses"`

#### diana_task_002 | Budget Tracking
- **categoria:** Budget / TASK 42
- **descripcion:** Tracking de budget vs actuals por categoría
- **output:** `{ categorias: [...], varianza: {...}, alerts: [...] }`
- **mock:** `"0 alertas de budget — todo dentro de rang"`

#### diana_task_003 | KPIs Finance
- **categoria:** KPIs / TASK 59
- **descripcion:** Verificar KPIs financieros del cliente
- **output:** `{ metricas: {...}, estado: "on-track|behind|ahead" }`
- **mock:** `"KPIs financieros OK"`

### Primera首发 de cada semana (viernes)

#### diana_task_004 | Weekly Financial Review
- **categoria:** Finance / TASK 61, TASK 69, TASK 71
- **descripcion:** Análisis semanal de performance financiero vs objetivos
- **output:** `{ revenue: X, costs: X, margin: X%, vs_plan: "+/-X%", acciones: [...] }`

#### diana_task_005 | Strategy Alignment Check
- **categoria:** Strategy / TASK 1-6
- **descripcion:** Verificar que las operaciones de la semana están alineadas con objetivos estratégicos
- **output:** `{ alignment_score: X/10, gaps: [...], recommendations: [...] }`

#### diana_task_006 | Cash Flow Forecast
- **categoria:** Finance / TASK 42, TASK 71
- **descripcion:** Forecast de cash flow para próximas 4 semanas
- **output:** `{ forecast_weeks: [...], runway_updated: N meses, actions: [...] }`

### Primera首发 de cada mes

#### diana_task_007 | Month-End Financial Close
- **categoria:** Finance / TASK 75
- **descripcion:** Coordinar cierre financiero de fin de mes
- **output:** `{ closed_on_time: true|false, issues: [...], statements_ready: true|false }`

#### diana_task_008 | Financial Controls Audit
- **categoria:** Finance / TASK 75
- **descripcion:** Auditar controles financieros: aprovisionamientos, autorizaciones, compliance
- **output:** `{ controls_passed: X/Y, gaps: [...], remediation: [...] }`

#### diana_task_009 | Budget Review & Forecast
- **categoria:** Budget / TASK 42, TASK 4-5
- **descripcion:** Revisar budget allocation y proponer rebalanceos si necesario
- **output:** `{ current_allocation: {...}, recommended: {...}, rationale: "..." }`

#### diana_task_010 | Fundraising Readiness
- **categoria:** Fundraising / TASK 90, TASK 98
- **descripcion:** Evaluar readiness para fundraising: materials, metrics, story
- **output:** `{ ready_score: X/10, missing: [...], timeline: "..." }`

---

## MARCOS — Product & Engineering
**Área: TASK 17-24, 33-39, 58, 76-78, 81, 84, 89**
**Foco: Product Discovery, MVP Development, Tech Infrastructure, Scale**

### Diario (siempre)

#### marcos_task_001 | Product Roadmap Grooming
- **categoria:** Product / TASK 76
- **descripcion:** Revisar y priorizar el product backlog del cliente
- **output:** `{ prioritized_backlog: [...], top_3: [...], deprioritized: [...] }`
- **mock:** `"Backlog grooming OK — sin cambios urgente"`

#### marcos_task_002 | Tech Infrastructure Health
- **categoria:** Tech / TASK 58, TASK 78
- **descripcion:** Check de health de infraestructura: uptime, latency, errores, security
- **output:** `{ uptime: X%, latency_p99: Xms, errors: N, security_issues: N }`
- **mock:** `"Infraestructura OK — 99.9% uptime, 0 incidentes"`

#### marcos_task_003 | Bug & Tech Debt Tracker
- **categoria:** Engineering / TASK 62, TASK 66
- **descripcion:** Seguimiento de bugs abiertos y tech debt prioritario
- **output:** `{ bugs_criticos: N, bugs_abiertos: N, tech_debt_hrs: N, actions: [...] }`
- **mock:** `"0 bugs críticos — tech debt bajo control"`

### Primera首发 de cada semana (lunes)

#### marcos_task_004 | Lean Startup Loop Review
- **categoria:** Product / TASK 24
- **descripcion:** Revisar estado del Build-Measure-Learn loop actual
- **output:** `{ loop_state: "building|measuring|learning|pivoting", hypothesis: "...", metrics: {...} }`

#### marcos_task_005 | MVP Progress Review
- **categoria:** MVP / TASK 33-39
- **descripcion:** Evaluar progreso del MVP: scope, timeline, quality
- **output:** `{ mvp_progress: X%, scope_healthy: true|false, risks: [...], next_milestone: "..." }`

#### marcos_task_006 | Competitive Tech Analysis
- **categoria:** Competitive / TASK 11, TASK 33
- **descripcion:** Analizar advantages tecnológicos vs competencia
- **output:** `{ our_tech_advantages: [...], competitor_advantages: [...], gap_to_close: [...] }`

### Primera首发 de cada mes

#### marcos_task_007 | Scalability Audit
- **categoria:** Tech / TASK 78
- **descripcion:** Auditoría de escalabilidad: load testing results, bottlenecks, optimization opportunities
- **output:** `{ scalability_score: X/10, bottlenecks: [...], optimizations: [...], next_scale_test: "..." }`

#### marcos_task_008 | UI/UX Enhancement Plan
- **categoria:** UX / TASK 77
- **descripcion:** Plan de mejora de UX basado en usability tests y engagement data
- **output:** `{ issues_prioritized: [...], quick_wins: [...], major_redo: [...], expected_impact: "..." }`

#### marcos_task_009 | CRM & Payments Audit
- **categoria:** Product / TASK 84, TASK 81
- **descripcion:** Revisar estado de CRM y payment infrastructure
- **output:** `{ crm_healthy: true|false, payment_conversion: X%, fraud_rate: X%, actions: [...] }`

#### marcos_task_010 | OKR Product Alignment
- **categoria:** OKRs / TASK 89
- **descripcion:** Asegurar que el product roadmap está alineado con OKRs del trimestre
- **output:** `{ alignment: X/10, misaligned_items: [...], recommendation: "..." }`

---

## Sistema de ejecución

### Prioridades por día de la semana
| Día | Agente | Tareas # |
|-----|--------|---------|
| Lunes | Laura, Marcos | Laura 1-3 + 4-6, Marcos 1-3 + 4-6 |
| Martes | Enzo | Enzo 1-3 + 4-6 |
| Miércoles | Carlos | Carlos 1-3 + 4-6 |
| Jueves | Elena | Elena 1-3 + 4-6 |
| Viernes | Diana | Diana 1-3 + 4-6 |

### Reglas
1. **3 tareas diarias máximo** por agente para no saturar
2. **Primera首发 de semana** = la primera vez que se ejecuta el cron esa semana (no necesariamente lunes)
3. **Mock output** = lo que devuelve si no hay datos reales del cliente
4. **Todas las tareas escriben a `/data/mycompi/shared/proactive-log.md`** con timestamp

### Cómo añadir una nueva tarea
1. Añadir entrada con formato JSON en la sección del agente correspondiente
2. Actualizar `proactive-daily.js` con el handler si es una tarea nueva (no derivada de TASK ref)
3. No superar 3 tareas diarias por agente
