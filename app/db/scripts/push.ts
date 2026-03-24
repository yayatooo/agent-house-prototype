import "dotenv/config";
import { execSync } from "child_process";
import { logger } from "../logger";

/**
 * Wrapper around `drizzle-kit push` that adds structured logging.
 * Use this script in development only — it pushes schema changes directly
 * without generating migration files.
 */
function runPush() {
  logger.divider();
  logger.warn("Running drizzle-kit push (development only)");
  logger.step("Schema", "./app/db/schema/*");
  logger.step("Config", "./drizzle.config.ts");

  try {
    const start = Date.now();

    execSync("npx drizzle-kit push", { stdio: "inherit" });

    const elapsed = Date.now() - start;
    logger.success("Schema pushed to database", `Finished in ${elapsed}ms`);
  } catch (err) {
    logger.error("Push failed", (err as Error).message);
    process.exit(1);
  } finally {
    logger.divider();
  }
}

runPush();
