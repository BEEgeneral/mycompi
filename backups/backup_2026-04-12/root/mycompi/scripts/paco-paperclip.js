/**
 * Paco Paperclip Bridge — crea tareas en Paperclip desde MyCompi
 * 
 * Uso desde HEARTBEAT.md de Paco:
 * node /data/.openclaw/workspace/mycompi/scripts/paco-paperclip.js create \
 *   --title "Landing nueva para oferta" \
 *   --agent enzo \
 *   --priority high \
 *   --description "Crear landing page para campaña de Navidad"
 */

const API = "http://127.0.0.1:57458";
const COMPANY_ID = "94b69daf-47c3-4d77-8928-dcc2eb03f38d";
const AGENTS_FILE = "/data/.openclaw/workspace/mycompi/paperclip-agents.json";

const { readFileSync } = require("fs");

const agentMap = JSON.parse(readFileSync(AGENTS_FILE, "utf8")).agents.reduce((acc, a) => {
  acc[a.name.toLowerCase()] = a.id;
  return acc;
}, {});

const args = process.argv.slice(2);

if (args[0] === "create") {
  const title = extractArg("--title", args) || "Nueva tarea";
  const agentName = extractArg("--agent", args) || "laura";
  const priority = extractArg("--priority", args) || "medium";
  const description = extractArg("--description", args) || "";
  const agentId = agentMap[agentName.toLowerCase()];

  if (!agentId) {
    console.log(JSON.stringify({ error: `Agente '${agentName}' no encontrado. Disponibles: ${Object.keys(agentMap).join(", ")}` }));
    process.exit(1);
  }

  createIssue({ title, description, agentId, priority }).then(r => {
    console.log(JSON.stringify(r));
  });
} else if (args[0] === "list") {
  listIssues().then(r => {
    console.log(JSON.stringify(r));
  });
} else if (args[0] === "wake") {
  const issueId = args[1];
  const agentId = args[2];
  if (!issueId || !agentId) {
    console.log("Usage: wake <issueId> <agentId>");
    process.exit(1);
  }
  wakeAgent({ issueId, agentId }).then(r => {
    console.log(JSON.stringify(r));
  });
} else {
  console.log(JSON.stringify({ error: "Comando desconocido. Usa: create, list, wake" }));
}

function extractArg(flag, args) {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : null;
}

async function createIssue({ title, description, agentId, priority }) {
  try {
    const res = await fetch(`${API}/api/companies/${COMPANY_ID}/issues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, assigneeAgentId: agentId, priority })
    });
    const issue = await res.json();
    if (!res.ok) return { error: issue };

    // Wake the agent immediately
    const wake = await fetch(`${API}/api/agents/${agentId}/wakeup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId: issue.id })
    });
    const wakeResult = await wake.json();

    return {
      ok: true,
      issue: { id: issue.id, title: issue.title, status: issue.status, priority },
      agent: agentId,
      wake: { runId: wakeResult.id, status: wakeResult.status }
    };
  } catch (e) {
    return { error: e.message };
  }
}

async function listIssues() {
  try {
    const res = await fetch(`${API}/api/companies/${COMPANY_ID}/issues`, {
      headers: { "Content-Type": "application/json" }
    });
    const issues = await res.json();
    return { issues: issues.slice(0, 20) };
  } catch (e) {
    return { error: e.message };
  }
}

async function wakeAgent({ issueId, agentId }) {
  try {
    const res = await fetch(`${API}/api/agents/${agentId}/wakeup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issueId })
    });
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}
