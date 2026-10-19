

# run-k6-prom.md

```md

#!/bin/bash

# =========================
# k6 + VictoriaMetrics Remote Write
# =========================

export BASE_URL="${BASE_URL:-http://localhost:8080}"

VUS=${1:-50}
DURATION=${2:-2m}
STAGE=${3:-normal}

# [핵심] k6가 인식하는 공식 환경변수명 설정
export K6_PROMETHEUS_RW_SERVER_URL="${PROM_URL:-http://localhost:8428/api/v1/write}"
export K6_PROMETHEUS_REMOTE_WRITE_URL="$K6_PROMETHEUS_RW_SERVER_URL"

echo "================================="
echo "run-k6 $VUS $DURATION $STAGE"
echo "================================="
echo "VUS       : $VUS"
echo "DURATION  : $DURATION"
echo "BASE_URL  : $BASE_URL"
echo "STAGE     : $STAGE"
echo "PROM_URL  : $K6_PROMETHEUS_RW_SERVER_URL"
echo "================================="

k6 run \
  -o experimental-prometheus-rw \
  --vus "$VUS" \
  --duration "$DURATION" \
  --env STAGE="$STAGE" \
  run.js


```

