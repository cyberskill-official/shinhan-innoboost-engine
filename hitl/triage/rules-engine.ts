// hitl/triage/rules-engine.ts
// P06-T01 — Triage Rules Engine
// Confidence + Sensitivity + Novelty → route to reviewer or auto-approve

// ─── Types ───────────────────────────────────────────────

export type TriageAction = 'auto_approve' | 'route_reviewer' | 'escalate' | 'refuse';
export type SensitivityTier = 'public' | 'internal' | 'restricted' | 'regulated';
export type ConfidenceTier = 'high' | 'medium' | 'low';
export type Priority = 'normal' | 'high' | 'critical';

export interface TriageInput {
  readonly questionId: string;
  readonly question: string;
  readonly confidenceScore: number;       // 0.0–1.0
  readonly confidenceTier: ConfidenceTier;
  readonly sensitivityTier: SensitivityTier;
  readonly noveltyScore: number;          // 0.0–1.0, lower = more novel
  readonly userId: string;
  readonly userRole: string;
  readonly tenantId: string;
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly isHistoricallyFlagged: boolean;
  readonly generatedAnswer: string;
  readonly generatedSql: string;
  readonly citations: readonly { column: string; value: unknown }[];
}

export interface TriageDecision {
  readonly action: TriageAction;
  readonly reason: string;
  readonly rulesMatched: readonly string[];
  readonly assignedReviewerId: string | null;
  readonly priority: Priority;
  readonly slaMinutes: number;
  readonly estimatedWaitMs: number;
  readonly timestamp: string;
}

export interface TriageRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly priority: number;   // Lower = higher priority (evaluated first)
  readonly enabled: boolean;
  readonly condition: (input: TriageInput) => boolean;
  readonly action: TriageAction;
  readonly slaMinutes: number;
  readonly priorityLevel: Priority;
}

// ─── SLA Configuration ───────────────────────────────────

export const SLA_CONFIG = {
  target_minutes: 30,
  warning_minutes: 20,
  breach_minutes: 30,
  escalation_minutes: 45,
  max_queue_depth: 50,
} as const;

// ─── Seed Rules (per demo-build-plan §6.1) ───────────────

export const SEED_RULES: readonly TriageRule[] = [
  {
    id: 'R001',
    name: 'Low Confidence Auto-Route',
    description: 'Confidence score below 65% → always route to reviewer',
    priority: 10,
    enabled: true,
    condition: (input) => input.confidenceScore < 0.65,
    action: 'route_reviewer',
    slaMinutes: 30,
    priorityLevel: 'high',
  },
  {
    id: 'R002',
    name: 'Restricted/Regulated Sensitivity Gate',
    description: 'Sensitivity ≥ Restricted → mandatory reviewer approval',
    priority: 20,
    enabled: true,
    condition: (input) => input.sensitivityTier === 'restricted' || input.sensitivityTier === 'regulated',
    action: 'route_reviewer',
    slaMinutes: 30,
    priorityLevel: 'high',
  },
  {
    id: 'R003',
    name: 'Novel Question Detection',
    description: 'Similarity < 0.40 to any gold-set entry → route for review (potential new pattern)',
    priority: 30,
    enabled: true,
    condition: (input) => input.noveltyScore < 0.40,
    action: 'route_reviewer',
    slaMinutes: 30,
    priorityLevel: 'normal',
  },
  {
    id: 'R004',
    name: 'Historically Flagged Pattern',
    description: 'Question matches a pattern previously rejected by reviewers',
    priority: 25,
    enabled: true,
    condition: (input) => input.isHistoricallyFlagged,
    action: 'route_reviewer',
    slaMinutes: 30,
    priorityLevel: 'high',
  },
  {
    id: 'R005',
    name: 'No Citations Generated',
    description: 'Answer generated without any citations → cannot verify → route',
    priority: 15,
    enabled: true,
    condition: (input) => input.citations.length === 0 && input.confidenceTier !== 'high',
    action: 'route_reviewer',
    slaMinutes: 30,
    priorityLevel: 'normal',
  },
  {
    id: 'R006',
    name: 'Regulated + Low Confidence → Escalate',
    description: 'Regulated data with low confidence → immediate escalation',
    priority: 5,
    enabled: true,
    condition: (input) => input.sensitivityTier === 'regulated' && input.confidenceScore < 0.50,
    action: 'escalate',
    slaMinutes: 15,
    priorityLevel: 'critical',
  },
  {
    id: 'R007',
    name: 'High Confidence + Public → Auto-approve',
    description: 'High confidence on public data → no reviewer needed',
    priority: 100,
    enabled: true,
    condition: (input) => input.confidenceScore >= 0.85 && input.sensitivityTier === 'public' && !input.isHistoricallyFlagged && input.noveltyScore >= 0.40,
    action: 'auto_approve',
    slaMinutes: 0,
    priorityLevel: 'normal',
  },
];

// ─── Reviewer Pool & Routing ─────────────────────────────

export interface Reviewer {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly buScope: readonly string[];
  readonly sensitivityCeiling: SensitivityTier;
  readonly maxConcurrent: number;
  readonly currentLoad: number;
  readonly availableFrom: string;   // ISO time
  readonly availableTo: string;     // ISO time
  readonly timezone: string;
}

export class ReviewerPool {
  private reviewers: Reviewer[] = [];
  private lastAssignedIndex = 0;

  addReviewer(reviewer: Reviewer): void {
    this.reviewers.push(reviewer);
  }

  /**
   * Round-robin assignment within eligible reviewers.
   * Eligible = covers the BU + sensitivity tier + within working hours + under load limit.
   */
  assign(bu: string, sensitivity: SensitivityTier): Reviewer | null {
    const sensitivityOrder: SensitivityTier[] = ['public', 'internal', 'restricted', 'regulated'];
    const requiredLevel = sensitivityOrder.indexOf(sensitivity);

    const eligible = this.reviewers.filter((r) => {
      const reviewerLevel = sensitivityOrder.indexOf(r.sensitivityCeiling);
      return (
        (r.buScope.includes(bu) || r.buScope.includes('*')) &&
        reviewerLevel >= requiredLevel &&
        r.currentLoad < r.maxConcurrent
      );
    });

    if (eligible.length === 0) return null;

    // Round-robin
    this.lastAssignedIndex = (this.lastAssignedIndex + 1) % eligible.length;
    return eligible[this.lastAssignedIndex]!;
  }
}

// ─── Triage Engine ───────────────────────────────────────

export class TriageEngine {
  private rules: TriageRule[];
  private pool: ReviewerPool;

  constructor(rules: readonly TriageRule[] = SEED_RULES, pool?: ReviewerPool) {
    // Sort by priority (lower number = higher priority)
    this.rules = [...rules].sort((a, b) => a.priority - b.priority);
    this.pool = pool ?? new ReviewerPool();
  }

  /**
   * Evaluate input against all rules, return first matching action.
   * If no rule matches → auto-approve (default-safe for high-confidence public).
   */
  evaluate(input: TriageInput): TriageDecision {
    const matchedRules: string[] = [];
    let action: TriageAction = 'auto_approve';
    let slaMinutes = 0;
    let priorityLevel: Priority = 'normal';
    let reason = 'No triage rules triggered — auto-approved.';

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      try {
        if (rule.condition(input)) {
          matchedRules.push(rule.id);

          // Highest-priority rule wins for action
          if (matchedRules.length === 1 || rule.priority < 50) {
            action = rule.action;
            slaMinutes = rule.slaMinutes;
            priorityLevel = rule.priorityLevel;
            reason = `Rule ${rule.id}: ${rule.description}`;
          }
        }
      } catch {
        // Rule evaluation error — skip, don't crash triage
        continue;
      }
    }

    // Assign reviewer if routing
    let assignedReviewerId: string | null = null;
    if (action === 'route_reviewer' || action === 'escalate') {
      const reviewer = this.pool.assign(input.bu, input.sensitivityTier);
      assignedReviewerId = reviewer?.id ?? null;
    }

    return {
      action,
      reason,
      rulesMatched: matchedRules,
      assignedReviewerId,
      priority: priorityLevel,
      slaMinutes,
      estimatedWaitMs: slaMinutes * 60 * 1000,
      timestamp: new Date().toISOString(),
    };
  }

  /** Add a custom rule at runtime. */
  addRule(rule: TriageRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
  }

  /** Disable a rule by ID. */
  disableRule(ruleId: string): boolean {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (!rule) return false;
    (rule as { enabled: boolean }).enabled = false;
    return true;
  }
}
