import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool";

async function run(): Promise<void> {
  const migrationsDir = path.resolve(__dirname, "migrations");
  const files = (await readdir(migrationsDir)).sort();

  for (const file of files) {
    if (!file.endsWith(".sql")) {
      continue;
    }

    const fullPath = path.join(migrationsDir, file);
    const sql = await readFile(fullPath, "utf8");
    await pool.query(sql);
  }

  await pool.end();
}

run().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
