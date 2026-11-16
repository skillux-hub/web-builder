import { resolve } from "node:path";
/** CLI and adapter must resolve relative SQLite paths against the same project root. */
export function databaseUrl() {
  const url = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (!url.startsWith("file:")) throw new Error("This local foundation requires a SQLite file URL");
  return "file:" + resolve(url.slice(5)).replaceAll("\\", "/");
}
