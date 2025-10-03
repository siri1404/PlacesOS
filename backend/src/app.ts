import "express-async-errors";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { auditLogRouter } from "./routes/auditLog";
import { availabilityRouter } from "./routes/availability";
import { bookingsRouter } from "./routes/bookings";
import { recurringRulesRouter } from "./routes/recurringRules";
import { resourceTypesRouter } from "./routes/resourceTypes";
import { resourcesRouter } from "./routes/resources";
import { usersRouter } from "./routes/users";

export const app = express();

app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/users", usersRouter);
app.use("/resource-types", resourceTypesRouter);
app.use("/resources", resourcesRouter);
app.use("/recurring-rules", recurringRulesRouter);
app.use("/bookings", bookingsRouter);
app.use("/availability", availabilityRouter);
app.use("/audit-log", auditLogRouter);

app.use(errorHandler);
