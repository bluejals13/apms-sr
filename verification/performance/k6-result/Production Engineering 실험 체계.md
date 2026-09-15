좋습니다. 지금까지 이야기한 방향을 **하나의 설계 문서로 바로 저장할 수 있는 형태**로 정리하겠습니다. 핵심은 `k6` 자체보다 **통제된 Infrastructure/OS/Runtime 환경에서 APMS.SR의 성능·용량·장애 특성을 실험하고 Evidence로 남기는 것**입니다.

 # APMS.SR Controlled Performance & Infrastructure Experiment Plan

 ## 1\. 문서 목적

 본 문서는 APMS.SR의 기존 k6 기반 성능 검증을 확장하여, 단순한 Load Test를 넘어 **통제된 Infrastructure / OS / Runtime 환경에서 성능, 자원 사용량, 용량 한계 및 장애 특성을 실험하고 검증하기 위한 계획**을 정의한다.

 현재 APMS.SR은 Spring Boot, MySQL, Redis, Nginx, Docker Compose, Prometheus/Grafana 및 k6를 사용하는 구조를 갖추고 있다.

 따라서 추가적인 애플리케이션 기능을 지속적으로 확장하기보다 다음 질문에 답할 수 있는 Production Engineering 실험 체계를 구축한다.

 > 동일한 Application과 Workload를 대상으로 Infrastructure와 Runtime 조건을 통제했을 때 시스템의 성능과 Reliability는 어떻게 변화하는가?

 본 문서에서 중요한 것은 특정 OS나 Infrastructure가 "무조건 더 빠르다"는 결론을 만드는 것이 아니다.

 **재현 가능한 환경을 구성하고, 하나의 변수를 통제하여 변경하면서 관찰 가능한 Evidence를 확보하는 것**을 목표로 한다.

---

 # 2\. Engineering Objective

 최종 목표는 다음과 같다.

```
Application
    ↓
Runtime
    ↓
Container
    ↓
Operating System
    ↓
Virtual Machine
    ↓
Host Hardware
    ↓
Workload
```

 각 계층을 명시적으로 관리하고 동일한 Workload를 반복 실행하여 다음을 측정한다.

 - Throughput
- Latency
- Error Rate
- CPU Utilization
- Memory Utilization
- Disk I/O
- Network I/O
- JVM behavior
- Database resource usage
- Redis resource usage
- Resource saturation point
- Recovery behavior
- Scale-out behavior

 최종적으로 다음과 같은 Engineering Statement를 만들 수 있어야 한다.

 > APMS.SR은 특정 Resource Envelope에서 어느 정도의 처리량과 지연시간을 안정적으로 제공하며, Resource가 제한되거나 Infrastructure 구성요소에 장애가 발생했을 때 어떤 방식으로 성능 저하와 Failure가 발생하는지 측정하고 검증하였다.

---

 # 3\. Scope

 ## 3.1 Application

 대상 Application은 APMS.SR이다.

 주요 구성:

```
Spring Boot
Spring Security
JPA
MySQL
Redis
Nginx
Docker
Prometheus
Grafana
k6
```

---

 ## 3.2 Infrastructure

 실험 Infrastructure는 단계적으로 확장한다.

```
Level 0
Local / Existing Environment

Level 1
Docker Resource Control

Level 2
Hyper-V Controlled VM

Level 3
OS / Runtime Tuning

Level 4
Multi-VM / Failure Experiment

Level 5
Cloud / Kubernetes
```

 Kubernetes와 Cloud는 초기 목표가 아니다.

 먼저 현재 환경에서 **Baseline → Constraint → Failure → Scale**을 검증한 뒤 필요성에 따라 확장한다.

---

 # 4\. Core Principle

 ## 4.1 One Variable at a Time

 실험에서는 가능한 한 하나의 독립 변수를 변경한다.

 예:

```
Fixed:
- Application
- JVM
- MySQL
- Redis
- k6 workload
- VM memory
- VM network
- Disk

Variable:
- CPU allocation
```

 또는:

```
Fixed:
- CPU
- Memory
- Application
- Workload

Variable:
- Operating System
```

 이를 통해 결과의 원인을 추론할 수 있도록 한다.

---

 # 5\. Experimental Stack

 전체 실험 구조는 다음과 같다.

```
                     Physical Host
                          │
                       Hyper-V
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
 Windows Server       Ubuntu Server      Other OS
        │                 │                 │
      Docker            Docker            Docker
        │                 │                 │
     APMS.SR           APMS.SR           APMS.SR
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                         k6
                          │
                     Measurements
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
       Throughput       Latency         Errors
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                       Evidence
```

---

 # 6\. Level 0 — Existing k6 Baseline

 가장 먼저 현재 환경에서 기존 k6 테스트를 기준선으로 고정한다.

 측정 항목:

```
RPS
p50
p90
p95
p99
Error Rate
CPU
Memory
DB Connection
Redis Usage
```

 기준 Workload 예:

```
50 VU
70 VU
100 VU
200 VU
```

 또는 실제 시스템 특성에 맞는 Arrival Rate 기반 시나리오를 사용할 수 있다.

 중요한 것은 이후 모든 실험이 동일한 Workload Definition을 재사용하는 것이다.

---

 # 7\. Level 1 — Docker Resource Control

 Host를 변경하지 않고 Container의 Resource Envelope를 변경한다.

 실험 변수:

```
CPU
Memory
PIDs
Network
```

 예:

```
1 CPU
2 CPU
4 CPU
8 CPU
```

 Memory:

```
512 MB
1 GB
2 GB
4 GB
```

 목적:

 > Application이 제한된 Resource에서 어떻게 degradation되는가?

 측정:

```
Resource
    ↓
Throughput
Latency
Error
```

 예상되는 결과 형태:

 | CPU | RPS | p95 | Error |
| --- | --- | --- | --- |
| 1 vCPU | - | - | - |
| 2 vCPU | - | - | - |
| 4 vCPU | - | - | - |
| 8 vCPU | - | - | - |

실제 결과를 기록한다.

---

 # 8\. Level 2 — Hyper-V Controlled Environment

 Hyper-V를 이용하여 동일한 Physical Host에서 재현 가능한 VM 환경을 구성한다.

 VM Configuration:

```
vCPU
vRAM
Virtual Disk
Virtual Network
Generation
CPU topology
```

 예:

```
VM-A
4 vCPU
8 GB RAM

VM-B
4 vCPU
8 GB RAM
```

 Application과 Workload는 동일하게 유지한다.

 목적:

 > Host 환경과 Application 환경을 분리하고 동일한 Resource Envelope를 재현한다.

---

 # 9\. Level 3 — Operating System Comparison

 실무적으로 비교 가치가 있는 OS를 선정한다.

 최소:

```
Windows Server
Ubuntu Server
```

 필요할 경우 추가 Linux distribution을 사용할 수 있다.

 중요한 것은 OS 개수가 아니라 실험 품질이다.

 각 VM은 가능한 한 동일한 조건으로 구성한다.

```
vCPU       = 4
RAM        = 8 GB
Disk       = 동일 조건
Network    = 동일 조건
JDK        = 동일
Application = 동일
MySQL      = 동일
Redis      = 동일
k6        = 동일
Workload  = 동일
```

 변수:

```
Operating System
```

---

 # 10\. OS Baseline

 OS별로 다음 환경을 기록한다.

 ## Windows Server

```
OS Version
Kernel / Build
Power Plan
CPU Scheduling
Memory Configuration
Storage Configuration
Network Configuration
Background Services
Security Software
Container Runtime
JDK
```

 ## Linux

```
Distribution
Kernel Version
CPU Governor
Scheduler
Memory Configuration
Swappiness
Transparent Huge Pages
IRQ / CPU Affinity
Storage Configuration
Network Configuration
Container Runtime
JDK
```

 모든 설정 변경은 실험 기록에 남긴다.

---

 # 11\. OS Tuning

 OS별로 기본 상태와 Tuned 상태를 구분한다.

```
OS Baseline
    ↓
Measurement
    ↓
OS Tuning
    ↓
Measurement
    ↓
Comparison
```

 예:

```
Ubuntu Default
Ubuntu Tuned

Windows Default
Windows Tuned
```

 주의:

 > Performance 실험을 위해 보안 기능이나 운영상 중요한 보호 기능을 비활성화한 경우, 이를 Production Best Practice로 간주하지 않는다.

 해당 설정은 오직 Controlled Performance Experiment Configuration으로 기록한다.

---

 # 12\. CPU Experiment

 CPU는 하나의 변수가 아니다.

 다음 요소를 구분한다.

```
CPU Core Count
CPU Frequency
CPU Allocation
CPU Quota
CPU Affinity
CPU Contention
CPU Scheduling
```

 따라서 실험을 분리한다.

 ## CPU Capacity

```
1 vCPU
2 vCPU
4 vCPU
8 vCPU
```

 측정:

```
RPS
p95
CPU %
Error %
```

 목표:

 > CPU가 더 이상 Throughput을 증가시키지 않는 Saturation Point를 찾는다.

---

 # 13\. CPU Frequency Experiment

 BIOS/UEFI 또는 Host Configuration을 통해 CPU Frequency 조건을 통제할 수 있다.

 예:

```
Baseline Frequency
Restricted Frequency
Turbo Enabled
Turbo Disabled
```

 단, Frequency 실험은 Core Count 실험과 별도로 수행한다.

 예:

```
4 cores @ Condition A
4 cores @ Condition B
```

 처럼 나머지 조건을 동일하게 유지한다.

 목적:

 > CPU frequency 변화가 APMS.SR의 latency 및 throughput에 미치는 영향을 확인한다.

---

 # 14\. BIOS / UEFI Configuration

 BIOS/UEFI는 실험 환경의 고정 조건 또는 독립적인 실험 변수로 관리한다.

 관리 가능한 예:

```
SMT
Turbo
C-State
P-State
Power Limit
CPU Core Enable/Disable
Memory Frequency
Virtualization
```

 BIOS 설정은 실험 시작 시점의 Configuration Snapshot으로 기록한다.

 예:

```
BIOS Profile:
APMS-SR-BENCHMARK-001

SMT: Enabled
Turbo: Disabled
C-State: ...
Power Limit: ...
Memory Frequency: ...
Virtualization: Enabled
```

 중요한 원칙:

 > BIOS 설정을 변경했다면 모든 이전 Benchmark와 동일한 결과로 간주하지 않는다.

 환경 Profile이 달라진 것이므로 새로운 Experiment Environment로 취급한다.

---

 # 15\. Memory Experiment

 Memory도 독립적인 실험 변수로 관리한다.

 예:

```
512 MB
1 GB
2 GB
4 GB
8 GB
```

 관찰:

```
Heap Usage
GC
RSS
Swap
OOM
Latency
Throughput
Error
```

 특히 JVM에서는:

```
Container Memory
JVM Xms
JVM Xmx
Native Memory
```

 를 구분한다.

 목적:

 > Memory pressure가 Application latency와 stability에 미치는 영향을 확인한다.

---

 # 16\. JVM Experiment

 동일한 JDK version을 기본값으로 유지한다.

 필요할 경우:

```
Heap Size
GC
JVM Flags
Thread Pool
Connection Pool
```

 을 실험 변수로 사용한다.

 중요한 원칙:

```
Infrastructure Experiment
≠
JVM Tuning Experiment
```

 둘을 동시에 변경하지 않는다.

---

 # 17\. Network Experiment

 Network도 Controlled Variable로 만든다.

 기본:

```
Bandwidth
Latency
Packet Loss
Jitter
```

 예:

```
0 ms
10 ms
30 ms
50 ms
100 ms
```

 Packet Loss:

```
0%
0.1%
1%
```

 등으로 실험할 수 있다.

 목적:

 > Network degradation이 Application latency와 failure behavior에 미치는 영향을 측정한다.

---

 # 18\. Storage / I/O Experiment

 MySQL과 Application의 Storage behavior를 관찰한다.

 측정:

```
Read IOPS
Write IOPS
Latency
Queue
Disk Utilization
```

 가능하다면:

```
Local Disk
Virtual Disk
Different Storage Configuration
```

 을 비교한다.

---

 # 19\. Performance Metrics

 모든 실험에서 가능한 한 동일한 Metric Set을 사용한다.

 ## Application

```
RPS
p50
p90
p95
p99
Error Rate
```

 ## CPU

```
Usage
Load
Throttling
Steal Time
```

 ## Memory

```
RSS
Heap
GC
Swap
OOM
```

 ## Database

```
Connections
Query Latency
CPU
Buffer / Cache
Lock
```

 ## Redis

```
Memory
Commands
Latency
Connection
```

 ## Network

```
Bandwidth
Latency
Packet Loss
```

---

 # 20\. k6 Workload Standardization

 k6는 단순한 실행 도구가 아니라 모든 실험의 Controlled Workload Generator로 취급한다.

 Workload Definition을 고정한다.

 예:

```
Scenario:
Authentication + Refresh + Protected API

Warm-up:
2 min

Measurement:
5 min

Cool-down:
1 min
```

 필요한 경우:

```
50 VU
100 VU
200 VU
500 VU
```

 를 별도 Scenario로 정의한다.

 중요:

 > Infrastructure를 변경할 때 Workload를 변경하지 않는다.

---

 # 21\. Warm-up

 JVM과 Application이 Cold Start 상태인지 Warm 상태인지에 따라 결과가 달라질 수 있다.

 따라서:

```
Start
 ↓
Warm-up
 ↓
Measurement
```

 구조를 사용한다.

 Warm-up 결과는 본 측정값에서 제외한다.

---

 # 22\. Repetition

 단일 실행 결과를 최종 결론으로 사용하지 않는다.

 가능하면 동일 조건에서 여러 번 반복한다.

 예:

```
Experiment A

Run 1
Run 2
Run 3
Run 4
Run 5
```

 그리고:

```
Mean
Median
p95
Variance
```

 등을 기록한다.

 특히 latency는 평균값 하나만으로 판단하지 않는다.

---

 # 23\. Performance Saturation

 실험의 핵심 결과 중 하나는 Saturation Point이다.

 예:

```
1 vCPU → 180 RPS
2 vCPU → 350 RPS
4 vCPU → 620 RPS
8 vCPU → 650 RPS
```

 해석:

```
1 → 2 → 4 vCPU
큰 증가

4 → 8 vCPU
작은 증가
```

 따라서:

 > 4 vCPU 이후 CPU scaling benefit이 감소한다.

 고 판단할 수 있다.

 이후 DB, Redis, Network, Lock, Connection Pool 등의 병목을 조사한다.

---

 # 24\. Failure Engineering

 Performance Experiment와 별도로 Failure Experiment를 수행한다.

 주요 실험:

```
Application Failure
Redis Failure
MySQL Failure
Network Failure
CPU Pressure
Memory Pressure
Disk Pressure
```

 각 실험은 다음 순서를 따른다.

```
Baseline
 ↓
Fault Injection
 ↓
Detection
 ↓
Impact
 ↓
Recovery
 ↓
Verification
```

---

 # 25\. Redis Failure Experiment

 예:

```
EXP-REDIS-001
```

 Baseline:

```
Redis Healthy
Refresh Success
```

 Fault:

```
Redis Container Stop
```

 관찰:

```
Refresh API
Application Log
HTTP Status
Latency
Frontend Behavior
```

 Recovery:

```
Redis Restart
```

 Verification:

```
Redis PING
Login
Refresh
Logout
```

 결과:

```
Impact
Recovery Time
Residual Risk
```

 를 기록한다.

---

 # 26\. Application Failure Experiment

 예:

```
EXP-APP-001
```

 Fault:

```
Backend Container Stop
```

 관찰:

```
Nginx
Health Check
HTTP Response
Monitoring
Alert
```

 Recovery:

```
Backend Restart
```

 Verification:

```
Health
Login
Refresh
Protected API
```

---

 # 27\. Database Failure Experiment

 예:

```
EXP-DB-001
```

 Fault:

```
MySQL Stop
```

 관찰:

```
Connection Pool
Timeout
HTTP Status
Application Log
Health Status
```

 Recovery:

```
MySQL Restart
```

 Verification:

```
DB Ready
Login
Query
Transaction
```

---

 # 28\. Refresh Token Failure Experiments

 현재 ADR-0005와 연결한다.

 ## Replay

```
RT_1
 ↓
Normal Refresh
 ↓
RT_2
 ↓
Reuse RT_1
```

 예상:

```
401
Replay Detection
Token Family Revocation
RT_2 unusable
```

---

 ## Concurrent Refresh

```
RT_1
 │
 ├── Request A
 ├── Request B
 ├── Request C
 └── Request D
```

 예상:

```
1 Success
N-1 Failure
```

 Redis 최종 상태를 확인한다.

 목표:

 > 동일 Refresh Token이 동시에 여러 번 Rotation되는 것을 방지한다.

---

 # 29\. Evidence Structure

 각 실험은 독립적인 Evidence ID를 가진다.

 예:

```
EV-K6-001
Baseline Performance

EV-CPU-001
CPU Capacity

EV-MEM-001
Memory Constraint

EV-OS-001
Windows vs Linux

EV-RTR-001
Refresh Token Replay

EV-RTR-002
Concurrent Refresh

EV-REDIS-001
Redis Failure

EV-APP-001
Application Failure

EV-DB-001
Database Failure
```

 각 Evidence는 다음 정보를 포함한다.

```
Experiment ID
Objective
Environment
Fixed Variables
Variable
Workload
Procedure
Expected Result
Observed Result
Metrics
Analysis
Conclusion
Limitations
Raw Data Location
```

---

 # 30\. Environment Manifest

 모든 실험은 Environment Manifest를 가진다.

 예:

```
experiment: EV-OS-001

host:
  cpu: "<CPU MODEL>"
  physical_cores: 8
  memory: "32GB"
  bios_profile: "APMS-BENCH-001"

hypervisor:
  type: "Hyper-V"
  version: "<VERSION>"

vm:
  vcpu: 4
  memory: "8GB"
  disk: "<CONFIG>"
  network: "<CONFIG>"

os:
  name: "Ubuntu"
  version: "<VERSION>"
  kernel: "<VERSION>"

runtime:
  docker: "<VERSION>"
  jdk: "<VERSION>"

application:
  spring_boot: "<VERSION>"
  mysql: "<VERSION>"
  redis: "<VERSION>"
  nginx: "<VERSION>"

workload:
  tool: "k6"
  vus: 100
  warmup: "2m"
  measurement: "5m"
```

 Windows 실험에서는 동일한 Manifest에서 OS 관련 부분만 변경한다.

---

 # 31\. OS Comparison의 목적

 OS 비교는 다음 질문에 답하기 위한 것이다.

 > 동일한 Resource Envelope와 동일한 APMS.SR Workload에서 OS 차이가 Application Performance 및 Resource Behavior에 어떤 영향을 주는가?

 비교 대상:

```
Windows Server
Ubuntu Server
```

 비교 항목:

```
CPU
Memory
Disk I/O
Network
Container Runtime
Application Latency
Throughput
Error Rate
Operational Complexity
```

 단순히 "어느 OS가 빠른가"를 결론으로 만들지 않는다.

 최종 판단에는:

```
Performance
Resource Efficiency
Container Ecosystem
Observability
Operational Tooling
Deployment Model
Maintainability
Security
```

 를 함께 고려한다.

---

 # 32\. Practical Production Decision

 실험 결과는 Production Deployment Decision으로 연결한다.

 예:

```
Windows Server
Performance:
...

Operational:
...

Container:
...

Conclusion:
...
```

```
Ubuntu Server
Performance:
...

Operational:
...

Container:
...

Conclusion:
...
```

 최종적으로:

```
Production Baseline
= Ubuntu Server
```

 와 같이 선택할 수 있다.

 중요한 것은 선택 결과보다 **선택 근거**다.

---

 # 33\. BIOS/Hardware와 Production Environment의 구분

 BIOS/UEFI 실험은 매우 상세한 환경 제어를 가능하게 하지만, 모든 Production Recommendation으로 직접 해석해서는 안 된다.

 예:

```
Turbo Disabled
```

 는:

```
Benchmark Reproducibility
```

 에는 유용할 수 있다.

 그러나:

```
Production Recommendation
```

 과 동일하지 않을 수 있다.

 따라서 다음 두 Profile을 분리한다.

```
Benchmark Profile
```

 과

```
Production-like Profile
```

---

 # 34\. Benchmark Profile

 목적:

 > 최대한 통제되고 재현 가능한 결과를 얻는다.

 가능한 설정:

```
Fixed CPU
Fixed Frequency
Fixed VM
Fixed OS
Fixed Background Process
Fixed Workload
```

---

 # 35\. Production-like Profile

 목적:

 > 실제 운영 환경에 가까운 결과를 얻는다.

 가능한 조건:

```
Normal CPU behavior
Normal OS services
Normal Security Software
Normal Container Runtime
Normal Monitoring
Normal Background Activity
```

 두 결과를 혼동하지 않는다.

---

 # 36\. 최종 Experiment Pipeline

 전체 프로젝트는 다음 순서로 진행한다.

```
Phase 1
Existing k6 Baseline
        ↓
Phase 2
Docker Resource Constraints
        ↓
Phase 3
Hyper-V Controlled VM
        ↓
Phase 4
Windows / Linux Comparison
        ↓
Phase 5
OS Tuning
        ↓
Phase 6
CPU / Memory / I/O / Network Experiments
        ↓
Phase 7
Failure Injection
        ↓
Phase 8
Multi-VM Scale-Out
        ↓
Phase 9
Cloud
        ↓
Phase 10
Kubernetes
```

 모든 단계를 반드시 수행해야 하는 것은 아니다.

 각 단계는 이전 단계에서 얻은 Engineering Question에 따라 확장한다.

---

 # 37\. What This Project Demonstrates

 최종적으로 이 실험 체계가 보여줘야 하는 것은 다음과 같다.

```
Application Development
        +
Infrastructure Control
        +
Performance Engineering
        +
Failure Engineering
        +
Observability
        +
Capacity Planning
        +
Operational Decision Making
```

 즉:

 > "Spring Boot 애플리케이션을 만들었다."

 에서 끝나는 것이 아니라,

 > **"동일한 서비스를 통제된 Infrastructure 환경에서 실행하고, Resource 제한과 OS 차이, Workload 증가 및 장애 주입에 따른 시스템의 변화를 측정하여 Production Architecture와 Resource Allocation에 대한 근거를 만들었다."**

 라는 Engineering Record를 구축한다.

---

 # 38\. Recommended Initial Scope

 처음부터 모든 실험을 구현하지 않는다.

 첫 번째 Milestone은 다음으로 제한한다.

```
M1

1. Existing k6 Baseline
2. Hyper-V VM
3. Ubuntu Server
4. Windows Server
5. 동일 Resource Envelope
6. 동일 k6 Workload
7. CPU / Memory / Network 측정
8. 3~5회 반복
9. 결과 비교
10. Evidence 작성
```

 그 다음:

```
M2

CPU Constraint
Memory Constraint
```

 그리고:

```
M3

Redis Failure
Application Failure
MySQL Failure
```

 이후:

```
M4

Multi-VM
Load Balancing
Scale-Out
```

 마지막으로 필요할 경우:

```
M5

Cloud
Kubernetes
```

 까지 확장한다.

---

 # 39\. Final Principle

 본 프로젝트에서 Infrastructure의 복잡성을 증가시키는 것이 목적이 아니다.

 목표는 다음 질문에 답할 수 있는 것이다.

```
현재 시스템은 어느 정도의 부하를 처리할 수 있는가?
        ↓
어떤 Resource가 병목인가?
        ↓
Resource를 증가시키면 얼마나 개선되는가?
        ↓
OS / Runtime 차이가 영향을 주는가?
        ↓
어떤 장애에서 어떻게 실패하는가?
        ↓
얼마나 빨리 복구되는가?
        ↓
언제 Scale-Out이 필요한가?
        ↓
Scale-Out 이후 어떤 Infrastructure가 적합한가?
```

 따라서 Kubernetes, Cloud, 여러 OS를 사용하는 것 자체를 목표로 하지 않는다.

 **측정 → 관찰 → 분석 → 판단 → 검증**의 반복 가능한 Engineering Process를 구축하는 것이 최종 목표다.

 이 문서를 기준으로 잡으면 **Hyper-V → Windows/Linux → Docker → k6 → Resource 제한 → OS 튜닝 → 장애 주입 → Scale-out**이 하나의 일관된 연구/포트폴리오 흐름으로 묶입니다. 특히 처음에는 **Windows Server vs Ubuntu Server + 동일 VM 사양 + 동일 k6 workload**까지만 해도 충분히 좋은 첫 번째 Evidence가 됩니다.