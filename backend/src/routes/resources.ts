import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit";
import { pool } from "../db/pool";
import { getActorUserId, getNumericId } from "../http";
import { validateBody } from "../middleware/validate";

const router = Router();

const resourceSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  floor: z.string().min(1),
  capacity: z.number().int().positive(),
  status: z.string().min(1),
  metadata_json: z.record(z.any()),
  resource_type_id: z.number().int().positive()
});

router.get("/", async (_req, res) => {
  const result = await pool.query(
    `SELECT resources.*, resource_types.name AS resource_type_name
     FROM resources
     JOIN resource_types ON resource_types.id = resources.resource_type_id
     ORDER BY resources.id`
  );

  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const id = getNumericId(req.params.id);
  const result = await pool.query("SELECT * FROM resources WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/", validateBody(resourceSchema), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const result = await pool.query(
    `INSERT INTO resources (name, location, floor, capacity, status, metadata_json, resource_type_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      req.body.name,
      req.body.location,
      req.body.floor,
      req.body.capacity,
      req.body.status,
      req.body.metadata_json,
      req.body.resource_type_id
    ]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "resources",
    entityId: result.rows[0].id,
    action: "create",
    beforeState: null,
    afterState: result.rows[0]
  });

  res.status(201).json(result.rows[0]);
});

router.patch("/:id", validateBody(resourceSchema.partial()), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM resources WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  const merged = { ...current.rows[0], ...req.body };
  const result = await pool.query(
    `UPDATE resources
     SET name = $1, location = $2, floor = $3, capacity = $4, status = $5, metadata_json = $6, resource_type_id = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      merged.name,
      merged.location,
      merged.floor,
      merged.capacity,
      merged.status,
      merged.metadata_json,
      merged.resource_type_id,
      id
    ]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "resources",
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
  const current = await pool.query("SELECT * FROM resources WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Resource not found" });
    return;
  }

  await pool.query("DELETE FROM resources WHERE id = $1", [id]);

  await writeAuditLog({
    actorUserId,
    entityName: "resources",
    entityId: id,
    action: "delete",
    beforeState: current.rows[0],
    afterState: null
  });

  res.status(204).send();
});

export { router as resourcesRouter };
