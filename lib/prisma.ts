// One Prisma client for the app. In development it is kept on globalThis so
// a hot reload does not open another pool. With `npm run db`, DATABASE_URL
// needs connection_limit=1 or the local server rejects the next prepared statement.

import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
