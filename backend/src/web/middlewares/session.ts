// src/web/middlewares/session.ts
import type { RequestHandler } from "express";
import session, { type Store } from "express-session";
import { randomUUID } from "crypto";

type Env = "production" | "dev";
type Options = {
  /** Zewnętrzny store (np. Redis). Jeśli brak, użyje MemoryStore (OK tylko w dev). */
  store?: Store;
  /** Nazwa ciasteczka sesji. W production domyślnie __Host-sid. */
  name?: string;
  /** Dni ważności ciasteczka sesji (domyślnie 7). */
  days?: number;
};

const RAW =
  String(((globalThis as any)?.CONFIG?.APP?.mode ?? process.env.NODE_ENV ?? "dev")).toLowerCase();
export const ENV: Env = RAW === "production" ? "production" : "dev";
const isProd = ENV === "production";

export default function createSessionMiddleware(opts: Options = {}): RequestHandler {
  const {
    store,
    name = isProd ? "__Host-sid" : "sid",
    days = 7,
  } = opts;

  const secret = process.env.SESSION_SECRET || (isProd ? "" : "dev-secret-change-me");
  if (isProd && !secret) {
    throw new Error("SESSION_SECRET is required in production");
  }

  return session({
    secret,
    name,
    store, // w dev bezpiecznie pominąć; w prod PODŁĄCZ zewnętrzny store!
    resave: false,
    saveUninitialized: false,
    rolling: false,
    proxy: isProd, // wymaga app.set('trust proxy', 1) za reverse proxy
    genid: () => randomUUID(),
    unset: "destroy",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,            // HTTPS wymagany dla ciasteczek w prod
      maxAge: days * 24 * 60 * 60 * 1000, // dni → ms
      path: "/",                 // wymagane dla __Host-*
      // Uwaga: nie ustawiaj "domain" przy __Host-* (spec wymaga braku)
    },
  });
}
