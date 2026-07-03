-- AlterTable
ALTER TABLE "CampaignField" ADD COLUMN "imagens" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
