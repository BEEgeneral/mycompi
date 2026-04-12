# Agente Luna — Atención al Cliente

## Qué es esto

El primer agente del sistema MyCompi. Luna es la responsable de atención al cliente de MyCompi.

## Estructura

```
atencion-cliente/
├── SOUL.md           ← Personalidad + filosofía de atención
├── IDENTITY.md       ← Quién es Luna
├── SKILL.md          ← Qué sabe hacer
├── MEMORY.md         ← Aprendizaje acumulado
├── luna.js           ← Integration layer (conecta con API MyCompi)
└── overlays/         ← Contexto de cada cliente
    └── pizzeriacliente/
        ├── USER.md       ← Contexto del negocio
        └── memoria/       ← Histórico de interacciones
```

## Próximos pasos

1. **Conectar con OpenClaw** — registrar Luna como skill en el gateway
2. **Integrar con WhatsApp/Telegram** — canal de entrada para mensajes
3. **Conectar con API MyCompi** — leer clientes, trabajos, pagos existentes
4. **Testear** — enviar un mensaje simulando consulta de Don Carlos

## Para probar

```js
const { buildContext } = require('./luna');

const contexto = buildContext('pizzeriacliente');
console.log(contexto);
```

Esto te devuelve el contexto completo que se le pasa al modelo: SOUL + IDENTITY + SKILL + MEMORY + overlay del cliente.

## Flujo de una consulta

```
Cliente (WhatsApp) → OpenClaw Gateway → Luna (luna.js + buildContext)
                                        ↓
                                  ¿Puedo resolver?
                                  ↓ Sí → Respondo con tono Luna
                                  ↓ No → Escalo con resumen
                                        ↓
                                  logInteraction() → memoria del cliente
```
