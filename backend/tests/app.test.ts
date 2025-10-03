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

describe("PlacesOS API", () => {
  beforeEach(() => {
    queryMock.mockReset();
    writeAuditLogMock.mockReset();
  });

  test("GET /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  test("GET /users", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, full_name: "A" }] });
    const response = await request(app).get("/users");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("POST /users", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, email: "a@a.com", full_name: "A", role: "admin" }] });

    const response = await request(app)
      .post("/users")
      .set("x-actor-user-id", "1")
      .send({ email: "a@a.com", full_name: "A", role: "admin" });

    expect(response.status).toBe(201);
    expect(writeAuditLogMock).toHaveBeenCalledTimes(1);
  });

  test("PATCH /users/:id", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2, email: "b@b.com", full_name: "B", role: "member" }] })
      .mockResolvedValueOnce({ rows: [{ id: 2, email: "b@b.com", full_name: "BB", role: "member" }] });

    const response = await request(app)
      .patch("/users/2")
      .set("x-actor-user-id", "1")
      .send({ full_name: "BB" });

    expect(response.status).toBe(200);
    expect(response.body.full_name).toBe("BB");
  });

  test("DELETE /users/:id", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 2 }] })
      .mockResolvedValueOnce({});

    const response = await request(app).delete("/users/2").set("x-actor-user-id", "1");
    expect(response.status).toBe(204);
  });

  test("GET /resource-types", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, name: "Room" }] });
    const response = await request(app).get("/resource-types");
    expect(response.status).toBe(200);
  });

  test("POST /resource-types", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, name: "Room" }] });
    const response = await request(app)
      .post("/resource-types")
      .set("x-actor-user-id", "1")
      .send({
        name: "Room",
        description: "Meeting room",
        bookable_window_days: 30,
        max_booking_minutes: 60
      });
    expect(response.status).toBe(201);
  });

  test("GET /resource-types/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: "Room" }] });
    const response = await request(app).get("/resource-types/1");
    expect(response.status).toBe(200);
  });

  test("PATCH /resource-types/:id", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, name: "Room", description: "Meeting room", bookable_window_days: 30, max_booking_minutes: 60 }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, name: "Room", description: "Updated", bookable_window_days: 30, max_booking_minutes: 60 }] });

    const response = await request(app)
      .patch("/resource-types/1")
      .set("x-actor-user-id", "1")
      .send({ description: "Updated" });

    expect(response.status).toBe(200);
  });

  test("DELETE /resource-types/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }).mockResolvedValueOnce({});
    const response = await request(app).delete("/resource-types/1").set("x-actor-user-id", "1");
    expect(response.status).toBe(204);
  });

  test("GET /resources", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 10, name: "Desk A" }] });
    const response = await request(app).get("/resources");
    expect(response.status).toBe(200);
  });

  test("POST /resources", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 10, name: "Desk A" }] });
    const response = await request(app)
      .post("/resources")
      .set("x-actor-user-id", "1")
      .send({
        name: "Desk A",
        location: "HQ",
        floor: "2",
        capacity: 1,
        status: "active",
        metadata_json: {},
        resource_type_id: 1
      });
    expect(response.status).toBe(201);
  });

  test("GET /resources/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10, name: "Desk A" }] });
    const response = await request(app).get("/resources/10");
    expect(response.status).toBe(200);
  });

  test("PATCH /resources/:id", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10, name: "Desk A", location: "HQ", floor: "2", capacity: 1, status: "active", metadata_json: {}, resource_type_id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ id: 10, name: "Desk A", location: "HQ", floor: "2", capacity: 1, status: "maintenance", metadata_json: {}, resource_type_id: 1 }] });

    const response = await request(app)
      .patch("/resources/10")
      .set("x-actor-user-id", "1")
      .send({ status: "maintenance" });

    expect(response.status).toBe(200);
  });

  test("DELETE /resources/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 10 }] }).mockResolvedValueOnce({});
    const response = await request(app).delete("/resources/10").set("x-actor-user-id", "1");
    expect(response.status).toBe(204);
  });

  test("GET /recurring-rules", async () => {
    queryMock.mockResolvedValueOnce({ rows: [] });
    const response = await request(app).get("/recurring-rules");
    expect(response.status).toBe(200);
  });

  test("POST /recurring-rules", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const response = await request(app)
      .post("/recurring-rules")
      .set("x-actor-user-id", "1")
      .send({ user_id: 1, resource_id: 1, pattern: "FREQ=DAILY", starts_on: "2026-01-01", ends_on: "2026-01-31" });

    expect(response.status).toBe(201);
  });

  test("GET /recurring-rules/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, pattern: "FREQ=DAILY" }] });
    const response = await request(app).get("/recurring-rules/1");
    expect(response.status).toBe(200);
  });

  test("PATCH /recurring-rules/:id", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1, user_id: 1, resource_id: 1, pattern: "FREQ=DAILY", starts_on: "2026-01-01", ends_on: "2026-01-31" }] })
      .mockResolvedValueOnce({ rows: [{ id: 1, user_id: 1, resource_id: 1, pattern: "FREQ=WEEKLY", starts_on: "2026-01-01", ends_on: "2026-01-31" }] });

    const response = await request(app)
      .patch("/recurring-rules/1")
      .set("x-actor-user-id", "1")
      .send({ pattern: "FREQ=WEEKLY" });

    expect(response.status).toBe(200);
  });

  test("DELETE /recurring-rules/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 1 }] }).mockResolvedValueOnce({});
    const response = await request(app).delete("/recurring-rules/1").set("x-actor-user-id", "1");
    expect(response.status).toBe(204);
  });

  test("GET /bookings", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 5 }] });
    const response = await request(app).get("/bookings");
    expect(response.status).toBe(200);
  });

  test("POST /bookings", async () => {
    queryMock
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5, resource_id: 1 }] });

    const response = await request(app)
      .post("/bookings")
      .set("x-actor-user-id", "1")
      .send({
        user_id: 1,
        resource_id: 1,
        recurring_rule_id: null,
        starts_at: "2026-03-01T10:00:00.000Z",
        ends_at: "2026-03-01T11:00:00.000Z",
        purpose: "Sprint planning",
        status: "confirmed"
      });

    expect(response.status).toBe(201);
  });

  test("GET /bookings/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] });
    const response = await request(app).get("/bookings/5");
    expect(response.status).toBe(200);
  });

  test("PATCH /bookings/:id", async () => {
    queryMock
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{
          id: 5,
          user_id: 1,
          resource_id: 1,
          recurring_rule_id: null,
          starts_at: "2026-03-01T10:00:00.000Z",
          ends_at: "2026-03-01T11:00:00.000Z",
          purpose: "Sprint planning",
          status: "confirmed"
        }]
      })
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 5, purpose: "Updated planning" }] });

    const response = await request(app)
      .patch("/bookings/5")
      .set("x-actor-user-id", "1")
      .send({ purpose: "Updated planning" });

    expect(response.status).toBe(200);
  });

  test("DELETE /bookings/:id", async () => {
    queryMock.mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 5 }] }).mockResolvedValueOnce({});
    const response = await request(app).delete("/bookings/5").set("x-actor-user-id", "1");
    expect(response.status).toBe(204);
  });

  test("GET /availability/grid", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1, available: true }] });
    const response = await request(app).get(
      "/availability/grid?starts_at=2026-03-01T10:00:00.000Z&ends_at=2026-03-01T11:00:00.000Z"
    );
    expect(response.status).toBe(200);
  });

  test("GET /audit-log", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: 1 }] });
    const response = await request(app).get("/audit-log");
    expect(response.status).toBe(200);
  });
});
