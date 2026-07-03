-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "publicSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_publicSlug_key" ON "Campaign"("publicSlug");
