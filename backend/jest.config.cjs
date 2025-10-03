module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/server.ts",
    "!src/db/runMigrations.ts",
    "!src/db/runSeeds.ts"
  ],
  coverageDirectory: "coverage",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"]
};
