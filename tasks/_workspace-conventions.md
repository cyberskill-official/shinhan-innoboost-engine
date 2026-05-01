# Workspace Conventions — Shinhan Innoboost 2026

> The single-source-of-truth rulebook for how the squad communicates, tracks work, and makes decisions. Every squad member reads this on Day 1.

**Last updated**: 2026-05-02
**Owner**: PM + Founder
**Status**: DRAFT — pending Slack channel + Linear project creation

---

## Slack Channel Conventions

### Channel Map

| Channel | Purpose | Who | Access |
|---|---|---|---|
| `#shinhan-innoboost-squad` | Daily work discussion, blockers, quick questions | All squad members | Private (NDA-gated) |
| `#shinhan-innoboost-alerts` | CI/CD alerts, eval regression alerts, GPU cost alerts, security alerts | Bots + ops lead | Private |
| `#shinhan-innoboost-decisions` | Asynchronous decision threads with sign-off | All squad + founder | Private |
| `#shinhan-innoboost-external` | Coordination with Shinhan-side contacts (if needed post-kickoff) | Account owner + PM + founder | Private |

### Thread Rules

1. **Every non-trivial discussion happens in a thread**, not in the channel root. Channel root is for announcements and kick-off messages.
2. **Decisions get their own thread** in `#shinhan-innoboost-decisions`. Format: `📌 Decision: {topic}`. The thread must end with a clear conclusion and sign-off emoji (✅ = approved, ❌ = rejected, 🔁 = revisit).
3. **No Confidential Information in public channels.** Ever. Even screenshots. Even genericised summaries if they can be deanonymised.
4. **Tag sparingly.** Use `@channel` only for genuine emergencies. Use `@here` for time-sensitive non-emergencies.
5. **Standup format** (posted to `#shinhan-innoboost-squad` by 10am ICT):
   ```
   ✅ Yesterday: [what I shipped]
   🔧 Today: [what I'm working on]
   🚧 Blockers: [what's blocking me, or "none"]
   ```

---

## Linear Project Conventions

### Project Structure

| Level | Example | Notes |
|---|---|---|
| Project | Shinhan Innoboost 2026 | One project for the entire engagement |
| Phase | Phase 0 — Pre-flight | Maps to demo-build-plan.md phases |
| Task | P00-T01 — Sponsor Consent | Maps 1:1 to INDEX.md task IDs |
| Subtask | P00-T01.1 — Rider draft | Maps to FR subtask checklists |

### Ticket Naming

Format: `[PHASE_ID]-[TASK_NUM] — [Title]`

Examples:
- `P00-T01 — Secure sponsor consent`
- `P01-T01 — Monorepo skeleton`
- `P02-T02 — NL→SQL pipeline`

**Never invent a ticket that doesn't have a corresponding INDEX.md entry.** If you need a new task, add it to INDEX.md first — that is the master list.

### Labels

| Label | Use for |
|---|---|
| `phase-0` through `phase-13` | Phase grouping |
| `agent:yes` / `agent:partial` / `agent:no` | Whether the task can be AI-assisted |
| `blocked` | Task is blocked on an upstream dependency |
| `needs-human` | Task requires human action that cannot be automated |
| `needs-review` | Work is done, needs human review before marking complete |
| `compliance` | Tasks with compliance/legal implications |
| `gpu` | Tasks that involve GPU resources and cost |

### Status Workflow

```
Backlog → Draft → In Progress → In Review → Done
                                    ↓
                                 Blocked
```

---

## Decision-Capture Protocol

Every non-trivial decision follows this pattern:

1. **Decision thread** in `#shinhan-innoboost-decisions` with title: `📌 Decision: {topic}`
2. **Context**: 2–3 sentences on what the decision is about
3. **Options**: at least 2 concrete options with pros/cons
4. **Recommendation**: the proposer's recommendation and reasoning
5. **Discussion**: threaded responses from stakeholders
6. **Conclusion**: the final decision, captured as a reply in the thread
7. **Sign-off**: ✅ emoji from the ratifier (usually founder)

If the decision is architectural, it gets an ADR (per P00-T02 pattern). If it's operational, the decision thread is sufficient.

### Escalation

- **Squad-level decisions** (tooling, implementation approach): engine tech lead decides
- **Architectural decisions** (system boundaries, technology choices): founder decides (via ADR)
- **Commercial decisions** (pricing, scope, commitments): founder decides
- **Legal decisions** (NDA terms, compliance posture): legal lead decides

---

## File-Naming Conventions

### Task Files

- `tasks/P{phase}-T{number}-{slug}.md` — Feature Request (FR) documents
- `tasks/_*.md` — Squad-facing operational documents (prefixed with underscore)
- `tasks/INDEX.md` — Master task registry (never renamed)

### ADRs

- `docs/adr/shinhan-innoboost/{number}-{slug}.md` — Architecture Decision Records
- Numbers are zero-padded to three digits (001, 002, 003…)

### Legal Documents

- `legal/ndas/shinhan-innoboost-2026/*.md` — NDA-related documents
- `legal/consents/shinhan-innoboost-2026/*.log` — Audit logs (append-only)

### Infrastructure

- `infra/gpu/*.sh` — Scripts (executable)
- `infra/gpu/*.md` — Human-readable logs and documentation

---

## External-Voice Rules

When communicating externally (emails, documents, presentations to Shinhan or partners):

1. **Sign as "CyberSkill Engagement Team"** — never as an individual
2. **Use enterprise voice** — no founder name, no headcount, no team-size claims
3. **Follow citation rules** in `tasks/_engagement-citation-rules.md`
4. **No casual tone** in external materials — even if Shinhan reviewers are informal
5. **Every external document is reviewed by the account owner** before sending

---

## Weekly Cadence

| Day | Activity | Owner |
|---|---|---|
| Monday | Weekly planning: review INDEX.md, assign tasks for the week | PM |
| Tuesday–Thursday | Execution: code, docs, design | Squad |
| Wednesday | Mid-week checkpoint: 15-min sync on blockers | PM + tech leads |
| Friday | Weekly demo + retrospective: show what shipped, discuss what's stuck | PM + founder |
| Friday (PM) | GPU spend review, NDA tracker review, INDEX.md status update | Ops lead + PM |

---

## Confidentiality Reminders

- **NDA is in effect** — re-read `legal/ndas/shinhan-innoboost-2026/quick-reference.md`
- **No screenshots of Shinhan data** in Slack, even in private channels
- **No code samples from the project** in public forums, blog posts, or conference talks
- **No discussions of the project** outside NDA-gated channels
- **When in doubt**: ask legal lead or founder before sharing anything

---

## Acknowledgement

After reading this document, confirm in `tasks/_squad-acknowledged.md`.
