-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sharedAt" TIMESTAMP(3);
