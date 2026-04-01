/**
 * Paperclip Update Checker
 * Revisa si hay nueva versión de Paperclip y propone mejoras
 * Se ejecuta cada lunes a las 9h España
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const PAPERCLIP_DIR = "/data/paperclip";
const LOG_FILE = "/data/.openclaw/workspace/mycompi/shared/paperclip-updates.md";
const CURRENT_VERSION_FILE = "/data/.openclaw/workspace/mycompi/shared/paperclip-current-version.txt";

async function getLatestVersion() {
  try {
    const res = await fetch("https://api.github.com/repos/paperclipai/paperclip/releases/latest", {
      headers: { "User-Agent": "MyCompi/1.0" }
    });
    const data = await res.json();
    return data.tag_name?.replace("v", "") || null;
  } catch {
    return null;
  }
}

function getCurrentVersion() {
  try {
    // Leer version del package.json del monorepo
    const pkg = JSON.parse(fs.readFileSync(path.join(PAPERCLIP_DIR, "package.json"), "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

function getInstalledPlugins() {
  try {
    const adaptersDir = path.join(PAPERCLIP_DIR, "packages", "adapters");
    if (!fs.existsSync(adaptersDir)) return [];
    return fs.readdirSync(adaptersDir).filter(d => !d.startsWith("."));
  } catch {
    return [];
  }
}

async function checkOpenClawAdapterUpdates() {
  // Ver si hay updates del adapter de openclaw
  try {
    const res = await fetch("https://api.github.com/repos/paperclipai/paperclip/contents/packages/adapters/openclaw-gateway", {
      headers: { "User-Agent": "MyCompi/1.0" }
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const current = getCurrentVersion();
  const latest = await getLatestVersion();
  const plugins = getInstalledPlugins();
  const hasAdapterUpdate = await checkOpenClawAdapterUpdates();
  
  const now = new Date().toISOString().split("T")[0];
  const updateAvailable = latest && latest !== current;
  
  let report = fs.readFileSync(LOG_FILE, "utf8").catch(() => "# Paperclip Updates\n\n");
  
  const entry = `
## ${now} — ${updateAvailable ? "🔔 ACTUALIZACIÓN DISPONIBLE" : "✅ AL DÍA"}

- **Versión actual:** ${current}
- **Última versión:** ${latest || "no detectada"}
- **Plugins instalados:** ${plugins.join(", ") || "ninguno"}
${updateAvailable ? `
### Cambios desde ${current} → ${latest}:
` : "### Sin cambios — todo al día"}
`;
  
  // Añadir entrada al inicio
  const lines = report.split("\n");
  const insertIdx = lines.findIndex(l => l.startsWith("## 2"));
  if (insertIdx > 0) {
    lines.splice(insertIdx, 0, entry);
    report = lines.join("\n");
  } else {
    report = report + "\n" + entry;
  }
  
  fs.writeFileSync(LOG_FILE, report);
  
  console.log(`📋 Reporte guardado en ${LOG_FILE}`);
  console.log(`   Actual: ${current} | Latest: ${latest} | Update: ${updateAvailable}`);
  
  // Notificar si hay update
  if (updateAvailable) {
    console.log(`\n🔔 Paperclip ${latest} disponible (actual: ${current})`);
    console.log("   Revisa https://github.com/paperclipai/paperclip/releases");
  }
}

main().catch(console.error);
