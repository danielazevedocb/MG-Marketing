-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "channels" "Channel"[] DEFAULT ARRAY[]::"Channel"[],
ADD COLUMN     "wizardStep" TEXT,
ADD COLUMN     "recipientContactIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "recipientGroupIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
