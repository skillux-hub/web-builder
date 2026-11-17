import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
test("public settings persist without administrator services", async () => {
  const temp = mkdtempSync(join(tmpdir(), "web-builder-public-"));
  process.env.DATABASE_URL = "file:" + join(temp, "test.db").replaceAll("\\", "/");
  let db: typeof import("../lib/db").db | undefined;
  try {
    execFileSync(process.execPath, ["node_modules/tsx/dist/cli.mjs", "scripts/prepare-db.ts"], { env: process.env, stdio: "pipe" });
    execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "push", "--config", "prisma7.config.ts"], { env: process.env, stdio: "pipe" });
    db = (await import("../lib/db")).db;
    const { settings } = await import("../lib/settings");
    await db.systemSetting.upsert({ where: { key: "site" }, create: { key: "site", value: JSON.stringify({ seoTitle: "Persisted title" }) }, update: {} });
    await db.$disconnect();
    assert.equal((await settings()).seoTitle, "Persisted title");
    const { extensionRoute } = await import("../lib/extension-routes");
    assert.equal(await extensionRoute(new Request("http://localhost/api/admin/session", { method: "POST" }), ["admin", "session"]), null);
  } finally { if (db) await db.$disconnect(); rmSync(temp, { recursive: true, force: true }); }
});
