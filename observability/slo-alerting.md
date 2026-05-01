# SLO Document, Alerting Rules & On-Call Runbook
## P09-T04

---

## 1. Service Level Objectives (SLOs)

### Primary SLOs

| SLO | Target | Measurement | Window | Budget |
|---|---|---|---|---|
| **Availability** | 99.5% | 1 - (5xx responses / total requests) | 30-day rolling | 0.5% ≈ 3.6h/month |
| **P95 Latency** | < 5,000 ms | 95th percentile request duration | 30-day rolling | — |
| **Eval Accuracy** | ≥ 95% | Gold-set accuracy on latest eval run | Per deployment | 5% error budget |
| **HITL SLA Adherence** | ≥ 95% | Reviews completed within SLA / total reviews | 30-day rolling | 5% miss budget |
| **Prompt Guard** | ≥ 99% block rate | Blocked injections / detected injections | 30-day rolling | 1% escape budget |

### Secondary SLOs

| SLO | Target | Measurement |
|---|---|---|
| P50 Latency | < 2,000 ms | 50th percentile |
| Cache Hit Rate | > 60% | Cache hits / total queries |
| Citation Accuracy | ≥ 90% | Correct citations / total citations |
| Cost per Question | < 5,000 VND | Total LLM + compute cost / questions |

---

## 2. Alerting Rules

### Prometheus Alert Rules

```yaml
# prometheus/alerts.yml

groups:
  - name: slo_alerts
    interval: 30s
    rules:

      # ─── Availability ────────────────────────
      - alert: AvailabilitySLOBreach
        expr: |
          1 - (
            sum(rate(engine_errors_total{status_code=~"5.."}[5m]))
            / sum(rate(engine_requests_total[5m]))
          ) < 0.995
        for: 5m
        labels:
          severity: critical
          team: platform
        annotations:
          summary: "Availability below 99.5% SLO"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes."
          runbook: "#runbook-availability"

      # ─── Latency ─────────────────────────────
      - alert: LatencyP95SLOBreach
        expr: |
          histogram_quantile(0.95, rate(engine_request_duration_seconds_bucket[5m])) > 5
        for: 5m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "P95 latency exceeds 5s SLO"
          description: "P95 latency is {{ $value }}s."
          runbook: "#runbook-latency"

      # ─── Eval Regression ─────────────────────
      - alert: EvalAccuracyRegression
        expr: eval_accuracy_overall < 0.93
        for: 1m
        labels:
          severity: critical
          team: ml
        annotations:
          summary: "Eval accuracy dropped below 93% (danger zone)"
          description: "Current accuracy: {{ $value | humanizePercentage }}. Deployment gate should block."
          runbook: "#runbook-eval-regression"

      # ─── HITL Queue ──────────────────────────
      - alert: HITLQueueBacklog
        expr: hitl_queue_depth > 25
        for: 10m
        labels:
          severity: warning
          team: hitl
        annotations:
          summary: "HITL queue depth exceeds 25"
          description: "{{ $value }} items pending review."
          runbook: "#runbook-hitl-backlog"

      - alert: HITLSLABreach
        expr: |
          increase(hitl_sla_breach_total[1h]) > 3
        for: 1m
        labels:
          severity: critical
          team: hitl
        annotations:
          summary: "Multiple HITL SLA breaches in the last hour"
          description: "{{ $value }} breaches detected."
          runbook: "#runbook-hitl-sla"

      # ─── Security ────────────────────────────
      - alert: PromptInjectionSpike
        expr: |
          rate(prompt_injection_attempts_total[5m]) > 0.5
        for: 2m
        labels:
          severity: critical
          team: security
        annotations:
          summary: "Prompt injection attempt rate spike"
          description: "{{ $value }} attempts/sec detected."
          runbook: "#runbook-injection-spike"

      - alert: RefusalRateSpike
        expr: |
          rate(engine_refusals_total[5m]) / rate(engine_requests_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
          team: ml
        annotations:
          summary: "Refusal rate exceeds 10%"
          description: "May indicate attack or model degradation."

      # ─── Cost ────────────────────────────────
      - alert: CostAnomaly
        expr: cost_anomaly_score > 3
        for: 10m
        labels:
          severity: warning
          team: platform
        annotations:
          summary: "Cost anomaly detected (>3σ)"
          description: "Hourly cost deviating significantly from 7-day average."
          runbook: "#runbook-cost-anomaly"
```

---

## 3. Notification Routing

| Severity | Channel | SLA | Escalation |
|---|---|---|---|
| Critical | PagerDuty + Slack #incidents + Email | 15 min ack | → CTO after 30 min |
| Warning | Slack #alerts + Email | 1 hour ack | → Eng Lead after 4 hours |
| Info | Slack #monitoring | Best effort | None |

---

## 4. On-Call Runbook

### General Protocol
1. **Acknowledge** the alert within SLA (15 min critical, 1 hour warning)
2. **Assess** severity and blast radius
3. **Communicate** in #incidents channel
4. **Mitigate** — apply temporary fix
5. **Resolve** — deploy permanent fix
6. **Document** — post-mortem within 24 hours

---

### Runbook: Availability {#runbook-availability}

| Step | Action |
|---|---|
| 1 | Check `engine_errors_total` — which error codes are spiking? |
| 2 | Check recent deployments — was something just rolled out? |
| 3 | Check database connectivity — is Postgres/Redis responding? |
| 4 | Check LLM API — is the provider having issues? |
| 5 | If deployment-related: **rollback** immediately |
| 6 | If DB-related: check connection pool, restart service |
| 7 | If LLM-related: switch to fallback model (Qwen-7B local) |

### Runbook: Latency {#runbook-latency}

| Step | Action |
|---|---|
| 1 | Check distributed traces — where is the bottleneck? |
| 2 | Common culprits: LLM API latency, DB slow queries, cache misses |
| 3 | If LLM: check provider status page, consider reducing prompt size |
| 4 | If DB: check `pg_stat_statements`, add missing indexes |
| 5 | If cache: check Redis memory, cache hit rate |

### Runbook: Eval Regression {#runbook-eval-regression}

| Step | Action |
|---|---|
| 1 | **Do not deploy** until accuracy recovers above 95% |
| 2 | Check recent prompt changes — diff system prompts |
| 3 | Run full eval suite locally: `pnpm cyber-eval run --full` |
| 4 | Compare per-BU accuracy — is regression localised? |
| 5 | If prompt change: revert to previous prompt version |
| 6 | If model change: revert to previous model version |

### Runbook: HITL Backlog {#runbook-hitl-backlog}

| Step | Action |
|---|---|
| 1 | Check reviewer availability — are reviewers online? |
| 2 | Check triage rules — is a rule routing too aggressively? |
| 3 | Temporarily: recruit additional reviewers |
| 4 | If confidence threshold too low: raise from 65% to 70% temporarily |
| 5 | Monitor queue drain rate |

### Runbook: Injection Spike {#runbook-injection-spike}

| Step | Action |
|---|---|
| 1 | Check source IPs — is it a single actor? |
| 2 | Block offending IPs at WAF level |
| 3 | Check if any injections bypassed the guard (escaped) |
| 4 | If escapes found: add to adversarial corpus, retrain guard |
| 5 | Notify security team, file incident report if SEV-1/2 |

### Runbook: Cost Anomaly {#runbook-cost-anomaly}

| Step | Action |
|---|---|
| 1 | Check which component is spiking (LLM, DB, compute) |
| 2 | Check if a specific BU or tenant is responsible |
| 3 | Common causes: cache cold start, eval suite running, abuse |
| 4 | If abuse: rate-limit the offending tenant |
| 5 | If cache: pre-warm cache, check eviction policy |
