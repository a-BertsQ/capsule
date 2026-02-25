-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastBillingDate" TIMESTAMP(3),
ADD COLUMN     "nextBillingDate" TIMESTAMP(3),
ADD COLUMN     "subscriptionExpiresAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStartedAt" TIMESTAMP(3),
ADD COLUMN     "subscriptionStatus" TEXT DEFAULT 'active';
