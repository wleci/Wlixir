// src/web/middlewares/rateLimit.ts
import type { RequestHandler } from "express";
import rateLimit, { type Options } from "express-rate-limit";

type Env = "production" | "dev";

// Tylko dwa tryby: "production" albo "dev" (wszystko poza "production" = "dev")
const RAW =
  String(((globalThis as any)?.CONFIG?.APP?.mode ?? process.env.NODE_ENV ?? "dev")).toLowerCase();
export const ENV: Env = RAW === "production" ? "production" : "dev";
const isProd = ENV === "production";

export type RateLimiterOpts = {
  /** Okno czasowe w ms (domyślnie 15 min w prod, 1 min w dev) */
  windowMs?: number;
  /** Limit żądań na okno (domyślnie 100 w prod, 300 w dev) */
  limit?: number;
  /** Własny generator klucza (np. po userId zamiast IP) */
  keyGenerator?: Options["keyGenerator"];
  /** Dodatkowe pominięcia (obok health/static) */
  skip?: Options["skip"];
};

/**
 * Uniwersalny limiter dla całej aplikacji.
 * Użycie: app.use(createRateLimiter())
 */
export default function createRateLimiter(opts: RateLimiterOpts = {}): RequestHandler {
  const {
    windowMs = isProd ? 15 * 60 * 1000 : 60 * 1000,
    limit = isProd ? 100 : 300,
    keyGenerator,
    skip,
  } = opts;

  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7", // RateLimit-Limit / -Remaining / -Reset
    legacyHeaders: false,       // wyłącz X-RateLimit-*
    statusCode: 429,
    message: { error: "Too Many Requests" },
    // Only set keyGenerator if provided, otherwise use default
    ...(keyGenerator && { keyGenerator }),
    skip: (req, res) => {
      // nie limituj health-checków i prostych statyk
      const p = req.path || req.url || "";
      if (
        p.startsWith("/health") ||
        p.startsWith("/_health") ||
        p === "/favicon.ico" ||
        /\.(?:css|js|png|jpg|jpeg|gif|svg|ico|map)$/.test(p)
      ) {
        return true;
      }
      return typeof skip === "function" ? skip(req, res) : false;
    },
  });
}

/**
 * Bardziej restrykcyjny limiter pod wrażliwe endpointy (np. /auth, /login, /register).
 * Użycie: app.use("/auth", authLimiter)
 */
export const authLimiter: RequestHandler = rateLimit({
  windowMs: isProd ? 10 * 60 * 1000 : 60 * 1000,
  limit: isProd ? 5 : 50,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  statusCode: 429,
  message: { error: "Too Many Attempts, try again later." },
});
