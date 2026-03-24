import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { logger } from "../logger";

async function runMigrate() {
  logger.divider();
  logger.info("Starting database migration...");
  logger.step("Migrations folder", "./drizzle");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    const start = Date.now();

    await migrate(db, { migrationsFolder: "./drizzle" });

    const elapsed = Date.now() - start;
    logger.success("Migration completed", `Finished in ${elapsed}ms`);
  } catch (err) {
    logger.error("Migration failed", (err as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
    logger.divider();
  }
}

runMigrate();
