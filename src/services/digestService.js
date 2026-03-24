/**
 * Digest Service — Genera el daily briefing para cada cliente
 * 
 * Recopila actividad del día desde los logs de tokenController
 * y genera un email en formato texto (similar al ejemplo de PolsIA)
 */

const AGENT_NAMES = {
  luna: 'Laura Montes',
  enzo: 'Enzo Herrera', 
  carlos: 'Carlos Mendoza',
  elena: 'Elena Ortega',
  diana: 'Diana Palau',
  alberto: 'Alberto Gala',
}

function formatDate() {
  const now = new Date()
  return now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
}

function getActivitiesByAgent(logs) {
  const byAgent = {}
  logs.forEach(log => {
    const agent = log.agente || 'unknown'
    if (!byAgent[agent]) {
      byAgent[agent] = { count: 0, tokens: 0, costo: 0, lastActivity: null }
    }
    byAgent[agent].count++
    byAgent[agent].tokens += log.tokens?.total || 0
    byAgent[agent].costo += log.costoEstimado || 0
    byAgent[agent].lastActivity = log.timestamp
  })
  return byAgent
}

function formatAgentLine(agentId, data) {
  const name = AGENT_NAMES[agentId] || agentId
  const lines = []
  
  if (data.count > 0) {
    lines.push(`  - ${name}: ${data.count} sesión${data.count !== 1 ? 'es' : ''}, ${Math.round(data.tokens).toLocaleString()} tokens`)
  }
  
  return lines.join('\n')
}

/**
 * Genera el cuerpo del email de digest
 * @param {Object} params
 * @param {Array} params.logs — logs de actividad del día
 * @param {string} params.clienteNombre — nombre del cliente
 * @param {string} params.clienteEmail — email del cliente
 * @param {Object} params.plan — plan del cliente
 */
function generateDigest({ logs, clienteNombre, clienteEmail, plan }) {
  const fecha = formatDate()
  const byAgent = getActivitiesByAgent(logs)
  
  const agentLines = Object.entries(byAgent)
    .filter(([_, data]) => data.count > 0)
    .map(([agentId, data]) => formatAgentLine(agentId, data))
    .join('\n')
  
  const totalTokens = logs.reduce((sum, l) => sum + (l.tokens?.total || 0), 0)
  const totalCosto = logs.reduce((sum, l) => sum + (l.costoEstimado || 0), 0)
  const totalSessions = logs.length
  
  const equipoCount = Object.keys(byAgent).filter(id => byAgent[id].count > 0).length
  
  // Determinar el foco principal según el agente más activo
  const mostActive = Object.entries(byAgent)
    .filter(([_, d]) => d.count > 0)
    .sort((a, b) => b[1].count - a[1].count)[0]
  
  let focoText = 'gestión general'
  if (mostActive) {
    const agentId = mostActive[0]
    if (agentId === 'laura') focoText = 'atención al cliente'
    else if (agentId === 'enzo') focoText = 'marketing y contenido'
    else if (agentId === 'carlos') focoText = 'ventas y captación'
    else if (agentId === 'elena') focoText = 'operaciones y automatizaciones'
    else if (agentId === 'diana') focoText = 'análisis de datos'
    else if (agentId === 'alberto') focoText = 'desarrollo'
  }
  
  // Generar tareas proactivas fake (en prod vendrán de los logs)
  const proactiveTasks = [
    'Revisar métricas de engagement de la última semana',
    'Preparar respuesta a las conversaciones escaladas',
    'Actualizar documentación del cliente',
  ]
  
  const emailHtml = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111;">
  <div style="background: #FDC239; padding: 16px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="margin: 0; font-size: 20px; color: #111;">Resumen MyCompi — ${fecha}</h1>
    <p style="margin: 4px 0 0; font-size: 14px; color: #555;">Tu equipo agéntico en acción</p>
  </div>
  
  <div style="background: #fff; border: 1px solid #E5E7EB; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      <strong>${clienteNombre},</strong>
    </p>
    <p style="font-size: 15px; line-height: 1.6; color: #333; margin: 0 0 20px;">
      Hoy el foco ha estado en <strong>${focoText}</strong>. Tu equipo ha trabajado en ${totalSessions} sesión${totalSessions !== 1 ? 'es' : ''} con un total de ${Math.round(totalTokens).toLocaleString()} tokens procesados.
    </p>
    
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
      Lo que ha hecho tu equipo
    </h2>
    
    ${agentLines ? `<pre style="font-family: monospace; font-size: 13px; background: #F9FAFB; padding: 16px; border-radius: 8px; overflow: auto; white-space: pre-wrap; margin: 0 0 20px;">${agentLines}</pre>` : '<p style="font-size: 14px; color: #888; margin: 0 0 20px;">No ha habido actividad este día.</p>'}
    
    ${proactiveTasks.length > 0 ? `
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
      Pendiente para mañana
    </h2>
    <ul style="font-size: 14px; color: #333; margin: 0 0 20px; padding-left: 20px;">
      ${proactiveTasks.map(t => `<li style="margin-bottom: 6px;">${t}</li>`).join('')}
    </ul>
    ` : ''}
    
    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #888; margin: 0 0 12px; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
      Resumen rápido
    </h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #111;">${totalSessions}</div>
        <div style="font-size: 11px; color: #888; text-transform: uppercase;">Sesiones</div>
      </div>
      <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #111;">${equipoCount}</div>
        <div style="font-size: 11px; color: #888; text-transform: uppercase;">Agentes activos</div>
      </div>
      <div style="background: #F9FAFB; padding: 12px; border-radius: 8px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #111;">${Math.round(totalTokens).toLocaleString()}</div>
        <div style="font-size: 11px; color: #888; text-transform: uppercase;">Tokens</div>
      </div>
    </div>
    
    <p style="font-size: 12px; color: #888; margin: 20px 0 0; border-top: 1px solid #E5E7EB; padding-top: 16px;">
      Enviado por <strong>MyCompi</strong> — ElOrchestrador<br/>
      ${plan} — Tu equipo de ${Object.keys(byAgent).filter(id => byAgent[id].count > 0).length} agente${Object.keys(byAgent).filter(id => byAgent[id].count > 0).length !== 1 ? 's' : ''} activo${Object.keys(byAgent).filter(id => byAgent[id].count > 0).length !== 1 ? 's' : ''}
    </p>
  </div>
</div>
  `.trim()

  return { html: emailHtml, subject: `Resumen MyCompi — ${fecha}`, proactiveTasks }
}

/**
 * Versión texto plano del email (para clientes que prefieran texto)
 */
function generateDigestPlain({ logs, clienteNombre, clienteEmail, plan }) {
  const fecha = formatDate()
  const byAgent = getActivitiesByAgent(logs)
  
  const agentLines = Object.entries(byAgent)
    .filter(([_, data]) => data.count > 0)
    .map(([agentId, data]) => formatAgentLine(agentId, data))
    .join('\n')
  
  const totalTokens = logs.reduce((sum, l) => sum + (l.tokens?.total || 0), 0)
  const totalSessions = logs.length
  const equipoCount = Object.keys(byAgent).filter(id => byAgent[id].count > 0).length
  
  return `
RESUMEN MYCOMPI — ${fecha.toUpperCase()}
${'='.repeat(40)}

${clienteNombre},

Hoy tu equipo ha trabajado en ${totalSessions} sesión${totalSessions !== 1 ? 'es' : ''} con ${Math.round(totalTokens).toLocaleString()} tokens.

LO QUE HA HECHO TU EQUIPO:
${agentLines || '(Sin actividad este día)'}

RESUMEN:
  Sesiones: ${totalSessions}
  Agentes activos: ${equipoCount}
  Tokens: ${Math.round(totalTokens).toLocaleString()}

---
Enviado por MyCompi — ElOrchestrador
  `.trim()
}

module.exports = { generateDigest, generateDigestPlain }
