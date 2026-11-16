import "dotenv/config";
import { defineConfig } from "prisma/config";
import { databaseUrl } from "./lib/db-url";
export default defineConfig({ schema: "prisma/schema.prisma", datasource: { url: databaseUrl() } });
