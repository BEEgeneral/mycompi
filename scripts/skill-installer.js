/**
 * Skill Installer — MyCompi
 * Instala skills de skills.sh a los agentes cuando lo necesiten
 * 
 * Uso: node scripts/skill-installer.js <agente> <skill-owner/repo>
 * Ejemplo: node scripts/skill-installer.js enzo coreyhaines31/marketingskills/seo-audit
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PAPERCLIP_API = "http://127.0.0.1:57458";
const AGENTS_FILE = "/data/.openclaw/workspace/mycompi/paperclip-agents.json";
const SKILLS_LOG = "/data/.openclaw/workspace/mycompi/shared/skills-installed.md";

function getAgents() {
  const data = JSON.parse(fs.readFileSync(AGENTS_FILE, "utf8"));
  return data.agents;
}

function findAgent(name) {
  const agents = getAgents();
  return agents.find(a => a.name.toLowerCase() === name.toLowerCase());
}

function installSkill(skillRepo) {
  console.log(`📦 Instalando ${skillRepo}...`);
  try {
    const output = execSync(`npx skillsadd ${skillRepo} 2>&1`, {
      cwd: "/data/paperclip",
      timeout: 60000,
    }).toString();
    console.log(`✅ ${skillRepo} instalado`);
    return { ok: true, output };
  } catch (e) {
    console.log(`❌ Error instalando ${skillRepo}: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

async function assignSkillToAgent(agentId, skillName) {
  // Paperclip permite asignar skills via API
  const res = await fetch(`${PAPERCLIP_API}/api/agents/${agentId}/skills/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ desiredSkills: [skillName] })
  });
  return res.json();
}

function logSkill(agent, skill, status) {
  const now = new Date().toISOString().split("T")[0];
  let log = "";
  try {
    log = fs.readFileSync(SKILLS_LOG, "utf8");
  } catch {
    log = "# Skills Instaladas — MyCompi\n\n";
  }
  const entry = `\n| ${now} | ${agent} | ${skill} | ${status} |`;
  log = log.replace(/\n$/, "") + entry + "\n";
  fs.writeFileSync(SKILLS_LOG, log);
}

async function main() {
  const args = process.argv.slice(2);
  const agentName = args[0];
  const skillRepo = args[1];

  if (!agentName || !skillRepo) {
    console.log("Uso: node skill-installer.js <agente> <skill-owner/repo>");
    console.log("\nAgentes disponibles:");
    getAgents().forEach(a => console.log(`  - ${a.name} (${a.role})`));
    console.log("\nSkills.sh — top skills por categoría:");
    console.log("  Marketing: coreyhaines31/marketingskills/*");
    console.log("  Ventas: coreyhaines31/marketingskills/cold-email, sales-enablement");
    console.log("  Data: supercent-io/skills-template/data-analysis");
    console.log("  QA: currents-dev/playwright-best-practices-skill/*");
    console.log("  DevOps: better-auth/skills/better-auth-best-practices");
    console.log("  SEO: coreyhaines31/marketingskills/seo-audit");
    process.exit(1);
  }

  const agent = findAgent(agentName);
  if (!agent) {
    console.log(`❌ Agente '${agentName}' no encontrado`);
    process.exit(1);
  }

  const result = installSkill(skillRepo);
  if (result.ok) {
    try {
      await assignSkillToAgent(agent.id, skillRepo.split("/").pop());
      console.log(`✅ Skill asignada a ${agent.name}`);
    } catch (e) {
      console.log(`⚠️ Skill instalada pero no asignada via API: ${e.message}`);
    }
    logSkill(agent.name, skillRepo, "✅ Instalada");
  } else {
    logSkill(agent.name, skillRepo, `❌ ${result.error.slice(0, 50)}`);
  }
}

main().catch(console.error);
