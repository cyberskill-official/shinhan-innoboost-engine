---
title: "Build citation engine (every numeric claim → verifiable source)"
author: "@cyberskill-engine-tech-lead"
department: engineering
status: draft
priority: p0
created_at: "2026-04-29"
ai_authorship: assisted
feature_type: user_facing
eu_ai_act_risk_class: limited
target_release: "2026-06-26"
client_visible: true
template: feature_request@1
---

# Feature Request

> Turn Your Will Into Real.

## Summary

Build the citation engine that ensures every numeric claim in a chat answer is traceable back to its source — the exact SQL row that produced the number — with one click. Each numeric value in the narrative carries a citation token that, when expanded, reveals: the source SQL, the row in the result set that produced this value, the metric definition (with version) that the SQL implements, the freshness timestamp of the data, the lineage chain from metric to source tables, and a confidence indicator. The "trust drawer" UI surfaces this on demand. Citations are not decorative; they are the structural enforcement of "we don't hallucinate numbers" — the single most important credibility signal we can give to a banking-sector reviewer. Without citations, every numeric claim is suspect; with citations, every numeric claim is auditable in 5 seconds.

## Customer Quotes

<untrusted_content source="form_answer_excerpt">
"every answer carries a confidence tier and a citation" — CyberSkill SF9 form answer
"zero hallucinated KPI numbers since UAT" — CyberSkill Engagement A reference (via SF9 form answer)
</untrusted_content>

## Problem

The Form Answers commit explicitly to citation-bearing answers. The Innoboost Q&A's emphasis on feasibility for a financial institution and on commercial readiness make it a non-negotiable: a chat-with-data system that says "the deposit balance is 1.2 trillion VND" without a verifiable cite is indistinguishable from a chat-with-data system that hallucinates. Citations are the difference.

Specific gaps if we shortcut:

- **Without citations, hallucination is undetectable to the user.** The user reads a number; the user trusts the number; if the number is wrong, the trust collapses. With citations, the user can verify in seconds.
- **Without citations, audit is impossible.** "Where does the number 1.2T come from?" — without a citation, the answer is "the LLM said so". With a citation, the answer is "from the row {tenant_id, branch_id, balance_vnd} returned by the SQL on metric 'deposit_balance_by_branch@v1.2.0' at 2026-09-15 14:23 UTC".
- **Without citations, regulators cannot trace decisions.** ISO 42001 (AI management system), EU AI Act Article 14 (human oversight) all require traceability. Citations are the structural enforcement.
- **Without a "show me how" drawer, citations are buried.** UX matters: a click expands the citation; the user sees source, lineage, freshness; trust is reinforced.
- **Without freshness in citations, stale data answers as if fresh.** Confidence-tier scoring (P02-T05) depends on freshness; citations expose freshness to the user.
- **Without lineage in citations, source-table-level changes are opaque.** Lineage in the citation lets the user see "this comes from `consumer_loans` and `payments`; if Shinhan renames `payments`, this metric is impacted".
- **Without versions in citations, the metric definition can drift silently.** Citations pin to a metric version; if the metric is upgraded, prior answers still cite their original version.

The `shinhanos_ai_compliance` memory note's 7 primitives include "citation engine" as a foundational primitive that satisfies multi-jurisdictional rules. This is its implementation.

The `feedback_p1_scope_preference` memory note biases us richer. For citations, "richer" means: every numeric value carries a citation; "show me how" drawer reveals source, lineage, version, freshness, confidence; copy-citation pattern lets users paste the citation into emails or reports. Each layer is feasible; together they form the trust contract.

## Proposed Solution

A citation engine in `engine/citations/` that:

1. **Annotates narrative output with citation tokens.** When the result post-processor (P02-T02) generates a narrative, every numeric claim is wrapped in a citation token: `{The total disbursement in Q1 was [[cite:c-7f3a2]] 12.4 billion VND}`. The token references a citation record.
2. **Generates citation records.** Each citation record contains: `{ id, sql, row_index, column_name, value, metric_id, metric_version, freshness, lineage_chain, confidence_tier, generated_at }`. Records are stored in the audit log (P02-T09) and queryable by ID.
3. **Resolves citations on demand.** UI requests `GET /citations/{id}`; engine returns the full record. Records are cache-friendly (immutable once written).
4. **Renders the trust drawer.** UI component (in P05-T01) expands a citation into a structured display: SQL, source row, metric definition link, lineage diagram, freshness, confidence, and a "copy as text" / "open in admin" affordance.
5. **Validates citations against actual SQL.** A faithfulness check runs at post-execution time (per P02-T03 policy layer, post-faithfulness rule): for each numeric claim in the narrative, verify the value matches the cited row. Mismatch is a hard-rejection.

Setup target: 14 days from task assignment.

### Subtasks

- [ ] **Define the citation record schema.** TypeScript type at `engine/citations/types.ts`. Fields: `id` (UUID-v7); `tenant_id`; `requesterId`; `narrative_position` (start/end character offsets in the narrative); `sql` (full executed SQL with parameters bound); `row_index` (0-based row in the result set); `column_name`; `value` (typed: number, string, date, boolean); `metric_id`; `metric_version`; `freshness` (timestamp); `lineage_chain` (array of `{table, column}`); `confidence_tier` ("Low" / "Medium" / "High"); `generated_at`.
- [ ] **Define the citation-token format.** Narrative format: `[[cite:{citation_id}]]` inserted inline. The frontend chat renderer detects the pattern and renders as a clickable pill.
- [ ] **Implement narrative annotator.** `engine/citations/annotator.ts`. Called by the result post-processor (P02-T02) after narrative generation. For each numeric claim in the narrative, the annotator: (a) identifies the source row in the result set; (b) generates a citation record; (c) inserts the citation token into the narrative at the claim's position; (d) writes the citation record to the audit log.
- [ ] **Implement citation-record storage.** Citations are stored in the audit log (P02-T09); queryable by ID. Cached in a separate Postgres table for fast retrieval (`citations` table indexed on `id`).
- [ ] **Implement citation resolver.** `engine/citations/resolver.ts`. `GET /citations/{id}` returns the full record. Authorization: only the requester's tenant can resolve their own citations; cross-tenant resolution is denied.
- [ ] **Implement faithfulness validator.** `engine/citations/faithfulness.ts`. After narrative generation, for each citation, verify: the cited value matches the cited row's value (exact match for strings, within numerical tolerance for floats). Mismatch is logged and the response is rejected (post-execution policy gate triggers refusal).
- [ ] **Implement the trust-drawer UI component.** In `ui/components/trust-drawer.tsx` (deployed in P05-T01). Rendered when user clicks a citation pill. Shows: the value being cited; the SQL (formatted, syntax-highlighted, scrollable); the source row (table view); the metric definition link (opens admin metric page); the lineage diagram; the freshness timestamp; the confidence tier; copy-citation button.
- [ ] **Implement the copy-citation affordance.** Click "copy as text" produces a copy-paste-friendly citation: "Source: metric `consumer_loans_by_branch@v1.2.0`, row 42 (`branch_id=BR-001`), value `12,401,830,500 VND`, freshness `2026-09-15 14:23 UTC`, confidence `High`, citation ID `c-7f3a2`."
- [ ] **Implement the open-in-admin affordance.** Click "open in admin" opens the metric definition page in the admin console (P05-T05) with the citation context (which question, which row, which version) pre-filled.
- [ ] **Implement the export-citation affordance.** Some users want to export a question + answer + citations to PDF for reporting. The export bundle includes: the question; the narrative; every citation expanded inline; metadata footer.
- [ ] **Implement citation observability.** Track per-citation metrics: how often is each citation expanded? Which questions produce the most expanded citations (signal of low trust)? Aggregate to surface "users frequently doubt the answers about X — review the metric".
- [ ] **Test exhaustively.** > 100 tests covering: annotator inserts citations correctly; resolver returns correct records; faithfulness check catches deliberate mismatches; cross-tenant resolution is denied; UI renders all citation states; copy/export work.

### Acceptance criteria

- Narrative output contains a citation token for every numeric claim.
- Each citation record contains all documented fields and is stored in the audit log.
- Citation resolver `GET /citations/{id}` returns the full record with correct authorization.
- Faithfulness validator runs on every response; mismatches trigger refusal.
- Trust-drawer UI component is operational in the chat surface.
- Copy-citation, open-in-admin, export-citation affordances work.
- Citation observability metrics flow to central observability store.
- Test suite > 100 tests, > 95% coverage of `engine/citations/`.

## Alternatives Considered

- **Skip citations; rely on the LLM's training to not hallucinate.** Rejected: this is exactly the failure mode banking reviewers fear. Citations are non-negotiable.
- **Use a single global citation footnote at the end of the narrative.** Rejected: per-numeric-claim citation is much more useful — the user can verify each claim independently.
- **Use a markdown-link-style citation (`[12.4B](#cite-c-7f3a2)`).** Rejected: looks like a regular link; users may miss it. Visual distinction via citation pill is better UX.
- **Skip the trust drawer; just show the citation ID.** Rejected: the drawer's structured view is what makes the citation useful; an ID alone is opaque.
- **Skip the faithfulness validator; trust the annotator.** Rejected: defence-in-depth — the validator is the deterministic gate that catches annotator bugs or LLM-hallucinated numbers.
- **Skip cross-tenant resolution check.** Rejected: leak risk; even citation IDs reveal information.
- **Generate citations only on user-request (lazy).** Rejected: too late — by the time the user asks, the audit-log entry must already exist.
- **Use sequence-IDs instead of UUIDs for citation IDs.** Rejected: sequence-IDs leak volume information across tenants. UUIDs are opaque.

## Success Metrics

- **Primary**: Faithfulness check passes on every response in the eval harness gold-set within 14 days of task assignment. Measured by: P04-T03 evaluation harness reporting citation-faithfulness metric.
- **Guardrail**: Zero hallucinated numeric claims surface to users during the engagement (zero faithfulness-validator-bypass events). Measured by: spot-check during rehearsals + nightly faithfulness-validator log analysis.

## Scope

### In scope
- Citation record schema and storage.
- Narrative annotator.
- Citation resolver API.
- Faithfulness validator.
- Trust-drawer UI component.
- Copy / open-in-admin / export-PDF affordances.
- Citation observability metrics.
- Test suite.

### Out of scope
- Confidence-tier scoring algorithm (P02-T05).
- Lineage diagram rendering library (P05; this task uses pre-built).
- Audit-log infrastructure (P02-T09).
- Frontend chat renderer beyond the citation-pill detection (P05-T01).
- Multi-language (Vietnamese / Korean) localisation of citation UI strings (handled in P05).
- Per-user-preference citation density (deferred — every numeric claim cited).

## Dependencies

- **Upstream**: P02-T01 (metric layer); P02-T02 (NL→SQL pipeline output); P02-T03 (policy layer triggers faithfulness); P02-T05 (confidence tier); P02-T07 (PDPL classifier — for sensitive-data masking in citation display); P02-T09 (audit log).
- **Downstream**: P05-T01 (chat surface), P05-T05 (admin console).
- **People**: engine tech lead authoring; eng-llm reviewing the annotator's claim-detection logic; design lead reviewing trust-drawer UX; eng-sec reviewing cross-tenant authorization.
- **Memory references**: `shinhanos_ai_compliance`, `feedback_p1_scope_preference`.

## Open Questions

- Q1: How does the annotator detect numeric claims in the narrative? Recommendation: regex + LLM-aware parsing (the LLM marks numeric claims with a tag during narrative generation; annotator post-processes).
- Q2: For the citation token format, do we use `[[cite:id]]` or a different format? Recommendation: `[[cite:id]]` is unique enough not to collide with regular markdown.
- Q3: What about non-numeric claims that warrant citation (e.g., "the top branch was Branch District 1")? Recommendation: cite them too — anything that is a fact retrievable from the SQL gets a citation.
- Q4: For the copy-as-text format, is the verbose form (above) or a shorter form preferred? Recommendation: provide both — user picks via a dropdown.
- Q5: For citation TTL — do we expire citation records eventually? Recommendation: never expire; audit-log retention (7 years) governs.
- Q6: Trust drawer should it be a side-panel or a modal? Recommendation: side-panel — keeps the question + narrative visible.

## Implementation Notes

- The annotator must be deterministic: same narrative + same result set → same citations. Non-determinism breaks audit reproducibility.
- For numeric-claim detection, the prompt to the narrative-generator LLM (P02-T02) instructs it to wrap every numeric claim in a special tag; the annotator parses the tags and replaces them with citations. This is more reliable than regex-based number detection (which struggles with formatted numbers like "1,234,567.89 VND" or "12.4B").
- For the value type, store the typed value in the citation record (number, string, date) plus the format string used to render it in the narrative. The trust drawer can then re-render with the same format.
- For freshness, the timestamp is the warehouse's most-recent-update for the source tables, not the query execution time. This is what users care about: "is this data current?"
- For lineage chain, store as a normalised array; the trust drawer renders it as a tree.
- For copy-as-text, include the citation ID at the end so anyone receiving the copied citation can verify against the audit log if needed.

## Test Plan

- Test 1: Annotator — given a sample narrative + result set, verify each numeric claim is wrapped in a citation token; verify each citation record has all documented fields.
- Test 2: Faithfulness check — corrupt a single numeric claim post-annotation; verify the validator catches and triggers refusal.
- Test 3: Resolver — `GET /citations/{id}` returns the correct record; cross-tenant attempt returns 403.
- Test 4: Trust drawer — render UI with sample citations; verify all fields displayed; verify copy-as-text and open-in-admin work.
- Test 5: Export-PDF — generate a sample export; verify citations are inlined and metadata footer is correct.
- Test 6: Observability — verify per-citation expansion metrics flow.
- Test 7: Performance — citation resolver p95 < 100ms (cache hit < 20ms).

## Rollback Plan

- A bad annotator change is rolled back via PR revert.
- A bad faithfulness rule that causes false-rejections is rolled back via runtime configuration toggle.
- A bad UI change in trust drawer is rolled back via Helm rollback of the UI image.

## Audit Trail / Artefacts

| Artefact | Location | Verifier | Retention |
|---|---|---|---|
| Citation engine implementation | `engine/citations/` | Engine tech lead | Continuous |
| Citation records | P02-T09 audit log + `citations` table | Eng-sec | 7 years |
| Trust drawer UI component | `ui/components/trust-drawer.tsx` | Design lead | Continuous |
| Faithfulness logs | Central observability store | Eng-sec | 1 year |
| Citation expansion metrics | Central observability store | Engine tech lead | Continuous |
| Test suite | `engine/citations/__tests__/` | Engine tech lead | Continuous |

## Operational Risks

- **Citation database query slow under load.** Mitigation: cache; index on `id`; spot-check p95 under load.
- **Citation IDs leak across tenants.** Mitigation: cross-tenant authorization enforced at resolver; audit-log review.
- **Narrative without citations slips through (bug in annotator).** Mitigation: post-annotation check that the narrative has at least one citation per numeric claim; if not, refuse.
- **Trust drawer reveals more than the user is allowed to see (e.g., source rows tagged regulated).** Mitigation: trust drawer respects RBAC; sensitive data is masked even in the drawer.
- **Performance hit from per-claim citation generation.** Mitigation: batched generation; citations written async; UI requests fetched on demand.

## Definition of Done

- Citation engine + faithfulness validator + trust drawer + affordances all in place.
- Test suite passing; faithfulness verified on gold-set.
- Observability metrics flowing.
- This FR's ticket marked Done.

## AI Risk Assessment

### Data Sources
The citation engine grounds every numeric claim back to its origin in the warehouse. No customer data is used to train any model in this task; the LLM that generates the narrative is the same one as P02-T02. Citation records contain the actual data values from the result set, but only the requester's tenant can resolve them.

### Human Oversight
Faithfulness validator is deterministic and runs on every response. Citations themselves are the human-oversight surface — every numeric claim is auditable by the user; the trust drawer is the surface. Compliance officers can audit any past response via the admin console.

### Failure Modes
- Annotator misses a numeric claim: post-annotation check + faithfulness validator catches; refusal triggered.
- Faithfulness validator passes a hallucinated number due to format coincidence: extremely rare; defence-in-depth via the constrained generator (P02-T02 validator) ensures hallucinations are unlikely in the first place.
- Citation resolver returns wrong record: tested exhaustively; cross-tenant denials enforced.
- Trust drawer fails to render: chat surface degrades gracefully (citation pill remains clickable; on click, error message).
- Source data deleted or moved (e.g., retention purge): citation record references the snapshot at generation time; admin console may show "source data no longer available" with the original snapshot value preserved.

## Sales/CS Summary

CyberSkill's citation engine is what makes our chat-with-data answers trustworthy: every number in every answer is one click away from its source. Click a number, and a side-panel reveals the SQL that produced it, the row in the result set the number came from, the metric definition that defined the calculation, when the data was last updated, and a confidence rating. If our AI ever produces a number that doesn't match its citation, the response is rejected before the user sees it — there is no path for a hallucinated number to reach a user. Banking-sector reviewers should see this as the structural enforcement of "we don't make up numbers"; users should see this as "I can verify any number in 5 seconds".

## AI Authorship Disclosure

- **Tools used**: Claude Sonnet 4.6 (drafting this FR).
- **Scope**: Claude drafted all sections.
- **Human review**: engine tech lead authors implementation; eng-llm reviews annotator; design lead reviews trust drawer UX; eng-sec reviews cross-tenant authorization; `@stephen-cheng` ratifies user-facing copy.
