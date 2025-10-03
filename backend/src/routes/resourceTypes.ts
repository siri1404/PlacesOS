import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit";
import { pool } from "../db/pool";
import { getActorUserId, getNumericId } from "../http";
import { validateBody } from "../middleware/validate";

const router = Router();

const resourceTypeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  bookable_window_days: z.number().int().positive(),
  max_booking_minutes: z.number().int().positive()
});

router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM resource_types ORDER BY id");
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const id = getNumericId(req.params.id);
  const result = await pool.query("SELECT * FROM resource_types WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Resource type not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/", validateBody(resourceTypeSchema), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const result = await pool.query(
    `INSERT INTO resource_types (name, description, bookable_window_days, max_booking_minutes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [req.body.name, req.body.description, req.body.bookable_window_days, req.body.max_booking_minutes]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "resource_types",
    entityId: result.rows[0].id,
    action: "create",
    beforeState: null,
    afterState: result.rows[0]
  });

  res.status(201).json(result.rows[0]);
});

router.patch("/:id", validateBody(resourceTypeSchema.partial()), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM resource_types WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Resource type not found" });
    return;
  }

  const merged = { ...current.rows[0], ...req.body };
  const result = await pool.query(
    `UPDATE resource_types
     SET name = $1, description = $2, bookable_window_days = $3, max_booking_minutes = $4, updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [merged.name, merged.description, merged.bookable_window_days, merged.max_booking_minutes, id]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "resource_types",
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
  const current = await pool.query("SELECT * FROM resource_types WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Resource type not found" });
    return;
  }

  await pool.query("DELETE FROM resource_types WHERE id = $1", [id]);

  await writeAuditLog({
    actorUserId,
    entityName: "resource_types",
    entityId: id,
    action: "delete",
    beforeState: current.rows[0],
    afterState: null
  });

  res.status(204).send();
});

export { router as resourceTypesRouter };
