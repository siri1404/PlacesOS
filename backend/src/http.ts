import { Request } from "express";

export function getNumericId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid numeric id");
  }
  return id;
}

export function getActorUserId(req: Request): number {
  const actorHeader = req.header("x-actor-user-id");
  if (!actorHeader) {
    throw new Error("Missing x-actor-user-id header");
  }

  return getNumericId(actorHeader);
}
