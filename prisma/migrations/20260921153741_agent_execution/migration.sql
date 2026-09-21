-- CreateEnum
CREATE TYPE "AgentTurnStatus" AS ENUM ('SUCCESS', 'DENIED', 'CLARIFY', 'ERROR', 'PENDING_CONFIRMATION');

-- CreateTable
CREATE TABLE "agent_executions" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "toolName" TEXT,
    "toolArgs" JSONB,
    "status" "AgentTurnStatus" NOT NULL,
    "errorCode" TEXT,
    "latencyMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_executions_condominiumId_createdAt_idx" ON "agent_executions"("condominiumId", "createdAt");
