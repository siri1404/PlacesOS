import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM audit_log ORDER BY id DESC");
  res.json(result.rows);
});

router.get("/entity/:entityName/:entityId", async (req, res) => {
  const entityId = Number(req.params.entityId);

  if (!Number.isInteger(entityId) || entityId <= 0) {
    res.status(400).json({ error: "Invalid entity id" });
    return;
  }

  const result = await pool.query(
    `SELECT * FROM audit_log
     WHERE entity_name = $1 AND entity_id = $2
     ORDER BY id DESC`,
    [req.params.entityName, entityId]
  );

  res.json(result.rows);
});

export { router as auditLogRouter };
