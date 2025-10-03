import { Router } from "express";
import { z } from "zod";
import { writeAuditLog } from "../audit";
import { pool } from "../db/pool";
import { getActorUserId, getNumericId } from "../http";
import { validateBody } from "../middleware/validate";

const router = Router();

const userSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1),
  role: z.string().min(1)
});

router.get("/", async (_req, res) => {
  const result = await pool.query("SELECT * FROM users ORDER BY id");
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const id = getNumericId(req.params.id);
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (result.rowCount === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(result.rows[0]);
});

router.post("/", validateBody(userSchema), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const result = await pool.query(
    `INSERT INTO users (email, full_name, role, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [req.body.email, req.body.full_name, req.body.role]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "users",
    entityId: result.rows[0].id,
    action: "create",
    beforeState: null,
    afterState: result.rows[0]
  });

  res.status(201).json(result.rows[0]);
});

router.patch("/:id", validateBody(userSchema.partial()), async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);

  const current = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  if (current.rowCount === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const merged = { ...current.rows[0], ...req.body };
  const updated = await pool.query(
    `UPDATE users
     SET email = $1, full_name = $2, role = $3, updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [merged.email, merged.full_name, merged.role, id]
  );

  await writeAuditLog({
    actorUserId,
    entityName: "users",
    entityId: id,
    action: "update",
    beforeState: current.rows[0],
    afterState: updated.rows[0]
  });

  res.json(updated.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const actorUserId = getActorUserId(req);
  const id = getNumericId(req.params.id);
  const current = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

  if (current.rowCount === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await pool.query("DELETE FROM users WHERE id = $1", [id]);

  await writeAuditLog({
    actorUserId,
    entityName: "users",
    entityId: id,
    action: "delete",
    beforeState: current.rows[0],
    afterState: null
  });

  res.status(204).send();
});

export { router as usersRouter };
