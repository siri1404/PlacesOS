import { Router } from "express";
import { pool } from "../db/pool";
import { getNumericId } from "../http";

const router = Router();

router.get("/resource/:id", async (req, res) => {
  const resourceId = getNumericId(req.params.id);
  const startsAt = req.query.starts_at;
  const endsAt = req.query.ends_at;

  if (typeof startsAt !== "string" || typeof endsAt !== "string") {
    res.status(400).json({ error: "starts_at and ends_at query params are required" });
    return;
  }

  const result = await pool.query(
    `SELECT COUNT(*)::int AS overlap_count
     FROM bookings
     WHERE resource_id = $1
       AND starts_at < $3
       AND ends_at > $2`,
    [resourceId, startsAt, endsAt]
  );

  res.json({
    resource_id: resourceId,
    starts_at: startsAt,
    ends_at: endsAt,
    available: result.rows[0].overlap_count === 0
  });
});

router.get("/grid", async (req, res) => {
  const startsAt = req.query.starts_at;
  const endsAt = req.query.ends_at;

  if (typeof startsAt !== "string" || typeof endsAt !== "string") {
    res.status(400).json({ error: "starts_at and ends_at query params are required" });
    return;
  }

  const result = await pool.query(
    `SELECT resources.id,
            resources.name,
            resources.location,
            resources.floor,
            resources.capacity,
            resources.status,
            CASE WHEN COUNT(bookings.id) = 0 THEN true ELSE false END AS available
     FROM resources
     LEFT JOIN bookings
       ON bookings.resource_id = resources.id
      AND bookings.starts_at < $2
      AND bookings.ends_at > $1
     GROUP BY resources.id
     ORDER BY resources.id`,
    [startsAt, endsAt]
  );

  res.json(result.rows);
});

export { router as availabilityRouter };
