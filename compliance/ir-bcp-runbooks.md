# Incident Response & Business Continuity Runbooks
## P08-T08

---

# Part A — Incident Response Plan

## 1. Scope

This plan covers security incidents, data breaches, system outages, and AI-specific incidents affecting the CyberSkill platform serving Shinhan Vietnam business units.

---

## 2. Severity Classification

| Level | Name | Description | Examples | Response SLA |
|---|---|---|---|---|
| SEV-1 | Critical | Complete service outage or confirmed data breach | Data exfiltration, system compromise, production DB breach | 15 min assembly |
| SEV-2 | High | Partial outage or suspected breach | Successful prompt injection, HITL queue failure, auth bypass | 1 hour assembly |
| SEV-3 | Medium | Degraded performance or policy violation | SLA breach, eval regression, anomalous query patterns | 4 hours triage |
| SEV-4 | Low | Minor issue, no user impact | Failed injection attempt, config drift, non-critical dependency CVE | 24 hours triage |

---

## 3. Communication Tree

```
                    ┌─────────┐
                    │   CTO   │ ← Incident Commander
                    └────┬────┘
                ┌────────┼────────┐
           ┌────▼────┐  ┌▼──────┐ ┌▼──────────┐
           │ Eng Lead│  │  DPO  │ │ Compliance │
           └────┬────┘  └───┬───┘ └─────┬──────┘
                │           │           │
    ┌───────────┤     ┌─────┤     ┌─────┤
    │           │     │     │     │     │
┌───▼──┐ ┌─────▼──┐ ┌▼───┐ │   ┌─▼───┐ │
│On-Call│ │Security│ │MoPS│ │   │ SBV │ │
│ Eng  │ │  Team  │ │    │ │   │     │ │
└──────┘ └────────┘ └────┘ │   └─────┘ │
                      ┌────▼────┐ ┌────▼──────┐
                      │  MoIC   │ │  Shinhan  │
                      │ (VNCERT)│ │  Liaison  │
                      └─────────┘ └───────────┘
```

---

## 4. Response Phases

### Phase 1 — Detection & Triage (0-15 min)
- [ ] Identify the incident source (monitoring alert, user report, automated scan)
- [ ] Classify severity (SEV-1 to SEV-4)
- [ ] Assign Incident Commander (IC)
- [ ] Open incident channel (Slack/Teams #incident-YYYYMMDD-NN)
- [ ] Log initial assessment in incident tracker

### Phase 2 — Containment (15 min - 1 hour)
- [ ] Isolate affected systems (revoke API keys, block IPs, disable user accounts)
- [ ] Preserve evidence (snapshot logs, freeze audit trail)
- [ ] Assess blast radius (which BUs, which data, which users)
- [ ] Implement temporary fix if possible (feature flag, rollback)
- [ ] Notify Shinhan liaison (SEV-1/2 only)

### Phase 3 — Eradication (1-4 hours)
- [ ] Identify root cause
- [ ] Remove threat actor access
- [ ] Patch vulnerability
- [ ] Verify fix in staging
- [ ] Deploy to production

### Phase 4 — Recovery (4-24 hours)
- [ ] Restore normal operations
- [ ] Verify system integrity (audit log chain verification)
- [ ] Monitor for recurrence (72-hour watch period)
- [ ] Re-enable disabled features/accounts
- [ ] Confirm with Shinhan liaison

### Phase 5 — Post-Incident (24-72 hours)
- [ ] Conduct post-mortem (blameless)
- [ ] Document lessons learned
- [ ] Update threat model if needed
- [ ] File regulatory notifications:
  - MoPS (A05): 24 hours from detection (SEV-1/2)
  - MoIC (VNCERT): 24 hours from detection (SEV-1/2)
  - SBV: 2 hours for Grade A, 24 hours for Grade B
- [ ] Update adversarial corpus if applicable
- [ ] Archive incident record

---

## 5. Regulatory Notification Templates

### Template: MoPS Notification
```
TO: Ministry of Public Security, Department A05
FROM: CyberSkill JSC — Data Protection Officer
DATE: [Date]
SUBJECT: Security Incident Notification — [Incident ID]

1. Nature of incident: [Description]
2. Date/time of detection: [Timestamp]
3. Systems affected: [List]
4. Data categories impacted: [Categories]
5. Number of affected data subjects: [Count or estimate]
6. Measures taken: [Containment actions]
7. Further measures planned: [Eradication plan]
8. Contact person: [DPO name, email, phone]
```

---

# Part B — Business Continuity Plan

## 1. Recovery Objectives

| Metric | Target | Justification |
|---|---|---|
| RTO (Recovery Time Objective) | 4 hours | Users can tolerate 4h outage for non-real-time queries |
| RPO (Recovery Point Objective) | 1 hour | Hourly backups; max 1h data loss acceptable |
| MTPD (Max Tolerable Period of Disruption) | 24 hours | Beyond 24h, manual processes must be activated |

---

## 2. Continuity Strategies

| Scenario | Strategy | Procedure |
|---|---|---|
| Cloud region outage (ap-southeast-1) | Failover to on-prem or alternate region | Activate docker-compose deployment on backup server |
| LLM API provider outage | Fallback to local Qwen-7B (quantised) | Switch LLM_PROVIDER env variable; accept reduced accuracy |
| Database corruption | Restore from latest backup | Automated restore script; verify audit log chain |
| DDoS attack | WAF + rate limiting + Shinhan CDN | Activate WAF rules; notify Shinhan SOC |
| Key personnel unavailable | Cross-trained team members | At least 2 people trained per critical function |

---

## 3. Testing Schedule

| Test Type | Frequency | Last Tested | Next Due |
|---|---|---|---|
| Tabletop exercise | Semi-annually | [TBD] | [TBD] |
| Backup restoration | Quarterly | [TBD] | [TBD] |
| Failover drill | Annually | [TBD] | [TBD] |
| Communication tree test | Quarterly | [TBD] | [TBD] |

---

## 4. Contact List

| Role | Name | Phone | Email | Backup |
|---|---|---|---|---|
| Incident Commander | [CTO] | [Phone] | [Email] | [Eng Lead] |
| DPO | [DPO] | [Phone] | [Email] | [Compliance] |
| On-Call Engineer | Rotation | [PagerDuty] | [Alias] | — |
| Shinhan Liaison | [TBD] | [TBD] | [TBD] | [TBD] |
| Legal Counsel | [TBD] | [TBD] | [TBD] | [TBD] |
