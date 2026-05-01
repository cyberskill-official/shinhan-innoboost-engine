# Joint Working Agreements
## P13-T02

---

## 1. Communication Channels

| Channel | Purpose | Participants | Frequency |
|---|---|---|---|
| **Slack/Teams #cyberskill-shinhan** | Day-to-day questions, async updates | All team members | Continuous |
| **Weekly Standup** | Progress, blockers, decisions needed | CyberSkill PM + Shinhan sponsor + IT liaison | Weekly (Mon 10:00 ICT) |
| **Weekly Demo** | Live feature demo + feedback | Full team + BU stakeholders | Weekly (Thu 14:00 ICT) |
| **Bi-weekly Decision Gate** | Go/no-go on milestones, scope changes | CyberSkill founder + Shinhan VP sponsor | Bi-weekly (Fri 10:00 ICT) |
| **Email** | Formal decisions, escalations, sign-offs | Named contacts only | As needed |
| **Emergency** | SEV-1/2 incidents, blockers | CyberSkill CTO + Shinhan IT lead | Immediate (phone) |

---

## 2. Cadence

### Weekly Rhythm

```
Monday     10:00  Standup (30 min)
Tuesday    —      Sprint work
Wednesday  —      Sprint work
Thursday   14:00  Demo (45 min)
Friday     10:00  Decision gate (bi-weekly, 30 min)
Friday     16:00  Internal retro (CyberSkill only, 30 min)
```

### Milestone Cadence

| Week | Milestone | Decision Gate |
|---|---|---|
| 2 | Data onboarded + schema mapped | Go/kill: is schema compatible? |
| 4 | First 30 queries live | Go/kill: accuracy ≥ 80%? |
| 6 | Mid-term assessment | Formal review: continue/adjust/kill |
| 8 | Pilot rollout complete | Go/kill: SLA adherence ≥ 90%? |
| 10 | Eval harness calibrated | Go/kill: accuracy ≥ 95%? |
| 12 | Final demo + assessment | Graduate/kill decision |

---

## 3. Decision-Gate Process

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ CyberSkill│────▶│  Joint   │────▶│ Decision │
│ prepares  │     │ review   │     │          │
│ evidence  │     │ meeting  │     │ Go / Adjust│
│           │     │          │     │ / Kill    │
└──────────┘     └──────────┘     └──────────┘
```

**Decision authority**:
- **Go**: CyberSkill PM + Shinhan IT liaison (jointly)
- **Adjust scope**: CyberSkill founder + Shinhan sponsor (jointly)
- **Kill**: Shinhan sponsor (unilateral) or CyberSkill founder (with 14-day notice)

**Evidence required for each gate**:
1. Metrics dashboard screenshot (accuracy, SLA, latency)
2. User feedback summary
3. Outstanding blockers list
4. Recommendation (go/adjust/kill with rationale)

---

## 4. Escalation Tree

```
Level 1: CyberSkill PM ↔ Shinhan IT Liaison
   │ (resolve within 24 hours)
   ▼
Level 2: CyberSkill Founder ↔ Shinhan BU Sponsor
   │ (resolve within 48 hours)
   ▼
Level 3: CyberSkill CEO ↔ Shinhan Innoboost Program Director
   │ (resolve within 5 business days)
```

### When to Escalate
- Blocker not resolved within SLA
- Scope change request
- Resource conflict
- Security/compliance concern
- Timeline risk (>1 week delay)

---

## 5. Artefact Management

| Artefact | Location | Owner | Access |
|---|---|---|---|
| Source code | GitHub (private) | CyberSkill | CyberSkill team |
| Configurations | GitHub (private) | Joint | CyberSkill + Shinhan IT |
| Documentation | Shared Google Drive / Confluence | Joint | All team members |
| Meeting notes | Shared Drive / Confluence | CyberSkill PM | All team members |
| Metrics dashboards | Grafana (hosted) | CyberSkill | All team members |
| Incident reports | Shared Drive | CyberSkill | All team + Shinhan compliance |

---

## 6. Working Norms

| Norm | Detail |
|---|---|
| Language | English for documentation; Vietnamese for meetings (Korean interpretation available) |
| Timezone | ICT (UTC+7) |
| Response SLA | Slack: 4 hours (business hours); Email: 24 hours |
| Location | Hybrid — CyberSkill HCM office; on-site at Shinhan as needed |
| Tools | Slack/Teams, Google Meet/Zoom, GitHub, Jira/Linear, Grafana |
| Holidays | Vietnamese + Korean public holidays observed (notify 1 week ahead) |
