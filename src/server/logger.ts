import winston from "winston";

const isProd = process.env.NODE_ENV === "production";

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const prettyFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaText = Object.keys(meta).length ? ` ${JSON.stringify(meta, null, 2)}` : "";
    return `[${timestamp}:${level}] ${message}${metaText}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? "info" : "debug"),
  format: jsonFormat, // base format for non-console transports
  transports: [
    new winston.transports.Console({
      format: isProd ? jsonFormat : prettyFormat
    })
  ],
  defaultMeta: { service: "discord-chat-app", env: process.env.NODE_ENV}
});

interface DbLogInput {
  queryName: string;
  durationMs: number;
  params?: unknown;
  result?: unknown[];
  requestId?: string;
  userId?: string;
};

function redact(value: unknown): unknown {
  const secretKeys = new Set(["password", "token", "secret", "apiKey", "authorization"]);
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = secretKeys.has(k) ? "[REDACTED]" : redact(v);
    }
    return out;
  }
  return value;
}

function summarizeRows(rows: unknown[] = []) {
  const preview = rows.slice(0, 2).map((r) => redact(r));
  const first = rows[0] as Record<string, unknown> | undefined;
  const keys = first ? Object.keys(first) : [];
  return { rowCount: rows.length, keys, preview };
}

export function logDbSuccess(input: DbLogInput) {
  const { queryName, durationMs, params, result = [], requestId, userId } = input;
  const summary = summarizeRows(result);

  logger.info("db.query.success", {
    event: "db.query",
    success: true,
    queryName,
    durationMs,
    params: redact(params),
    ...summary,
    requestId,
    userId
  });
}

export function logDbError(input: DbLogInput & { error: unknown }) {
  const { queryName, durationMs, params, error, requestId, userId } = input;

  logger.error("db.query.error", {
    event: "db.query",
    success: false,
    queryName,
    durationMs,
    params: redact(params),
    error,
    requestId,
    userId
  });
}
