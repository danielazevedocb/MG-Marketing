-- CreateEnum
CREATE TYPE "ContactTipo" AS ENUM ('Lead', 'Prospect', 'Cliente', 'Parceiro');

-- AlterEnum
ALTER TYPE "CampaignType" ADD VALUE 'Captacao';

-- AlterEnum
ALTER TYPE "TemplateType" ADD VALUE 'Captacao';

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "tipo" "ContactTipo" NOT NULL DEFAULT 'Lead';

-- CreateIndex
CREATE INDEX "Contact_tipo_idx" ON "Contact"("tipo");
