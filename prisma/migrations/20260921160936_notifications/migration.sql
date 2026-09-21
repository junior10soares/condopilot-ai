-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "sentByUserId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_condominiumId_idx" ON "notifications"("condominiumId");

-- CreateIndex
CREATE INDEX "notifications_recipientUserId_idx" ON "notifications"("recipientUserId");
