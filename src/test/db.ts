import { PrismaClient } from "@prisma/client";

const url = process.env.TEST_DATABASE_URL;
if (!url) {
  throw new Error("TEST_DATABASE_URL is not set — required for integration tests.");
}

export const testDb = new PrismaClient({ datasources: { db: { url } } });
