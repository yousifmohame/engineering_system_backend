-- CreateTable
CREATE TABLE "FollowUpAgent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nationalId" TEXT,
    "commercialRegister" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "specialization" TEXT[],
    "governmentEntities" TEXT[],
    "joinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpTask" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "governmentEntity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetDate" TIMESTAMP(3),
    "completionDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "successStatus" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "feedbacks" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FollowUpTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowUpTask_agentId_idx" ON "FollowUpTask"("agentId");

-- CreateIndex
CREATE INDEX "FollowUpTask_transactionId_idx" ON "FollowUpTask"("transactionId");

-- AddForeignKey
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "FollowUpAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpTask" ADD CONSTRAINT "FollowUpTask_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
