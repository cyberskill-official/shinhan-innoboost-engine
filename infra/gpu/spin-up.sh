#!/usr/bin/env bash
# =============================================================================
# Shinhan Innoboost 2026 — GPU Instance Spin-Up Script
# Per P00-T05 FR and ADR-SHB-002 (model stack)
# =============================================================================
#
# Usage:
#   ./spin-up.sh [--type h100-sxm|h100-pcie|a100] [--region us-east-1] [--cap-hours 4] [--purpose rehearsal|eval|demo]
#
# Prerequisites:
#   - Lambda Labs CLI configured (or Runpod CLI as fallback)
#   - SSH key pair in secrets vault (per P01-T03)
#   - Quantised Qwen-72B-AWQ-Q4 weights staged in artefact store
#
# This script:
#   1. Launches a GPU instance with the specified type and region
#   2. Pulls the pre-built Docker image with vLLM + dependencies
#   3. Downloads Qwen-72B-AWQ-Q4 weights from the internal artefact store
#   4. Starts the vLLM inference server with OpenAI-compatible endpoint
#   5. Logs the launch to usage.md
#
# Target: from ./spin-up.sh to "ready" state in < 10 minutes
# =============================================================================

set -euo pipefail

# --- Configuration ---
INSTANCE_TYPE="${1:---type}"
REGION="us-east-1"
CAP_HOURS=4
PURPOSE="rehearsal"
PROVIDER="lambda"  # lambda or runpod

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USAGE_LOG="${SCRIPT_DIR}/usage.md"
ALERTS_LOG="${SCRIPT_DIR}/alerts.log"

# --- Docker image with all dependencies ---
# Ubuntu 22.04 LTS + CUDA 12.4 + PyTorch 2.4 + vLLM (latest stable) + transformers + AutoAWQ
DOCKER_IMAGE="ghcr.io/cyberskill-official/shinhan-innoboost-engine/gpu-inference:latest"

# --- Model weights ---
MODEL_REPO="Qwen/Qwen2.5-72B-Instruct-AWQ"
MODEL_LOCAL_PATH="/models/qwen-72b-awq-q4"

# --- vLLM serving config ---
VLLM_PORT=8000
VLLM_MODEL_NAME="qwen-72b"
VLLM_MAX_MODEL_LEN=8192
VLLM_GPU_MEMORY_UTILIZATION=0.90

# --- Parse arguments ---
while [[ $# -gt 0 ]]; do
  case $1 in
    --type)
      INSTANCE_TYPE="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --cap-hours)
      CAP_HOURS="$2"
      shift 2
      ;;
    --purpose)
      PURPOSE="$2"
      shift 2
      ;;
    --provider)
      PROVIDER="$2"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# --- Default instance type ---
if [[ "$INSTANCE_TYPE" == "--type" ]]; then
  INSTANCE_TYPE="h100-sxm"
fi

# --- Cost tracking ---
declare -A HOURLY_RATES
HOURLY_RATES[h100-sxm]=2.99
HOURLY_RATES[h100-pcie]=2.49
HOURLY_RATES[a100]=1.99

HOURLY_RATE="${HOURLY_RATES[$INSTANCE_TYPE]:-2.99}"
ESTIMATED_COST=$(echo "$CAP_HOURS * $HOURLY_RATE" | bc)

echo "=============================================="
echo "Shinhan Innoboost — GPU Spin-Up"
echo "=============================================="
echo "Instance type:  $INSTANCE_TYPE"
echo "Region:         $REGION"
echo "Hour cap:       $CAP_HOURS hours (auto-terminate)"
echo "Purpose:        $PURPOSE"
echo "Provider:       $PROVIDER"
echo "Estimated cost: \$${ESTIMATED_COST}"
echo "=============================================="

# --- Safety check: cost cap ---
WEEKLY_SPEND=$(grep "$(date +%Y-W%V)" "$USAGE_LOG" 2>/dev/null | awk -F'|' '{sum += $7} END {print sum+0}')
PROJECTED_WEEKLY=$(echo "$WEEKLY_SPEND + $ESTIMATED_COST" | bc)

if (( $(echo "$PROJECTED_WEEKLY > 300" | bc -l) )); then
  echo "⚠️  WARNING: Weekly spend would reach \$${PROJECTED_WEEKLY} (cap: \$300/week)"
  echo "   Requires founder pre-approval. Aborting."
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ)\tWEEKLY_CAP_EXCEEDED\t\$${PROJECTED_WEEKLY}\t$(whoami)\t$PURPOSE" >> "$ALERTS_LOG"
  exit 1
fi

if (( $(echo "$ESTIMATED_COST > 20" | bc -l) )); then
  echo "⚠️  WARNING: Single launch cost \$${ESTIMATED_COST} exceeds \$20 threshold."
  echo "   Requires founder pre-approval per runbook. Continue? (y/N)"
  read -r confirm
  if [[ "$confirm" != "y" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

echo ""
echo "--- Step 1: Launching $INSTANCE_TYPE instance on $PROVIDER ---"
echo "[TODO] Replace with actual provider CLI command:"
echo "  lambda cloud instances create --type $INSTANCE_TYPE --region $REGION"
echo ""

INSTANCE_ID="PLACEHOLDER_INSTANCE_ID"
INSTANCE_IP="PLACEHOLDER_IP"
LAUNCH_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "--- Step 2: Waiting for instance to be ready ---"
echo "[TODO] Poll instance status until 'running'"
echo ""

echo "--- Step 3: Pulling Docker image ---"
echo "[TODO] SSH to instance and run:"
echo "  docker pull $DOCKER_IMAGE"
echo ""

echo "--- Step 4: Loading model weights ---"
echo "[TODO] SSH to instance and run:"
echo "  huggingface-cli download $MODEL_REPO --local-dir $MODEL_LOCAL_PATH"
echo ""

echo "--- Step 5: Starting vLLM inference server ---"
echo "[TODO] SSH to instance and run:"
echo "  docker run -d --gpus all -p $VLLM_PORT:$VLLM_PORT \\"
echo "    -v $MODEL_LOCAL_PATH:/models \\"
echo "    $DOCKER_IMAGE \\"
echo "    python -m vllm.entrypoints.openai.api_server \\"
echo "      --model /models \\"
echo "      --served-model-name $VLLM_MODEL_NAME \\"
echo "      --port $VLLM_PORT \\"
echo "      --max-model-len $VLLM_MAX_MODEL_LEN \\"
echo "      --gpu-memory-utilization $VLLM_GPU_MEMORY_UTILIZATION \\"
echo "      --quantization awq"
echo ""

echo "--- Step 6: Verifying endpoint ---"
echo "[TODO] curl http://$INSTANCE_IP:$VLLM_PORT/v1/models"
echo ""

echo "--- Step 7: Setting auto-terminate timer ---"
echo "[TODO] Schedule instance termination in $CAP_HOURS hours"
echo ""

# --- Log to usage.md ---
echo "| $LAUNCH_TIME | — | — | \$${ESTIMATED_COST} (est) | $(whoami) | $PURPOSE | $INSTANCE_TYPE / $REGION | Pending tear-down |" >> "$USAGE_LOG"

echo "=============================================="
echo "✅ GPU instance launched (placeholder)"
echo "   Instance ID: $INSTANCE_ID"
echo "   Endpoint:    http://$INSTANCE_IP:$VLLM_PORT/v1"
echo "   Auto-terminate in: $CAP_HOURS hours"
echo "   Remember to run tear-down.sh when done!"
echo "=============================================="
