// src/web/middlewares/compression.ts
import type { RequestHandler } from "express";
import compression from "compression";

type Env = "production" | "dev";
const RAW =
  String(((globalThis as any)?.CONFIG?.APP?.mode ?? process.env.NODE_ENV ?? "dev")).toLowerCase();
const ENV: Env = RAW === "production" ? "production" : "dev";
const isProd = ENV === "production";

const shouldCompress: compression.CompressionFilter = (req, res) => {
  // pozwól wyłączyć kompresję per-request
  if (req.headers["x-no-compression"]) return false;

  // nie kompresuj Server-Sent Events (EventSource)
  const ct = res.getHeader("Content-Type");
  if (typeof ct === "string" && ct.includes("text/event-stream")) return false;

  // domyślne kryteria (na podstawie typu MIME)
  return compression.filter(req, res);
};

const compressionMiddleware = (): RequestHandler =>
  compression({
    // poziom 0–9; 6 = dobry kompromis CPU/ratio
    level: isProd ? 6 : 1,
    // nie kompresuj bardzo małych odpowiedzi (mniej sensu niż narzut nagłówków)
    threshold: isProd ? 1024 : 0, // 1 KB w prod, w dev może kompresować wszystko
    filter: shouldCompress,
  });

export default compressionMiddleware;
