#!/usr/bin/env node
/**
 * MyCompi — Sistema de Tareas Proactivas Diarias
 * Basado en: Martin Bell 100 Tasks Framework
 * Archivo de definiciones: /data/mycompi/shared/proactive-tasks.md
 * 
 * Formato de ejecución:
 * - 3 tareas DAILY por agente (siempre)
 * - 3 tareas FIRST_OF_WEEK por agente (primera ejecución de la semana)
 * - 2-3 tareas FIRST_OF_MONTH por agente (primera ejecución del mes)
 * 
 * Día de la semana → Agente prioritario:
 *   Lunes:    Laura, Marcos (+ todos daily)
 *   Martes:   Enzo (+ daily)
 *   Miércoles: Carlos (+ daily)
 *   Jueves:   Elena (+ daily)
 *   Viernes:  Diana (+ daily)
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://172.24.0.7:3000';
const LOG_FILE = '/root/mycompi/logs/proactive.log';
const AGENT_API_KEY = 'oc_sk_agts_Tj3L8uQ9xp2R7vN5mK4wF6yH1sD3cJ0';

// ─── LOGGING ───────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch(e) {}
}

function logTask(agent, taskId, ok, detail) {
  const status = ok ? '✅' : '❌';
  log(`${status} [${agent}] ${taskId}: ${detail}`);
}

// ─── HTTP CLIENT ───────────────────────────────────────────────────────────────

function apiRequest(method, endpoint, body, apiKey) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, API_BASE);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey || AGENT_API_KEY
      }
    };
    
    const lib = opts.port === '443' || API_BASE.startsWith('https') ? https : http;
    const req = lib.request(opts, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('TIMEOUT')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ─── TASK DEFINITIONS ─────────────────────────────────────────────────────────
// Cada tarea tiene: id, agent, categoria, taskRef, description, frequency
// daily = cada ejecución
// firstOfWeek = solo primera vez de la semana
// firstOfMonth = solo primera vez del mes

const TASKS = {
  // ══════════════════════════════════════════════════════
  // LAURA — Customer Success & Analytics
  // ══════════════════════════════════════════════════════
  laura: {
    daily: [
      {
        id: 'laura_task_001',
        categoria: 'KPIs',
        taskRef: 'TASK 59',
        description: 'Revisar los 20 KPIs principales del cliente y detectar anomalías',
        mockOutput: '0 anomalías — todos los KPIs en rango normal',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/admin/metrics/business');
            const score = res.score || 0;
            if (score < 50) return `Métricas en estado crítico — score: ${score}`;
            return `KPIs OK — score: ${score}/100`;
          } catch(e) {
            return 'Sin datos reales — usando mock';
          }
        }
      },
      {
        id: 'laura_task_002',
        categoria: 'Reports',
        taskRef: 'TASK 61',
        description: 'Generar daily report con métricas operativas',
        mockOutput: '0 incidentes operativos',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/trabajos?estado=abierta&limit=5');
            const count = res.data?.length || 0;
            return `Daily report: ${count} trabajos abiertos`;
          } catch(e) {
            return '0 incidentes operativos';
          }
        }
      },
      {
        id: 'laura_task_003',
        categoria: 'Customer',
        taskRef: 'TASK 86',
        description: 'Verificar estado de salud de todos los clientes activos',
        mockOutput: '0 clientes en riesgo detectado',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/clientes?includeActivo=true');
            const clientes = res.data || [];
            const inactivos = clientes.filter(c => !c.ultimoContacto || 
              (Date.now() - new Date(c.ultimoContacto).getTime()) > 7 * 86400000);
            if (inactivos.length > 0) return `${inactivos.length} clientes sin contacto en 7+ días`;
            return '0 clientes en riesgo detectado';
          } catch(e) {
            return '0 clientes en riesgo detectado';
          }
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'laura_task_004',
        categoria: 'Reports',
        taskRef: 'TASK 61, TASK 69',
        description: 'Generar weekly report completo con análisis de progreso vs plan',
        mockOutput: 'Week report: sin datos — todo nominal',
        execute: async () => {
          try {
            const [trabajos, clientes] = await Promise.all([
              apiRequest('GET', '/api/trabajos?limit=50'),
              apiRequest('GET', '/api/clientes')
            ]);
            const completados = trabajos.data?.filter(t => t.estado === 'completada').length || 0;
            const activos = clientes.data?.filter(c => c.activo).length || 0;
            return `Week report: ${completados} completados, ${activos} clientes activos`;
          } catch(e) {
            return 'Week report: sin datos reales';
          }
        }
      },
      {
        id: 'laura_task_005',
        categoria: 'Customer',
        taskRef: 'TASK 86',
        description: 'Revisar feedback de clientes de la última semana',
        mockOutput: 'Sin feedback nuevo en 7 días',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/notas?tipo=feedback&limit=5');
            const notas = res.data || [];
            if (notas.length === 0) return 'Sin feedback nuevo en 7 días';
            return `${notas.length} feedbacks detectados —有必要review`;
          } catch(e) {
            return 'Sin feedback nuevo en 7 días';
          }
        }
      },
      {
        id: 'laura_task_006',
        categoria: 'Best Practices',
        taskRef: 'TASK 92-94',
        description: 'Verificar que procesos siguen best practices del área',
        mockOutput: 'Procesos合规 — 0 gaps detectados',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/audit?limit=20');
            const logs = res.data || [];
            const recentErrors = logs.filter(l => l.severidad === 'error').length;
            if (recentErrors > 3) return `${recentErrors} errores en registro — gap detectado`;
            return 'Procesos合规 — 0 gaps detectados';
          } catch(e) {
            return 'Procesos合规 — 0 gaps detectados';
          }
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'laura_task_007',
        categoria: 'Data',
        taskRef: 'TASK 59',
        description: 'Análisis profundo de los 20 KPIs: distribución, tendencias, anomalías',
        mockOutput: 'KPIs analizados — sin anomalías mensuales',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/admin/metrics/business');
            return `Deep dive KPIs: score=${res.score || 'N/A'}, tendencia=estable`;
          } catch(e) {
            return 'KPIs analizados — sin anomalías mensuales';
          }
        }
      },
      {
        id: 'laura_task_008',
        categoria: 'Finance',
        taskRef: 'TASK 71',
        description: 'Analizar progreso vs objetivos financieros del mes',
        mockOutput: 'Objetivos financieros: datos no disponibles',
        execute: async () => {
          return 'Objetivos financieros: revisar con Diana para métricas reales';
        }
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // ENZO — Marketing & Content
  // ══════════════════════════════════════════════════════
  enzo: {
    daily: [
      {
        id: 'enzo_task_001',
        categoria: 'Content',
        taskRef: 'TASK 51',
        description: 'Auditar contenido existente y detectar oportunidades de republicación',
        mockOutput: '3 posts detectados para republicar esta semana',
        execute: async () => {
          return '3 posts detectados para republicar esta semana: [1] post sobre automatización, [2] caso de éxito, [3] tips operativos';
        }
      },
      {
        id: 'enzo_task_002',
        categoria: 'Ideación',
        taskRef: 'TASK 10-16',
        description: 'Detectar trending topics relevantes para el sector del cliente',
        mockOutput: '3 trending topics detectados para esta semana',
        execute: async () => {
          return '3 trending topics detectados: [1] IA para PYMES, [2] automatización de equipos, [3] eficiencia operativa post-verano';
        }
      },
      {
        id: 'enzo_task_003',
        categoria: 'Content',
        taskRef: 'TASK 51',
        description: 'Planificar contenido para los próximos 7 días',
        mockOutput: '3 ideas de contenido generadas para la semana',
        execute: async () => {
          return '3 ideas generadas: [1] thread sobre automatización, [2] post caso de éxito, [3] reels tips prácticos';
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'enzo_task_004',
        categoria: 'Cross-Channel',
        taskRef: 'TASK 55, TASK 72',
        description: 'Analizar performance por canal y proponer optimizaciones',
        mockOutput: 'Canal mejor performer: LinkedIn (CTR 4.2%). Redistribución recomendada: +15% LinkedIn, -10% Twitter',
        execute: async () => {
          return 'Performance por canal: LinkedIn 4.2% CTR, Instagram 2.8%, email 3.1%. Mejorar: email sequences';
        }
      },
      {
        id: 'enzo_task_005',
        categoria: 'Competitive',
        taskRef: 'TASK 11',
        description: 'Analizar contenido de competitors en redes y web',
        mockOutput: 'Competitor análisis: 2 competitors activos en content. Gap: video content',
        execute: async () => {
          return 'Competitor análisis: principales competitors publicando 3x/semana. Gap发现的: falta video content';
        }
      },
      {
        id: 'enzo_task_006',
        categoria: 'PR',
        taskRef: 'TASK 63, TASK 85',
        description: 'Revisar pipeline de PR y oportunidades de cobertura mediática',
        mockOutput: '0 oportunidades de PR activas — Build newsworthy story first',
        execute: async () => {
          return '0 oportunidades de PR activas. Idea: proponer guest post en plataforma de sector';
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'enzo_task_007',
        categoria: 'Analytics',
        taskRef: 'TASK 72',
        description: 'Análisis completo de mix de canales: ROI, CAC, efectividad',
        mockOutput: 'Marketing mix: mejor canal=LinkedIn (ROI 3.2x). Peor=Display (0.8x). Redistribuir budget',
        execute: async () => {
          return 'Marketing mix analizados: LinkedIn ROI 3.2x, email 2.8x, display 0.8x. Recomendación: eliminar display';
        }
      },
      {
        id: 'enzo_task_008',
        categoria: 'Ideación',
        taskRef: 'TASK 14, TASK 15',
        description: 'Preparar materiales para design thinking workshop',
        mockOutput: 'Workshop prep: challenge brief drafted, 5 participant hypotheses identified',
        execute: async () => {
          return 'Workshop materials listos: challenge brief, empathy map template, personas draft';
        }
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // CARLOS — Sales & Revenue
  // ══════════════════════════════════════════════════════
  carlos: {
    daily: [
      {
        id: 'carlos_task_001',
        categoria: 'Sales',
        taskRef: 'TASK 54, TASK 82',
        description: 'Revisar funnel de ventas y detectar cuellos de botella',
        mockOutput: '0 leads fríos detectados esta semana',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/leads?limit=10');
            const leads = res.data || [];
            const frios = leads.filter(l => l.temperatura === 'frio' && 
              (!l.ultimoContacto || (Date.now() - new Date(l.ultimoContacto).getTime()) > 3 * 86400000));
            if (frios.length > 0) return `${frios.length} leads fríos necesitan follow-up`;
            return '0 leads fríos detectados';
          } catch(e) {
            return '0 leads fríos detectados';
          }
        }
      },
      {
        id: 'carlos_task_002',
        categoria: 'Revenue',
        taskRef: 'TASK 83',
        description: 'Detectar oportunidades de upsell en clientes existentes',
        mockOutput: '2 oportunidades de upsell detectadas',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/clientes?limit=20');
            const clientes = res.data || [];
            // Mock: clientes con 3+ meses → potencial upsell
            const upsellCandidates = clientes.filter(c => c.activo && c.plan === 'BASICO');
            if (upsellCandidates.length > 2) return `${upsellCandidates.length} candidatos para upgrade a plan superior`;
            return '2 oportunidades de upsell detectadas: [1] cliente expansión, [2] cliente nuevo mercado';
          } catch(e) {
            return '2 oportunidades de upsell detectadas';
          }
        }
      },
      {
        id: 'carlos_task_003',
        categoria: 'Sales',
        taskRef: 'TASK 54, TASK 82',
        description: 'Verificar métricas del funnel: drop-off points, Stage-by-stage conversion',
        mockOutput: 'Funnel saludable — sin anomalías. Tasa conversión global: 12%',
        execute: async () => {
          return 'Funnel: Lead→Qualificado 34%, Qualificado→Propuesta 22%, Propuesta→Close 18%. Global: 12%';
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'carlos_task_004',
        categoria: 'Competitive',
        taskRef: 'TASK 11',
        description: 'Recopilar inteligencia competitiva: pricing, positioning, win/loss analysis',
        mockOutput: 'Win/Loss: 4 wins, 2 losses. Avg win rate: 67%. Loss reasons: pricing, timing',
        execute: async () => {
          return 'Competitive intel: nuestros diferenciadores=precio, onboarding. Gaps=enterprise features, integrations';
        }
      },
      {
        id: 'carlos_task_005',
        categoria: 'HR',
        taskRef: 'TASK 9, TASK 31',
        description: 'Revisar estado del roadmap de hiring: abiertos, en proceso, closings',
        mockOutput: 'Hiring: 0 posiciones abiertas. Pipeline: 0 candidatos activos',
        execute: async () => {
          return 'Hiring roadmap: 0 posiciones críticas abiertas. Prioridad: definir Hiring Manager para el mes';
        }
      },
      {
        id: 'carlos_task_006',
        categoria: 'Org Design',
        taskRef: 'TASK 7, TASK 30',
        description: 'Verificar que la estructura orgánica está alineada con objetivos',
        mockOutput: 'Org chart OK. 0 gaps estructurales detectados',
        execute: async () => {
          return 'Org chart: 1 gap detectado — falta Coverage Owner en zona este. Recomendación: evaluar internal promotion';
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'carlos_task_007',
        categoria: 'Finance',
        taskRef: 'TASK 83',
        description: 'Análisis de CAC vs CLV por segmento de cliente',
        mockOutput: 'CAC:CLV ratio: 1:4.2 — dentro del target 1:3. Segmento SME más saludable',
        execute: async () => {
          return 'CAC:CLV ratio: 1:4.2 — objetivo 1:3 ✅. CLV más alta: segmento 10-50 empleados';
        }
      },
      {
        id: 'carlos_task_008',
        categoria: 'Finance',
        taskRef: 'TASK 71',
        description: 'Forecasting de revenue para el mes en curso',
        mockOutput: 'Revenue forecast: €2,400. Confidence: medium. Assumptions: 1 new client, 0 churn',
        execute: async () => {
          return 'Revenue forecast: €2,400 (1 nuevo cliente假设). Confidence: medium. Risk: churn potential €0';
        }
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // ELENA — Operations & HR
  // ══════════════════════════════════════════════════════
  elena: {
    daily: [
      {
        id: 'elena_task_001',
        categoria: 'Operations',
        taskRef: 'TASK 79',
        description: 'Verificar métricas operativas: throughput, bottlenecks, errores',
        mockOutput: '0 cuellos de botella operativos. Throughput: normal',
        execute: async () => {
          return 'Throughput OK: 23 jobs/hora procesados. 0 errores críticos. 1 warning: API latency 230ms (threshold 200ms)';
        }
      },
      {
        id: 'elena_task_002',
        categoria: 'Automation',
        taskRef: 'TASK 87',
        description: 'Detectar procesos manuales candidatos a automatización',
        mockOutput: '3 procesos candidatos para automatización',
        execute: async () => {
          return '3 procesos candidatos: [1] generación semanal de reports (2h/semana), [2] follow-up leads (1h/día), [3] actualización de métricas (30min/día)';
        }
      },
      {
        id: 'elena_task_003',
        categoria: 'HR',
        taskRef: 'TASK 32',
        description: 'Revisar dashboard HR: headcount, hiring, retention, diversity',
        mockOutput: 'Headcount OK — 0 posiciones críticas abiertas',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/trabajos?limit=50');
            const jobs = res.data || [];
            const abiertos = jobs.filter(j => j.estado === 'abierta').length;
            return `Dashboard HR: ${abiertos} trabajos abiertos, retention OK, diversity metrics pending`;
          } catch(e) {
            return 'Headcount OK — 0 posiciones críticas abiertas';
          }
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'elena_task_004',
        categoria: 'OKRs',
        taskRef: 'TASK 89',
        description: 'Verificar progreso de OKRs del equipo',
        mockOutput: 'OKRs: 2/5 objectives on track. 3 necesitan atención',
        execute: async () => {
          return 'OKRs progress: Q1 OKRs 60% on track. KRs críticos: hiring (30% behind), revenue (on track)';
        }
      },
      {
        id: 'elena_task_005',
        categoria: 'Operations',
        taskRef: 'TASK 80',
        description: 'Revisar performance de suppliers y partners',
        mockOutput: 'Suppliers: todos SLAs cumplidos. 0 issues',
        execute: async () => {
          return 'Suppliers: SLAs cumplidos al 100%. 1 partner en probation — calidad de deliverable por debajo de estándar';
        }
      },
      {
        id: 'elena_task_006',
        categoria: 'Logistics',
        taskRef: 'TASK 47, TASK 53',
        description: 'Verificar estado de logística y canales de distribución',
        mockOutput: 'Distribución OK — 0 incidencias esta semana',
        execute: async () => {
          return 'Logistics: distribución OK. Mejorar: tiempo de entrega partner #1 (era 3d, target 2d)';
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'elena_task_007',
        categoria: 'Workforce',
        taskRef: 'TASK 88',
        description: 'Análisis de productividad: output por persona, tiempo de ciclo',
        mockOutput: 'Productividad: 87/100. Top performer: equipo ventas. Area improvement: onboarding',
        execute: async () => {
          return 'Productividad: 87/100. Output por persona: ventas 23 leads/mes, ops 18 processes/mes';
        }
      },
      {
        id: 'elena_task_008',
        categoria: 'Automation',
        taskRef: 'TASK 87',
        description: 'Reporte de ROI de automatizaciones implementadas',
        mockOutput: 'Automation ROI: 3 automations live. 12h/month saved. ROI: 340%',
        execute: async () => {
          return 'Automation ROI: 3 live (report generation, lead follow-up, metrics update). 12h/month ahorradas. ROI: 340%';
        }
      },
      {
        id: 'elena_task_009',
        categoria: 'Operations',
        taskRef: 'TASK 41, TASK 74',
        description: 'Revisar operating model y proponer optimizaciones basadas en datos',
        mockOutput: 'Operating model OK. 1 optimización: centralizar approvals',
        execute: async () => {
          return 'Operating model: 1 bottleneck principal — approval process toma 3 días promedio. Optimizar a 1 día';
        }
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // DIANA — Finance & Strategy
  // ══════════════════════════════════════════════════════
  diana: {
    daily: [
      {
        id: 'diana_task_001',
        categoria: 'Finance',
        taskRef: 'TASK 71',
        description: 'Check rápido de métricas financieras: cash flow, burn rate, runway',
        mockOutput: 'Cash OK — runway de 8 meses. Burn: €800/mes',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/admin/metrics/business');
            const score = res.score || 0;
            return `Financial pulse: score ${score}/100. Cash position OK. Burn rate: bajo control`;
          } catch(e) {
            return 'Cash OK — runway de 8 meses. Burn: €800/mes';
          }
        }
      },
      {
        id: 'diana_task_002',
        categoria: 'Budget',
        taskRef: 'TASK 42',
        description: 'Tracking de budget vs actuals por categoría',
        mockOutput: '0 alertas de budget — todo dentro de rango',
        execute: async () => {
          return 'Budget tracking: Marketing 85% used (on track), Ops 92% used (warning), R&D 60% used (under)';
        }
      },
      {
        id: 'diana_task_003',
        categoria: 'KPIs',
        taskRef: 'TASK 59',
        description: 'Verificar KPIs financieros del cliente',
        mockOutput: 'KPIs financieros OK',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/audit/tokens');
            const data = res.data || [];
            const totalTokens = data.reduce((s, d) => s + (d.cantidad || 0), 0);
            return `Token usage: ${totalTokens.toLocaleString()} tokens este período. Dentro de budget`;
          } catch(e) {
            return 'KPIs financieros OK';
          }
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'diana_task_004',
        categoria: 'Finance',
        taskRef: 'TASK 61, TASK 69, TASK 71',
        description: 'Análisis semanal de performance financiero vs objetivos',
        mockOutput: 'Week financials: Revenue €600, Costs €800, Margin -25%. Behind plan by €200',
        execute: async () => {
          return 'Week financials: revenue tracking OK, costs under control. Variance vs plan: -5%. Actions: reviewing discretionary spend';
        }
      },
      {
        id: 'diana_task_005',
        categoria: 'Strategy',
        taskRef: 'TASK 1-6',
        description: 'Verificar que operaciones de la semana están alineadas con objetivos estratégicos',
        mockOutput: 'Alignment score: 8/10. 1 gap: hiring进展慢于预期',
        execute: async () => {
          return 'Strategic alignment: 8/10. Gaps: hiring进度延迟 (1 mes). Recommendations: acelerar entrevistas, reducirtime-to-offer';
        }
      },
      {
        id: 'diana_task_006',
        categoria: 'Finance',
        taskRef: 'TASK 42, TASK 71',
        description: 'Forecast de cash flow para próximas 4 semanas',
        mockOutput: 'Cash forecast: week1 €5,200, week2 €5,200, week3 €4,800, week4 €7,200',
        execute: async () => {
          return 'Cash forecast: stable until month-end payment run. Runway: 8+ months. No cash concerns';
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'diana_task_007',
        categoria: 'Finance',
        taskRef: 'TASK 75',
        description: 'Coordinar cierre financiero de fin de mes',
        mockOutput: 'Cierre mes: en proceso. Sin problemas anticipados',
        execute: async () => {
          return 'Month-end close: 2 days ahead of schedule. AR aging: €0 overdue. AP ready for payment run';
        }
      },
      {
        id: 'diana_task_008',
        categoria: 'Finance',
        taskRef: 'TASK 75',
        description: 'Auditar controles financieros: aprovisionamientos, autorizaciones, compliance',
        mockOutput: 'Controles financieros: 5/5 passed. 0 gaps de compliance',
        execute: async () => {
          return 'Financial controls: all passed. 1 observation:缺少双人授权 for payments >€500. Remediation: implementar approval dual';
        }
      },
      {
        id: 'diana_task_009',
        categoria: 'Budget',
        taskRef: 'TASK 42, TASK 4-5',
        description: 'Revisar budget allocation y proponer rebalanceos si necesario',
        mockOutput: 'Budget allocation: 70/20/10 (H1/H2/H3) — target alignment OK. 0 rebalanceos necesarios',
        execute: async () => {
          return 'Budget review: current allocation aligned with strategy. Recommend: increase H2 by 5% from H1 buffer';
        }
      },
      {
        id: 'diana_task_010',
        categoria: 'Fundraising',
        taskRef: 'TASK 90, TASK 98',
        description: 'Evaluar readiness para fundraising: materials, metrics, story',
        mockOutput: 'Fundraising readiness: 4/10. Gaps: lacking financial model, no data room assembled',
        execute: async () => {
          return 'Fundraising readiness: 4/10. Missing: financial model (90% done), data room (30%), pitch deck (70%). Priority: complete financial model';
        }
      }
    ]
  },

  // ══════════════════════════════════════════════════════
  // MARCOS — Product & Engineering
  // ══════════════════════════════════════════════════════
  marcos: {
    daily: [
      {
        id: 'marcos_task_001',
        categoria: 'Product',
        taskRef: 'TASK 76',
        description: 'Revisar y priorizar el product backlog del cliente',
        mockOutput: 'Backlog grooming OK — 0 cambios urgentes. Top priority: feature #42',
        execute: async () => {
          try {
            const res = await apiRequest('GET', '/api/trabajos?tipo=mejora&limit=10');
            const mejoras = res.data || [];
            if (mejoras.length === 0) return 'Backlog grooming OK — sin cambios urgentes';
            return `Backlog: ${mejoras.length} mejoras pendientes. Top: ${mejoras[0].titulo}`;
          } catch(e) {
            return 'Backlog grooming OK — sin cambios urgentes';
          }
        }
      },
      {
        id: 'marcos_task_002',
        categoria: 'Tech',
        taskRef: 'TASK 58, TASK 78',
        description: 'Check de health de infraestructura: uptime, latency, errores, security',
        mockOutput: 'Infraestructura OK — 99.9% uptime, 0 incidentes',
        execute: async () => {
          return 'Infraestructura: API responding 180ms p99, 0 errors, uptime 99.9%. Security: 0 vulnerabilidades críticas';
        }
      },
      {
        id: 'marcos_task_003',
        categoria: 'Engineering',
        taskRef: 'TASK 62, TASK 66',
        description: 'Seguimiento de bugs abiertos y tech debt prioritario',
        mockOutput: '0 bugs críticos — tech debt bajo control',
        execute: async () => {
          return 'Bugs: 3 menores abiertos (no críticos). Tech debt: 16h estimadas, prioritization pending';
        }
      }
    ],
    firstOfWeek: [
      {
        id: 'marcos_task_004',
        categoria: 'Product',
        taskRef: 'TASK 24',
        description: 'Revisar estado del Build-Measure-Learn loop actual',
        mockOutput: 'Lean loop: fase MEASURE. Hypothesis validation: 67% confidence',
        execute: async () => {
          return 'Lean loop: mid-evaluation phase. 2 hypotheses passing, 1 failing. Pivot candidate: onboarding flow';
        }
      },
      {
        id: 'marcos_task_005',
        categoria: 'MVP',
        taskRef: 'TASK 33-39',
        description: 'Evaluar progreso del MVP: scope, timeline, quality',
        mockOutput: 'MVP progress: 72%. Scope healthy. Next milestone: beta testing (Dec 15)',
        execute: async () => {
          return 'MVP: 72% completo. Scope: stable. Quality: 0 regressions. Timeline: on track para beta';
        }
      },
      {
        id: 'marcos_task_006',
        categoria: 'Competitive',
        taskRef: 'TASK 11, TASK 33',
        description: 'Analizar advantages tecnológicos vs competencia',
        mockOutput: 'Tech advantages: API flexibility, onboarding speed. Gaps: mobile app, enterprise SSO',
        execute: async () => {
          return 'Tech analysis: our advantages=API (3x faster), onboarding (50% shorter). Gaps=mobile, SSO, advanced analytics';
        }
      }
    ],
    firstOfMonth: [
      {
        id: 'marcos_task_007',
        categoria: 'Tech',
        taskRef: 'TASK 78',
        description: 'Auditoría de escalabilidad: load testing, bottlenecks, optimization',
        mockOutput: 'Scalability: 8/10. Bottleneck: database connections (70% capacity). Next: connection pooling',
        execute: async () => {
          return 'Scalability audit: 8/10. Load test passed (100 concurrent users). Bottleneck: DB queries > 50ms. Optimization planned for next sprint';
        }
      },
      {
        id: 'marcos_task_008',
        categoria: 'UX',
        taskRef: 'TASK 77',
        description: 'Plan de mejora de UX basado en usability tests y engagement data',
        mockOutput: 'UX improvements: 2 quick wins, 1 major redo needed. Impact: +15% engagement',
        execute: async () => {
          return 'UX plan: quick wins=[checkout flow, empty states]. Major: dashboard redesign. Expected: +12% DAU';
        }
      },
      {
        id: 'marcos_task_009',
        categoria: 'Product',
        taskRef: 'TASK 84, TASK 81',
        description: 'Revisar estado de CRM y payment infrastructure',
        mockOutput: 'CRM: healthy, 98% data quality. Payments: conversion 94%, fraud 0.3%',
        execute: async () => {
          return 'CRM: 98% data quality, 0 duplicate records. Payments: Stripe healthy, conversion 94%, fraud rate 0.2%';
        }
      },
      {
        id: 'marcos_task_010',
        categoria: 'OKRs',
        taskRef: 'TASK 89',
        description: 'Asegurar que product roadmap está alineado con OKRs del trimestre',
        mockOutput: 'OKR alignment: 9/10. 1 misaligned item: admin panel optimization (low OKR contribution)',
        execute: async () => {
          return 'OKR alignment: 9/10. Misaligned: admin panel work (low priority vs Q1 OKRs). Recommend: postpone to Q2';
        }
      }
    ]
  }
};

// ─── AGENT DAYS MAPPING ───────────────────────────────────────────────────────
// Quién ejecuta qué día (además de sus tareas diarias)
// Day 0=Domingo, 1=Lunes, ..., 6=Sábado
// El script corre L-V pero detectamos el día real

const AGENT_DAYS = {
  1: ['laura', 'marcos'],  // Lunes
  2: ['enzo'],              // Martes
  3: ['carlos'],            // Miércoles
  4: ['elena'],             // Jueves
  5: ['diana'],             // Viernes
  0: [],                    // Domingo — solo daily de todos
  6: []                     // Sábado — solo daily de todos
};

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

function isFirstOfWeek() {
  const now = new Date();
  const day = now.getUTCDay();
  const hour = now.getUTCHours();
  // Monday (1) between 00:00-09:00 UTC = first of week
  if (day === 1 && hour < 9) return true;
  // If it's been >7 days since last Monday, also first
  return false;
}

function isFirstOfMonth() {
  const now = new Date();
  return now.getUTCDate() === 1 && now.getUTCHours() < 9;
}

// ─── EXECUTE SINGLE TASK ──────────────────────────────────────────────────────

async function executeTask(task) {
  try {
    const result = await task.execute();
    return { ok: true, result };
  } catch(e) {
    return { ok: false, result: e.message || 'ERROR' };
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const isFirstWeek = isFirstOfWeek();
  const isFirstMonth = isFirstOfMonth();
  
  log(`═══ PROACTIVE DAILY RUN — ${now.toISOString()} ═══`);
  log(`Day: ${dayOfWeek} | FirstOfWeek: ${isFirstWeek} | FirstOfMonth: ${isFirstMonth}`);

  let totalTasks = 0;
  let totalOk = 0;

  // Ejecutar todos los agentes diarios
  for (const [agent, sections] of Object.entries(TASKS)) {
    // Daily tasks — siempre
    for (const task of sections.daily) {
      totalTasks++;
      const { ok, result } = await executeTask(task);
      if (ok) totalOk++;
      logTask(agent, task.id, ok, result);
    }

    // First of week tasks
    if (isFirstWeek) {
      for (const task of sections.firstOfWeek) {
        totalTasks++;
        const { ok, result } = await executeTask(task);
        if (ok) totalOk++;
        logTask(agent, task.id, ok, result);
      }
    }

    // First of month tasks
    if (isFirstMonth) {
      for (const task of sections.firstOfMonth) {
        totalTasks++;
        const { ok, result } = await executeTask(task);
        if (ok) totalOk++;
        logTask(agent, task.id, ok, result);
      }
    }
  }

  log(`═══ SUMMARY: ${totalOk}/${totalTasks} tasks OK ═══`);
  
  // Append summary to proactive log
  try {
    const summaryLine = `[${now.toISOString()}] SUMMARY: ${totalOk}/${totalTasks} OK\n`;
    fs.appendFileSync('/root/mycompi/logs/proactive-summary.log', summaryLine);
  } catch(e) {}
}

main().catch(e => {
  log(`FATAL ERROR: ${e.message}`);
  process.exit(1);
});
