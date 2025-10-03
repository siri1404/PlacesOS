describe("config module", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  test("loads required values when environment is valid", () => {
    process.env.NODE_ENV = "test";
    process.env.API_PORT = "4010";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
    process.env.CORS_ORIGIN = "http://localhost:5173";

    const { config } = require("../src/config");

    expect(config.NODE_ENV).toBe("test");
    expect(config.API_PORT).toBe(4010);
  });

  test("throws when required environment values are missing", () => {
    process.env.NODE_ENV = "test";
    process.env.API_PORT = "4010";
    delete process.env.DATABASE_URL;
    process.env.CORS_ORIGIN = "http://localhost:5173";

    expect(() => require("../src/config")).toThrow("Invalid environment configuration");
  });
});
