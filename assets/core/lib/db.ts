import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { databaseUrl } from "./db-url";
const globalDb = globalThis as unknown as { webBuilderDb?: PrismaClient };
export const db = globalDb.webBuilderDb ?? new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl() }),
});
if (process.env.NODE_ENV !== "production") globalDb.webBuilderDb = db;
