
# 📌 k6 Performance Test Framework (SLA + Monitoring + Load Test)

## 1. 개요

이 프로젝트는 k6 기반으로 구축된 **API 성능 테스트 및 부하 시뮬레이션 프레임워크**입니다.

단순한 부하 테스트 스크립트가 아니라,
실제 서비스 환경을 기준으로 다음을 검증할 수 있도록 설계되었습니다:

- API 단위 성능 검증 (SLA 기반)
- 사용자 행동 기반 시나리오 테스트
- 트래픽 패턴별 부하 시뮬레이션 (Load / Stress / Spike / Soak)
- Prometheus + Grafana 기반 모니터링 연동
- CI/CD 환경에서 성능 회귀 테스트 가능 구조



# 2. 전체 구조

```text
k6/
├── api/                 # 서비스 단위 API abstraction layer
├── core/               # 인증/HTTP retry/공통 통신 레이어
├── config/             # 환경 설정 및 SLA 정의
├── scenarios/          # 사용자 행동 기반 시나리오
├── tests/              # 부하 테스트 시나리오 (load/stress/spike/soak)
├── run.sh              # 단일 실행 스크립트
└── run-prom.sh         # Prometheus 연동 실행
```



# 3. 아키텍처 구조

```text
User Scenario (Business Flow)
        ↓
API Abstraction Layer
        ↓
Core HTTP / Auth Layer
        ↓
k6 Engine
        ↓
Observability (Prometheus / Grafana)
```



# 4. 역할 정의

| Layer        | 역할 |
|--------------|------|
| scenarios    | 실제 사용자 행동 흐름 정의 (비즈니스 시뮬레이션) |
| api          | 서비스 API abstraction (재사용 가능한 함수 레이어) |
| core/request | HTTP wrapper + retry + auth handling |
| core/auth    | 인증 및 token lifecycle 관리 |
| config       | 환경 변수 및 SLA 기준 정의 |
| tests        | 트래픽 패턴 기반 부하 테스트 정의 |



# 5. 핵심 코드 흐름

## 5.1 Auth (core/auth.js)

* login()
* refreshToken()
* token cache 관리

👉 인증 전담



## 5.2 Request (core/request.js)

* HTTP 요청 wrapper
* Authorization header 자동 추가
* 401 발생 시 refresh 후 재시도

👉 모든 API 통신 중앙 관리



## 5.3 API Layer

```javascript
UserAPI.getUsers()
MenuAPI.createMenu()
```

👉 React service layer 구조와 동일



## 5.4 Scenario

```javascript
const users = UserAPI.getUsers().json();
UserAPI.changeStatus(users[0].id, "ACTIVE");
MenuAPI.createMenu({...});
```

👉 실제 사용자 행동 시뮬레이션



# 6. SLA 기준 (thresholds)

```javascript
export const thresholds = {
  http_req_duration: ["p(95)<500"],  // 95% 요청 500ms 이하
  http_req_failed: ["rate<0.01"],    // 에러율 1% 이하
};
```



# 7. 실행 방식

## 7.1 기본 실행

```bash
k6 run k6/scenarios/active.js
```



## 7.2 SLA 테스트 실행 (shell)

```bash
./run.sh
```

옵션:

```bash
VUS=50 DURATION=2m ./run.sh
```



## 7.3 Prometheus 연동 실행

```bash
./run-prom.sh
```



# 8. run.sh (실행 스크립트)

```bash
#!/bin/bash

export BASE_URL="http://localhost:8080"

k6 run \
  --vus 50 \
  --duration 2m \
  --env BASE_URL=$BASE_URL \
  k6/scenarios/active.js
```



# 9. Grafana + Prometheus 연동

## 9.1 metrics export

```bash
--out experimental-prometheus-rw
```



## 9.2 Grafana 주요 패널

| Metric      | PromQL                                                                |
| ----------- | --------------------------------------------------------------------- |
| RPS         | `rate(http_reqs[1m])`                                                 |
| Error Rate  | `rate(http_req_failed[1m])`                                           |
| p95 Latency | `histogram_quantile(0.95, rate(http_req_duration_bucket[1m]))`        |
| Avg Latency | `rate(http_req_duration_sum[1m]) / rate(http_req_duration_count[1m])` |



# 10. 테스트 유형

| Type        | 설명 |
|------------|------|
| SLA Test    | API 성능 기준 검증 (CI/CD gate) |
| Load Test   | 정상 트래픽 기준 성능 테스트 |
| Stress Test | 시스템 한계 부하 테스트 |
| Spike Test  | 트래픽 급증 상황 대응 테스트 |
| Soak Test   | 장시간 안정성 테스트 |



# 11. 현재 구조 평가

## ✔ 장점

* API / Auth / Scenario 분리 완료
* SLA 기준 존재
* refresh retry 구조 존재
* Prometheus 연동 가능 구조
* 실무 수준 아키텍처



## ⚠️ 개선 여지

* scenario 다양화 필요 (read/write 분리)
* token pool 구조 없음
* spike/stress 패턴 없음
* Grafana dashboard 일부 metric 보강 필요



# 12. 전체 요약

👉 현재 구조는:

> “개발 완료 후 SLA 검증 + 기본 부하 테스트 가능한 k6 프레임워크”



