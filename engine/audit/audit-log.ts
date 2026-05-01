// engine/audit/audit-log.ts
// P02-T09 — Append-only hash-chained audit log with WORM export

import { createHash, randomUUID } from 'node:crypto';

export type EventClass =
  | 'nl_to_sql_run' | 'auth_event' | 'rbac_decision' | 'hitl_action'
  | 'consent_event' | 'erasure_event' | 'break_glass' | 'metric_version_bump'
  | 'admin_override' | 'policy_decision' | 'faithfulness_failure';

export interface AuditEvent {
  readonly id: string;                 // UUIDv7-style (time-ordered)
  readonly eventClass: EventClass;
  readonly eventSubclass: string;
  readonly tenantId: string;
  readonly requesterId: string | null;
  readonly requesterRole: string;
  readonly timestamp: string;
  readonly payload: Record<string, unknown>;
  readonly payloadRedactionMap: Record<string, string>;
  readonly prevHash: string;
  readonly rowHash: string;
}

const ZERO_HASH = '0'.repeat(64);

export class AuditLog {
  private readonly entries: AuditEvent[] = [];
  private lastHash: string = ZERO_HASH;

  /**
   * Append an event to the audit log. Computes hash chain.
   */
  append(params: {
    eventClass: EventClass;
    eventSubclass: string;
    tenantId: string;
    requesterId: string | null;
    requesterRole: string;
    payload: Record<string, unknown>;
    redactionMap?: Record<string, string>;
  }): AuditEvent {
    const prevHash = this.lastHash;
    const partial = {
      id: randomUUID(),
      eventClass: params.eventClass,
      eventSubclass: params.eventSubclass,
      tenantId: params.tenantId,
      requesterId: params.requesterId,
      requesterRole: params.requesterRole,
      timestamp: new Date().toISOString(),
      payload: params.payload,
      payloadRedactionMap: params.redactionMap ?? {},
      prevHash,
    };

    const rowHash = createHash('sha256')
      .update(prevHash + JSON.stringify(partial))
      .digest('hex');

    const event: AuditEvent = { ...partial, rowHash };
    this.entries.push(event);
    this.lastHash = rowHash;
    return event;
  }

  /**
   * Verify hash chain integrity. Returns first broken index or -1.
   */
  verifyChain(): { valid: boolean; brokenAt: number } {
    let expectedPrev = ZERO_HASH;
    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!;
      if (entry.prevHash !== expectedPrev) {
        return { valid: false, brokenAt: i };
      }
      const { rowHash, ...rest } = entry;
      const computed = createHash('sha256')
        .update(expectedPrev + JSON.stringify(rest))
        .digest('hex');
      if (computed !== rowHash) {
        return { valid: false, brokenAt: i };
      }
      expectedPrev = rowHash;
    }
    return { valid: true, brokenAt: -1 };
  }

  /**
   * Query entries with optional redaction.
   */
  query(params: {
    tenantId?: string;
    eventClass?: EventClass;
    since?: string;
    limit?: number;
    redact?: boolean;
  }): readonly AuditEvent[] {
    let results = [...this.entries];
    if (params.tenantId) results = results.filter((e) => e.tenantId === params.tenantId);
    if (params.eventClass) results = results.filter((e) => e.eventClass === params.eventClass);
    if (params.since) results = results.filter((e) => e.timestamp >= params.since);

    if (params.redact) {
      results = results.map((e) => ({
        ...e,
        payload: this.redactPayload(e.payload, e.payloadRedactionMap),
      }));
    }

    return results.slice(-(params.limit ?? 100));
  }

  /**
   * Export for WORM storage (S3 Object Lock / on-prem).
   */
  exportForWorm(tenantId: string): string {
    const entries = this.entries.filter((e) => e.tenantId === tenantId);
    return entries.map((e) => JSON.stringify(e)).join('\n');
  }

  get length(): number { return this.entries.length; }

  private redactPayload(
    payload: Record<string, unknown>,
    redactionMap: Record<string, string>,
  ): Record<string, unknown> {
    const redacted = { ...payload };
    for (const [field, label] of Object.entries(redactionMap)) {
      if (field in redacted) {
        redacted[field] = `[REDACTED:${label}]`;
      }
    }
    return redacted;
  }
}
