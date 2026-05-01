# Past-Incident Transparency Log
## P11-T05

> Trust comes from candour. Here's everything that's gone wrong, and what we did about it.

---

## Why This Exists

We believe vendors who claim zero incidents are either lying or not measuring. This log documents every significant incident, eval failure, and near-miss during CyberSkill development — and the specific actions we took to prevent recurrence.

---

## Incident Log

### INC-001: SQL Injection via Prompt Manipulation
**Date**: 2025-11-14  
**Severity**: Critical  
**Phase**: Development (pre-deployment)  
**Impact**: None (caught in testing)

| Aspect | Detail |
|---|---|
| **What happened** | Adversarial prompt caused the NL→SQL engine to generate a `DROP TABLE` statement |
| **Root cause** | No SQL validation layer; LLM output was executed directly |
| **Detection** | Manual security review during sprint demo |
| **Action taken** | Built SQL validation layer: allowlist of operations (SELECT only), parameterised queries, statement analysis |
| **Prevention** | Added to adversarial corpus (now 50+ attack patterns), eval harness includes injection tests |
| **Time to fix** | 48 hours |

---

### INC-002: Eval Accuracy Regression After Model Upgrade
**Date**: 2026-01-22  
**Severity**: High  
**Phase**: Staging  
**Impact**: Eval accuracy dropped from 93% to 78%

| Aspect | Detail |
|---|---|
| **What happened** | Upgraded from GPT-4o to GPT-4o-mini for cost savings; accuracy dropped 15 points |
| **Root cause** | Smaller model struggled with complex financial domain queries |
| **Detection** | Automated eval harness caught regression within 5 minutes of deployment |
| **Action taken** | Reverted to GPT-4o immediately; established model change protocol |
| **Prevention** | Added 2% regression gate to CI/CD pipeline; model changes now require full eval suite |
| **Time to fix** | 15 minutes (rollback), 2 days (protocol) |

---

### INC-003: PII Leak in LLM Prompt
**Date**: 2026-02-08  
**Severity**: High  
**Phase**: Development  
**Impact**: None (dev environment, synthetic data)

| Aspect | Detail |
|---|---|
| **What happened** | Customer name appeared in LLM prompt when generating SQL for a KYC query |
| **Root cause** | Prompt template included raw query context without PII scrubbing |
| **Detection** | Prompt logging review during security audit |
| **Action taken** | Built PII scrubber for all prompts; only column names and aggregation patterns sent to LLM |
| **Prevention** | Prompt guard layer checks for PII patterns before any external API call |
| **Time to fix** | 3 days |

---

### INC-004: HITL Queue Overflow During Load Test
**Date**: 2026-03-15  
**Severity**: Medium  
**Phase**: Staging  
**Impact**: 47 reviews breached SLA during simulated peak load

| Aspect | Detail |
|---|---|
| **What happened** | 200 concurrent queries overwhelmed 2 reviewers; queue depth hit 47 |
| **Root cause** | Triage rules were too aggressive; 80% of queries routed to HITL |
| **Detection** | Load test monitoring dashboard |
| **Action taken** | Tuned confidence thresholds; raised auto-serve threshold from 50% to 65% |
| **Prevention** | Queue depth alert at 25 items; reviewer pool auto-scaling protocol |
| **Time to fix** | 4 hours (tuning), 2 days (alerting) |

---

### INC-005: Stale Cache Serving Outdated Financial Data
**Date**: 2026-03-28  
**Severity**: Medium  
**Phase**: Staging  
**Impact**: Users received 48-hour-old data when they expected real-time

| Aspect | Detail |
|---|---|
| **What happened** | Redis cache TTL was set to 48 hours; a user asked "What's the current NPL ratio?" and got stale data |
| **Root cause** | TTL was uniform across all query types; time-sensitive queries weren't distinguished |
| **Detection** | User reported "numbers don't match my spreadsheet" |
| **Action taken** | Implemented tiered TTL: real-time (5 min), daily (4h), historical (24h) |
| **Prevention** | Citation engine now shows data freshness ("Last updated: 2 hours ago") |
| **Time to fix** | 1 day |

---

## Summary Statistics

| Metric | Value |
|---|---|
| Total incidents logged | 5 |
| Critical | 1 (all pre-deployment) |
| High | 2 (all pre-deployment or dev) |
| Medium | 2 (staging only) |
| Production incidents | **0** |
| Average time to fix | 2.2 days |
| Recurrence | **0** |

---

## Lessons Learned → System Improvements

| Lesson | Improvement | Now Part Of |
|---|---|---|
| LLM output can be malicious | SQL validation + allowlist | Engine core |
| Model changes can regress accuracy | 2% regression gate | CI/CD pipeline |
| Prompts can leak PII | PII scrubber + prompt guard | Policy engine |
| HITL queues can overflow | Alerting + confidence tuning | Observability |
| Cache freshness matters | Tiered TTL + citation freshness | Cache layer |

> Every incident made the system stronger. We'd rather find these in dev than in production with Shinhan's data.
