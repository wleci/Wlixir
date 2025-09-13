// src/web/middlewares/security.ts
import type { RequestHandler } from "express";
import helmet, { type HelmetOptions } from "helmet";
import morgan from "morgan";

type Env = "production" | "dev";

// odczyt z globalThis.CONFIG.APP.mode -> NODE_ENV -> 'dev'
const RAW_MODE =
    String(((globalThis as any)?.CONFIG?.APP?.mode ?? process.env.NODE_ENV ?? "dev")).toLowerCase();

export const ENV: Env = RAW_MODE === "production" ? "production" : "dev";
const isProd = ENV === "production";

// opcjonalnie: zsynchronizuj NODE_ENV (nie wymagane)
process.env.NODE_ENV = isProd ? "production" : "development";

const helmetOptions: HelmetOptions = {
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            scriptSrc: ["'self'", ...(isProd ? [] : ["'unsafe-eval'"])],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: ["'self'", ...(isProd ? [] : ["ws:"])],
        },
    },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: isProd,
    crossOriginResourcePolicy: { policy: "same-origin" },
    referrerPolicy: { policy: "no-referrer" },
    frameguard: { action: "deny" },
    noSniff: true,
};

export const securityHelmet: RequestHandler = helmet(helmetOptions);
export const requestLogger: RequestHandler = morgan(ENV === "dev" ? "dev" : "combined");
