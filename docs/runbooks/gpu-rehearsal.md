# GPU Rehearsal Runbook — Shinhan Innoboost 2026

> Covers: when to launch, who has access, cost discipline, how to tear down, and the kill switch.

**Owner**: Ops lead
**Last updated**: 2026-05-02
**Status**: DRAFT — pending account creation (Lambda Labs + Runpod)

---

## When to Launch

| Trigger | Urgency | Expected Duration | Approver |
|---|---|---|---|
| First-light rehearsal (initial model validation) | Medium | 1–2 hours | Ops lead |
| Eval-harness dry run (gold-set against on-prem path) | Medium | 2–4 hours | Engine tech lead |
| Full-stack integration test (engine + HITL + UI + eval) | Medium | 4–8 hours | Engine tech lead |
| Day-before-demo capacity hold | High | 24 hours | Founder |
| Ad-hoc debugging (vLLM issue, quantisation issue) | Low | 1–2 hours | Ops lead |
| Phase 12 rehearsal | High | 4–8 hours | Founder + PM |

---

## Who Has Access

| Role | Access Level | Can Launch? | Can Tear Down? |
|---|---|---|---|
| Ops lead | Full (provider accounts, SSH keys) | ✅ | ✅ |
| Engine tech lead | SSH access only | ✅ (via ops) | ✅ |
| Squad engineers | No direct access | ❌ (request via ops) | ❌ |
| Founder | Provider account owner | ✅ (emergency only) | ✅ |

SSH keys are stored in the secrets vault (per P01-T03). Rotation: 90-day cycle per ENG-OPS standard.

---

## Cost Discipline Rules

| Rule | Threshold | Action |
|---|---|---|
| Single launch cost | > $20 | Requires founder pre-approval |
| Weekly spend | > $300 | Triggers spend review with founder + ops |
| Monthly spend cap | $1,200 | Hard stop; no further launches without founder exception |
| Daily spend alert | > $50 | Alert to Slack + founder |
| Instance running > cap hours | Auto-terminate | spin-up.sh enforces |

### Cost Reference

| Instance Type | Hourly Rate | 4-hour cost | 24-hour cost |
|---|---|---|---|
| H100 SXM (Lambda) | ~$2.99/hr | ~$12 | ~$72 |
| H100 PCIe (Lambda) | ~$2.49/hr | ~$10 | ~$60 |
| A100 80GB (Lambda) | ~$1.99/hr | ~$8 | ~$48 |
| H100 SXM (Runpod) | ~$3.50/hr | ~$14 | ~$84 |

---

## Launch Procedure

```bash
# 1. Navigate to infra/gpu/
cd infra/gpu/

# 2. Launch instance (default: H100 SXM, 4-hour cap)
./spin-up.sh --type h100-sxm --cap-hours 4 --purpose rehearsal

# 3. Wait for "ready" confirmation (~10 min)
# 4. Run your workload
# 5. Tear down when done
./tear-down.sh --instance-id INSTANCE_ID --capture-artefacts
```

---

## Tear-Down Procedure

```bash
# Standard tear-down (captures artefacts)
./tear-down.sh --instance-id INSTANCE_ID --capture-artefacts

# Tear-down with snapshot (for forensic recovery)
./tear-down.sh --instance-id INSTANCE_ID --capture-artefacts --snapshot

# Quick tear-down (no artefact capture)
./tear-down.sh --instance-id INSTANCE_ID
```

**Always tear down after your session.** Stuck instances burn budget.

---

## Kill Switch — Emergency Instance Termination

If the script-based tear-down fails, use the provider's web console directly:

### Lambda Labs Kill Switch
1. Go to https://cloud.lambdalabs.com/instances
2. Find the running instance
3. Click "Terminate"
4. Verify termination in the instance list
5. Log the event in `alerts.log`

### Runpod Kill Switch
1. Go to https://www.runpod.io/console/pods
2. Find the running pod
3. Click "Stop" then "Delete"
4. Verify termination
5. Log the event in `alerts.log`

### Nuclear Option
If you cannot access the provider console:
1. Contact the provider's support (Lambda: support@lambdalabs.com; Runpod: via Discord)
2. Request immediate termination of all instances under our account
3. Notify founder and ops lead
4. Log the event

---

## Artefact Capture

After every meaningful rehearsal, capture:

| Artefact | Location | Retention |
|---|---|---|
| Eval-harness JSON output | `infra/gpu/artefacts/{date}/eval/` | Until program end |
| Latency snapshots (p50/p95/p99) | `infra/gpu/artefacts/{date}/latency/` | Until program end |
| vLLM server logs | `infra/gpu/artefacts/{date}/logs/` | Until program end |
| GPU memory profile | `infra/gpu/artefacts/{date}/memory/` | Until program end |

---

## Pre-Booked Day-Before-Demo Capacity

| Event | Date | Duration | Instance Type | Reservation Status |
|---|---|---|---|---|
| Phase 12 dry-run #1 | TBD | 8 hours | H100 SXM | ◯ Not booked |
| Phase 12 dry-run #2 | TBD | 8 hours | H100 SXM | ◯ Not booked |
| Phase 12 dry-run #3 | TBD | 8 hours | H100 SXM | ◯ Not booked |
| Day before interview (if shortlisted) | TBD | 24 hours | H100 SXM | ◯ Not booked |
| Day before Demo Day (if selected) | TBD | 24 hours | H100 SXM | ◯ Not booked |

Book at least **5 days ahead**. If quota is denied on Lambda, switch to Runpod.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| H100 quota unavailable on Lambda | Switch to Runpod (`--provider runpod`) |
| Both providers quota-constrained | Try Vast.ai (lower reliability); notify founder |
| vLLM OOM during inference | Reduce `--gpu-memory-utilization` to 0.85; check for memory leaks |
| Model download throttled by HuggingFace | Use pre-staged weights from internal artefact store |
| CUDA version mismatch | Pin CUDA 12.4 in Docker image; do not use provider's default image |
| Instance stuck (cannot SSH) | Use kill switch above |
| Spin-up takes > 15 minutes | Check image pull speed; pre-build and cache the Docker image |
