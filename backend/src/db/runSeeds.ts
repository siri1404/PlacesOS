import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./pool";

async function run(): Promise<void> {
  const seedsDir = path.resolve(__dirname, "seeds");
  const files = (await readdir(seedsDir)).sort();

  for (const file of files) {
    if (!file.endsWith(".sql")) {
      continue;
    }

    const fullPath = path.join(seedsDir, file);
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
