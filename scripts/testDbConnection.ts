import "dotenv/config";
import { Pool } from "pg";

const configs = [
  {
    label: "Primary",
    host: process.env.DB_HOST || "192.168.0.171",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "jobmongolia",
    user: process.env.DB_USER || "jobmongolia_user",
    password: process.env.DB_PASSWORD || "JobMongolia2025R5",
    ssl: false,
  },
  {
    label: "Fallback",
    host: "203.23.49.100",
    port: 5432,
    database: "jobmongolia",
    user: "jobmongolia_user",
    password: "JobMongolia2025R5",
    ssl: false,
  },
];

(async () => {
  for (const cfg of configs) {
    try {
      console.log(`🔌 Attempting to connect (${cfg.label}) ${cfg.host}:${cfg.port}...`);
      const pool = new Pool(cfg);
      await pool.query("SELECT 1");
      console.log(`✅ Connected to ${cfg.label} server: ${cfg.host}`);
      await pool.end();
      process.exit(0);
    } catch (error: any) {
      console.error(`❌ Connection failed (${cfg.label}):`, error.message);
    }
  }
  console.error("🚨 Could not connect to any database server.");
  process.exit(1);
})(); 