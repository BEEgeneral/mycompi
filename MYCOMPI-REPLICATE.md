# MYCOMPI DOCUMENTACION PARA REPLICAR

## 7 AGENTES + DIRECTOR

Paco: a1c29523-4fb5-4a70-b029-9a8052da1ac0 (10 min)
Laura: cmnct7zvf0001r9tkvm0p3dbw (20 min)
Enzo: cmnct809d0003r9tkbdzelzv3 (30 min)
Carlos: cmnct80ih0005r9tkdmktoi7i (25 min)
Elena: cmnct80rm0007r9tkodlpaghf (30 min)
Diana: cmnct810q0009r9tkib9nzb6z (60 min)
Marcos: cmnct819t000br9tk1t1nm1f1 (60 min)
Valeria: cmndh3yet0001r915hh6etshs (30 min)

## FLUJO COMUN
1. Leer cola de trabajos (BD MyCompi)
2. Ejecutar trabajos disponibles
3. Tareas proactivas segun frecuencia
4. Research (1x semana)
5. Guardar en last-heartbeat.json

## SCRIPT COLA
node /data/mycompi/scripts/agent-queue-reader.js [AGENT_ID]

## COORDINACION
- shared/strategy-proposals.md - Proposals semanales
- shared/sprint-backlog.md - Tareas priorizadas
- shared/proactive-tasks.md - Tareas proactivas
- No agent-to-agent - todo via API

## DOCKER
/root/mycompi/docker-compose.yml

## OPENCLAW
Gateway: https://openclaw-19kq.srv1493128.hstgr.cloud
