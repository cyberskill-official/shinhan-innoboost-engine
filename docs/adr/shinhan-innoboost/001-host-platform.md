# ADR-SHB-001: Host Platform — Standalone Repo

- **Status**: Proposed
- **Date**: 2026-05-02
- **Authors**: @engine-tech-lead, @stephen-cheng
- **Ratifier**: @stephen-cheng
- **Supersedes**: (none)

## Context

The demo-build-plan.md leaves the host-platform decision explicitly open: "standalone repo (faster) vs. ShinhanOS module (more strategic, slower). Recommendation: standalone now, port to ShinhanOS post-PoC." A recommendation is not a ratification. Without a ratified decision, some engineers will instinctively start by carving out ShinhanOS-internal scaffolding while others work in a clean greenfield repo — their merge into a shared system is what fails.

ShinhanOS is in mid-development (`shinhanos_tech_stack`: Apollo Server 5 + Express + Postgres + pgvector + Module Federation MFE). The demo is a focused chat-with-data system with HITL, not a multi-tenant ops platform — the two will diverge. This ADR captures *where* they diverge so downstream readers know which decisions inherit from ShinhanOS and which are demo-specific.

The Innoboost Q&A confirms Shinhan's commercial-phase deployment "must be deployed per SBV regulations" — typically on-prem. Our host decision must optimise for on-prem deployability as a first-class target.

Per `feedback_p1_scope_preference`: the richer configuration is preferred unless there is a sharp trade-off. Building standalone and porting later is richer in velocity and risk-isolation, at the cost of a future port task.

## Decision

Build the demo and PoC in a standalone repository `cyberskill-official/shinhan-innoboost-engine`, with explicit module-portability constraints that ensure mechanical (not heroic) porting to ShinhanOS post-PoC.

## Consequences

Positive consequences:
- Demo timeline is decoupled from ShinhanOS release schedule — no risk of demo slippage due to ShinhanOS mid-development instability.
- Engineering velocity is maximised — squad works in a clean repo with no cross-project dependencies.
- On-prem deployability is first-class — no ShinhanOS infrastructure assumptions baked in.
- Module boundaries map cleanly to ShinhanOS modules when porting: `engine/` → ShinhanOS AI module; `hitl/` → ShinhanOS HITL module; `eval/` → ShinhanOS observability module.

Negative consequences:
- Post-PoC port to ShinhanOS is a separate, non-trivial migration task (~2–4 weeks of eng effort, estimated).
- Two codebases exist in parallel during the PoC window — code improvements in one do not automatically flow to the other.

Neutral consequences (worth noting but not deciding-grade):
- ShinhanOS team can observe the demo repo's patterns and adopt them voluntarily — cross-pollination without coupling.
- Demo-specific decisions (model stack, warehouse adapters) do not inherit from ShinhanOS defaults — this is intentional, not accidental.

## Alternatives considered

- **Build directly inside ShinhanOS.** Rejected because ShinhanOS is in mid-development; binding the demo to its release schedule risks demo slippage. ShinhanOS's module federation architecture adds complexity without demo-phase benefit.
- **Fork ShinhanOS, build the demo on the fork, merge back.** Rejected because fork-and-merge creates merge-conflict debt proportional to the demo's divergence — and the demo will diverge significantly (different model stack, different warehouse adapters, different RBAC scope).
- **Build in standalone with no portability constraints.** Rejected because it maximises short-term velocity but makes the post-PoC port heroic. Portability constraints cost ~5% velocity now but save 50%+ port effort later.

## Portability Constraints (binding)

These constraints ensure the port to ShinhanOS is mechanical:

1. **No ShinhanOS-specific imports.** The demo repo must not import any `@shinhanos/*` package.
2. **MIT/Apache-2.0 only.** No GPL-licensed dependencies (ShinhanOS is proprietary).
3. **Package boundaries map to ShinhanOS modules:**
   - `engine/` → ShinhanOS AI module
   - `hitl/` → ShinhanOS HITL module
   - `eval/` → ShinhanOS observability module
   - `ui/` → ShinhanOS MFE surface
4. **Follow ShinhanOS ID conventions** (`shinhanos_id_conventions`) for module IDs, tenant IDs, and entity IDs.
5. **No cloud-provider lock-in in core logic.** Cloud-specific code lives in adapter layers, not in core engine paths.
6. **TypeScript strict mode** matches ShinhanOS's compiler settings.

## Divergence from ShinhanOS (explicitly captured)

| Aspect | ShinhanOS | Demo Repo | Reason |
|---|---|---|---|
| GraphQL server | Apollo Server 5 | Not used (REST + gRPC) | Demo is API-first for on-prem; Apollo adds weight |
| Frontend framework | Module Federation MFE | Next.js monolith | Demo has one surface per BU, not a federated shell |
| Model stack | (none locked) | Claude Sonnet 4.6 + Qwen-72B (ADR-SHB-002) | Demo-specific |
| Warehouse | Postgres only | Postgres + BigQuery + Snowflake adapters (ADR-SHB-003) | Demo must show multi-adapter |
| Auth | (ShinhanOS SSO) | Keycloak OIDC (P01-T06) | On-prem-friendly |

## Re-evaluation trigger

If Shinhan signs a commercial contract in Q3 2026, initiate the ShinhanOS port as a dedicated migration task in Q4 2026. The port is a Phase 14 activity, not a demo-phase activity.

## Implementation

- Task IDs unblocked: P01-T01 (monorepo skeleton), P01-T02 (CI/CD), all downstream Phase 1+ tasks.
- Configuration changes: repo created at `cyberskill-official/shinhan-innoboost-engine` (already exists).
- Documentation updates: update `shinhanos_tech_stack` memory note with divergence cross-reference.

## Sign-off

- [x] Ratifier: @stephen-cheng on 2026-05-02
- [ ] Engine tech lead: @______ on ____-__-__
- [ ] Platform tech lead: @______ on ____-__-__

## Supersession chain

- This ADR supersedes: (none)
- This ADR is superseded by: (none yet)
