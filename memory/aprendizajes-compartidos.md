# Aprendizajes Compartidos — MyCompi

> Este fichero lo leen TODOS los agentes antes de cada tarea.
> Los aprendizajes importantes del equipo se guardan aquí.

---

## Sistema de tags

- `#marketing` — estrategias que funcionan
- `#ventas` — técnicas de closing
- `#soporte` — problemas comunes y soluciones
- `#producto` — bugs o features
- `#cliente` — comportamiento de clientes
- `#operaciones` — automatizaciones exitosas
- `#aprendizaje` — lección general

---

## 🔧 Herramientas Conectadas (2026-03-25)

**Arquitectura:** Hub-and-spoke. Los agentes piden tools via `POST /api/tools/ejecutar`. La API verifica plan y permisos, ejecuta, y devuelve el resultado.

**Tools disponibles por plan:**

| Tool | BASICO | EQUIPO | DIRECCION |
|---|---|---|---|
| `send_email` | ✅ | ✅ | ✅ |
| `send_email_batch` | — | ✅ | ✅ |
| `registrar_tarea` | ✅ | ✅ | ✅ |
| `obtener_tareas` | ✅ | ✅ | ✅ |
| `actualizar_tarea` | ✅ | ✅ | ✅ |
| `scrape_web` | — | — | ✅ |
| `publicar_tweet` | — | — | ✅ |
| `buscar_en_web` | — | — | ✅ |

**Endpoint:** `POST /api/tools/ejecutar` → body: `{ tool: "send_email", params: { para: "...", asunto: "..." } }`

**Para más info:** `src/services/toolRegistry.js`
