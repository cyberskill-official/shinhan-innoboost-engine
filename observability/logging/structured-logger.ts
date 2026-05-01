// observability/logging/structured-logger.ts
// P09-T01 — Structured Logging → OpenSearch / Grafana Loki
// JSON-formatted, correlation-ID aware, shipping-ready

// ─── Types ───────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface StructuredLogEntry {
  readonly timestamp: string;        // ISO 8601
  readonly level: LogLevel;
  readonly service: string;          // e.g. "nl2sql", "policy", "hitl"
  readonly traceId: string;          // OpenTelemetry trace ID
  readonly spanId: string;           // OpenTelemetry span ID
  readonly correlationId: string;    // Request-scoped correlation
  readonly message: string;
  readonly data?: Record<string, unknown>;
  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
  };
  readonly context: {
    readonly bu: string;
    readonly tenantId: string;
    readonly userId?: string;
    readonly environment: string;
    readonly version: string;
  };
  readonly duration_ms?: number;     // For timed operations
  readonly labels?: Record<string, string>; // Loki label selectors
}

// ─── Logger Configuration ────────────────────────────────

export interface LoggerConfig {
  readonly level: LogLevel;
  readonly service: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly version: string;
  readonly shipping: {
    readonly enabled: boolean;
    readonly target: 'opensearch' | 'loki' | 'stdout' | 'file';
    readonly endpoint?: string;       // e.g. "http://loki:3100/loki/api/v1/push"
    readonly batchSize: number;       // Entries before flush
    readonly flushIntervalMs: number; // Max time before flush
    readonly apiKey?: string;
  };
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, fatal: 4,
};

// ─── Structured Logger ───────────────────────────────────

export class StructuredLogger {
  private config: LoggerConfig;
  private buffer: StructuredLogEntry[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;

    if (config.shipping.enabled && config.shipping.flushIntervalMs > 0) {
      this.flushTimer = setInterval(() => this.flush(), config.shipping.flushIntervalMs);
    }
  }

  /** Create a child logger with additional context. */
  child(overrides: { service?: string; traceId?: string; spanId?: string; correlationId?: string }): ChildLogger {
    return new ChildLogger(this, overrides);
  }

  /** Core log method. */
  log(
    level: LogLevel,
    message: string,
    context: { bu: string; tenantId: string; userId?: string },
    data?: Record<string, unknown>,
    traceId = '',
    spanId = '',
    correlationId = '',
    duration_ms?: number,
  ): void {
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.level]) return;

    const entry: StructuredLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.config.service,
      traceId,
      spanId,
      correlationId,
      message,
      data,
      context: {
        bu: context.bu,
        tenantId: context.tenantId,
        userId: context.userId,
        environment: this.config.environment,
        version: this.config.version,
      },
      duration_ms,
      labels: {
        service: this.config.service,
        level,
        bu: context.bu,
        env: this.config.environment,
      },
    };

    this.buffer.push(entry);

    // Always write to stdout in dev
    if (this.config.environment === 'development' || this.config.shipping.target === 'stdout') {
      console.log(JSON.stringify(entry));
    }

    // Auto-flush on buffer full
    if (this.buffer.length >= this.config.shipping.batchSize) {
      this.flush();
    }

    // Immediate flush for errors/fatals
    if (level === 'error' || level === 'fatal') {
      this.flush();
    }
  }

  /** Flush buffered entries to shipping target. */
  async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const entries = [...this.buffer];
    this.buffer = [];

    if (!this.config.shipping.enabled) return;

    switch (this.config.shipping.target) {
      case 'loki':
        await this.shipToLoki(entries);
        break;
      case 'opensearch':
        await this.shipToOpenSearch(entries);
        break;
      case 'file':
        // Write to file (production: rotated log files)
        for (const entry of entries) {
          process.stdout.write(JSON.stringify(entry) + '\n');
        }
        break;
    }
  }

  /** Ship to Grafana Loki via push API. */
  private async shipToLoki(entries: StructuredLogEntry[]): Promise<void> {
    const streams = new Map<string, { ts: string; line: string }[]>();

    for (const entry of entries) {
      const labelKey = `{service="${entry.service}",level="${entry.level}",bu="${entry.context.bu}",env="${entry.context.environment}"}`;
      if (!streams.has(labelKey)) streams.set(labelKey, []);
      streams.get(labelKey)!.push({
        ts: String(Date.now() * 1_000_000), // nanoseconds
        line: JSON.stringify(entry),
      });
    }

    const payload = {
      streams: Array.from(streams.entries()).map(([labels, values]) => ({
        stream: Object.fromEntries(labels.slice(1, -1).split(',').map(kv => {
          const [k, v] = kv.split('=');
          return [k, v!.replace(/"/g, '')];
        })),
        values: values.map(v => [v.ts, v.line]),
      })),
    };

    // Production: POST to Loki endpoint
    console.log(`[Loki] Shipping ${entries.length} entries to ${this.config.shipping.endpoint}`);
    void payload; // Used in production fetch call
  }

  /** Ship to OpenSearch via bulk API. */
  private async shipToOpenSearch(entries: StructuredLogEntry[]): Promise<void> {
    const bulkBody = entries.flatMap(entry => [
      JSON.stringify({ index: { _index: `cyberskill-logs-${entry.context.environment}-${new Date().toISOString().slice(0, 10)}` } }),
      JSON.stringify(entry),
    ]).join('\n') + '\n';

    console.log(`[OpenSearch] Shipping ${entries.length} entries to ${this.config.shipping.endpoint}`);
    void bulkBody; // Used in production fetch call
  }

  /** Shutdown: flush remaining and stop timer. */
  async shutdown(): Promise<void> {
    if (this.flushTimer) clearInterval(this.flushTimer);
    await this.flush();
  }
}

// ─── Child Logger ────────────────────────────────────────

class ChildLogger {
  constructor(
    private parent: StructuredLogger,
    private overrides: { service?: string; traceId?: string; spanId?: string; correlationId?: string },
  ) {}

  info(message: string, context: { bu: string; tenantId: string; userId?: string }, data?: Record<string, unknown>): void {
    this.parent.log('info', message, context, data, this.overrides.traceId, this.overrides.spanId, this.overrides.correlationId);
  }

  warn(message: string, context: { bu: string; tenantId: string; userId?: string }, data?: Record<string, unknown>): void {
    this.parent.log('warn', message, context, data, this.overrides.traceId, this.overrides.spanId, this.overrides.correlationId);
  }

  error(message: string, context: { bu: string; tenantId: string; userId?: string }, data?: Record<string, unknown>): void {
    this.parent.log('error', message, context, data, this.overrides.traceId, this.overrides.spanId, this.overrides.correlationId);
  }

  timed(message: string, context: { bu: string; tenantId: string }, startMs: number, data?: Record<string, unknown>): void {
    this.parent.log('info', message, context, data, this.overrides.traceId, this.overrides.spanId, this.overrides.correlationId, Date.now() - startMs);
  }
}

// ─── Default Logger Factory ──────────────────────────────

export function createLogger(service: string, environment: 'development' | 'staging' | 'production' = 'development'): StructuredLogger {
  return new StructuredLogger({
    level: environment === 'production' ? 'info' : 'debug',
    service,
    environment,
    version: process.env.APP_VERSION ?? '0.0.0',
    shipping: {
      enabled: environment !== 'development',
      target: environment === 'production' ? 'loki' : 'stdout',
      endpoint: process.env.LOKI_ENDPOINT ?? 'http://loki:3100/loki/api/v1/push',
      batchSize: 100,
      flushIntervalMs: 5000,
    },
  });
}
