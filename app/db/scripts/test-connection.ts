import "dotenv/config";
import { Pool } from "pg";
import { logger } from "../logger";

async function testConnection() {
  logger.divider();
  logger.info("Testing database connection...");
  logger.step("DATABASE_URL", process.env.DATABASE_URL?.replace(/:([^@]+)@/, ":***@"));

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const start = Date.now();
    const client = await pool.connect();

    const { rows } = await client.query<{ version: string }>(
      "SELECT version()"
    );
    const elapsed = Date.now() - start;

    logger.success("Connection established", `Latency: ${elapsed}ms`);
    logger.info("Server version", rows[0].version);

    const dbResult = await client.query<{ current_database: string }>(
      "SELECT current_database()"
    );
    logger.info("Database", dbResult.rows[0].current_database);

    const schemaResult = await client.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (schemaResult.rows.length === 0) {
      logger.warn("No tables found — schema not yet applied");
    } else {
      logger.info(
        `Tables found (${schemaResult.rows.length})`,
        schemaResult.rows.map((r) => r.table_name).join(", ")
      );
    }

    client.release();
  } catch (err) {
    logger.error("Connection failed", (err as Error).message);
    process.exit(1);
  } finally {
    await pool.end();
    logger.divider();
  }
}

testConnection();
