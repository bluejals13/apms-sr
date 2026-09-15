
# start-monitoring.md

```md
#!/bin/bash

echo "Starting monitoring stack..."

cd "$(dirname "$0")/.."

docker compose up -d prometheus grafana node-exporter cadvisor

echo "Monitoring stack started"
```

