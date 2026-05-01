// hitl/src/feedback-wire.ts
// P06-T04 — Reviewer-Feedback → Engine Improvement Loop
// Wires reviewer decisions back into: gold-set candidates, prompt improvement, metric corrections

import type { ReviewAction } from './reviewer-console.js';
import type { ReviewAuditEntry } from '../calibration/audit-trail.js';

// ─── Types ───────────────────────────────────────────────

export type FeedbackChannel =
  | 'gold_set_candidate'         // Approved-with-edits → candidate for gold-set
  | 'prompt_improvement'         // Rejected-with-reason → prompt tuning queue
  | 'metric_correction'          // Patterns across rejections → metric registry fix
  | 'triage_rule_update'         // Systematic misrouting → rule adjustment
  | 'none';                      // Approve-as-is: no feedback loop action

export interface FeedbackEvent {
  readonly id: string;
  readonly channel: FeedbackChannel;
  readonly auditEntryId: string;
  readonly questionId: string;
  readonly bu: string;
  readonly timestamp: string;
  readonly payload: FeedbackPayload;
  readonly status: 'pending' | 'processed' | 'dismissed';
}

export type FeedbackPayload =
  | GoldSetCandidatePayload
  | PromptImprovementPayload
  | MetricCorrectionPayload
  | TriageRulePayload;

export interface GoldSetCandidatePayload {
  readonly type: 'gold_set_candidate';
  readonly originalQuestion: string;
  readonly editedAnswer: string;
  readonly editedSql: string;
  readonly editDiff: string;
  readonly reviewerNotes: string;
}

export interface PromptImprovementPayload {
  readonly type: 'prompt_improvement';
  readonly rejectionReason: string;
  readonly questionPattern: string;
  readonly failureCategory: 'wrong_sql' | 'wrong_answer' | 'hallucination' | 'missing_context' | 'wrong_confidence' | 'other';
  readonly suggestedFix: string;
}

export interface MetricCorrectionPayload {
  readonly type: 'metric_correction';
  readonly metricId: string;
  readonly issue: string;
  readonly rejectionCount: number;
  readonly exampleQuestionIds: readonly string[];
}

export interface TriageRulePayload {
  readonly type: 'triage_rule_update';
  readonly ruleId: string;
  readonly issue: 'over_routing' | 'under_routing';
  readonly evidence: string;
  readonly suggestedChange: string;
}

// ─── Feedback Wire Service ───────────────────────────────

export class FeedbackWire {
  private events: FeedbackEvent[] = [];
  private rejectionPatterns: Map<string, number> = new Map(); // questionPattern → count

  /**
   * Process a reviewer decision and route to appropriate feedback channels.
   */
  processDecision(auditEntry: ReviewAuditEntry): FeedbackEvent | null {
    const channel = this.determineChannel(auditEntry);
    if (channel === 'none') return null;

    const payload = this.buildPayload(auditEntry, channel);
    if (!payload) return null;

    const event: FeedbackEvent = {
      id: `FB-${Date.now()}-${this.events.length}`,
      channel,
      auditEntryId: auditEntry.id,
      questionId: auditEntry.questionId,
      bu: auditEntry.bu,
      timestamp: new Date().toISOString(),
      payload,
      status: 'pending',
    };

    this.events.push(event);

    // Track rejection patterns
    if (auditEntry.action === 'reject') {
      const pattern = this.extractPattern(auditEntry.reason);
      const count = (this.rejectionPatterns.get(pattern) ?? 0) + 1;
      this.rejectionPatterns.set(pattern, count);

      // If pattern reaches threshold → emit metric correction
      if (count >= 3) {
        this.emitMetricCorrection(pattern, count, auditEntry);
      }
    }

    return event;
  }

  /**
   * Determine which feedback channel to route to.
   */
  private determineChannel(entry: ReviewAuditEntry): FeedbackChannel {
    switch (entry.action) {
      case 'approve':
        return 'none'; // Approve-as-is: no action needed

      case 'edit_approve':
        return 'gold_set_candidate'; // Edits become gold-set candidates

      case 'reject':
        return 'prompt_improvement'; // Rejections feed prompt improvement

      case 'escalate':
        return 'triage_rule_update'; // Escalations may indicate bad routing

      case 'refuse_notify':
        return 'prompt_improvement'; // Refusals also need prompt tuning

      default:
        return 'none';
    }
  }

  /**
   * Build the appropriate payload for the feedback channel.
   */
  private buildPayload(entry: ReviewAuditEntry, channel: FeedbackChannel): FeedbackPayload | null {
    switch (channel) {
      case 'gold_set_candidate':
        return {
          type: 'gold_set_candidate',
          originalQuestion: '', // Populated from review item
          editedAnswer: entry.afterState.answer,
          editedSql: entry.afterState.sql,
          editDiff: entry.afterState.editDiff ?? '',
          reviewerNotes: entry.reason,
        };

      case 'prompt_improvement':
        return {
          type: 'prompt_improvement',
          rejectionReason: entry.reason,
          questionPattern: this.extractPattern(entry.reason),
          failureCategory: this.categorizeFailure(entry.reason),
          suggestedFix: '', // To be filled during prompt-eng triage
        };

      case 'triage_rule_update':
        return {
          type: 'triage_rule_update',
          ruleId: entry.triageRulesMatched[0] ?? 'unknown',
          issue: 'over_routing',
          evidence: `Escalated item that matched rules: ${entry.triageRulesMatched.join(', ')}`,
          suggestedChange: 'Review rule threshold or condition',
        };

      default:
        return null;
    }
  }

  /**
   * Extract a pattern from rejection reasons for clustering.
   */
  private extractPattern(reason: string): string {
    // Normalize to lowercase, strip specifics
    return reason
      .toLowerCase()
      .replace(/\d+/g, 'N')
      .replace(/['"]/g, '')
      .trim()
      .slice(0, 100);
  }

  /**
   * Categorize the failure type from rejection reason.
   */
  private categorizeFailure(reason: string): PromptImprovementPayload['failureCategory'] {
    const lower = reason.toLowerCase();
    if (lower.includes('sql') || lower.includes('query')) return 'wrong_sql';
    if (lower.includes('hallucin')) return 'hallucination';
    if (lower.includes('confidence')) return 'wrong_confidence';
    if (lower.includes('context') || lower.includes('missing')) return 'missing_context';
    if (lower.includes('wrong') || lower.includes('incorrect')) return 'wrong_answer';
    return 'other';
  }

  /**
   * Emit a metric correction when rejection pattern reaches threshold.
   */
  private emitMetricCorrection(pattern: string, count: number, entry: ReviewAuditEntry): void {
    const correctionEvent: FeedbackEvent = {
      id: `FB-MC-${Date.now()}`,
      channel: 'metric_correction',
      auditEntryId: entry.id,
      questionId: entry.questionId,
      bu: entry.bu,
      timestamp: new Date().toISOString(),
      payload: {
        type: 'metric_correction',
        metricId: 'auto-detected',
        issue: `Pattern "${pattern}" rejected ${count} times`,
        rejectionCount: count,
        exampleQuestionIds: this.events
          .filter((e) => e.channel === 'prompt_improvement')
          .slice(-5)
          .map((e) => e.questionId),
      },
      status: 'pending',
    };

    this.events.push(correctionEvent);
  }

  /** Get pending events for a channel. */
  getPending(channel?: FeedbackChannel): readonly FeedbackEvent[] {
    return this.events.filter(
      (e) => e.status === 'pending' && (!channel || e.channel === channel),
    );
  }

  /** Mark event as processed. */
  markProcessed(eventId: string): boolean {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return false;
    (event as { status: string }).status = 'processed';
    return true;
  }

  /** Get summary stats. */
  getSummary(): {
    total: number;
    byChannel: Record<FeedbackChannel, number>;
    pending: number;
    processed: number;
  } {
    const byChannel: Record<FeedbackChannel, number> = {
      gold_set_candidate: 0, prompt_improvement: 0,
      metric_correction: 0, triage_rule_update: 0, none: 0,
    };

    for (const event of this.events) {
      byChannel[event.channel]++;
    }

    return {
      total: this.events.length,
      byChannel,
      pending: this.events.filter((e) => e.status === 'pending').length,
      processed: this.events.filter((e) => e.status === 'processed').length,
    };
  }
}
