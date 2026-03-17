# MyCompi

Plataforma de profesionales agénticos para PYMEs.

## Quick Start

```bash
# Instalar dependencias
npm install

# Copiar .env.example a .env y configurar
cp .env.example .env

# Inicializar base de datos
# (asegúrate de tener DATABASE_URL configurado)
node -e "require('./src/models/db').initDB()"

# Arrancar en desarrollo
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrar cliente
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Usuario actual

### Clientes
- `GET /api/clientes` - Obtener cliente
- `PUT /api/clientes` - Actualizar cliente
- `GET /api/clientes/usuarios` - Usuarios del cliente
- `GET /api/clientes/memoria` - Memoria del cliente
- `GET /api/clientes/documentos` - Documentos del cliente

### Agentes
- `GET /api/agentes` - Listar agentes
- `POST /api/agentes` - Crear agente
- `GET /api/agentes/:id` - Ver agente
- `PUT /api/agentes/:id` - Actualizar agente
- `DELETE /api/agentes/:id` - Eliminar agente

### Trabajos
- `GET /api/trabajos` - Listar trabajos
- `POST /api/trabajos` - Crear trabajo
- `GET /api/trabajos/:id` - Ver trabajo
- `PUT /api/trabajos/:id` - Actualizar trabajo
- `GET /api/trabajos/stats` - Estadísticas

### Pagos
- `GET /api/pagos` - Historial de pagos
- `GET /api/pagos/planes` - Planes disponibles
- `GET /api/pagos/suscripcion` - Suscripción actual

## Deploy en Render

1. Conectar GitHub repo a Render
2. Configurar:
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Environment Variables: DATABASE_URL, JWT_SECRET

## Planes

| Plan | Precio | Agentes |
|------|--------|---------|
| Básico | €10 | 1 |
| Equipo | €49 | 6 |
| Dirección | €150 | 10 |
| Completo | €269 | 20 |
