

# run-k6-prom.md

```md

#!/bin/bash


# =========================
# k6 + Prometheus Remote Write
# =========================


# 환경 변수
export BASE_URL="${BASE_URL:-http://localhost:8080}"


# k6 실행 옵션
VUS=${1:-50}
DURATION=${2:-2m}

STAGE=${3:-normal}

# Prometheus remote write endpoint
PROM_URL=${PROM_URL:-http://victoriametrics:8428/api/v1/write}

echo "================================="
echo "run-k6 $VUS $DURATION $STAGE"
echo "================================="


echo "================================="
echo "k6 Load Test Start"
echo "VUS       : $VUS"
echo "DURATION  : $DURATION"
echo "BASE_URL  : $BASE_URL"
echo "STAGE     : $STAGE"
echo "================================="


k6 run \
  --vus "$VUS" \
  --duration "$DURATION" \
  --env STAGE="$STAGE" \
  run.js


```

