import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: "203.23.49.100",
    port: 5432,
    user: "jobmongolia_user",
    password: "JobMongolia2025R5",
    database: "jobmongolia",
    ssl: false
  },
});
