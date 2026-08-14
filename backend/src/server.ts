import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";
import { geocodeRouter } from "./routes/geocode.js";
import { landInfoRouter } from "./routes/landInfo.js";

const app = express();

app.use(cors());
app.use(express.json());

// Unprotected root path for hosting-platform uptime/health checks.
app.get("/", (_req, res) => {
  res.json({ status: "ok" });
});

// Lightweight deterrent against random discovery of the public URL — not
// real authentication (the value ships in the client bundle), just enough
// to stop casual scraping/bots from burning the shared reinfolib API quota.
// No-op when APP_SHARED_SECRET isn't configured (e.g. local development).
app.use("/api", (req, res, next) => {
  if (!env.appSharedSecret) {
    next();
    return;
  }
  if (req.header("x-app-secret") !== env.appSharedSecret) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
});

app.use(
  "/api",
  rateLimit({
    windowMs: 60_000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api", healthRouter);
app.use("/api", geocodeRouter);
app.use("/api", landInfoRouter);

app.listen(env.port, () => {
  console.log(`land-info backend listening on port ${env.port}`);
});
