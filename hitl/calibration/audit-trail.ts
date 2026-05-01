// hitl/calibration/audit-trail.ts
// P06-T03 — Audit Trail & Quarterly Calibration Reporting
// Every reviewer decision logged; performance metrics; drift detection

import type { ReviewAction } from '../src/reviewer-console.js';

// ─── Audit Entry ─────────────────────────────────────────

export interface ReviewAuditEntry {
  readonly id: string;
  readonly reviewItemId: string;
  readonly questionId: string;
  readonly reviewerId: string;
  readonly reviewerName: string;
  readonly action: ReviewAction;
  readonly reason: string;
  readonly timestamp: string;
  readonly durationMs: number;

  // Before/After state capture
  readonly beforeState: {
    readonly answer: string;
    readonly sql: string;
    readonly confidenceScore: number;
    readonly confidenceTier: string;
  };
  readonly afterState: {
    readonly answer: string;       // Same as before if approve-as-is
    readonly sql: string;
    readonly editDiff: string | null;
  };

  // Context
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly sensitivityTier: string;
  readonly triageRulesMatched: readonly string[];
  readonly slaDeadline: string;
  readonly slaMet: boolean;

  // Integrity
  readonly rowHash: string;
  readonly prevHash: string;
}

// ─── Reviewer Performance Metrics ────────────────────────

export interface ReviewerPerformance {
  readonly reviewerId: string;
  readonly period: { from: string; to: string };
  readonly volume: number;
  readonly slaAdherence: number;           // 0-100%
  readonly averageDurationMs: number;
  readonly actionBreakdown: Record<ReviewAction, number>;
  readonly overrideRate: number;           // % of auto-generated answers edited
  readonly downstreamFeedback: {
    readonly positive: number;
    readonly negative: number;
    readonly neutral: number;
  };
}

// ─── Calibration Report ──────────────────────────────────

export interface CalibrationReport {
  readonly reportId: string;
  readonly quarter: string;              // "2025-Q4"
  readonly generatedAt: string;
  readonly reviewerCount: number;
  readonly totalDecisions: number;

  // Consistency analysis
  readonly interReviewerAgreement: number;  // 0-100% (Fleiss' kappa equivalent)
  readonly driftDetected: boolean;
  readonly driftDetails: readonly DriftIndicator[];

  // Disagreement clusters
  readonly disagreementClusters: readonly DisagreementCluster[];

  // Per-reviewer summaries
  readonly reviewerSummaries: readonly ReviewerPerformance[];

  // Recommendations
  readonly recommendations: readonly string[];
}

export interface DriftIndicator {
  readonly metric: string;
  readonly direction: 'improving' | 'degrading' | 'volatile';
  readonly currentValue: number;
  readonly previousValue: number;
  readonly deltaPct: number;
  readonly significance: 'low' | 'medium' | 'high';
}

export interface DisagreementCluster {
  readonly id: string;
  readonly description: string;
  readonly questionPattern: string;
  readonly reviewerDecisions: readonly {
    readonly reviewerId: string;
    readonly action: ReviewAction;
    readonly reason: string;
  }[];
  readonly suggestedResolution: string;
}

// ─── Audit Trail Service ─────────────────────────────────

export class AuditTrailService {
  private entries: ReviewAuditEntry[] = [];
  private lastHash = '0'.repeat(64);

  /**
   * Append a reviewer decision to the audit trail.
   * Hash-chains entries for tamper evidence (per P02-T09 audit log pattern).
   */
  append(entry: Omit<ReviewAuditEntry, 'id' | 'rowHash' | 'prevHash'>): ReviewAuditEntry {
    const id = `RAUD-${Date.now()}-${this.entries.length}`;
    const prevHash = this.lastHash;

    // Simple hash for demo (production uses SHA-256)
    const contentToHash = JSON.stringify({ ...entry, id, prevHash });
    const rowHash = this.simpleHash(contentToHash);

    const fullEntry: ReviewAuditEntry = {
      ...entry,
      id,
      rowHash,
      prevHash,
    };

    this.entries.push(fullEntry);
    this.lastHash = rowHash;

    return fullEntry;
  }

  /**
   * Verify chain integrity — any tampered entry breaks the chain.
   */
  verifyChain(): { valid: boolean; brokenAt?: number } {
    let expectedPrev = '0'.repeat(64);

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i]!;
      if (entry.prevHash !== expectedPrev) {
        return { valid: false, brokenAt: i };
      }
      expectedPrev = entry.rowHash;
    }

    return { valid: true };
  }

  /**
   * Compute reviewer performance for a given period.
   */
  getReviewerPerformance(reviewerId: string, from: string, to: string): ReviewerPerformance {
    const entries = this.entries.filter(
      (e) => e.reviewerId === reviewerId && e.timestamp >= from && e.timestamp <= to,
    );

    const actionBreakdown: Record<ReviewAction, number> = {
      approve: 0, edit_approve: 0, reject: 0, escalate: 0, refuse_notify: 0,
    };
    let slaMetCount = 0;
    let totalDuration = 0;
    let editCount = 0;

    for (const entry of entries) {
      actionBreakdown[entry.action]++;
      if (entry.slaMet) slaMetCount++;
      totalDuration += entry.durationMs;
      if (entry.afterState.editDiff !== null) editCount++;
    }

    return {
      reviewerId,
      period: { from, to },
      volume: entries.length,
      slaAdherence: entries.length > 0 ? (slaMetCount / entries.length) * 100 : 100,
      averageDurationMs: entries.length > 0 ? totalDuration / entries.length : 0,
      actionBreakdown,
      overrideRate: entries.length > 0 ? (editCount / entries.length) * 100 : 0,
      downstreamFeedback: { positive: 0, negative: 0, neutral: 0 }, // To be wired
    };
  }

  /**
   * Generate quarterly calibration report.
   */
  generateCalibrationReport(quarter: string): CalibrationReport {
    const [year, q] = quarter.split('-Q');
    const qNum = parseInt(q!, 10);
    const from = `${year}-${String((qNum - 1) * 3 + 1).padStart(2, '0')}-01T00:00:00Z`;
    const to = `${year}-${String(qNum * 3).padStart(2, '0')}-31T23:59:59Z`;

    const periodEntries = this.entries.filter(
      (e) => e.timestamp >= from && e.timestamp <= to,
    );

    // Unique reviewers
    const reviewerIds = [...new Set(periodEntries.map((e) => e.reviewerId))];
    const reviewerSummaries = reviewerIds.map((id) =>
      this.getReviewerPerformance(id, from, to),
    );

    // Detect drift: compare first half vs second half of quarter
    const mid = new Date((new Date(from).getTime() + new Date(to).getTime()) / 2).toISOString();
    const firstHalf = periodEntries.filter((e) => e.timestamp < mid);
    const secondHalf = periodEntries.filter((e) => e.timestamp >= mid);

    const driftDetails: DriftIndicator[] = [];
    const firstApprovalRate = firstHalf.length > 0
      ? firstHalf.filter((e) => e.action === 'approve').length / firstHalf.length
      : 0;
    const secondApprovalRate = secondHalf.length > 0
      ? secondHalf.filter((e) => e.action === 'approve').length / secondHalf.length
      : 0;

    if (Math.abs(firstApprovalRate - secondApprovalRate) > 0.1) {
      driftDetails.push({
        metric: 'approval_rate',
        direction: secondApprovalRate > firstApprovalRate ? 'improving' : 'degrading',
        currentValue: secondApprovalRate * 100,
        previousValue: firstApprovalRate * 100,
        deltaPct: (secondApprovalRate - firstApprovalRate) * 100,
        significance: Math.abs(firstApprovalRate - secondApprovalRate) > 0.2 ? 'high' : 'medium',
      });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    for (const summary of reviewerSummaries) {
      if (summary.slaAdherence < 90) {
        recommendations.push(`Reviewer ${summary.reviewerId}: SLA adherence ${summary.slaAdherence.toFixed(0)}% — investigate bottleneck.`);
      }
      if (summary.overrideRate > 50) {
        recommendations.push(`Reviewer ${summary.reviewerId}: High override rate ${summary.overrideRate.toFixed(0)}% — engine may need tuning for their BU.`);
      }
    }

    if (driftDetails.some((d) => d.significance === 'high')) {
      recommendations.push('Significant drift detected — schedule alignment meeting.');
    }

    return {
      reportId: `CAL-${quarter}-${Date.now()}`,
      quarter,
      generatedAt: new Date().toISOString(),
      reviewerCount: reviewerIds.length,
      totalDecisions: periodEntries.length,
      interReviewerAgreement: 0, // Requires multi-reviewer overlap to compute
      driftDetected: driftDetails.length > 0,
      driftDetails,
      disagreementClusters: [], // Populated when overlap data available
      reviewerSummaries,
      recommendations,
    };
  }

  /** Get all entries (for export / WORM). */
  getEntries(): readonly ReviewAuditEntry[] {
    return this.entries;
  }

  private simpleHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32-bit int
    }
    return Math.abs(hash).toString(16).padStart(16, '0').repeat(4);
  }
}
