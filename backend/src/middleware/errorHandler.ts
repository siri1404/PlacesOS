import { NextFunction, Request, Response } from "express";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  void _next;
  const message = error instanceof Error ? error.message : "Unknown error";
  res.status(500).json({ error: message });
}
