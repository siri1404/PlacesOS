import { pool } from "./db/pool";

export async function writeAuditLog(params: {
  actorUserId: number;
  entityName: string;
  entityId: number;
  action: string;
  beforeState: unknown;
  afterState: unknown;
}): Promise<void> {
  await pool.query(
    `INSERT INTO audit_log (actor_user_id, entity_name, entity_id, action, before_state, after_state, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [
      params.actorUserId,
      params.entityName,
      params.entityId,
      params.action,
      params.beforeState,
      params.afterState
    ]
  );
}
