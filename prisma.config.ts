import path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma config runs outside Next.js so it doesn't auto-load .env.local
dotenvConfig({ path: ".env.local" });
dotenvConfig(); // fallback to .env

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
