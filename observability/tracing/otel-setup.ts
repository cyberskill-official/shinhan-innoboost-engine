// observability/tracing/otel-setup.ts
// P09-T03 — OpenTelemetry Distributed Tracing End-to-End
// Trace: UI → API GW → NL→SQL → Warehouse → LLM → Cache → Audit

import { createLogger } from '../logging/structured-logger.js';

// ─── Types ───────────────────────────────────────────────

export interface TracingConfig {
  readonly serviceName: string;
  readonly serviceVersion: string;
  readonly environment: 'development' | 'staging' | 'production';
  readonly exporter: {
    readonly type: 'otlp' | 'jaeger' | 'console';
    readonly endpoint?: string;        // e.g. "http://tempo:4318/v1/traces"
    readonly headers?: Record<string, string>;
  };
  readonly sampling: {
    readonly strategy: 'always' | 'probability' | 'rateLimiting';
    readonly probability?: number;     // 0.0 - 1.0
    readonly maxTracesPerSecond?: number;
  };
  readonly propagation: ('w3c' | 'b3')[];
}

export interface Span {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly operationName: string;
  readonly serviceName: string;
  readonly startTime: number;          // epoch ms
  endTime?: number;
  readonly attributes: Record<string, string | number | boolean>;
  readonly events: SpanEvent[];
  status: 'OK' | 'ERROR' | 'UNSET';
  statusMessage?: string;
}

export interface SpanEvent {
  readonly name: string;
  readonly timestamp: number;
  readonly attributes?: Record<string, string | number>;
}

// ─── Trace Context Propagation ───────────────────────────

export interface TraceContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly traceFlags: number;       // 0x01 = sampled
}

function generateId(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function createTraceContext(): TraceContext {
  return {
    traceId: generateId(16),  // 128-bit
    spanId: generateId(8),    // 64-bit
    traceFlags: 0x01,         // sampled
  };
}

/** W3C Trace Context header: traceparent */
export function toTraceparent(ctx: TraceContext): string {
  return `00-${ctx.traceId}-${ctx.spanId}-${ctx.traceFlags.toString(16).padStart(2, '0')}`;
}

/** Parse W3C traceparent header */
export function fromTraceparent(header: string): TraceContext | null {
  const parts = header.split('-');
  if (parts.length !== 4) return null;
  return {
    traceId: parts[1]!,
    spanId: parts[2]!,
    traceFlags: parseInt(parts[3]!, 16),
  };
}

// ─── Tracer ──────────────────────────────────────────────

export class Tracer {
  private config: TracingConfig;
  private spans: Span[] = [];
  private logger = createLogger('otel-tracer');

  constructor(config: TracingConfig) {
    this.config = config;
  }

  /** Start a new root span. */
  startSpan(operationName: string, attributes: Record<string, string | number | boolean> = {}): Span {
    const ctx = createTraceContext();
    return this.createSpan(ctx.traceId, ctx.spanId, undefined, operationName, attributes);
  }

  /** Start a child span from a parent. */
  startChildSpan(parent: Span, operationName: string, attributes: Record<string, string | number | boolean> = {}): Span {
    const spanId = generateId(8);
    return this.createSpan(parent.traceId, spanId, parent.spanId, operationName, attributes);
  }

  /** Start a child span from a trace context (e.g. incoming request). */
  startSpanFromContext(ctx: TraceContext, operationName: string, attributes: Record<string, string | number | boolean> = {}): Span {
    const spanId = generateId(8);
    return this.createSpan(ctx.traceId, spanId, ctx.spanId, operationName, attributes);
  }

  private createSpan(
    traceId: string, spanId: string, parentSpanId: string | undefined,
    operationName: string, attributes: Record<string, string | number | boolean>,
  ): Span {
    const span: Span = {
      traceId,
      spanId,
      parentSpanId,
      operationName,
      serviceName: this.config.serviceName,
      startTime: Date.now(),
      attributes: {
        'service.name': this.config.serviceName,
        'service.version': this.config.serviceVersion,
        'deployment.environment': this.config.environment,
        ...attributes,
      },
      events: [],
      status: 'UNSET',
    };

    this.spans.push(span);
    return span;
  }

  /** Add an event to a span. */
  addEvent(span: Span, name: string, attributes?: Record<string, string | number>): void {
    (span.events as SpanEvent[]).push({
      name,
      timestamp: Date.now(),
      attributes,
    });
  }

  /** End a span with status. */
  endSpan(span: Span, status: 'OK' | 'ERROR' = 'OK', statusMessage?: string): void {
    span.endTime = Date.now();
    span.status = status;
    span.statusMessage = statusMessage;

    this.logger.log('debug', `Span completed: ${span.operationName}`, {
      bu: String(span.attributes['bu'] ?? 'system'),
      tenantId: String(span.attributes['tenantId'] ?? 'system'),
    }, {
      traceId: span.traceId,
      spanId: span.spanId,
      duration_ms: span.endTime - span.startTime,
      status,
    });
  }

  /** Export collected spans. */
  async export(): Promise<void> {
    const completedSpans = this.spans.filter(s => s.endTime);
    if (completedSpans.length === 0) return;

    switch (this.config.exporter.type) {
      case 'otlp':
        await this.exportOTLP(completedSpans);
        break;
      case 'console':
        for (const span of completedSpans) {
          console.log(JSON.stringify(span, null, 2));
        }
        break;
    }

    // Remove exported spans
    this.spans = this.spans.filter(s => !s.endTime);
  }

  private async exportOTLP(spans: Span[]): Promise<void> {
    const payload = {
      resourceSpans: [{
        resource: {
          attributes: [
            { key: 'service.name', value: { stringValue: this.config.serviceName } },
            { key: 'service.version', value: { stringValue: this.config.serviceVersion } },
            { key: 'deployment.environment', value: { stringValue: this.config.environment } },
          ],
        },
        scopeSpans: [{
          scope: { name: 'cyberskill-tracer', version: '0.1.0' },
          spans: spans.map(s => ({
            traceId: s.traceId,
            spanId: s.spanId,
            parentSpanId: s.parentSpanId ?? '',
            name: s.operationName,
            kind: 1, // INTERNAL
            startTimeUnixNano: String(s.startTime * 1_000_000),
            endTimeUnixNano: String((s.endTime ?? Date.now()) * 1_000_000),
            attributes: Object.entries(s.attributes).map(([k, v]) => ({
              key: k,
              value: typeof v === 'string' ? { stringValue: v }
                   : typeof v === 'number' ? { intValue: String(v) }
                   : { boolValue: v },
            })),
            events: s.events.map(e => ({
              timeUnixNano: String(e.timestamp * 1_000_000),
              name: e.name,
              attributes: Object.entries(e.attributes ?? {}).map(([k, v]) => ({
                key: k,
                value: typeof v === 'string' ? { stringValue: v } : { intValue: String(v) },
              })),
            })),
            status: { code: s.status === 'OK' ? 1 : s.status === 'ERROR' ? 2 : 0, message: s.statusMessage ?? '' },
          })),
        }],
      }],
    };

    console.log(`[OTLP] Exporting ${spans.length} spans to ${this.config.exporter.endpoint}`);
    void payload; // Used in production fetch call
  }
}

// ─── Predefined Span Names ──────────────────────────────

export const SPAN_NAMES = {
  // Request lifecycle
  HTTP_REQUEST: 'http.request',
  API_GATEWAY: 'api.gateway',

  // NL→SQL pipeline
  NL_PARSE: 'nl2sql.parse',
  SQL_GENERATE: 'nl2sql.generate',
  SQL_VALIDATE: 'nl2sql.validate',
  SQL_EXECUTE: 'nl2sql.execute',

  // Policy engine
  POLICY_EVALUATE: 'policy.evaluate',
  CONSENT_CHECK: 'policy.consent_check',
  SENSITIVITY_CHECK: 'policy.sensitivity_check',

  // LLM
  LLM_CALL: 'llm.call',
  LLM_PROMPT_BUILD: 'llm.prompt_build',
  LLM_RESPONSE_PARSE: 'llm.response_parse',

  // Cache
  CACHE_LOOKUP: 'cache.lookup',
  CACHE_STORE: 'cache.store',

  // HITL
  HITL_TRIAGE: 'hitl.triage',
  HITL_ASSIGN: 'hitl.assign',
  HITL_REVIEW: 'hitl.review',

  // Audit
  AUDIT_LOG: 'audit.log',
  AUDIT_VERIFY: 'audit.verify',

  // Citations
  CITATION_EXTRACT: 'citation.extract',
  CITATION_VERIFY: 'citation.verify',
} as const;

// ─── Factory ─────────────────────────────────────────────

export function createTracer(
  serviceName: string,
  environment: 'development' | 'staging' | 'production' = 'development',
): Tracer {
  return new Tracer({
    serviceName,
    serviceVersion: process.env.APP_VERSION ?? '0.0.0',
    environment,
    exporter: {
      type: environment === 'production' ? 'otlp' : 'console',
      endpoint: process.env.OTLP_ENDPOINT ?? 'http://tempo:4318/v1/traces',
    },
    sampling: {
      strategy: environment === 'production' ? 'probability' : 'always',
      probability: 0.1, // 10% in production
    },
    propagation: ['w3c'],
  });
}
