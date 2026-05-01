// hitl/src/reviewer-console.tsx
// P06-T02 — Reviewer Console UI
// Inbox, actions, inline diffs, side panel (institutional memory)

// ─── Types ───────────────────────────────────────────────

export type ReviewAction = 'approve' | 'edit_approve' | 'reject' | 'escalate' | 'refuse_notify';

export interface ReviewItem {
  readonly id: string;
  readonly questionId: string;
  readonly question: string;
  readonly generatedAnswer: string;
  readonly generatedSql: string;
  readonly confidenceScore: number;
  readonly confidenceTier: 'high' | 'medium' | 'low';
  readonly confidenceReasoning: string;
  readonly sensitivityTier: 'public' | 'internal' | 'restricted' | 'regulated';
  readonly citations: readonly { column: string; value: unknown; lineage: string }[];
  readonly suggestedEdit: string | null;
  readonly userId: string;
  readonly userName: string;
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly assignedAt: string;
  readonly slaDeadline: string;
  readonly priority: 'normal' | 'high' | 'critical';
  readonly triageRulesMatched: readonly string[];
  readonly status: 'pending' | 'in_review' | 'completed';
}

export interface ReviewDecision {
  readonly itemId: string;
  readonly reviewerId: string;
  readonly action: ReviewAction;
  readonly reason: string;                   // Required for reject
  readonly editedAnswer?: string;            // For edit_approve
  readonly editedSql?: string;               // For edit_approve
  readonly timestamp: string;
  readonly durationMs: number;               // Time spent reviewing
}

export interface SimilarQuestion {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly action: ReviewAction;
  readonly reviewer: string;
  readonly reviewedAt: string;
  readonly similarity: number;
}

export interface InboxFilters {
  readonly status: 'pending' | 'in_review' | 'all';
  readonly bu: string | null;
  readonly priority: string | null;
  readonly sensitivityTier: string | null;
  readonly sortBy: 'assignedAt' | 'slaDeadline' | 'priority';
  readonly sortOrder: 'asc' | 'desc';
}

// ─── Inbox Component ─────────────────────────────────────

export function ReviewerInbox() {
  return {
    type: 'div',
    className: 'reviewer-inbox',
    children: [
      // Header with queue stats
      { type: 'header', className: 'inbox-header',
        children: [
          { type: 'h1', children: '📋 Reviewer Queue' },
          { type: 'div', className: 'queue-stats',
            children: [
              { type: 'div', className: 'stat', children: [
                { type: 'span', className: 'stat-value', id: 'stat-pending' },
                { type: 'span', className: 'stat-label', children: 'Pending' },
              ]},
              { type: 'div', className: 'stat', children: [
                { type: 'span', className: 'stat-value', id: 'stat-sla-risk' },
                { type: 'span', className: 'stat-label', children: 'SLA at risk' },
              ]},
              { type: 'div', className: 'stat', children: [
                { type: 'span', className: 'stat-value', id: 'stat-completed' },
                { type: 'span', className: 'stat-label', children: 'Completed today' },
              ]},
            ],
          },
        ],
      },

      // Filters bar
      { type: 'div', className: 'inbox-filters', role: 'toolbar', 'aria-label': 'Queue filters',
        children: [
          { type: 'select', className: 'filter-bu', id: 'filter-bu', 'aria-label': 'Filter by BU' },
          { type: 'select', className: 'filter-priority', id: 'filter-priority', 'aria-label': 'Filter by priority' },
          { type: 'select', className: 'filter-sensitivity', id: 'filter-sensitivity', 'aria-label': 'Filter by sensitivity' },
          { type: 'select', className: 'filter-sort', id: 'filter-sort', 'aria-label': 'Sort by' },
        ],
      },

      // Item list
      { type: 'div', className: 'inbox-list', role: 'list', 'aria-label': 'Review items' },
    ],
  };
}

// ─── Review Detail Panel ─────────────────────────────────

export function ReviewDetailPanel() {
  return {
    type: 'div',
    className: 'review-detail',
    children: [
      // Question
      { type: 'section', className: 'detail-question',
        children: [
          { type: 'h2', children: 'User Question' },
          { type: 'blockquote', className: 'question-text', id: 'detail-question-text' },
          { type: 'div', className: 'question-meta', id: 'detail-question-meta' },
        ],
      },

      // Generated Answer
      { type: 'section', className: 'detail-answer',
        children: [
          { type: 'h2', children: 'Generated Answer' },
          { type: 'div', className: 'answer-content', id: 'detail-answer-content' },
          { type: 'div', className: 'answer-confidence', id: 'detail-confidence' },
        ],
      },

      // Generated SQL
      { type: 'section', className: 'detail-sql',
        children: [
          { type: 'h2', children: 'Generated SQL' },
          { type: 'pre', children: { type: 'code', id: 'detail-sql-code' } },
        ],
      },

      // Citations
      { type: 'section', className: 'detail-citations',
        children: [
          { type: 'h2', children: 'Citations' },
          { type: 'div', className: 'citation-list', id: 'detail-citations-list' },
        ],
      },

      // Confidence Reasoning
      { type: 'section', className: 'detail-reasoning',
        children: [
          { type: 'h2', children: 'Confidence Reasoning' },
          { type: 'p', id: 'detail-reasoning-text' },
        ],
      },

      // Triage Info
      { type: 'section', className: 'detail-triage',
        children: [
          { type: 'h2', children: 'Triage Decision' },
          { type: 'div', id: 'detail-triage-info' },
        ],
      },

      // Action Bar
      { type: 'div', className: 'action-bar', role: 'toolbar', 'aria-label': 'Review actions',
        children: [
          { type: 'button', className: 'action-btn approve', id: 'btn-approve', children: '✅ Approve' },
          { type: 'button', className: 'action-btn edit', id: 'btn-edit-approve', children: '✏️ Edit & Approve' },
          { type: 'button', className: 'action-btn reject', id: 'btn-reject', children: '❌ Reject' },
          { type: 'button', className: 'action-btn escalate', id: 'btn-escalate', children: '⬆️ Escalate' },
          { type: 'button', className: 'action-btn refuse', id: 'btn-refuse', children: '🚫 Refuse & Notify' },
        ],
      },

      // Reject Modal (reason required)
      { type: 'dialog', className: 'reject-modal', id: 'reject-modal',
        children: [
          { type: 'h3', children: 'Rejection Reason (required)' },
          { type: 'textarea', id: 'reject-reason', 'aria-label': 'Rejection reason', placeholder: 'Explain why this answer is being rejected…' },
          { type: 'div', className: 'modal-actions',
            children: [
              { type: 'button', className: 'modal-cancel', id: 'reject-cancel', children: 'Cancel' },
              { type: 'button', className: 'modal-confirm', id: 'reject-confirm', children: 'Reject' },
            ],
          },
        ],
      },
    ],
  };
}

// ─── Inline Diff View ────────────────────────────────────

export interface DiffLine {
  readonly type: 'added' | 'removed' | 'unchanged';
  readonly content: string;
  readonly lineNumber: number;
}

export function InlineDiffView() {
  return {
    type: 'div',
    className: 'inline-diff',
    role: 'region',
    'aria-label': 'Answer changes',
    children: [
      { type: 'h3', children: 'Changes' },
      { type: 'div', className: 'diff-content', id: 'diff-content' },
    ],
  };
}

// ─── Side Panel — Similar Questions (Institutional Memory) ──

export function SimilarQuestionsPanel() {
  return {
    type: 'aside',
    className: 'similar-panel',
    role: 'complementary',
    'aria-label': 'Similar prior questions',
    children: [
      { type: 'h3', children: '📚 Similar Questions' },
      { type: 'p', className: 'panel-description', children: 'How similar questions were resolved previously:' },
      { type: 'div', className: 'similar-list', id: 'similar-questions-list' },
    ],
  };
}

// ─── SLA Timer ───────────────────────────────────────────

export interface SlaTimerProps {
  readonly deadline: string;
  readonly warningMinutes: number;
  readonly breachMinutes: number;
}

export function SlaTimer() {
  return {
    type: 'div',
    className: 'sla-timer',
    role: 'timer',
    'aria-live': 'polite',
    children: [
      { type: 'span', className: 'sla-icon', id: 'sla-icon' },
      { type: 'span', className: 'sla-remaining', id: 'sla-remaining' },
    ],
  };
}
