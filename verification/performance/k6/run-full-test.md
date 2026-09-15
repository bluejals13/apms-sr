
# run-full-test.md

```md
#!/bin/bash

./start-monitoring.sh

sleep 5

echo "Starting k6 test..."

# "run-k6 $VUS $DURATION $STAGE"

./run-k6.sh 70 1m stress

echo "Test finished"

```
