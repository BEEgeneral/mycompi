FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache openssl wget

# Copiar package files
COPY package*.json ./

# Instalar deps
RUN npm install

# Copiar prisma ANTES de generate
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

# Generar Prisma client
RUN npx prisma generate

# Copiar código fuente
COPY src/ ./src/
COPY public/ ./public/
COPY scripts/ ./scripts/

# Build de los paneles estáticos
RUN npm run build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3   CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
