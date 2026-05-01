# Assessment & Commercialisation Playbooks
## P13-T06

---

# Part A — Mid-Term Assessment (Week 6)

## Purpose
Formal checkpoint for both parties to evaluate PoC progress and decide: **continue, adjust, or kill**.

## Assessment Template

### 1. Quantitative Metrics

| Metric | Target | Actual | Status |
|---|---|---|---|
| Query accuracy (gold-set) | ≥ 90% | ___% | 🟢/🟡/🔴 |
| P95 latency | < 5 seconds | ___ sec | 🟢/🟡/🔴 |
| HITL SLA adherence | ≥ 90% | ___% | 🟢/🟡/🔴 |
| Active users | ≥ 10 | ___ | 🟢/🟡/🔴 |
| Queries per day | ≥ 20 | ___ | 🟢/🟡/🔴 |
| Security incidents | 0 | ___ | 🟢/🟡/🔴 |

### 2. Qualitative Assessment

| Area | Rating (1-5) | Notes |
|---|---|---|
| User adoption | | |
| Data quality | | |
| Response quality | | |
| Team collaboration | | |
| Communication cadence | | |
| Compliance readiness | | |

### 3. Blocker Review

| Blocker | Severity | Owner | Resolution Plan | ETA |
|---|---|---|---|---|
| | | | | |

### 4. Scope Adjustment (If Any)

| Change | Rationale | Impact on Timeline | Decision |
|---|---|---|---|
| | | | Approved / Rejected |

### 5. Recommendation

- [ ] **Continue as planned** — all metrics on track
- [ ] **Continue with adjustments** — [specify changes]
- [ ] **Kill** — [specify reason and graceful exit plan]

**Signed**:
| Party | Name | Title | Date |
|---|---|---|---|
| CyberSkill | _________________ | _________________ | _________________ |
| Shinhan | _________________ | _________________ | _________________ |

---

# Part B — Final Assessment (Week 12)

## Purpose
Formal evaluation determining whether the PoC graduates to pilot or is terminated.

## Assessment Template

### 1. Success Criteria Scorecard

| Criterion | Target | Achieved | Pass? |
|---|---|---|---|
| Query accuracy (gold-set) | ≥ 95% | ___% | ✅/❌ |
| P95 latency | < 5 seconds | ___ sec | ✅/❌ |
| HITL SLA adherence | ≥ 95% | ___% | ✅/❌ |
| User satisfaction (NPS) | ≥ +50 | +___ | ✅/❌ |
| Security incidents | 0 | ___ | ✅/❌ |
| Regulatory compliance | Full | ___% | ✅/❌ |

### 2. Production Readiness Checklist

| Item | Status | Evidence |
|---|---|---|
| Eval harness calibrated for BU | ⬜ | Eval report |
| HITL reviewers proficient | ⬜ | Review accuracy metrics |
| Audit trail verified | ⬜ | Hash chain verification log |
| Compliance checklist complete | ⬜ | Compliance dossier |
| Data handling documented | ⬜ | Data flow diagram |
| Incident response tested | ⬜ | IR drill report |
| On-call procedures documented | ⬜ | Runbook |

### 3. Lessons Learned

| Category | What Worked | What Didn't | Recommendation |
|---|---|---|---|
| Technical | | | |
| Process | | | |
| Communication | | | |
| Data | | | |

### 4. Graduation Decision

- [ ] **Graduate to pilot** — proceed to 6-month pilot phase
- [ ] **Graduate with conditions** — [list conditions]
- [ ] **Extend PoC** — [additional weeks needed, reason]
- [ ] **Terminate** — [reason, data deletion scheduled]

---

# Part C — Commercialisation Playbook

## Path: PoC → Pilot → Scale → MSA

### Phase 1: PoC (Current — 12 weeks)

| Item | Detail |
|---|---|
| Scope | 1 BU, masked data, staging environment |
| Team | 6 CyberSkill + 4 Shinhan |
| Fee | PoC fee (per SOW) |
| IP | Joint (per SOW §6) |
| Exit | 14-day notice, data deletion |

### Phase 2: Pilot (6 months)

| Item | Detail |
|---|---|
| Scope | 1 BU, production data, production environment |
| Users | Full BU team (50-100 users) |
| Team | Same CyberSkill team, reduced Shinhan support |
| Fee | Monthly subscription (per-BU) |
| SLA | 99.5% uptime, 5-sec P95 latency |
| New | Production monitoring, 24/7 on-call, quarterly business reviews |

### Phase 3: Scale (12+ months)

| Item | Detail |
|---|---|
| Scope | Multi-BU deployment (SVFC + Bank + Securities) |
| Users | 200-500 across BUs |
| Team | Dedicated CyberSkill delivery team |
| Fee | Enterprise license (per-BU + volume pricing) |
| SLA | 99.9% uptime, dedicated support |
| New | Cross-BU analytics, consolidated reporting, model fine-tuning |

### Phase 4: MSA (Master Service Agreement)

| Clause | CyberSkill Position | Negotiation Flexibility |
|---|---|---|
| Term | 3 years with annual renewal | Flexible (1-5 years) |
| Exclusivity | Non-exclusive | Negotiable per BU |
| Pricing | Per-BU subscription | Volume discounts at 3+ BUs |
| IP | CyberSkill platform; joint on customisations | Standard |
| Data | Shinhan owns all data; CyberSkill deletes on termination | Non-negotiable |
| Liability | Capped at 12 months' fees | Standard |
| Governing law | Vietnam | Non-negotiable |
| Audit rights | Shinhan may audit annually | Standard |

### Pricing Strategy

```
┌────────────────────────────────────────────────────┐
│  PoC: Fixed fee (modest — shows confidence)        │
│         ↓                                          │
│  Pilot: Monthly subscription per BU                │
│         ↓                                          │
│  Scale: Volume pricing (price per BU decreases     │
│         as more BUs onboard)                       │
│         ↓                                          │
│  MSA: Annual commitment with SLA guarantees        │
└────────────────────────────────────────────────────┘

Principle: Low entry cost → demonstrate value → expand
```

### Demo Day Preparation (Week 9)

| Task | Owner | Deadline |
|---|---|---|
| Compile metrics for final presentation | PM | Week 9 |
| Prepare demo with real (masked) Shinhan data | Eng | Week 10 |
| Draft graduation recommendation | PM + Founder | Week 11 |
| Schedule final review meeting | PM | Week 11 |
| Deliver final assessment report | PM | Week 12 |
