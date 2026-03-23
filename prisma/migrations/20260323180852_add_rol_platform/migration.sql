-- CreateEnum
CREATE TYPE "RolPlatform" AS ENUM ('ADMIN', 'CLIENT');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "rol_platform" "RolPlatform" NOT NULL DEFAULT 'CLIENT';
