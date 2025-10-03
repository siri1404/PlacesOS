import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit";
import { pool } from "../db/pool";
import { getActorUserId, getNumericId } from "../http";
import { validateBody } from "../middleware/validate";

const router = Router();

const bookingSchema = z.object({
  user_id: z.number().int().positive(),
  resource_id: z.number().int().positive(),
  recurring_rule_id: z.number().int().positive().nullable(),
  starts_at: z.string().datetime(),
  ends_at: z.string().datetime(),
  purpose: z.string().min(1),
  status: z.string().min(1)
});

async function ensureNoOverlap(resourceId: number, startsAt: string, endsAt: string, excludedId?: number): Promise<void> {
  const result = await pool.query(
    `SELECT id FROM bookings
     WHERE resource_id = $1
       AND id <> COALESCE($4, -1)
       AND starts_at < $3
       AND ends_at > $2`,
    [resourceId, startsAt, endsAt, excludedId ?? null]
  );

  if (result.rowCount && result.rowCount > 0) {
    throw new Error("Booking overlaps with an existing reservation");
  }
}

router.get("/", async (_req, res) => {
  const result = await pool.query(
    `SELECT bookings.*, users.full_name AS booked_by, resources.name AS resource_name
     FROM bookings
     JOIN users ON users.id = bookings.user_id
     JOIN resources ON resources.id = bookings.resource_id
     ORDER BY bookings.id`
  );
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const id = getNumericId(req.params.id);
  const result = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/", validateBody(bookingSchema), async (req, res) => {
  const actorUserId = getActorUserId(req);
  await ensureNoOverlap(req.body.resource_id, req.body.starts_at, req.body.ends_at);

  const result = await pool.query(
    `INSERT INTO bookings (user_id, resource_id, recurring_rule_id, starts_at, ends_at, purpose, status, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      req.body.user_id,
      req.body.resource_id,
      req.body.recurring_rule_id,
      req.body.starts_at,
      req.body.ends_at,
      req.body.purpose,
      req.body.status
    ]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "bookings",
    entityId: result.rows[0].id,
    action: "create",
    beforeState: null,
    afterState: result.rows[0]
  });

  res.status(201).json(result.rows[0]);
});

router.patch("/:id", validateBody(bookingSchema.partial()), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const merged = { ...current.rows[0], ...req.body };
  await ensureNoOverlap(merged.resource_id, merged.starts_at, merged.ends_at, id);

  const result = await pool.query(
    `UPDATE bookings
     SET user_id = $1, resource_id = $2, recurring_rule_id = $3, starts_at = $4, ends_at = $5, purpose = $6, status = $7, updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      merged.user_id,
      merged.resource_id,
      merged.recurring_rule_id,
      merged.starts_at,
      merged.ends_at,
      merged.purpose,
      merged.status,
      id
    ]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "bookings",
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
  const current = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  await pool.query("DELETE FROM bookings WHERE id = $1", [id]);

  await writeAuditLog({
    actorUserId,
    entityName: "bookings",
    entityId: id,
    action: "delete",
    beforeState: current.rows[0],
    afterState: null
  });

  res.status(204).send();
});

export { router as bookingsRouter };
