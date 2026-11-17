import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) { console.log("Existing .env preserved."); process.exit(0); }
const config = JSON.parse(readFileSync("site.config.json", "utf8"));
const admin = config.adminRequired !== false;
const commerce = readFileSync("prisma/schema.prisma", "utf8").includes("model Order {");
const password = admin ? randomBytes(18).toString("base64url") : "";
writeFileSync(".env", `DATABASE_URL="file:./prisma/dev.db"\n${admin ? `ADMIN_EMAIL="admin@local.test"\nADMIN_PASSWORD="${password}"\n` : ""}${commerce ? `TEST_PAYMENT_SECRET="${randomBytes(32).toString("hex")}"\n` : ""}`, { mode: 0o600 });
if (admin) writeFileSync("LOCAL_ACCESS.md", `# Local administrator access\n\nEmail: admin@local.test\n\nPassword: ${password}\n\nKeep this file and .env private.\n`, { mode: 0o600 });
console.log(admin ? "Configuration created. Credentials are in LOCAL_ACCESS.md." : "Configuration created without administrator credentials.");
