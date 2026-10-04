-- Prisma runs this in a transaction. ADD VALUE must be the only change here.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'REVIEWER';
