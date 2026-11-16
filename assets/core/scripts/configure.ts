import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if(existsSync(".env")){console.log("Existing .env preserved.");process.exit(0);}
const password=randomBytes(18).toString("base64url");
const commerce=readFileSync("prisma/schema.prisma","utf8").includes("model Order {");
writeFileSync(".env",`DATABASE_URL="file:./prisma/dev.db"\nADMIN_EMAIL="admin@local.test"\nADMIN_PASSWORD="${password}"\n${commerce?`TEST_PAYMENT_SECRET="${randomBytes(32).toString("hex")}"\n`:""}`,{mode:0o600});
writeFileSync("LOCAL_ACCESS.md",`# Local administrator access\n\nEmail: admin@local.test\n\nPassword: ${password}\n\nKeep this file and .env private.\n`,{mode:0o600});
console.log("Local configuration created. Credentials are in LOCAL_ACCESS.md; no secrets were printed.");
