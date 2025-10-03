import request from "supertest";

process.env.NODE_ENV = "test";
process.env.API_PORT = "4010";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.CORS_ORIGIN = "http://localhost:5173";

const queryMock = jest.fn();
const writeAuditLogMock = jest.fn();

jest.mock("../src/db/pool", () => ({
  pool: {
    query: queryMock
  }
}));

jest.mock("../src/audit", () => ({
  writeAuditLog: writeAuditLogMock
}));

import { app } from "../src/app";

describe("PlacesOS API branch and error paths", () => {
  beforeEach(() => {
    queryMock.mockReset();
    writeAuditLogMock.mockReset();
  });

  test("returns 500 when route receives invalid numeric id", async () => {
    const response = await request(app).get("/users/not-a-number");
    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Invalid numeric id");
  });

  test("returns 400 when request body fails zod validation", async () => {
    const response = await request(app).post("/users").set("x-actor-user-id", "1").send({ email: "bad" });
    expect(response.status).toBe(400);
  });

  test("returns 500 when actor header is missing", async () => {
    const response = await request(app)
      .post("/users")
      .send({ email: "x@y.com", full_name: "X", role: "admin" });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Missing x-actor-user-id header");
  });

  test("users GET by id returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get("/users/99");
    expect(response.status).toBe(404);
  });

  test("users PATCH returns 404 when record missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app)
      .patch("/users/99")
      .set("x-actor-user-id", "1")
      .send({ full_name: "Updated" });

    expect(response.status).toBe(404);
  });

  test("users DELETE returns 404 when record missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete("/users/99").set("x-actor-user-id", "1");
    expect(response.status).toBe(404);
  });

  test("resource types GET by id returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get("/resource-types/99");
    expect(response.status).toBe(404);
  });

  test("resource types POST invalid body returns 400", async () => {
    const response = await request(app)
      .post("/resource-types")
      .set("x-actor-user-id", "1")
      .send({ name: "Room" });

    expect(response.status).toBe(400);
  });

  test("resource types PATCH returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app)
      .patch("/resource-types/99")
      .set("x-actor-user-id", "1")
      .send({ description: "Updated" });

    expect(response.status).toBe(404);
  });

  test("resource types DELETE returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete("/resource-types/99").set("x-actor-user-id", "1");
    expect(response.status).toBe(404);
  });

  test("resources GET by id returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get("/resources/99");
    expect(response.status).toBe(404);
  });

  test("resources POST invalid body returns 400", async () => {
    const response = await request(app)
      .post("/resources")
      .set("x-actor-user-id", "1")
      .send({ name: "Desk" });

    expect(response.status).toBe(400);
  });

  test("resources PATCH returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app)
      .patch("/resources/99")
      .set("x-actor-user-id", "1")
      .send({ status: "maintenance" });

    expect(response.status).toBe(404);
  });

  test("resources DELETE returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete("/resources/99").set("x-actor-user-id", "1");
    expect(response.status).toBe(404);
  });

  test("recurring rules GET by id returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get("/recurring-rules/99");
    expect(response.status).toBe(404);
  });

  test("recurring rules POST invalid body returns 400", async () => {
    const response = await request(app)
      .post("/recurring-rules")
      .set("x-actor-user-id", "1")
      .send({ user_id: 1, resource_id: 1, pattern: "FREQ=DAILY", starts_on: "bad-date", ends_on: "bad-date" });

    expect(response.status).toBe(400);
  });

  test("recurring rules PATCH returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app)
      .patch("/recurring-rules/99")
      .set("x-actor-user-id", "1")
      .send({ pattern: "FREQ=MONTHLY" });

    expect(response.status).toBe(404);
  });

  test("recurring rules DELETE returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete("/recurring-rules/99").set("x-actor-user-id", "1");
    expect(response.status).toBe(404);
  });

  test("bookings GET by id returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).get("/bookings/99");
    expect(response.status).toBe(404);
  });

  test("bookings POST invalid body returns 400", async () => {
    const response = await request(app).post("/bookings").set("x-actor-user-id", "1").send({ user_id: 1 });
    expect(response.status).toBe(400);
  });

  test("bookings POST overlap returns 500", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 8 }] });

    const response = await request(app)
      .post("/bookings")
      .set("x-actor-user-id", "1")
      .send({
        user_id: 1,
        resource_id: 1,
        recurring_rule_id: null,
        starts_at: "2026-03-01T10:00:00.000Z",
        ends_at: "2026-03-01T11:00:00.000Z",
        purpose: "Overlap case",
        status: "confirmed"
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toContain("overlaps");
  });

  test("bookings PATCH returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const response = await request(app)
      .patch("/bookings/99")
      .set("x-actor-user-id", "1")
      .send({ purpose: "Updated" });

    expect(response.status).toBe(404);
  });

  test("bookings PATCH overlap returns 500", async () => {
    queryMock
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [
          {
            id: 2,
            user_id: 1,
            resource_id: 1,
            recurring_rule_id: null,
            starts_at: "2026-03-01T10:00:00.000Z",
            ends_at: "2026-03-01T11:00:00.000Z",
            purpose: "Original",
            status: "confirmed"
          }
        ]
      })
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 3 }] });

    const response = await request(app)
      .patch("/bookings/2")
      .set("x-actor-user-id", "1")
      .send({ purpose: "Updated" });

    expect(response.status).toBe(500);
  });

  test("bookings DELETE returns 404 when missing", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 0, rows: [] });
    const response = await request(app).delete("/bookings/99").set("x-actor-user-id", "1");
    expect(response.status).toBe(404);
  });

  test("availability resource endpoint validates query params", async () => {
    const response = await request(app).get("/availability/resource/1");
    expect(response.status).toBe(400);
  });

  test("availability resource endpoint returns false when overlaps exist", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ overlap_count: 2 }] });

    const response = await request(app).get(
      "/availability/resource/1?starts_at=2026-03-01T10:00:00.000Z&ends_at=2026-03-01T11:00:00.000Z"
    );

    expect(response.status).toBe(200);
    expect(response.body.available).toBe(false);
  });

  test("availability grid endpoint validates query params", async () => {
    const response = await request(app).get("/availability/grid");
    expect(response.status).toBe(400);
  });

  test("audit entity endpoint validates entity id", async () => {
    const response = await request(app).get("/audit-log/entity/users/not-number");
    expect(response.status).toBe(400);
  });

  test("audit entity endpoint returns records for valid params", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 10, entity_name: "users" }] });
    const response = await request(app).get("/audit-log/entity/users/10");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("error handler maps non-Error rejection to Unknown error", async () => {
    queryMock.mockRejectedValueOnce("db unavailable");
    const response = await request(app).get("/users");
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Unknown error");
  });

  test("error handler maps Error rejection to message", async () => {
    queryMock.mockRejectedValueOnce(new Error("database failure"));
    const response = await request(app).get("/users");
    expect(response.status).toBe(500);
    expect(response.body.error).toContain("database failure");
  });
});
