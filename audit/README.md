# Audit & Remediation Protocol — Shinhan Innoboost Engine

<!-- AGENT INSTRUCTIONS: This file is the entrypoint for autonomous audit and remediation cycles.
     Read this file FIRST. Follow the protocol in order. Stop ONLY at HITL gates. -->

## Protocol Version

```yaml
version: 2
last_cycle: "2026-05-02"
cycle_number: 1
cycle_type: baseline
total_reports: 97
phases_covered: "P00-P13"
agent_model: "antigravity"
repo_root: "."
audit_root: "audit/"
tasks_root: "tasks/"
```

---

## Agent Modes

This protocol supports two autonomous modes. Read the mode, then follow the corresponding workflow.

### Mode 1: `AUDIT` — Verify current state

**Trigger prompt**: `Run audit cycle` or `Audit phase P0X`  
**What it does**: Re-verify all FR acceptance criteria against current repo state  
**Output**: Updated audit reports + phase summaries + this README  
**HITL gates**: None — fully autonomous

### Mode 2: `IMPROVE` — Fix issues found by audit

**Trigger prompt**: `Run improvement cycle` or `Fix P0X issues`  
**What it does**: Pick the highest-priority autonomous remediation items and fix them  
**Output**: Code changes + updated audit reports showing improvement  
**HITL gates**: Stops at items tagged `HITL_REQUIRED`

---

## Workflow: AUDIT Mode

```
START
  │
  ├─ 1. Read this file (audit/README.md)
  ├─ 2. Determine scope:
  │     - Full: all phases P00–P13
  │     - Targeted: specific phases from user prompt
  │
  ├─ 3. For each phase in scope:
  │     │
  │     ├─ 3a. Read the phase summary: audit/phase-XX/phase-XX-summary.md
  │     ├─ 3b. List all FR task specs: tasks/P{XX}-T{YY}-*.md
  │     ├─ 3c. For each FR task:
  │     │     │
  │     │     ├─ Read the FR spec (tasks/P{XX}-T{YY}-*.md)
  │     │     ├─ Extract: Acceptance Criteria, Test Plan, Success Metrics, Definition of Done
  │     │     ├─ Locate the source implementation files referenced in the FR
  │     │     ├─ Verify EACH criterion against actual repo state:
  │     │     │   - File exists? → check with list_dir / view_file
  │     │     │   - Code works? → check syntax, imports, exports
  │     │     │   - Tests pass? → run test commands if available
  │     │     │   - Content complete? → compare against criterion description
  │     │     │
  │     │     ├─ Rate each criterion: ✅ PASS | ⚠️ PARTIAL | ❌ FAIL | 🔒 BLOCKED
  │     │     ├─ Calculate AC pass rate, Test pass rate
  │     │     ├─ Identify issues with severity (🔴 P0 / 🟡 P1 / 🟠 P2)
  │     │     ├─ Tag each issue: AUTONOMOUS or HITL_REQUIRED (see tagging rules below)
  │     │     └─ Write/update: audit/phase-XX/PXX-TYY-*.md
  │     │
  │     └─ 3d. Write/update: audit/phase-XX/phase-XX-summary.md
  │           - Aggregate AC/Test pass rates
  │           - List cross-cutting findings
  │           - Update remediation roadmap
  │
  ├─ 4. Update this file (audit/README.md):
  │     - Maturity matrix table
  │     - Critical issues list
  │     - Backlog table
  │     - Cycle history
  │
  ├─ 5. Generate cycle diff:
  │     - Compare current AC pass rates vs previous cycle
  │     - Highlight improvements and regressions
  │
  └─ DONE — report summary to user
```

---

## Workflow: IMPROVE Mode

```
START
  │
  ├─ 1. Read this file (audit/README.md)
  ├─ 2. Read the BACKLOG table (below)
  ├─ 3. Filter: items where auto = ✅ (AUTONOMOUS) and status = TODO
  ├─ 4. Sort by: priority (P0 first), then phase order
  │
  ├─ 5. For each item (in priority order):
  │     │
  │     ├─ 5a. Read the linked audit report for context
  │     ├─ 5b. Read the FR spec for acceptance criteria
  │     ├─ 5c. Read the source file(s) to understand current state
  │     ├─ 5d. Implement the fix:
  │     │     - Code changes → edit source files
  │     │     - Documentation → edit/create markdown files
  │     │     - Tests → create test files and run them
  │     │
  │     ├─ 5e. Verify the fix:
  │     │     - Re-check the specific AC that was failing
  │     │     - Run tests if applicable
  │     │     - Confirm the criterion now passes
  │     │
  │     ├─ 5f. Update the audit report:
  │     │     - Change status icon (❌ → ✅)
  │     │     - Add note: "Resolved in Cycle N"
  │     │     - Recalculate AC pass rate
  │     │
  │     ├─ 5g. Update the backlog item:
  │     │     - Change status: TODO → DONE
  │     │     - Add resolved_date
  │     │
  │     └─ 5h. Check HITL gate:
  │           - Is the NEXT item tagged HITL_REQUIRED? → STOP, report to user
  │           - Otherwise → continue to next item
  │
  ├─ 6. After all AUTONOMOUS items are done (or HITL gate hit):
  │     - Update this README (maturity matrix, backlog)
  │     - Run a mini AUDIT on affected phases
  │     - Report: what was fixed, what's next, what needs human input
  │
  └─ DONE (or HITL_STOP)
```

---

## HITL Tagging Rules

Use these rules to determine if a remediation item can be done autonomously or needs human input:

```yaml
AUTONOMOUS:  # Agent can fix without asking
  - Writing or fixing TypeScript/JavaScript code
  - Creating test files and running them
  - Fixing JSX/TSX syntax errors
  - Creating Dockerfiles from documented specs
  - Replacing console.log stubs with real implementations
  - Adding PII redaction logic to existing code
  - Migrating in-memory stores to database calls
  - Creating missing markdown documentation
  - Adding cross-reference links between documents
  - Converting ASCII diagrams to Mermaid syntax
  - Calculating and updating metrics in reports
  - Creating CI/CD configuration files
  - Fixing import/export issues in modules

HITL_REQUIRED:  # Agent MUST STOP and ask human
  - Filling [TBD] team member names (requires hiring decisions)
  - Setting actual pricing numbers (requires business decisions)
  - Legal review of NDA/SOW templates (requires lawyer)
  - Sponsor consent verification (requires external parties)
  - Scheduling rehearsals (requires calendar coordination)
  - Conducting rehearsals (requires human performance)
  - Recording demo videos (requires screen recording + narration)
  - Vietnamese translations (requires native speaker review)
  - Professional headshot photos (requires photography)
  - Obtaining Shinhan-side contacts (requires external party)
  - Setting absolute dates for milestones (requires business calendar)
  - Deploying to production infrastructure (requires infra access)
  - Running penetration tests (requires security team)
  - SOC 2 auditor engagement (requires external auditor)
```

---

## Current State — Maturity Matrix

<!-- AGENT: Parse this table to understand current state. Update after each cycle. -->

| Phase | Name | FRs | AC Pass | Test Pass | Verdict | Summary |
|-------|------|-----|---------|-----------|---------|---------|
| P00 | Foundation & Brand | 6 | 72% | 0% | ⚠️ Partial | [summary](phase-00/phase-00-summary.md) |
| P01 | Business Context | 10 | 68% | 0% | ⚠️ Partial | [summary](phase-01/phase-01-summary.md) |
| P02 | Core Engine | 9 | 65% | 0% | ⚠️ Partial | [summary](phase-02/phase-02-summary.md) |
| P03 | Synthetic Data | 4 | 60% | 0% | ⚠️ Partial | [summary](phase-03/phase-03-summary.md) |
| P04 | Eval Harness | 5 | 52% | 0% | ⚠️ Partial | [summary](phase-04/phase-04-summary.md) |
| P05 | UI Shell | 5 | 57% | 0% | ⚠️ Partial | [summary](phase-05/phase-05-summary.md) |
| P06 | HITL Queue | 5 | 48% | 0% | ⚠️ Partial | [summary](phase-06/phase-06-summary.md) |
| P07 | Demo Dry-Run | 4 | 32% | 0% | ❌ Incomplete | [summary](phase-07/phase-07-summary.md) |
| P08 | Compliance | 8 | 44% | 18% | ⚠️ Partial | [summary](phase-08/phase-08-summary.md) |
| P09 | Observability | 5 | 42% | 0% | ⚠️ Partial | [summary](phase-09/phase-09-summary.md) |
| P10 | Deployment | 4 | 72% | 0% | ⚠️ Partial | [summary](phase-10/phase-10-summary.md) |
| P11 | Trust & Reference | 6 | 55% | 11% | ⚠️ Partial | [summary](phase-11/phase-11-summary.md) |
| P12 | Pitch & Rehearsal | 5 | 47% | 0% | ⚠️ Partial | [summary](phase-12/phase-12-summary.md) |
| P13 | Kickoff Readiness | 6 | 76% | 17% | ✅ Substantial | [summary](phase-13/phase-13-summary.md) |

---

## Remediation Backlog

<!-- AGENT: This is your work queue for IMPROVE mode.
     Pick items where auto=✅ and status=TODO, in priority order.
     After fixing an item, change status to DONE and add resolved_cycle. -->

### P0 — Critical (blocks other work)

| ID | Phase | Issue | Auto | Status | Audit Report | Resolved |
|----|-------|-------|------|--------|--------------|----------|
| B-001 | P05 | `.tsx` components return objects not JSX — UI won't render | ✅ | TODO | [P05-T01](phase-05/P05-T01-shared-chat-surface.md) | — |
| B-002 | P10 | No Dockerfiles exist — docker-compose references missing images | ✅ | TODO | [P10-T01](phase-10/P10-T01-laptop-deployment.md) | — |
| B-003 | P09 | Logger ships to `console.log` only — no Loki/network export | ✅ | TODO | [P09-T01](phase-09/P09-T01-structured-logging.md) | — |
| B-004 | P09 | Tracer OTLP export is a stub — no Tempo integration | ✅ | TODO | [P09-T03](phase-09/P09-T03-opentelemetry-tracing.md) | — |
| B-005 | P09 | PII redaction missing from structured logger — PDPL risk | ✅ | TODO | [P09-T01](phase-09/P09-T01-structured-logging.md) | — |
| B-006 | P02 | Audit trail is in-memory array — no persistence | ✅ | TODO | [P02 summary](phase-02/phase-02-summary.md) | — |
| B-007 | P06 | HITL triage queue is in-memory — loses state on restart | ✅ | TODO | [P06-T01](phase-06/P06-T01-triage-rules-engine.md) | — |
| B-008 | P06 | Email/webhook notifications are `console.log` stubs | ✅ | TODO | [P06-T05](phase-06/P06-T05-notifications-sla.md) | — |
| B-009 | P02-P09 | Zero test files — no Vitest/Jest setup or test cases | ✅ | TODO | All engineering phases | — |

### P1 — High (needed before client milestone)

| ID | Phase | Issue | Auto | Status | Audit Report | Resolved |
|----|-------|-------|------|--------|--------------|----------|
| B-010 | P09 | Cost tracker events in-memory — no database persistence | ✅ | TODO | [P09-T05](phase-09/P09-T05-cost-dashboard-anomaly.md) | — |
| B-011 | P09 | Grafana dashboards empty — 5 dashboards documented but 0 JSON panels | ✅ | TODO | [P09-T02](phase-09/P09-T02-prometheus-grafana-dashboards.md) | — |
| B-012 | P09 | Alert rules in markdown only — no `alerts.yml` for Prometheus | ✅ | TODO | [P09-T04](phase-09/P09-T04-slo-alerting-on-call.md) | — |
| B-013 | P11 | Architecture diagrams ASCII-only — convert to Mermaid/SVG | ✅ | TODO | [P11-T03](phase-11/P11-T03-architecture-diagrams.md) | — |
| B-014 | P11 | Compliance dossier missing P11 artefact entries | ✅ | TODO | [P11-T04](phase-11/P11-T04-compliance-dossier.md) | — |
| B-015 | P11 | Transparency log severity not aligned with IR runbook (SEV-1/2/3/4) | ✅ | TODO | [P11-T05](phase-11/P11-T05-transparency-log.md) | — |
| B-016 | P11 | Reference one-pagers missing citation map (`CITATION_MAP.md`) | ✅ | TODO | [P11-T01](phase-11/P11-T01-reference-onepagers.md) | — |
| B-017 | P12 | FAQ only has 12 questions — FR requires 20+ | ✅ | TODO | [P12-T04](phase-12/P12-T04-faq-doc.md) | — |
| B-018 | P08 | ISO 27001 only 22% mapped (20/93 controls) | ✅ | TODO | [P08-T04](phase-08/P08-T04-iso-soc-readiness.md) | — |
| B-019 | P12 | Bank + Securities pitch decks are delta tables, not full scripts | ✅ | TODO | [P12-T01](phase-12/P12-T01-pitch-decks.md) | — |
| B-020 | P13 | Kickoff agenda missing remote/hybrid alternative | ✅ | TODO | [P13-T05](phase-13/P13-T05-kickoff-agenda.md) | — |

### P1 — High (HITL Required)

| ID | Phase | Issue | Auto | Status | Audit Report | Resolved |
|----|-------|-------|------|--------|--------------|----------|
| B-030 | P11 | 5 of 6 team bios are [TBD] — needs hiring decisions | ❌ | HITL | [P11-T06](phase-11/P11-T06-squad-bios.md) | — |
| B-031 | P12 | Pitch decks need PPTX visual design — needs designer | ❌ | HITL | [P12-T01](phase-12/P12-T01-pitch-decks.md) | — |
| B-032 | P12 | 3 rehearsals planned, 0 conducted — needs humans | ❌ | HITL | [P12-T05](phase-12/P12-T05-rehearsal-cadence.md) | — |
| B-033 | P12 | Fallback demo videos not recorded — needs narration | ❌ | HITL | [P12-T03](phase-12/P12-T03-live-coding-kit.md) | — |
| B-034 | P13 | NDA/SOW needs legal review — needs VN lawyer | ❌ | HITL | [P13-T01](phase-13/P13-T01-nda-sow-templates.md) | — |
| B-035 | P13 | PoC pricing is placeholder — needs business decision | ❌ | HITL | [P13-T01](phase-13/P13-T01-nda-sow-templates.md) | — |
| B-036 | P13 | Financial modelling for commercialisation — needs business input | ❌ | HITL | [P13-T06](phase-13/P13-T06-assessment-commercialisation.md) | — |
| B-037 | P11 | Vietnamese translations for all trust docs — needs native speaker | ❌ | HITL | [P11 summary](phase-11/phase-11-summary.md) | — |
| B-038 | P11 | Reference one-pagers need sponsor spot-check — needs external | ❌ | HITL | [P11-T01](phase-11/P11-T01-reference-onepagers.md) | — |
| B-039 | P11 | Professional headshots for team — needs photography | ❌ | HITL | [P11-T06](phase-11/P11-T06-squad-bios.md) | — |

### P2 — Medium

| ID | Phase | Issue | Auto | Status | Audit Report | Resolved |
|----|-------|-------|------|--------|--------------|----------|
| B-040 | P11 | Cross-references in doctrine lenses not linked to P08 files | ✅ | TODO | [P11-T02](phase-11/P11-T02-ai-doctrine-lenses.md) | — |
| B-041 | P13 | Delivery checklist missing dependency graph column | ✅ | TODO | [P13-T04](phase-13/P13-T04-delivery-checklists.md) | — |
| B-042 | P13 | Working agreements missing meeting agenda template | ✅ | TODO | [P13-T02](phase-13/P13-T02-working-agreements.md) | — |
| B-043 | P13 | Kickoff agenda missing Seoul time zone (KST) equivalents | ✅ | TODO | [P13-T05](phase-13/P13-T05-kickoff-agenda.md) | — |
| B-044 | P13 | Masking strategy not cross-referenced to PDPL mapping | ✅ | TODO | [P13-T04](phase-13/P13-T04-delivery-checklists.md) | — |

---

## Audit Report Format

<!-- AGENT: When creating or updating audit reports, use this exact structure. -->

Each FR audit report (`audit/phase-XX/PXX-TYY-*.md`) MUST contain these sections:

```markdown
# Audit Report — PXX-TYY: [Title]

> **Phase**: XX — [Phase Name]
> **Task**: TYY — [Task Name]
> **Source**: [link to source implementation file(s)]
> **FR Reference**: [link to tasks/PXX-TYY-*.md]
> **Auditor**: [agent model]
> **Date**: [ISO date]
> **Cycle**: [cycle number]

## 1. Acceptance Criteria Verification
<!-- Table: # | Criterion (from FR) | Status | Evidence -->

## 2. Test Plan Verification
<!-- Table: # | Test (from FR) | Status | Evidence -->

## 3. Success Metrics Evaluation
<!-- Table: Metric | Target | Actual | Status -->

## 4. Definition of Done Evaluation
<!-- Table: # | DoD Item | Status | Notes -->

## 5. Content Quality Analysis
### Strengths
### Issues
<!-- Table: # | Severity | Issue | Details -->

## 6. Gap Analysis & Remediation
<!-- Table: # | Gap | Impact | Remediation | Priority | Auto/HITL -->

## 7. Verdict
<!-- Overall status with rationale and estimated remediation effort -->
```

---

## Phase Summary Format

<!-- AGENT: When creating or updating phase summaries, use this structure. -->

```markdown
# Phase XX Audit Summary — [Phase Name]

> **Phase**: XX
> **Individual Reports**: [links to all FR reports]

## 1. Phase Overview
<!-- Table: Task | Component | AC Pass | Test Pass | Verdict -->

## 2. Per-Task Audit (abbreviated)
<!-- Quick findings per task — details in individual reports -->

## 3. Cross-Cutting Findings
### Strengths
### Issues

## 4. Remediation Roadmap
<!-- Table: # | Action | Est. Effort | Priority | Auto/HITL -->

## 5. Phase Verdict
```

---

## File Discovery Rules

<!-- AGENT: Use these rules to find source files for each phase. -->

```yaml
source_locations:
  P00: ["brand/", "docs/project-charter.md"]
  P01: ["docs/business/", "docs/market/"]
  P02: ["src/core/", "src/engine/"]
  P03: ["data/synthetic/", "src/data/"]
  P04: ["src/eval/", "data/gold-sets/"]
  P05: ["src/ui/", "src/components/"]
  P06: ["src/hitl/", "src/review/"]
  P07: ["starter-kit/", "demos/"]
  P08: ["compliance/"]
  P09: ["observability/"]
  P10: ["infra/"]
  P11: ["trust/"]
  P12: ["pitch/"]
  P13: ["kickoff/"]

task_specs: "tasks/P{XX}-T{YY}-*.md"
audit_reports: "audit/phase-{XX}/P{XX}-T{YY}-*.md"
phase_summaries: "audit/phase-{XX}/phase-{XX}-summary.md"
```

---

## Cycle History

<!-- AGENT: Add a row after each audit cycle. -->

| Cycle | Date | Type | Scope | AC Δ | Issues Found | Issues Resolved | Agent |
|-------|------|------|-------|------|-------------|-----------------|-------|
| 1 | 2026-05-02 | Baseline | P00–P13 | — | 44 | 0 | antigravity |
| 2 | _TBD_ | Post-Sprint 1 | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

---

## Quick-Start Prompts

<!-- AGENT: These are example prompts a user can paste to trigger each mode. -->

### Full Audit Cycle
```
Read audit/README.md and run a full AUDIT cycle.
For each phase P00–P13, verify every FR against its acceptance criteria.
Update all audit reports, phase summaries, and the README maturity matrix.
Compare against Cycle 1 baseline.
```

### Targeted Audit (specific phases)
```
Read audit/README.md and run AUDIT mode for phases P05, P06, P09, P10.
These phases had remediation work since the last cycle.
Update only those phase reports and the README.
```

### Improvement Cycle (autonomous)
```
Read audit/README.md and run IMPROVE mode.
Pick the top 5 AUTONOMOUS items from the backlog (B-001 through B-009).
Fix each one, verify the fix, update the audit report.
Stop if you hit an item tagged HITL_REQUIRED.
```

### Improvement Cycle (specific items)
```
Read audit/README.md and run IMPROVE mode for backlog items B-003, B-005.
B-003: Replace console.log in structured logger with real Loki HTTP export.
B-005: Add PII redaction rules to structured logger.
Fix, verify, update audit reports.
```

### Audit + Improve Combined
```
Read audit/README.md.
1. Run AUDIT mode for phases P09, P10.
2. Then run IMPROVE mode for all AUTONOMOUS P0 items in those phases.
3. Then re-audit to confirm improvements.
Stop at any HITL_REQUIRED items.
```

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | **PASS** — criterion fully met |
| ⚠️ | **PARTIAL** — some evidence but incomplete |
| ❌ | **FAIL** — criterion not met |
| 🔒 | **BLOCKED** — needs external input |

## Priority Legend

| Icon | Meaning |
|------|---------|
| 🔴 P0 | **Critical** — blocks other work |
| 🟡 P1 | **High** — needed before client milestone |
| 🟠 P2 | **Medium** — should fix, not blocking |
| ⚪ P3 | **Low** — nice to have |

## Directory Structure

```
audit/
├── README.md                              ← THIS FILE (agent entrypoint)
├── phase-00/  (7 files: 6 FRs + summary)  ← Foundation & Brand
├── phase-01/ (11 files: 10 FRs + summary) ← Business Context
├── phase-02/ (10 files: 9 FRs + summary)  ← Core Engine
├── phase-03/  (5 files: 4 FRs + summary)  ← Synthetic Data
├── phase-04/  (6 files: 5 FRs + summary)  ← Eval Harness
├── phase-05/  (6 files: 5 FRs + summary)  ← UI Shell
├── phase-06/  (6 files: 5 FRs + summary)  ← HITL Queue
├── phase-07/  (5 files: 4 FRs + summary)  ← Demo Dry-Run
├── phase-08/  (9 files: 8 FRs + summary)  ← Compliance
├── phase-09/  (6 files: 5 FRs + summary)  ← Observability
├── phase-10/  (5 files: 4 FRs + summary)  ← Deployment
├── phase-11/  (7 files: 6 FRs + summary)  ← Trust & Reference
├── phase-12/  (6 files: 5 FRs + summary)  ← Pitch & Rehearsal
└── phase-13/  (7 files: 6 FRs + summary)  ← Kickoff Readiness
```
