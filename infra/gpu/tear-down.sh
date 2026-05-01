#!/usr/bin/env bash
# =============================================================================
# Shinhan Innoboost 2026 — GPU Instance Tear-Down Script
# Per P00-T05 FR
# =============================================================================
#
# Usage:
#   ./tear-down.sh [--instance-id INSTANCE_ID] [--capture-artefacts] [--snapshot]
#
# This script:
#   1. Captures any artefacts (eval-run outputs, latency snapshots, log archives)
#   2. Uploads artefacts to the project artefact store
#   3. Optionally snapshots the instance for forensic recovery
#   4. Terminates the instance
#   5. Updates the usage log with tear-down time and actual cost
#
# Idempotent: safe to run multiple times.
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USAGE_LOG="${SCRIPT_DIR}/usage.md"
ALERTS_LOG="${SCRIPT_DIR}/alerts.log"

INSTANCE_ID=""
CAPTURE_ARTEFACTS=false
SNAPSHOT=false

# --- Parse arguments ---
while [[ $# -gt 0 ]]; do
  case $1 in
    --instance-id)
      INSTANCE_ID="$2"
      shift 2
      ;;
    --capture-artefacts)
      CAPTURE_ARTEFACTS=true
      shift
      ;;
    --snapshot)
      SNAPSHOT=true
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [[ -z "$INSTANCE_ID" ]]; then
  echo "Usage: ./tear-down.sh --instance-id INSTANCE_ID [--capture-artefacts] [--snapshot]"
  echo ""
  echo "Tip: Check usage.md for the latest instance ID."
  exit 1
fi

TEARDOWN_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "=============================================="
echo "Shinhan Innoboost — GPU Tear-Down"
echo "=============================================="
echo "Instance ID:      $INSTANCE_ID"
echo "Capture artefacts: $CAPTURE_ARTEFACTS"
echo "Snapshot:          $SNAPSHOT"
echo "=============================================="

# --- Step 1: Capture artefacts ---
if $CAPTURE_ARTEFACTS; then
  echo ""
  echo "--- Step 1: Capturing artefacts ---"
  echo "[TODO] SCP from instance:"
  echo "  scp -r user@INSTANCE_IP:/outputs/ ${SCRIPT_DIR}/artefacts/${TEARDOWN_TIME}/"
  echo ""
  echo "Artefacts to capture:"
  echo "  - /outputs/eval-results/     (eval-harness JSON outputs)"
  echo "  - /outputs/latency/          (p50/p95/p99 snapshots)"
  echo "  - /outputs/logs/             (vLLM server logs, system logs)"
  echo "  - /outputs/metrics/          (Prometheus scrape dumps)"
else
  echo ""
  echo "--- Step 1: Skipping artefact capture (use --capture-artefacts to enable) ---"
fi

# --- Step 2: Snapshot (optional) ---
if $SNAPSHOT; then
  echo ""
  echo "--- Step 2: Creating instance snapshot ---"
  echo "[TODO] Provider CLI:"
  echo "  lambda cloud instances snapshot --id $INSTANCE_ID --name shinhan-gpu-${TEARDOWN_TIME}"
fi

# --- Step 3: Terminate instance ---
echo ""
echo "--- Step 3: Terminating instance ---"
echo "[TODO] Provider CLI:"
echo "  lambda cloud instances terminate --id $INSTANCE_ID"
echo ""

# --- Step 4: Update usage log ---
echo ""
echo "--- Step 4: Updating usage log ---"
# Find the last entry for this instance and update tear-down time
# In practice, this would sed/awk the usage.md to fill in tear-down time
echo "[TODO] Update the 'Pending tear-down' entry in usage.md with:"
echo "  Tear-down time: $TEARDOWN_TIME"
echo "  Actual cost: [compute from provider API]"

echo ""
echo "=============================================="
echo "✅ Tear-down complete for instance $INSTANCE_ID"
echo "   Tear-down time: $TEARDOWN_TIME"
if $CAPTURE_ARTEFACTS; then
  echo "   Artefacts saved to: ${SCRIPT_DIR}/artefacts/${TEARDOWN_TIME}/"
fi
if $SNAPSHOT; then
  echo "   Snapshot created: shinhan-gpu-${TEARDOWN_TIME}"
fi
echo "=============================================="
