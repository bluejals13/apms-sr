좋습니다. 이 문서는 단순한 `k6 결과 보고서`가 아니라 **Capacity Planning Report**로 만드는 게 좋습니다.\
 핵심은 `RPS → Resource Saturation → Capacity Boundary → Scale-out Decision`이 하나의 논리로 이어지게 하는 것입니다.

 아래처럼 `apms-sr/docs/performance/capacity-planning.md` 정도로 두는 것을 추천합니다.

 # Capacity Planning & Load Test Report

 > APMS.SR의 현재 처리 용량을 측정하고, Application Instance 증가에 따른 처리량 변화와 Resource Saturation 지점을 분석하여 Scale-Out 기준을 정의한다.

---

 ## 1\. Document Information

 | Item | Value |
| --- | --- |
| Project | APMS.SR |
| Test Tool | k6 |
| Test Type | Load Test / Capacity Test |
| Environment | `<Local / EC2 / Cloud>` |
| Test Date | `<YYYY-MM-DD>` |
| Git Commit | `<COMMIT_SHA>` |
| Application Version | `<VERSION>` |
| Tester | `<NAME>` |

---

 # 2\. Purpose

 본 테스트의 목적은 단순히 APMS.SR의 최대 RPS를 측정하는 것이 아니다.

 다음 질문에 답하는 것을 목적으로 한다.

 1. 현재 단일 Application Instance가 안정적으로 처리할 수 있는 트래픽은 어느 정도인가?
2. 처리량 증가에 따라 CPU, Memory, DB Connection, Redis 등의 Resource는 어떻게 변화하는가?
3. 어느 시점부터 Latency 또는 Error Rate가 악화되는가?
4. 현재 Application Instance의 Capacity Boundary는 어디인가?
5. Application Instance를 2개, 3개로 증가시키면 처리 용량이 어떻게 변화하는가?
6. Scale-Out을 수행해야 하는 객관적인 기준은 무엇인가?

 최종적으로 다음과 같은 의사결정 기준을 확보한다.

```
Traffic
   ↓
Application Capacity
   ↓
Resource Saturation
   ↓
Performance Degradation
   ↓
Capacity Boundary
   ↓
Scale-Out Decision
```

---

 # 3\. Capacity Planning Principle

 Capacity는 **최대 RPS**가 아니라 **서비스 품질을 유지하면서 지속적으로 처리할 수 있는 부하 수준**으로 정의한다.

 예를 들어:

```
450 RPS
+
p95 < SLO
+
Error Rate < 1%
+
CPU < 80%
+
DB Connection < 80%
+
Memory < 80%
```

 를 만족한다면 450 RPS를 안정적인 Capacity 후보로 판단할 수 있다.

 반대로:

```
500 RPS
+
p95 급증
+
CPU 95%
+
DB Connection 98%
```

 이라면 단순히 "500 RPS를 처리했다"고 기록하지 않는다.

 이 경우 500 RPS는 **Capacity가 아니라 Saturation 영역**으로 분류한다.

---

 # 4\. System Under Test

 ## 4.1 Architecture

```
                         k6
                          │
                          │ HTTP
                          ▼
                       Nginx
                          │
                          ▼
                  Spring Boot App
                    │           │
                    │           │
                    ▼           ▼
                  MySQL       Redis
```

 Monitoring:

```
Spring Boot ──────┐
MySQL ────────────┤
Redis ────────────┤
Host Metrics ─────┤
                  ▼
              Prometheus
                  │
                  ▼
               Grafana
```

---

 # 5\. Test Environment

 ## 5.1 Infrastructure

 | Component | Specification |
| --- | --- |
| Host CPU | `<CPU>` |
| Host Memory | `<Memory>` |
| OS | `<OS>` |
| Docker | `<VERSION>` |
| Nginx | `<VERSION>` |
| JVM | `<VERSION>` |
| Spring Boot | `<VERSION>` |
| MySQL | `<VERSION>` |
| Redis | `<VERSION>` |
| k6 | `<VERSION>` |

---

 ## 5.2 Application Configuration

 | Configuration | Value |
| --- | --- |
| Application Instances | `<1>` |
| JVM Heap | `<VALUE>` |
| DB Pool Size | `<VALUE>` |
| DB Connection Limit | `<VALUE>` |
| Redis Configuration | `<VALUE>` |
| Nginx Worker | `<VALUE>` |

테스트 결과는 반드시 해당 Configuration과 함께 기록한다.

 Configuration이 변경되면 동일한 테스트라도 별도의 Test Run으로 취급한다.

---

 # 6\. Test Scenarios

 Capacity 측정은 단일 부하만 사용하는 것이 아니라 단계적으로 부하를 증가시키는 방식으로 수행한다.

 ## 6.1 Baseline

```
10 VU
   ↓
30 VU
   ↓
50 VU
   ↓
70 VU
   ↓
100 VU
```

 목적:

 - 정상적인 Resource Usage 확인
- Latency 변화 확인
- RPS 증가 패턴 확인
- 초기 Bottleneck 탐색

---

 ## 6.2 Saturation Test

 Baseline에서 안정적인 처리량이 확인되면 부하를 점진적으로 증가시킨다.

```
100 VU
   ↓
150 VU
   ↓
200 VU
   ↓
300 VU
   ↓
400 VU
```

 실제 VU 값은 Application의 특성과 이전 테스트 결과에 따라 조정한다.

 목적:

 - Capacity Boundary 탐색
- CPU Saturation 확인
- DB Connection Saturation 확인
- Latency Degradation 확인
- Error Rate 증가 지점 확인

---

 # 7\. k6 Test Design

 ## 7.1 Basic Test

```
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 70,
  duration: '3m',
};

export default function () {
  const response = http.get(
    `${__ENV.BASE_URL}/api/health`
  );

  check(response, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

 실제 Capacity Test에서는 Health Endpoint만 사용하는 것이 아니라 **실제 업무 흐름을 대표하는 API**를 사용해야 한다.

 예:

```
Login
    ↓
Authenticated Request
    ↓
Data Query
    ↓
Refresh Token
```

---

 # 8\. Workload Model

 실제 사용자 행동을 가능한 한 가깝게 모델링한다.

 예:

```
Virtual User

        Login
          │
          ▼
   Access Token 획득
          │
          ▼
Authenticated API
          │
          ▼
      Data Query
          │
          ▼
       Logout
```

 단일 Endpoint의 최대 RPS만 측정할 경우 실제 Application의 Capacity를 과대평가할 수 있으므로 주의한다.

---

 # 9\. Metrics

 Capacity Test에서는 RPS 하나만 기록하지 않는다.

 최소한 다음 Metric을 함께 수집한다.

 ## 9.1 Application Metrics

 - Requests Per Second
- Average Latency
- p50 Latency
- p95 Latency
- p99 Latency
- Error Rate
- HTTP 4xx
- HTTP 5xx

---

 ## 9.2 Host Metrics

 - CPU Utilization
- Memory Utilization
- Load Average
- Network Throughput
- Disk I/O

---

 ## 9.3 JVM Metrics

 - Heap Usage
- GC Activity
- Thread Count
- CPU Usage
- JVM Memory Pool

---

 ## 9.4 MySQL Metrics

 - Active Connections
- Connection Pool Usage
- Query Latency
- Slow Queries
- CPU
- Memory

---

 ## 9.5 Redis Metrics

 - Connected Clients
- Memory Usage
- Command Rate
- Command Latency
- CPU

---

 # 10\. Capacity Acceptance Criteria

 Capacity를 판단하기 위한 기준을 먼저 정의한다.

 예시:

 | Metric | Target |
| --- | --- |
| Error Rate | \< 1% |
| p95 Latency | \< 200ms |
| CPU | \< 80% |
| Memory | \< 80% |
| DB Connection Pool | \< 80% |
| Redis Memory | \< 80% |

위 기준은 예시이며 실제 Project SLO와 Infrastructure Specification에 따라 조정한다.

---

 # 11\. Test Result — Single Instance

 ## 11.1 Summary

 | VU | RPS | p95 | p99 | Error | CPU | Memory | DB Pool |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 10 | `<RPS>` | `<ms>` | `<ms>` | `<%>` | `<%>` | `<%>` | `<%>` |
| 30 | `<RPS>` | `<ms>` | `<ms>` | `<%>` | `<%>` | `<%>` | `<%>` |
| 50 | `<RPS>` | `<ms>` | `<ms>` | `<%>` | `<%>` | `<%>` | `<%>` |
| 70 | `<RPS>` | `<ms>` | `<ms>` | `<%>` | `<%>` | `<%>` | `<%>` |
| 100 | `<RPS>` | `<ms>` | `<ms>` | `<%>` | `<%>` | `<%>` | `<%>` |

---

 # 12\. Example Interpretation

 예를 들어 다음과 같은 결과가 나왔다고 가정한다.

 | VU | RPS | p95 | Error | CPU | DB Pool |
| --- | --- | --- | --- | --- | --- |
| 30 | 210 | 45ms | 0% | 35% | 25% |
| 50 | 340 | 61ms | 0% | 52% | 39% |
| 70 | 460 | 82ms | 0% | 68% | 55% |
| 100 | 590 | 210ms | 0.7% | 91% | 84% |
| 120 | 630 | 480ms | 4.2% | 97% | 96% |

이 경우 단순히:

 > Maximum RPS = 630

 이라고 결론 내리지 않는다.

 다음과 같이 해석한다.

```
70 VU
 ↓
460 RPS
 ↓
p95 82ms
CPU 68%
DB Pool 55%
Error 0%
 ↓
Stable
```

 반면:

```
100 VU
 ↓
590 RPS
 ↓
p95 210ms
CPU 91%
DB Pool 84%
Error 0.7%
 ↓
Saturation 시작
```

 따라서:

 > Single Instance의 안정적인 Capacity는 약 460 RPS 수준으로 판단하며, 590 RPS 부근부터 CPU 및 DB Connection Pool의 Saturation과 함께 Latency가 증가하기 시작했다.

 와 같이 결론을 내린다.

---

 # 13\. Capacity Boundary

 Capacity Boundary는 다음 조건을 만족하지 못하기 시작하는 지점으로 정의한다.

```
                 Capacity Boundary
                        │
                        ▼
          ┌─────────────────────────┐
          │                         │
          │ Error Rate > SLO        │
          │ OR                      │
          │ p95 > SLO              │
          │ OR                      │
          │ CPU > Threshold         │
          │ OR                      │
          │ DB Pool > Threshold     │
          │                         │
          └─────────────────────────┘
```

 현재 측정 결과:

```
Stable Capacity:
<XX RPS>

Saturation Begins:
<XX RPS>

Hard Failure:
<XX RPS>
```

---

 # 14\. Single Instance Capacity

 최종적으로 다음 형식으로 기록한다.

```
Single Application Instance

Stable Capacity
≈ <XX RPS>

Capacity Boundary
≈ <XX RPS>

Saturation Point
≈ <XX RPS>
```

 ### Interpretation

 > 단일 Application Instance는 `<XX RPS>` 수준까지 정의된 SLO와 Resource Threshold를 만족하며 안정적으로 처리할 수 있었다. `<YY RPS>`부터 CPU 및 Database Connection Pool 사용량이 증가하면서 p95 Latency가 악화되었으며, 이를 Capacity Boundary로 정의한다.

---

 # 15\. Multi-Instance Test

 Single Instance Capacity를 측정한 후 Application Instance를 증가시켜 Scale-Out 효과를 검증한다.

---

 ## 15.1 Two Instances

```
                    Load Generator
                          │
                          ▼
                    Load Balancer
                      │       │
                      ▼       ▼
                   App #1   App #2
                      │       │
                      └───┬───┘
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                  MySQL       Redis
```

 측정한다.

 | Metric | 1 Instance | 2 Instances |
| --- | --- | --- |
| Stable RPS | `<XX>` | `<YY>` |
| p95 | `<XX>` | `<YY>` |
| CPU / Instance | `<XX>` | `<YY>` |
| DB Connections | `<XX>` | `<YY>` |
| Error Rate | `<XX>` | `<YY>` |

---

 # 16\. Three Instance Test

 동일한 조건에서 Application Instance를 3개로 증가시킨다.

```
                    Load Balancer
                  /       |       \
                 ▼        ▼        ▼
              App #1   App #2   App #3
                 \        |        /
                  \       |       /
                   ▼      ▼      ▼
                      MySQL
                        │
                      Redis
```

 | Metric | 1 Instance | 2 Instances | 3 Instances |
| --- | --- | --- | --- |
| Stable RPS | `<X>` | `<Y>` | `<Z>` |
| p95 | `<X>` | `<Y>` | `<Z>` |
| Error Rate | `<X>` | `<Y>` | `<Z>` |
| CPU / Instance | `<X>` | `<Y>` | `<Z>` |
| DB Connections | `<X>` | `<Y>` | `<Z>` |

---

 # 17\. Scaling Efficiency

 Instance 증가가 항상 동일한 비율로 처리량을 증가시키지는 않는다.

 이를 Scaling Efficiency로 확인한다.

```
Scaling Efficiency

Measured Capacity
────────────────────────
Single Instance Capacity × Instance Count
```

 예:

```
1 Instance
500 RPS

2 Instances
900 RPS

Scaling Efficiency
900 / (500 × 2)
= 90%
```

 즉:

 > 2배의 Application Instance를 투입했지만 처리량은 1.8배 증가했으며, Scaling Efficiency는 약 90%였다.

 이 차이가 발생한 원인을 분석한다.

 가능한 원인:

 - Database bottleneck
- Redis bottleneck
- Connection Pool
- Network
- Load Balancer
- Shared Resource
- Lock Contention
- CPU overhead

---

 # 18\. Bottleneck Analysis

 Capacity Test 결과를 단순한 숫자로 끝내지 않고 Bottleneck을 식별한다.

 ## 18.1 CPU Bottleneck

```
RPS ↑
  ↓
CPU ↑
  ↓
CPU > 80%
  ↓
Latency ↑
```

 판단:

 > Application CPU가 주요 Bottleneck.

---

 ## 18.2 Database Bottleneck

```
RPS ↑
  ↓
DB Connections ↑
  ↓
Connection Pool Saturation
  ↓
Request Waiting
  ↓
Latency ↑
```

 판단:

 > Database 또는 Connection Pool이 주요 Bottleneck.

---

 ## 18.3 Redis Bottleneck

```
RPS ↑
  ↓
Redis Command Rate ↑
  ↓
Redis Latency ↑
  ↓
Application Latency ↑
```

 판단:

 > Redis가 Bottleneck일 가능성이 높음.

---

 # 19\. Bottleneck Decision Matrix

 | Symptom | Likely Bottleneck |
| --- | --- |
| CPU 90%+ / DB 정상 | Application CPU |
| DB Pool 90%+ | Database / Connection Pool |
| Redis Latency 증가 | Redis |
| Network Throughput Saturation | Network |
| p95 급증 / Resource 정상 | Lock / Queue / Dependency |
| RPS 증가 정체 | Shared Dependency |

최종 원인은 단일 Metric만으로 판단하지 않고 여러 Metric의 상관관계를 확인한다.

---

 # 20\. Scale-Out Decision

 Scale-Out은 다음 조건에 따라 판단한다.

 ### Trigger A — CPU

```
CPU > 80%
```

 ### Trigger B — Latency

```
p95 > SLO
```

 ### Trigger C — Error

```
Error Rate > SLO
```

 ### Trigger D — Database

```
DB Connection Pool > 80%
```

 단, Application을 Scale-Out한다고 모든 Bottleneck이 해결되는 것은 아니다.

 예:

```
App #1 ──┐
App #2 ──┼──→ MySQL
App #3 ──┘
             ↓
        DB Saturation
```

 이 경우 Application Instance를 계속 증가시켜도 전체 Capacity는 증가하지 않을 수 있다.

 따라서 **Scale-Out 판단은 Application뿐 아니라 Dependency Capacity를 함께 고려한다.**

---

 # 21\. Capacity Planning Model

 현재 측정 결과를 기반으로 예상 Capacity를 정의한다.

```
Traffic Forecast
       │
       ▼
Expected RPS
       │
       ▼
Required Capacity
       │
       ▼
Application Instances
       │
       ▼
Dependency Capacity
       │
       ▼
Final Architecture
```

 예:

```
Expected Traffic
      = 800 RPS

Single Instance
      = 460 RPS

Required Instances
      = ceil(800 / 460)
      = 2
```

 그러나 실제 운영에서는 여유 Capacity를 확보한다.

 예:

```
Target Traffic
= 800 RPS

Target Utilization
= 70%

Required Capacity
= 800 / 0.7
≈ 1,143 RPS

Single Instance
≈ 460 RPS

Required Instances
= ceil(1,143 / 460)
= 3
```

 따라서:

 > 예상 Traffic이 800 RPS인 환경에서는 단순 최소 Instance 수인 2개보다 3개를 운영하여 Resource Headroom을 확보하는 것이 적절하다.

---

 # 22\. Headroom

 Capacity Planning에서는 현재 Traffic만 고려하지 않는다.

 다음과 같은 여유 공간을 확보한다.

```
                Total Capacity
┌─────────────────────────────────┐
│                                 │
│        Available Headroom       │
│              30%                │
│                                 │
├─────────────────────────────────┤
│                                 │
│        Expected Traffic         │
│              70%                │
│                                 │
└─────────────────────────────────┘
```

 권장 초기 기준:

```
Normal Load
≤ 70% Capacity

Scale-Out Warning
≥ 70~80%

Saturation Risk
≥ 80%
```

 실제 기준은 Application의 특성에 따라 조정한다.

---

 # 23\. Test Reproducibility

 모든 Capacity Test는 재현 가능해야 한다.

 각 Test Run에 다음 정보를 저장한다.

```
Test ID
Test Date
Git Commit
Docker Image
Infrastructure
Configuration
k6 Script
VU
Duration
Warm-up
Result
Grafana Snapshot
```

 예:

```
CAP-001

Commit:
a81f92c

Configuration:
App=1
DB Pool=20
Redis=1

Load:
70 VU / 5m

Result:
460 RPS
p95=82ms
Error=0%
```

---

 # 24\. Test Run Naming

 권장 Naming:

```
CAP-001-single-10vu
CAP-002-single-30vu
CAP-003-single-50vu
CAP-004-single-70vu
CAP-005-single-100vu
CAP-006-single-saturation
CAP-007-two-instance-100vu
CAP-008-two-instance-saturation
CAP-009-three-instance-saturation
```

 이렇게 하면 PR-1A1의 Evidence와 연결하기 쉽다.

---

 # 25\. Evidence Mapping

 Capacity Test 결과는 Evidence로 관리한다.

 | Evidence | Description |
| --- | --- |
| EV-CAP-001 | Single Instance Baseline |
| EV-CAP-002 | Single Instance Capacity |
| EV-CAP-003 | Saturation Test |
| EV-CAP-004 | Two Instance Scaling |
| EV-CAP-005 | Three Instance Scaling |
| EV-CAP-006 | Bottleneck Analysis |

예:

```
Claim:
Single App Instance supports approximately <XX RPS
under defined SLO and resource thresholds.

Evidence:
EV-CAP-002

Test:
CAP-005-single-70vu

Commit:
<SHA>

Result:
<RESULT>
```

---

 # 26\. Final Capacity Report

 최종 결과는 다음 표로 요약한다.

 | Architecture | Stable Capacity | Saturation | p95 | Error Rate | Primary Bottleneck |
| --- | --- | --- | --- | --- | --- |
| 1 Instance | `<X>` RPS | `<Y>` RPS | `<X>` ms | `<X>%` | `<CPU/DB/etc>` |
| 2 Instances | `<X>` RPS | `<Y>` RPS | `<X>` ms | `<X>%` | `<CPU/DB/etc>` |
| 3 Instances | `<X>` RPS | `<Y>` RPS | `<X>` ms | `<X>%` | `<CPU/DB/etc>` |

---

 # 27\. Engineering Conclusion

 최종 결론은 단순한 성능 수치가 아니라 **Architecture Decision**으로 작성한다.

 예시:

 > 테스트 결과 단일 Application Instance는 약 460 RPS까지 정의된 SLO와 Resource Threshold를 만족하며 안정적으로 처리했다.
>
>  약 590 RPS부터 CPU 및 Database Connection Pool 사용량이 증가하면서 p95 Latency가 상승하기 시작했으며, 이를 Single Instance Capacity Boundary로 판단했다.
>
>  따라서 예상 Traffic이 약 800 RPS 수준으로 증가할 경우 단일 Instance의 지속적인 사용보다는 최소 2개 이상의 Application Instance를 Load Balancer 뒤에 배치하는 Scale-Out 구조를 검토해야 한다.
>
>  단, Application Instance를 증가시킬 경우 MySQL Connection Pool과 Database 처리 용량이 새로운 Bottleneck이 될 수 있으므로 Application Scale-Out과 함께 Database Capacity를 검증해야 한다.
>
>  Kubernetes 도입 여부는 Application Instance 증가 자체만으로 결정하지 않는다. Multi-Instance Deployment, Self-Healing, Rolling Deployment, Horizontal Scaling 등의 운영 요구사항이 실제로 발생하는 경우 Kubernetes 도입을 검토한다.

---

 # 28\. Next Experiments

 Capacity Test 이후 다음 실험을 수행한다.

```
CAPACITY
   │
   ├── Single Instance
   │      ├── Baseline
   │      └── Saturation
   │
   ├── Multi Instance
   │      ├── 2 Instances
   │      └── 3 Instances
   │
   ├── Dependency
   │      ├── MySQL Capacity
   │      └── Redis Capacity
   │
   └── Production Engineering
          ├── Failure Injection
          ├── Recovery
          ├── Backup / Restore
          └── Cloud Scale-Out
```

---

 # 29\. Final Principle

 APMS.SR의 Capacity Planning은 다음 원칙을 따른다.

 > **RPS를 측정하는 것이 목적이 아니다.**
>
>  **Traffic 증가가 Application과 Dependency Resource에 어떤 영향을 주는지 측정하고, 서비스 품질이 악화되기 시작하는 지점을 찾아 Scale-Out의 근거로 사용하는 것이 목적이다.**

 따라서 최종 결과는 다음과 같은 형태여야 한다.

```
70 VU
   ↓
460 RPS
   ↓
CPU 68%
DB Pool 55%
p95 82ms
Error 0%
   ↓
Stable Capacity
   ↓
~460 RPS
```

 그리고:

```
100 VU
   ↓
590 RPS
   ↓
CPU 91%
DB Pool 84%
p95 210ms
Error 0.7%
   ↓
Saturation
   ↓
Scale-Out Trigger
```

 최종적으로:

```
Current Traffic
       ↓
Measured Capacity
       ↓
Resource Headroom
       ↓
Capacity Boundary
       ↓
Scale-Out Decision
```

 이라는 연결을 확보한다.

 이 문서의 목적은 \*\*“APMS.SR은 460 RPS를 처리했다”\*\*를 주장하는 것이 아니라,

 **“왜 460 RPS를 현재의 안정적인 Capacity로 판단했으며, 어떤 Resource가 다음 병목이고, 어느 시점에 어떤 Architecture 변화가 필요한가”**

 를 재현 가능한 Evidence로 설명하는 것이다.