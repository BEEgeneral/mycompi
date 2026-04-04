-- Add ejecutor column to Trabajo for agent lock (prevents concurrent execution)
ALTER TABLE "Trabajo" ADD COLUMN IF NOT EXISTS "ejecutor" TEXT;
