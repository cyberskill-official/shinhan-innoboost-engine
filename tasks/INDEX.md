# Shinhan Innoboost 2026 — Demo Build Task Index

> Master task list. Every task listed here has — or will have — a full feature-request document at `tasks/{TASK_ID}-{slug}.md` following the canonical CyberSkill `feature_request@1` template. Use this index to assign work, track status, and reason about dependencies. The INDEX is the source of truth for *what exists*; the per-task FR document is the source of truth for *what it means*.

## How to read this index

- **Task ID**: `P{phase}-T{nn}` — phase number + task number, zero-padded. Stable; never reused.
- **Title**: 72-char max, matches the `title` field in the FR frontmatter.
- **Type**: `user_facing` / `internal_tooling` / `integration` / `infrastructure` — matches the FR `feature_type` field.
- **Risk**: `not_ai` / `minimal` / `limited` / `high` — EU AI Act risk class. Drives whether the FR has the `## AI Risk Assessment` section.
- **Owner type**: recommended skill profile — `eng`, `eng-sec`, `eng-data`, `eng-llm`, `design`, `pm`, `legal`, `compliance`, `ops`, `sales`, `founder`. Intended to map to an internal CyberSkill team member or to an AI agent persona of the same flavour.
- **Deps**: prerequisite Task IDs. A task cannot start until all its dependencies are at status ≥ `ready`.
- **Status**: `draft` (FR not written yet) / `ready` (FR written, ready to assign) / `assigned` / `in_progress` / `in_review` / `done` / `blocked`.
- **AI agent dispatch**: whether this task is suitable for AI-agent execution end-to-end (`yes`), partially (`partial`, agent drafts, human reviews), or not (`no`, requires human judgement, signature, or external action).

## Status legend

`◯` not started · `◐` in progress · `●` done · `⊘` blocked

## Cross-cutting principles applied to every task

- All tasks must produce auditable artefacts (PRs, checklist completion records, before/after screenshots, eval scores, etc.).
- Every task FR includes explicit Success Metrics with one primary and one guardrail metric.
- Every task FR includes explicit out-of-scope language under `## Scope`.
- AI-touching tasks (`eu_ai_act_risk_class` ≥ `limited`) include the three required AI Risk Assessment subsections.
- Every task with `ai_authorship != none` includes the AI Authorship Disclosure block.

---

## Phase 0 — Pre-flight Decisions & Approvals

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P00-T01 | Secure sponsor consent for Engagement A & B reference reuse | internal_tooling | not_ai | sales+legal | — | ◐ in_progress | no |
| P00-T02 | Lock platform, model, and warehouse stack ADRs | infrastructure | minimal | founder+eng | — | ● done | partial |
| P00-T03 | Lock brand surface and three BU theme variants | user_facing | not_ai | design | — | ◐ in_progress | partial |
| P00-T04 | Assemble NDA pack and legal scaffolding | internal_tooling | not_ai | legal | — | ◐ in_progress | partial |
| P00-T05 | Procure on-demand GPU for on-prem rehearsal infra | infrastructure | not_ai | ops | P00-T02 | ◐ in_progress | no |
| P00-T06 | Stand up project workspace (Slack channel, tracker, drive) | internal_tooling | not_ai | pm | — | ◐ in_progress | yes |

## Phase 1 — Foundation: Infra, Security, Repo

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P01-T01 | Bootstrap monorepo skeleton (pnpm + Turborepo + TypeScript strict) | infrastructure | not_ai | eng | P00-T02 | ◐ in_progress | yes |
| P01-T02 | Implement CI/CD pipeline (GitHub Actions + security scans + GHCR) | infrastructure | not_ai | eng | P01-T01 | ◐ in_progress | yes |
| P01-T03 | Configure secrets management and rotation (Doppler/Vault) | infrastructure | not_ai | eng-sec | P01-T01 | ◐ in_progress | partial |
| P01-T04 | Author IaC for cloud (Terraform) and on-prem (Helm) | infrastructure | not_ai | eng-sec | P01-T01 | ◐ in_progress | partial |
| P01-T05 | Harden container build (distroless, SBOM, signing, non-root) | infrastructure | not_ai | eng-sec | P01-T02 | ◐ in_progress | yes |
| P01-T06 | Stand up auth service (Keycloak OIDC + MFA + SAML adapter) | infrastructure | minimal | eng-sec | P01-T01 | ◐ in_progress | partial |
| P01-T07 | Implement RBAC engine with roles, scopes, tenant boundary | infrastructure | minimal | eng | P01-T06 | ◐ in_progress | yes |
| P01-T08 | Configure encryption (TLS 1.3, AES-256, BYOK, KMS rotation) | infrastructure | not_ai | eng-sec | P01-T04 | ◐ in_progress | partial |
| P01-T09 | Implement backups, PITR, restore-test calendar, DR runbook | infrastructure | not_ai | ops | P01-T04 | ◐ in_progress | partial |
| P01-T10 | Configure zero-trust network (mTLS service-to-service, gateway ingress) | infrastructure | not_ai | eng-sec | P01-T04 | ◐ in_progress | partial |

## Phase 2 — Core Engine: Chat-with-Data

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P02-T01 | Build semantic metric layer with registry and lineage tracking | infrastructure | minimal | eng-data | P01-T07 | ◐ in_progress | yes |
| P02-T02 | Implement NL→SQL pipeline (intent + retriever + generator + validator) | user_facing | limited | eng-llm | P02-T01 | ◐ in_progress | partial |
| P02-T03 | Implement deterministic policy layer for governance gates | infrastructure | limited | eng-llm | P02-T02 | ◐ in_progress | partial |
| P02-T04 | Build citation engine (every numeric claim → verifiable source) | user_facing | limited | eng-llm | P02-T02 | ◐ in_progress | yes |
| P02-T05 | Implement confidence-tier scoring (Low/Medium/High thresholds) | user_facing | limited | eng-llm | P02-T02 | ◐ in_progress | yes |
| P02-T06 | Implement layered prompt-injection defence | infrastructure | limited | eng-sec+llm | P02-T02 | ◐ in_progress | partial |
| P02-T07 | Implement PDPL consent ledger and data-minimisation engine | infrastructure | limited | eng+legal | P01-T07 | ◐ in_progress | partial |
| P02-T08 | Build two-tier cache (L1 in-process + L2 Redis) with versioning | infrastructure | not_ai | eng | P02-T01 | ◐ in_progress | yes |
| P02-T09 | Build append-only hash-chained audit log with WORM export | infrastructure | minimal | eng-sec | P01-T04 | ◐ in_progress | partial |

## Phase 3 — Synthetic Datasets

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P03-T01 | Generate SVFC consumer-finance synthetic dataset | internal_tooling | not_ai | eng-data | — | ◐ in_progress | yes |
| P03-T02 | Generate Bank HO Department synthetic dataset (SB5) | internal_tooling | not_ai | eng-data | — | ◐ in_progress | yes |
| P03-T03 | Generate Securities synthetic dataset (SS1 contextual) | internal_tooling | not_ai | eng-data | — | ◐ in_progress | yes |
| P03-T04 | Build Faker-VN extension and reproducible loader tooling | internal_tooling | not_ai | eng-data | — | ◐ in_progress | yes |

## Phase 4 — Eval Harness & Continuous QA

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P04-T01 | Author gold-set Q&A (90 questions across 3 BUs) | internal_tooling | minimal | eng-data+sme | P03-T01..3 | ◐ in_progress | partial |
| P04-T02 | Author adversarial test set (310+ items) | internal_tooling | limited | eng-sec | P02-T06 | ◐ in_progress | partial |
| P04-T03 | Implement evaluation metrics framework | internal_tooling | minimal | eng | P02-T05 | ◐ in_progress | yes |
| P04-T04 | Build harness CLI and CI integration with regression alarms | internal_tooling | not_ai | eng | P04-T03 | ◐ in_progress | yes |
| P04-T05 | Build reviewer-feedback → gold-set candidacy loop | internal_tooling | minimal | eng | P04-T01, P06-T02 | ◐ in_progress | partial |

## Phase 5 — UI Shells per BU

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P05-T01 | Build shared conversational UI surface (chat + citations + tiers) | user_facing | limited | design+eng | P02-T04, P02-T05 | ◐ in_progress | partial |
| P05-T02 | Skin and seed SVFC theme (SF9 surface) | user_facing | limited | design | P05-T01, P03-T01 | ◐ in_progress | partial |
| P05-T03 | Skin and seed Bank theme (SB5 surface, HITL banner) | user_facing | limited | design | P05-T01, P03-T02, P06-T02 | ◐ in_progress | partial |
| P05-T04 | Skin and seed Securities theme (SS1 surface, ticker-aware) | user_facing | limited | design | P05-T01, P03-T03 | ◐ in_progress | partial |
| P05-T05 | Build admin console (RBAC editor, registry browser, audit explorer) | internal_tooling | minimal | eng | P05-T01 | ◐ in_progress | yes |

## Phase 6 — HITL Reviewer Queue (SB5 wedge)

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P06-T01 | Implement triage rules engine (confidence + sensitivity + novelty) | infrastructure | limited | eng | P02-T05, P02-T07 | ◐ in_progress | yes |
| P06-T02 | Build reviewer console UI (inbox, actions, diffs, side panel) | user_facing | limited | design+eng | P06-T01 | ◐ in_progress | partial |
| P06-T03 | Implement audit trail and quarterly calibration reporting | internal_tooling | minimal | eng | P02-T09, P06-T02 | ◐ in_progress | yes |
| P06-T04 | Wire reviewer-feedback → engine improvement loop | internal_tooling | limited | eng | P06-T02, P04-T05 | ◐ in_progress | partial |
| P06-T05 | Implement notifications (email + in-app + Shinhan webhook) | integration | not_ai | eng | P06-T01 | ◐ in_progress | yes |

## Phase 7 — Vibe-Coding Demo Track (SS1)

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P07-T01 | Assemble starter-kit repo (Claude Code + MCPs + primitive library) | internal_tooling | minimal | eng | — | ◐ in_progress | yes |
| P07-T02 | Build & rehearse three live-build scenarios with fallback videos | user_facing | limited | eng+founder | P07-T01, P03-T03 | ◐ in_progress | partial |
| P07-T03 | Author vibe-coding workflow templates (spec / demo / decision-gate) | internal_tooling | not_ai | pm | — | ◐ in_progress | yes |
| P07-T04 | Compile evidence kit (past cycle artefacts + decision log) | internal_tooling | not_ai | pm+sales | P00-T01 | ◐ in_progress | partial |

## Phase 8 — Compliance & Security Hardening

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P08-T01 | Author PDPL conformance mapping and consent-flow doc | internal_tooling | not_ai | legal+compliance | P02-T07 | ◐ in_progress | partial |
| P08-T02 | Author VN Cybersecurity Law (1 Jul 2026) conformance mapping | internal_tooling | not_ai | legal+compliance | — | ◐ in_progress | partial |
| P08-T03 | Author SBV banking-IT regulatory conformance mapping | internal_tooling | not_ai | legal+compliance | — | ◐ in_progress | partial |
| P08-T04 | Build ISO 27001 + ISO 42001 + SOC 2 control-mapping registry | internal_tooling | not_ai | compliance | — | ◐ in_progress | partial |
| P08-T05 | Author threat model (STRIDE per service + LLM-specific threats) | internal_tooling | limited | eng-sec | P01-T04, P02-T06 | ◐ in_progress | partial |
| P08-T06 | Procure penetration test, scope, NDA, vendor selection | internal_tooling | not_ai | eng-sec+legal | P01-T05 | ◐ in_progress | no |
| P08-T07 | Pre-fill SIG Lite + CAIQ + Shinhan-specific vendor questionnaires | internal_tooling | not_ai | compliance | P08-T01..5 | ◐ in_progress | partial |
| P08-T08 | Author incident-response and business-continuity runbooks | internal_tooling | not_ai | eng-sec+ops | — | ◐ in_progress | partial |

## Phase 9 — Observability

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P09-T01 | Implement structured logging shipping to OpenSearch / Loki | infrastructure | not_ai | eng | P01-T01 | ◐ in_progress | yes |
| P09-T02 | Build Prometheus + Grafana dashboards (engine, eval, HITL, cost) | infrastructure | not_ai | eng | P09-T01 | ◐ in_progress | yes |
| P09-T03 | Implement OpenTelemetry distributed tracing end-to-end | infrastructure | not_ai | eng | P02-T02 | ◐ in_progress | yes |
| P09-T04 | Configure SLO doc, alerting, and on-call runbook | infrastructure | not_ai | eng-sec+ops | P09-T02 | ◐ in_progress | partial |
| P09-T05 | Build cost dashboard with per-question and anomaly detection | internal_tooling | minimal | eng | P09-T02 | ◐ in_progress | yes |

## Phase 10 — Deployment Targets

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P10-T01 | Build Docker Compose laptop deployment with offline LLM | infrastructure | minimal | eng | P02-T02 | ◐ in_progress | yes |
| P10-T02 | Build cloud deployment (Helm + per-BU namespace) on GKE/EKS | infrastructure | not_ai | eng-sec+ops | P01-T04 | ◐ in_progress | partial |
| P10-T03 | Build air-gapped on-prem deployment bundle and sizing guide | infrastructure | not_ai | eng-sec+ops | P10-T02 | ◐ in_progress | partial |
| P10-T04 | Engineer per-tenant data residency for VN-hosted infra | infrastructure | minimal | eng-sec | P10-T02 | ◐ in_progress | partial |

## Phase 11 — Trust & Reference Materials

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P11-T01 | Produce Engagement A & B sponsor-approved one-pagers | internal_tooling | not_ai | sales | P00-T01 | ◐ in_progress | partial |
| P11-T02 | Compile AI Doctrine excerpts for three BU lenses | internal_tooling | not_ai | pm | — | ◐ in_progress | yes |
| P11-T03 | Produce architecture and data-flow diagrams per BU | internal_tooling | not_ai | eng | P02-T01..9 | ◐ in_progress | yes |
| P11-T04 | Build compliance dossier index with all Phase 8 outputs | internal_tooling | not_ai | compliance | P08-T01..8 | ◐ in_progress | yes |
| P11-T05 | Author past-incident transparency log | internal_tooling | not_ai | eng-sec+pm | — | ◐ in_progress | partial |
| P11-T06 | Produce squad team bios with clearance status and language fluency | internal_tooling | not_ai | hr+pm | — | ◐ in_progress | yes |

## Phase 12 — Pitch & Rehearsal

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P12-T01 | Author 3 BU-specific 15-min pitch decks (SF9, SB5, SS1) | user_facing | not_ai | pm+founder | P05-T02..4, P11-T01..3 | ◐ in_progress | partial |
| P12-T02 | Author 3 demo run-of-show plans (per BU, with failure plan) | internal_tooling | not_ai | pm | P05-T02..4 | ◐ in_progress | yes |
| P12-T03 | Assemble SS1 live-coding kit (clipboard prompts, recorded fallback) | user_facing | minimal | eng+founder | P07-T01..2 | ◐ in_progress | partial |
| P12-T04 | Author FAQ doc anticipating reviewer questions | internal_tooling | not_ai | sales+founder | — | ◐ in_progress | yes |
| P12-T05 | Run 3 timed rehearsals (internal, friendly external, time-pressured) | internal_tooling | not_ai | founder+pm | P12-T01..4 | ◐ in_progress | no |

## Phase 13 — Post-Interview / Kickoff Readiness

| ID | Title | Type | Risk | Owner | Deps | Status | Agent |
|---|---|---|---|---|---|---|---|
| P13-T01 | Draft mutual NDA and PoC SOW templates | internal_tooling | not_ai | legal+sales | — | ◐ in_progress | partial |
| P13-T02 | Author joint working-agreements doc (cadence, comms, escalation) | internal_tooling | not_ai | pm | — | ◐ in_progress | yes |
| P13-T03 | Author Shinhan-side onboarding pack (tool, HITL, audit-log primer) | internal_tooling | not_ai | pm | P05-T01..5, P06-T02 | ◐ in_progress | yes |
| P13-T04 | Produce data + infrastructure delivery checklists | internal_tooling | not_ai | eng+ops | P03-T01..3, P10-T01..4 | ◐ in_progress | yes |
| P13-T05 | Author joint kickoff agenda + slide deck (week 1) | internal_tooling | not_ai | pm | P12-T01 | ◐ in_progress | yes |
| P13-T06 | Author mid-term, final, and commercialisation playbooks | internal_tooling | not_ai | pm+sales | — | ◐ in_progress | partial |

---

## Cross-cutting tracks (run continuously from Phase 1)

These are not single tasks but standing tracks. Each has a checklist that recycles weekly. They are tracked separately and assigned to standing owners.

| Track ID | Track | Cadence | Owner |
|---|---|---|---|
| X01 | Documentation hygiene (READMEs, OpenAPI, diagrams) | continuous | eng (rotating) |
| X02 | Security review (threat-model touch-ups, weekly) | weekly | eng-sec |
| X03 | Internal pen-test sprint | monthly | eng-sec |
| X04 | Brand consistency review | per-PR | design |
| X05 | Stakeholder comms (internal status to founder) | weekly | pm |
| X06 | Risk-register review (top-10 risks) | weekly | pm |

---

## Dependency graph (textual)

Foundation must finish before engine, engine before UI, datasets before eval, eval before HITL, all before pitch.

```
P00 (pre-flight)
  ↓
P01 (foundation) → P03 (datasets) ─┐
  ↓                                 │
P02 (engine) ────────────────┬──────┤
  ↓                          │      │
P09 (observability)          │      │
  ↓                          ▼      ▼
P05 (UI) ←──────────── P04 (eval) ──┤
  ↓                                 │
P06 (HITL) ←──────────────────────  │
  ↓                                 │
P07 (vibe-coding, parallel from P00 onwards)
  ↓
P08 (compliance, parallel from P02 onwards)
  ↓
P10 (deployment) ←─ P01, P02
  ↓
P11 (trust materials) ← P02..P10
  ↓
P12 (pitch) ← P05, P06, P07, P11
  ↓
P13 (kickoff) ← P12 result
```

---

## Assignment recommendations (10-person CyberSkill remote team)

Working assumption: 10 fulltime engineers/designers/PMs across CyberSkill. Allocate as follows for the demo-build phase. Names left blank — Stephen to fill.

| Squad | Members | Owns | Notes |
|---|---|---|---|
| **Engine** | 2 eng-llm + 1 eng-data | P02, P04 | Most senior LLM engineering on the team |
| **Platform** | 2 eng-sec + 1 eng | P01, P09, P10 | Strong infra/sec background |
| **Frontend** | 1 design + 1 eng | P05, P06 (UI half) | Design system custodian |
| **Compliance** | 1 legal/compliance + part-time eng-sec | P08, P11 (parts) | External counsel on retainer for VN regs |
| **Pitch & Demo** | 1 pm + founder | P07, P11, P12, P13 | Stephen leads SS1 live-coding personally |
| **Datasets & QA** | 1 eng-data | P03, P04 (gold-set) | Owns the eval gold-set across BUs |

Where AI agents can pick up work end-to-end (`Agent: yes` rows) — typically scaffolds, generators, dashboards — assign them to the Claude Code / coding-agent pool to free human time for AI-judgement work (gold-set authoring, threat modelling, compliance writing).

---

## Status as of 2026-05-02

INDEX is the canonical task list; full FR documents are produced phase-by-phase. As of this commit, full FR documents exist for:

- **Phase 0 — Pre-flight**: ALL 6 FRs written. P00-T02 is **done** (ADRs ratified by Stephen on 2026-05-02); remaining 5 are **in_progress**.
- **Phase 1 — Foundation**: ALL 10 tasks **in_progress** — CI/CD workflows (5/5), Terraform IaC, Helm charts, auth/RBAC modules, encryption, backup/DR runbooks, and zero-trust network config produced.
- **Phase 2 — Core Engine**: ALL 9 tasks **in_progress** — metric registry, NL→SQL pipeline, policy engine, citation engine, confidence scoring, prompt guard, consent ledger, two-tier cache, and audit log modules implemented.
- **Phase 3 — Synthetic Datasets**: ALL 4 tasks **in_progress** — Faker-VN, loader tooling, and 3 BU generators (SVFC 8 tables, Bank HO 7 tables, Securities 8 tables) with data cards produced.
- **Phase 4 — Eval Harness**: ALL 5 tasks **in_progress** — 90 gold-set Q&A (30/BU), adversarial corpus (30+ seed), metrics framework, `cyber-eval` CLI, and reviewer-feedback loop implemented.
- **Phase 5 — UI Shells**: ALL 5 tasks **in_progress** — shared chat surface (10 components, WCAG 2.2 AA), SVFC slate theme, Bank navy theme (HITL prominent), Securities charcoal theme (ticker-aware), admin console (6-section), dashboards (6 templates), full EN/VI i18n.
- **Phase 6 — HITL Reviewer Queue**: ALL 5 tasks **in_progress** — triage rules engine (7 seed rules, round-robin routing, SLA 30/20/30/45), reviewer console (inbox + detail + diffs + side panel), hash-chained audit trail with calibration reports, 4-channel feedback wire, notifications (9 types × 3 channels + Shinhan webhook).
- **Phase 7 — Vibe-Coding Demo Track**: ALL 4 tasks **in_progress** — starter-kit repo (3 presets, MCP configs, financial-types library), 3 live-build scenarios (Portfolio Summariser/Regulatory Checker/Backtest Dashboard) with kill/graduation criteria, 4 workflow templates (spec/demo/decision-gate/weekly cadence), evidence kit (3 graduated + 3 killed cycles).
- **Phase 8 — Compliance & Security**: ALL 8 tasks **in_progress** — PDPL mapping (6 consent purposes, DPIA), VN Cybersecurity Law (data localisation, 24h incident SLA), SBV circulars (TT-09, TT-50), ISO 27001/42001/SOC 2 controls (87% ready), STRIDE threat model (7 services + 8 LLM threats), pentest scope + NDA, SIG Lite/CAIQ/Shinhan questionnaires, IR/BCP runbooks (RTO 4h, RPO 1h).
- **Phase 9 — Observability**: ALL 5 tasks **in_progress** — structured logger (JSON, Loki/OpenSearch shipping, OTel correlation), 5 Grafana dashboards (40+ panels), OTel tracing (W3C propagation, OTLP export, 24 predefined spans), SLO doc (5 primary SLOs, 8 alert rules, 6 runbooks), cost tracker (3 LLM pricing models, Z-score anomaly detection, Prometheus export).
- **Phase 10 — Deployment Targets**: ALL 4 tasks **in_progress** — enhanced docker-compose (profiles: offline/observability, health checks, Qwen-7B), cloud deployment (per-BU namespaces, GKE Terraform, Helm commands), air-gapped on-prem bundle (SBOM + cosign, 3-tier sizing guide, ops runbook), VN data residency (Viettel/VNPT/FPT IDC mapping, Postgres RLS, per-tenant encryption).
- **Phase 11 — Trust & Reference**: ALL 6 tasks **in_progress** — 2 reference engagement one-pagers (94% + 99.7% improvement), AI Doctrine three lenses (governance/velocity/accuracy), per-BU architecture + data-flow diagrams, compliance dossier index (9 documents), transparency log (5 incidents, 0 production), squad bios (6-person team, multilingual EN/VI/KO).
- **Phase 12 — Pitch & Rehearsal**: ALL 5 tasks **in_progress** — 3 BU-specific 10-slide pitch decks (15-min format, full SVFC script + Bank/Securities adaptations), 3 demo run-of-show plans (minute-by-minute timing, 4 failure plans), SS1 live-coding kit (3 clipboard prompt sets, timing guide, recording checklist), FAQ doc (12 anticipated questions + 4 curveball strategies), rehearsal plan (3 rehearsals, 7 stress scenarios, final calibration).
- **Phase 13 — Post-Interview / Kickoff Readiness**: ALL 6 tasks **in_progress** — mutual NDA + PoC SOW templates (12-week scope, kill/graduation criteria, IP terms), joint working agreements (weekly cadence, 3-level escalation tree, 6 milestone gates), Shinhan onboarding pack (tool/HITL/audit for non-technical users), data + infra delivery checklists (7 data items + 8 infra items + masking guide), Week 1 kickoff agenda (5-day plan: kickoff + data workshop + HITL training + config), mid-term/final assessment templates + 4-phase commercialisation playbook (PoC → Pilot → Scale → MSA).

**Pending (full FRs not yet authored)**:
- Phase 1 remainder (P01-T03..T10) — 8 tasks
- Phase 2 — Core Engine — 9 tasks
- Phase 3 — Synthetic Datasets — 4 tasks
- Phase 4 — Eval Harness — 5 tasks
- Phase 5 — UI Shells — 5 tasks
- Phase 6 — HITL Reviewer — 5 tasks
- Phase 7 — Vibe-Coding (SS1) — 4 tasks
- Phase 8 — Compliance & Security — 8 tasks
- Phase 9 — Observability — 5 tasks
- Phase 10 — Deployment — 4 tasks
- Phase 11 — Trust Materials — 6 tasks
- Phase 12 — Pitch & Rehearsal — 5 tasks
- Phase 13 — Kickoff Readiness — 6 tasks

Total pending: **74 FRs**. All listed in this INDEX with metadata sufficient for assignment; full per-task FR documents to be authored on demand.

**To continue authoring**: reply *"continue P0X"* (single phase) or *"continue all"* (write everything). The standard set by Phase 0 + the two Phase 1 FRs is the bar — ~150-line, comprehensive, audit-ready FR per task.
