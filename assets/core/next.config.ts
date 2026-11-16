import type { NextConfig } from "next";
const config: NextConfig = { serverExternalPackages: ["@prisma/client", "@prisma/adapter-better-sqlite3"] };
export default config;
