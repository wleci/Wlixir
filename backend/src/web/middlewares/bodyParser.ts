import type { RequestHandler } from "express";

type BodyParserOptions = {
  /** Maksymalny rozmiar payloadu w bajtach (domyślnie ~1MB). */
  limitBytes?: number;
  /** Limit czasu na odczyt body (domyślnie 10s). */
  timeoutMs?: number;
};

const bodyParser = (opts: BodyParserOptions = {}): RequestHandler => {
  const { limitBytes = 1_000_000, timeoutMs = 10_000 } = opts;

  return (req, res, next) => {
    // jeśli już coś sparsował inny middleware — przepuść
    if ((req as any).body !== undefined) return next();

    const contentType = (req.headers["content-type"] || "").toLowerCase();

    // multipart/plikami nie zajmujemy się tutaj (zostaw dedykowanemu parserowi)
    if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/octet-stream")
    ) {
      return next();
    }

    // szybki check nagłówka content-length vs limit
    const contentLength =
      req.headers["content-length"] != null
        ? parseInt(String(req.headers["content-length"]), 10)
        : null;
    if (contentLength !== null && contentLength > limitBytes) {
      res.status(413).send("Payload Too Large");
      return;
    }

    let total = 0;
    const chunks: Buffer[] = [];

    // timeout, żeby nie wisieć na zablokowanych połączeniach
    const timer = setTimeout(() => {
      res.status(408).send("Request Timeout");
      req.destroy();
    }, timeoutMs);

    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > limitBytes) {
        clearTimeout(timer);
        res.status(413).send("Payload Too Large");
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      clearTimeout(timer);

      const raw = Buffer.concat(chunks, total);
      (req as any).rawBody = raw; // przydatne do weryfikacji podpisów (np. Stripe/GitHub)

      if (raw.length === 0) {
        (req as any).body = {};
        return next();
      }

      const isJson =
        contentType.includes("application/json") || contentType.includes("+json");
      const isUrlEncoded = contentType.includes(
        "application/x-www-form-urlencoded"
      );
      const isText = contentType.includes("text/") || contentType === "";

      try {
        if (isJson) {
          let text = raw.toString("utf8");
          // usuń ewentualny BOM
          if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
          (req as any).body = text ? JSON.parse(text) : {};
        } else if (isUrlEncoded) {
          const text = raw.toString("utf8");
          (req as any).body = Object.fromEntries(new URLSearchParams(text));
        } else if (isText) {
          (req as any).body = raw.toString("utf8");
        } else {
          // nieznany/niestandardowy typ — przekaż surowy Buffer
          (req as any).body = raw;
        }
        next();
      } catch {
        if (isJson) {
          res.status(400).json({ error: "Invalid JSON payload" });
        } else if (isUrlEncoded) {
          res.status(400).json({ error: "Invalid URL-encoded payload" });
        } else {
          // dla innych typów — przekaż jako tekst
          (req as any).body = raw.toString("utf8");
          next();
        }
      }
    });

    req.on("error", () => {
      clearTimeout(timer);
      res.status(400).json({ error: "Error while reading request body" });
    });

    req.on("aborted", () => {
      clearTimeout(timer);
      // połączenie przerwane przez klienta — nic nie odsyłamy
    });
  };
};

export default bodyParser;
