-- =============================================================
-- MyCompi FASE 1 + 2爹 Trabaja mientras duermes
-- =============================================================

-- 1. Trabajo: add parentId (jerarquía padre/hijo)
ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "parentId" TEXT;

ALTER TABLE "Trabajo" ADD CONSTRAINT "Trabajo_parentId_fkey"
  FOREIGN KEY ("parentId") REFERENCES "Trabajo"(id) ON DELETE SET NULL;

-- 2. Trabajo: add approval gates
ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "aprobadoPor" TEXT;

ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "aprobadoAt" TIMESTAMPTZ;

ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "notaAprobacion" TEXT;

-- 3. Agente: add budget y alertas
ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "budgetTokensMes" BIGINT NOT NULL DEFAULT 1000000;

ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "alertaPorcentaje" INT NOT NULL DEFAULT 80;

ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "tokensUsadosMes" BIGINT NOT NULL DEFAULT 0;

ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "ultimoResetTokens" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- 4. Agente: cooldown y heartbeat tracking
ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "ultimoHeartbeat" TIMESTAMPTZ;

ALTER TABLE "Agente" ADD COLUMN IF NOT EXISTS "activoHeartbeat" BOOLEAN NOT NULL DEFAULT true;

-- 5. AUDIT LOG爹append-only
CREATE TABLE IF NOT EXISTS "AuditLog" (
  id            TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  clienteId     TEXT        NOT NULL,
  agenteId      TEXT,
  accion        TEXT        NOT NULL,
  recursoTipo   TEXT        NOT NULL,
  recursoId     TEXT,
  detalle       JSONB,
  costeTokens   BIGINT,
  createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "AuditLog_clienteId_idx" ON "AuditLog"("clienteId");
CREATE INDEX IF NOT EXISTS "AuditLog_agenteId_idx" ON "AuditLog"("agenteId");
CREATE INDEX IF NOT EXISTS "AuditLog_accion_idx" ON "AuditLog"(accion);
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- 6. TOKEN USAGE爹log append-only
CREATE TABLE IF NOT EXISTS "TokenUsage" (
  id            TEXT        NOT NULL DEFAULT gen_random_uuid()::text,
  clienteId     TEXT        NOT NULL,
  agenteId      TEXT        NOT NULL,
  trabajoId     TEXT,
  accion        TEXT        NOT NULL,
  tokensUsados  BIGINT      NOT NULL DEFAULT 0,
  modelo        TEXT,
  costeEuros   NUMERIC(10,6),
  createdAt     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "TokenUsage_clienteId_idx" ON "TokenUsage"("clienteId");
CREATE INDEX IF NOT EXISTS "TokenUsage_agenteId_idx" ON "TokenUsage"("agenteId");
CREATE INDEX IF NOT EXISTS "TokenUsage_createdAt_idx" ON "TokenUsage"("createdAt");

-- 7. Marcar jobs CRITICA como requiring approval
UPDATE "Trabajo" SET "requiereAprobacion" = true WHERE prioridad = 'CRITICA';

-- 8. Jobs CRITICA tienen tags de approval
UPDATE "Trabajo" SET tags = array_remove(array_cat(tags, ARRAY['requiere_aprobacion']), 'requiere_aprobacion')
WHERE prioridad = 'CRITICA' AND NOT ('requiere_aprobacion' = ANY(tags));
