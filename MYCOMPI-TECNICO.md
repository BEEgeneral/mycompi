# MYCOMPI — DOCUMENTACIÓN TÉCNICA COMPLETA

## 1. agent-queue-reader.js
Ubicacion: /root/mycompi/scripts/agent-queue-reader.js
EXISTE? NO — reconstruir desde cero.

Uso: node /root/mycompi/scripts/agent-queue-reader.js [AGENT_ID]

Logica:
1. Conectar a PostgreSQL (DATABASE_URL)
2. SELECT * FROM Trabajo WHERE agenteId = ? AND estado IN (TODO, IN_PROGRESS)
3. Ordenar por prioridad (CRITICA > ALTA > MEDIA > BAJA)
4. Devolver cola formateada

## 2. Docker Compose

Legacy (actual): /root/mycompi/docker-compose.yml
- mycompi-app (container unico, network_mode host)

Nuevo (/opt/mycompi/):
- traefik (reverse proxy + SSL)
- postgres (:5432)
- redis (:6379)
- api (:3000)
- paperclip (:3100)
- openclaw (:57457)
- static (nginx :80)

## 3. Prisma Schema

Tablas principales:
- Cliente (id, nombre, slug, email, plan, stripeCustomerId)
- Usuario (clienteId, nombre, email, passwordHash, rol)
- Agente (id, clienteId, workerId, nombre, email, tipo, config, estado, ultimoHeartbeat, budgetTokensMes)
- Trabajo (id, clienteId, agenteId, titulo, estado, prioridad, parentId, requiereAprobacion, aprobadoPor)
- Pago (clienteId, stripePaymentId, cantidad, estado, tipo)
- Documento (clienteId, tipo, titulo, contenido)
- Mensaje (agenteId, paraAgenteId, contenido, tipo)
- Notificacion (clienteId, agenteId, tipo, titulo, contenido)
- Email (messageId, de, para, asunto, texto, estado, clienteId)
- InteraccionChat (clienteId, agenteId, mensajeOriginal, respuestaAgente, estado)
- OnboardingSequence (clienteId, dia1Sent, dia3Sent, dia7Sent)
- ActivationToken (token, email, expiresAt, used)

Enums clave:
- Prioridad: BAJA / MEDIA / ALTA / CRITICA
- EstadoTrabajo: TODO / IN_PROGRESS / COMPLETED / FAILED / BLOCKED
- Plan: BASICO / EQUIPO / DIRECCION / COMPLETO

## 4. OpenClaw Gateway

URL: https://openclaw-19kq.srv1493128.hstgr.cloud
Token: Hw1BsofO0vUnuw1GoAKds5jOaQ42j6t2

Agentes en OpenClaw:
- Laura (cmnct7zvf0001r9tkvm0p3dbw)
- Enzo (cmnct809d0003r9tkbdzelzv3)
- Carlos (cmnct80ih0005r9tkdmktoi7i)
- Elena (cmnct80rm0007r9tkodlpaghf)
- Diana (cmnct810q0009r9tkib9nzb6z)
- Marcos (cmnct819t000br9tk1t1nm1f1)
- Valeria (cmndh3yet0001r915hh6etshs)
- Paco (a1c29523-4fb5-4a70-b029-9a8052da1ac0)

Flujo:
1. Alberto mensaje → Gateway Telegram/webchat
2. Abre sesion agente对应的HEARTBEAT.md
3. Ejecuta tareas definidas
4. Agent guarda last-heartbeat.json
5. Si necesita BD → llama API Express :3000

## 5. Valeria QA System

Archivo: /root/mycompi/agents/valeria/SKILL.md

Quality Gates por tipo:

CONTENIDO (emails, proposals, contratos):
- Tono correcto para el cliente
- Sin errores ortograficos
- Info factualmente correcta
- Formato profesional
- Call-to-action claro

CODIGO:
- Compila sin errores
- Tests basicos pasan
- Documentado si aplica

DATOS:
- Formato acordado
- Completitud verificada
- Accuracy confirmada

AUTOMATIZACIONES:
- Logs disponibles
- Rollback documentado
- Alerts configuradas

Flujo:
Trabajo completado -> Valeria revisa Quality Gate -> PASA o FALLA -> Agente corrige si falla

## 6. Sistema coordination

Archivos compartidos (/root/mycompi/shared/):
- strategy-proposals.md (proposals semanales)
- sprint-backlog.md (tareas priorizadas)
- proactive-tasks.md (100 Tasks Martin Bell)
- 100-tasks.md (framework completo)
- diaries/ (logs diarios agentes)
- quality-standards.md (standards Valeria)

No agent-to-agent directo. Todo via API o archivos compartidos.

## 7. Onboarding flow completo

Cliente nuevo:
1. Pago Stripe recibido (webhook)
2. Se crea Cliente en BD
3. Se crean 7 Agentes asociados
4. Email de bienvenida (OnboardingSequence)
5. Secuencia: dia 1, 3, 7 emails automaticos
6. Agentes despiertan segun crons
7. Valeria Quality Gate cada deliverable
8. Paco supervisa globalmente

## 8. Paco daily standup

Script: /root/mycompi/scripts/send-daily-briefing.js

Cada manana (8h KL / 00:00 UTC):
1. Recopila last-heartbeat.json de cada agente
2. Revisa cola trabajos pendientes
3. Genera briefing resumen
4. Envia a Alberto por Telegram
5. Formato: overview + acciones pendientes + alertas

## Scripts disponibles

agent-queue-reader.js - NO EXISTE (reconstruir)
paco-paperclip.js - Crear tareas Paperclip
proactive-daily.js - Ejecutar 100 Tasks
proactive-real.js - Version mejorada
send-daily-briefing.js - Briefing diario Paco
send-weekend-briefing.js - Briefing fin de semana
heartbeat-notifications.js - Notificaciones proactivas
sync-heartbeats.js - Sincronizar agentes
paperclip-heartbeat.js - Integracion Paperclip
backup-db.js - Backup PostgreSQL
skill-installer.js - Instalar skills agentes

## Pendiente de construir

1. agent-queue-reader.js - script basico cola BD
2. Docker Compose completo - migrar legacy
3. Quality gates automatizados - Valeria con criterios
4. Onboarding flow - emails automaticos funcionando
5. OpenClaw config - gateway agents + crons actualizados
