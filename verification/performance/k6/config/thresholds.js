// k6/config/thresholds.js

export const thresholds = {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.001"],
};
