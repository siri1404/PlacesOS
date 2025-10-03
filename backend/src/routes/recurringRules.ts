import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit";
import { pool } from "../db/pool";
import { getActorUserId, getNumericId } from "../http";
import { validateBody } from "../middleware/validate";

const router = Router();

const recurringRuleSchema = z.object({
  user_id: z.number().int().positive(),
  resource_id: z.number().int().positive(),
  pattern: z.string().min(1),
  starts_on: z.string().date(),
  ends_on: z.string().date()
});

router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM recurring_rules ORDER BY id");
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const id = getNumericId(req.params.id);
  const result = await pool.query("SELECT * FROM recurring_rules WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Recurring rule not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/", validateBody(recurringRuleSchema), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const result = await pool.query(
    `INSERT INTO recurring_rules (user_id, resource_id, pattern, starts_on, ends_on, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [req.body.user_id, req.body.resource_id, req.body.pattern, req.body.starts_on, req.body.ends_on]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "recurring_rules",
    entityId: result.rows[0].id,
    action: "create",
    beforeState: null,
    afterState: result.rows[0]
  });

  res.status(201).json(result.rows[0]);
});

router.patch("/:id", validateBody(recurringRuleSchema.partial()), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM recurring_rules WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Recurring rule not found" });
    return;
  }

  const merged = { ...current.rows[0], ...req.body };
  const result = await pool.query(
    `UPDATE recurring_rules
     SET user_id = $1, resource_id = $2, pattern = $3, starts_on = $4, ends_on = $5, updated_at = NOW()
     WHERE id = $6
     RETURNING *`,
    [merged.user_id, merged.resource_id, merged.pattern, merged.starts_on, merged.ends_on, id]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "recurring_rules",
    entityId: id,
    action: "update",
    beforeState: current.rows[0],
    afterState: result.rows[0]
  });

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM recurring_rules WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Recurring rule not found" });
    return;
  }

  await pool.query("DELETE FROM recurring_rules WHERE id = $1", [id]);

  await writeAuditLog({
    actorUserId,
    entityName: "recurring_rules",
    entityId: id,
    action: "delete",
    beforeState: current.rows[0],
    afterState: null
  });

  res.status(204).send();
});

export { router as recurringRulesRouter };
