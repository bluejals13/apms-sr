
# start-monitoring.md

```md
#!/bin/bash

echo "Starting monitoring stack..."

cd "$(dirname "$0")/.."

# victoria-metrics 서비스 추가
docker compose up -d prometheus victoria-metrics grafana node-exporter cadvisor

echo "Monitoring stack started"
```

