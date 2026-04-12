#!/bin/bash
# Wrapper para leer la cola de trabajos del agente
# Uso: bash get-cola.sh <AGENTE_ID>
cd /data/.openclaw/workspace/mycompi
node scripts/agent-queue-reader.js "$1"
