// engine/compliance/consent-ledger.ts
// P02-T07 — PDPL consent ledger and data-minimisation engine

import { createHash } from 'node:crypto';

export type ConsentPurpose = 'analytics_query' | 'ai_processing' | 'data_export' | 'cross_bu_sharing' | 'profiling';
export type ConsentStatus = 'granted' | 'revoked' | 'expired' | 'pending';

export interface ConsentRecord {
  readonly id: string;
  readonly subjectId: string;
  readonly controllerId: string;
  readonly purpose: ConsentPurpose;
  readonly status: ConsentStatus;
  readonly grantedAt: string;
  readonly expiresAt: string;
  readonly revokedAt?: string;
  readonly legalBasis: 'consent' | 'legitimate_interest' | 'contractual' | 'legal_obligation';
  readonly dataCategories: readonly string[];
  readonly retentionDays: number;
  readonly hash: string;
}

export interface ConsentCheck {
  readonly allowed: boolean;
  readonly reason: string;
  readonly consentId?: string;
  readonly requiresElevation: boolean;
}

const PII_COLUMNS = new Set([
  'customer_name', 'full_name', 'email', 'phone', 'id_number',
  'cmnd', 'cccd', 'address', 'date_of_birth', 'account_number',
  'card_number', 'salary', 'income',
]);

export class ConsentLedger {
  private readonly records = new Map<string, ConsentRecord>();

  grantConsent(params: {
    subjectId: string; controllerId: string; purpose: ConsentPurpose;
    legalBasis: ConsentRecord['legalBasis']; dataCategories: readonly string[];
    retentionDays: number;
  }): ConsentRecord {
    const now = new Date();
    const record: ConsentRecord = {
      id: createHash('sha256').update(`${Date.now()}-${Math.random()}`).digest('hex').slice(0, 16),
      subjectId: params.subjectId, controllerId: params.controllerId,
      purpose: params.purpose, status: 'granted',
      grantedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + params.retentionDays * 86400000).toISOString(),
      legalBasis: params.legalBasis, dataCategories: params.dataCategories,
      retentionDays: params.retentionDays, hash: '',
    };
    const hash = createHash('sha256').update(JSON.stringify(record)).digest('hex').slice(0, 32);
    const withHash = { ...record, hash };
    this.records.set(withHash.id, withHash);
    return withHash;
  }

  revokeConsent(consentId: string): ConsentRecord {
    const record = this.records.get(consentId);
    if (!record) throw new Error(`Consent ${consentId} not found`);
    const revoked = { ...record, status: 'revoked' as const, revokedAt: new Date().toISOString(), hash: '' };
    const hash = createHash('sha256').update(JSON.stringify(revoked)).digest('hex').slice(0, 32);
    const withHash = { ...revoked, hash };
    this.records.set(consentId, withHash);
    return withHash;
  }

  checkConsent(params: { subjectId: string; controllerId: string; purpose: ConsentPurpose }): ConsentCheck {
    const matching = [...this.records.values()].filter(
      (r) => r.subjectId === params.subjectId && r.controllerId === params.controllerId && r.purpose === params.purpose,
    );
    if (matching.length === 0) {
      return { allowed: false, reason: 'No consent record', requiresElevation: true };
    }
    const active = matching.find((r) => r.status === 'granted' && new Date(r.expiresAt) > new Date());
    if (!active) {
      return { allowed: false, reason: 'Consent revoked or expired', requiresElevation: true };
    }
    return { allowed: true, reason: 'Active consent', consentId: active.id, requiresElevation: false };
  }
}

export function minimiseColumns(
  requestedColumns: readonly string[],
  userHasPiiAccess: boolean,
): { allowed: string[]; removed: string[]; minimised: boolean } {
  const allowed: string[] = [];
  const removed: string[] = [];
  for (const col of requestedColumns) {
    if (PII_COLUMNS.has(col.toLowerCase()) && !userHasPiiAccess) {
      removed.push(col);
    } else {
      allowed.push(col);
    }
  }
  return { allowed, removed, minimised: removed.length > 0 };
}
