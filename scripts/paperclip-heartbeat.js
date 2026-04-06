#!/usr/bin/env node
/**
 * paperclip-heartbeat.js
 * Heartbeat standalone para agentes Paperclip — usa credenciales hardcoded del message.
 * 
 * Uso: node paperclip-heartbeat.js <agenteId> <agentToken> <logPath>
 * Ejemplo: node paperclip-heartbeat.js laura pcp_xxx /data/.openclaw/workspace/mycompi/agents/laura/
 */

const API_URL = 'https://paperclip.srv1493128.hstgr.cloud';

const [, , agentId, agentToken, logDir] = process.argv;

if (!agentId || !agentToken || !logDir) {
  console.error('Uso: node paperclip-heartbeat.js <agenteId> <agentToken> <logDir>');
  process.exit(1);
}

const LOG_FILE = `${logDir}/paperclip-heartbeat-${new Date().toISOString().split('T')[0]}.log`;

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] ${msg}`;
  console.log(line);
  require('fs').appendFileSync(LOG_FILE, line + '\n');
}

async function fetchWithAgent(url, method = 'GET', body = null) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method,
      headers: {
        'Authorization': `Bearer ${agentToken}`,
        'Content-Type': 'application/json'
      },
      rejectUnauthorized: false  // Cert es de mycompi.com, no del hostname paperclip.*
    };
    const req = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Request timeout')); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function fetchInbox() {
  const res = await fetchWithAgent(`${API_URL}/api/agents/me/inbox-lite`);
  if (res.status !== 200) throw new Error(`Inbox API error ${res.status}: ${JSON.stringify(res.data)}`);
  return res.data;
}

async function checkoutTask(taskId) {
  const res = await fetchWithAgent(`${API_URL}/api/issues/${taskId}/checkout`, 'POST', {
    agentId: agentToken,
    expectedStatuses: ['todo', 'backlog', 'blocked']
  });
  return res.data;
}

async function main() {
  log(`=== Paperclip Heartbeat — Agent: ${agentId} ===`);
  
  try {
    const inbox = await fetchInbox();
    
    if (!inbox.tasks || inbox.tasks.length === 0) {
      log('Inbox vacía — ninguna tarea pendiente.');
      return;
    }

    log(`Tareas encontradas: ${inbox.tasks.length}`);
    
    for (const task of inbox.tasks) {
      log(`  - [${task.status || '?'}] ${task.title} (id: ${task.id}, priority: ${task.priority || 'N/A'})`);
      
      try {
        const result = await checkoutTask(task.id);
        log(`    Checkout → ${JSON.stringify(result)}`);
      } catch (err) {
        log(`    Checkout ERROR: ${err.message}`);
      }
    }
    
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

main();
