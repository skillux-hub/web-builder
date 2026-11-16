import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { databaseUrl } from "../lib/db-url";
import { db } from "../lib/db";
// The Windows schema engine can fail without diagnostics on an absent SQLite file.
// Opening it with the runtime adapter first also verifies that both use the same path.
mkdirSync(dirname(databaseUrl().slice(5)), { recursive: true });
try { await db.$queryRawUnsafe("PRAGMA journal_mode = WAL"); }
finally { await db.$disconnect(); }
