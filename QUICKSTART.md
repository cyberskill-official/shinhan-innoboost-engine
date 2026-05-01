# Quickstart — start tasks today

> One page. What to do first. Where to look next.

## 1. Read the foundations (30 min)

- [`README.md`](README.md) — directory map.
- [`tasks/INDEX.md`](tasks/INDEX.md) — master task list (when authored; for now, browse `tasks/`).
- [`demo-build-plan.md`](demo-build-plan.md) — the 14-phase plan.

## 2. Pick a task

Order of execution is documented in each task FR's Dependencies section. The natural starting order is:

1. **Phase 0 — pre-flight** (P00-T01..T06): no upstream dependencies; can start in parallel.
2. **Phase 1 — foundation** (P01-T01..T10): depends on Phase 0; T01 (monorepo) is mostly done by *this scaffold*.
3. **Phase 2 — engine** (P02-T01..T09): depends on Phase 1.
4. **Phase 3 — datasets** (P03-T01..T04): can start parallel to Phase 2.
5. **Phase 4 — eval** (P04-T01..T05): depends on Phase 2 + Phase 3.
6. **Phase 5+** as the dependency graph allows.

## 3. Start a task

Per [`CONTRIBUTING.md`](CONTRIBUTING.md):

```bash
# Pick task ID, e.g., P02-T01
git checkout -b feat/P02-T01-metric-registry main

# Read the FR end-to-end
cat tasks/P02-T01-semantic-metric-layer.md

# Walk the Subtasks checklist
# ... do the work ...

# Commit per conventional-commits
git commit -m "feat(P02-T01): bootstrap metric registry"

# Push and open PR
gh pr create --title "feat(P02-T01): bootstrap metric registry" \
             --body "Refs: P02-T01"
```

## 4. Definition of done

Every task FR has a `## Definition of Done` section. The PR can merge when:

- All Subtasks are checked.
- All Acceptance Criteria are met.
- CI is green.
- Two reviewers approved.
- The task ticket in Linear is moved to Done.

## 5. Where to ask

- Engineering: `#shinhan-innoboost-2026` Slack channel; engineering thread.
- Compliance: same channel; security/compliance thread.
- Founder escalation: founder-only escalation thread.
- Tracker: Linear / ClickUp project "Shinhan Innoboost 2026".

## See also

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — full contribution guide.
- [`README.md`](README.md) — directory map.
- [`tasks/_TEMPLATE.md`](asks/_TEMPLATE.md) — template for new task FRs.
