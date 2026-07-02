-- CreateIndex
CREATE INDEX "SendHistory_sentAt_status_idx" ON "SendHistory"("sentAt", "status");

-- CreateIndex
CREATE INDEX "SendHistory_campaignId_sentAt_idx" ON "SendHistory"("campaignId", "sentAt");
