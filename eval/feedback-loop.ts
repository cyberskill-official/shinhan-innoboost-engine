// eval/feedback-loop.ts
// P04-T05 — Reviewer Feedback → Gold-Set Candidacy Loop
// HITL rejections auto-flagged; weekly triage; versioned gold-set.

// ─── Types ───────────────────────────────────────────────

export type CandidacyStatus = 'pending' | 'promoted' | 'demoted' | 'edited' | 'rejected';

export interface FeedbackEntry {
  readonly id: string;
  readonly question: string;
  readonly bu: 'svfc' | 'bank' | 'securities';
  readonly original_answer: string;
  readonly rejection_reason: 'incorrect_answer' | 'missing_citation' | 'wrong_confidence' | 'hallucination' | 'other';
  readonly reviewer: string;
  readonly feedback_text: string;
  readonly timestamp: string;
  readonly source: 'hitl_rejection' | 'manual_report' | 'eval_failure';
}

export interface GoldSetCandidate {
  readonly id: string;
  readonly feedback_id: string;
  readonly question: string;
  readonly bu: string;
  readonly proposed_sql: string;
  readonly proposed_answer_shape: string;
  readonly proposed_confidence_tier: string;
  readonly status: CandidacyStatus;
  readonly triaged_by: string | null;
  readonly triaged_at: string | null;
  readonly gold_set_version: string;
  readonly notes: string;
}

export interface GoldSetVersion {
  readonly version: string;
  readonly created_at: string;
  readonly created_by: string;
  readonly entries_added: number;
  readonly entries_removed: number;
  readonly entries_edited: number;
  readonly changelog: string;
}

// ─── Feedback Processor ──────────────────────────────────

export class FeedbackLoop {
  private candidates: GoldSetCandidate[] = [];
  private versions: GoldSetVersion[] = [];
  private currentVersion = '1.0.0';

  /**
   * Process a HITL rejection and auto-flag for gold-set candidacy.
   */
  flagForCandidacy(feedback: FeedbackEntry): GoldSetCandidate {
    const candidate: GoldSetCandidate = {
      id: `CAND-${this.candidates.length + 1}`,
      feedback_id: feedback.id,
      question: feedback.question,
      bu: feedback.bu,
      proposed_sql: '', // To be filled during triage
      proposed_answer_shape: '',
      proposed_confidence_tier: '',
      status: 'pending',
      triaged_by: null,
      triaged_at: null,
      gold_set_version: this.currentVersion,
      notes: `Auto-flagged from ${feedback.source}: ${feedback.rejection_reason}`,
    };
    this.candidates.push(candidate);
    return candidate;
  }

  /**
   * Triage a candidate: promote, demote, edit, or reject.
   */
  triage(
    candidateId: string,
    action: CandidacyStatus,
    reviewer: string,
    updates?: Partial<Pick<GoldSetCandidate, 'proposed_sql' | 'proposed_answer_shape' | 'proposed_confidence_tier' | 'notes'>>,
  ): GoldSetCandidate | null {
    const idx = this.candidates.findIndex((c) => c.id === candidateId);
    if (idx === -1) return null;

    const updated: GoldSetCandidate = {
      ...this.candidates[idx]!,
      status: action,
      triaged_by: reviewer,
      triaged_at: new Date().toISOString(),
      ...updates,
    };
    this.candidates[idx] = updated;
    return updated;
  }

  /**
   * Release a new gold-set version from triaged candidates.
   */
  releaseVersion(releasedBy: string): GoldSetVersion {
    const promoted = this.candidates.filter((c) => c.status === 'promoted');
    const demoted = this.candidates.filter((c) => c.status === 'demoted');
    const edited = this.candidates.filter((c) => c.status === 'edited');

    // Bump version
    const [major, minor, patch] = this.currentVersion.split('.').map(Number);
    const newVersion = promoted.length > 0 || demoted.length > 0
      ? `${major}.${minor! + 1}.0`  // Minor bump for content changes
      : `${major}.${minor}.${patch! + 1}`; // Patch for edits only

    const version: GoldSetVersion = {
      version: newVersion,
      created_at: new Date().toISOString(),
      created_by: releasedBy,
      entries_added: promoted.length,
      entries_removed: demoted.length,
      entries_edited: edited.length,
      changelog: [
        `## Gold-Set v${newVersion}`,
        '',
        `Added: ${promoted.length} entries`,
        `Removed: ${demoted.length} entries`,
        `Edited: ${edited.length} entries`,
        '',
        '### Promoted',
        ...promoted.map((c) => `- ${c.id}: ${c.question}`),
        '',
        '### Demoted',
        ...demoted.map((c) => `- ${c.id}: ${c.question}`),
      ].join('\n'),
    };

    this.versions.push(version);
    this.currentVersion = newVersion;

    // Reset triaged candidates
    this.candidates = this.candidates.filter((c) => c.status === 'pending');

    return version;
  }

  /**
   * Get pending candidates for the weekly triage meeting.
   */
  getPendingCandidates(): readonly GoldSetCandidate[] {
    return this.candidates.filter((c) => c.status === 'pending');
  }

  /**
   * Get triage summary for the weekly meeting.
   */
  getTriageSummary(): {
    pending: number;
    promoted: number;
    demoted: number;
    edited: number;
    rejected: number;
    version: string;
  } {
    return {
      pending: this.candidates.filter((c) => c.status === 'pending').length,
      promoted: this.candidates.filter((c) => c.status === 'promoted').length,
      demoted: this.candidates.filter((c) => c.status === 'demoted').length,
      edited: this.candidates.filter((c) => c.status === 'edited').length,
      rejected: this.candidates.filter((c) => c.status === 'rejected').length,
      version: this.currentVersion,
    };
  }

  /**
   * Get version history.
   */
  getVersionHistory(): readonly GoldSetVersion[] {
    return this.versions;
  }
}

// ─── Triage Runbook ──────────────────────────────────────

export const TRIAGE_RUNBOOK = `
# Gold-Set Triage Runbook

## Weekly Cadence

Every Monday, the domain reviewer triages pending candidates:

### Step 1: Review Pending Queue
\`\`\`bash
cyber-eval triage list --status=pending
\`\`\`

### Step 2: For Each Candidate
1. **Is the question representative?** → If yes, promote. If edge case, reject.
2. **Is the SQL correct?** → Verify against actual schema. Edit if needed.
3. **Is the expected answer realistic?** → Check tolerance and citations.
4. **Should an existing entry be demoted?** → If superseded, demote.

### Step 3: Release Version
\`\`\`bash
cyber-eval triage release --reviewer=@handle
\`\`\`

### Step 4: Validate
\`\`\`bash
cyber-eval run --suite=gold --bu=all
\`\`\`
Ensure no regressions from the gold-set change itself.

## Roles
- **Domain SME**: Decides promote/demote/edit (owns correctness)
- **Metric Owner**: Reviews SQL (owns precision)
- **Eng Lead**: Approves version release (owns stability)
`;
