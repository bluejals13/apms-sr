
# 🛡️ APMS.SR

> **Authentication & Privilege Management System**
>
> 인증·인가를 중심으로 보안, 데이터, 성능, 운영까지 직접 설계하고 검증한 Spring Boot 기반 Full-Stack Web Application

---

## 1. Why APMS.SR?

인증 기능을 구현하는 것만으로는 실제 시스템의 품질을 설명하기 어렵다고 판단했습니다.

APMS.SR은 다음 질문까지 검증하는 것을 목표로 설계했습니다.

* 요구사항이 명확하게 정의되어 있는가?
* 설계 결정에 근거가 있는가?
* 설계와 실제 구현이 일치하는가?
* 인증·인가 정책이 공격 및 예외 상황에서도 유지되는가?
* 데이터와 인증 상태의 책임이 적절하게 분리되어 있는가?
* 장애 상황에서 시스템의 동작을 설명할 수 있는가?
* 성능을 실제 실행 결과로 측정할 수 있는가?
* 테스트와 실행 결과를 재현 가능한 증거로 남길 수 있는가?

따라서 프로젝트의 개발 흐름을 다음과 같이 정의했습니다.

```text
Requirement
    ↓
Architecture / Design Decision
    ↓
Implementation
    ↓
Test
    ↓
Execution / Measurement
    ↓
Evidence
    ↓
Verification
```

---

# 2. What I Built

APMS.SR은 사용자 인증(Authentication), 인가(Authorization), IAM, Token Lifecycle을 중심으로 구성된 웹 서비스입니다.

주요 영역은 다음과 같습니다.

| 영역              | 주요 기능                                                  |
| --------------- | ------------------------------------------------------ |
| Authentication  | Login / Logout / Token Refresh                         |
| Authorization   | Permission-Based RBAC                                  |
| IAM             | User / Role / Permission / Menu                        |
| Token Lifecycle | Access Token / Refresh Token / Rotation / Invalidation |
| Audit           | 시스템 및 변경 이력 관리                                         |
| Persistence     | User / Role / Permission 관계 데이터 관리                     |
| Infrastructure  | Nginx / Docker Compose / MySQL / Redis                 |
| Observability   | Prometheus / Grafana                                   |
| Performance     | k6 기반 부하 및 성능 검증                                       |

---

# 3. System Architecture

현재 시스템은 **Microservices가 아닌 Monolithic Layered Architecture**를 채택합니다.

현재 프로젝트 규모에서는 서비스 분리 자체보다 Authentication, Authorization, Security, Performance, Failure Handling 및 Observability를 하나의 시스템에서 깊게 검증하는 것이 더 중요한 문제라고 판단했습니다.

```text
                         Client
                            │
                            ▼
                    ┌──────────────┐
                    │    Nginx     │
                    │ Reverse Proxy│
                    └──────┬───────┘
                           │
                           ▼
                ┌─────────────────────┐
                │   Spring Boot       │
                │      Backend        │
                │                     │
                │ ┌─────┐ ┌────────┐ │
                │ │ Auth│ │  IAM   │ │
                │ └─────┘ └────────┘ │
                └─────────┬───────────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
              MySQL              Redis
           Persistent Data      Token State

                Spring Boot
                     │
                     ▼
                Prometheus
                     │
                     ▼
                  Grafana
```

### 주요 실행 구성

| Component   | Responsibility                   |
| ----------- | -------------------------------- |
| React       | Web Frontend                     |
| Nginx       | Reverse Proxy / Entry Point      |
| Spring Boot | Application / Security / IAM     |
| MySQL       | Persistent Domain Data           |
| Redis       | Short-lived Authentication State |
| Prometheus  | Metrics Collection               |
| Grafana     | Metrics Visualization            |

상세 구조:

* [System Context](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/system-context.md)
* [Architecture Overview](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/architecture-overview.md)
* [Container Architecture](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/container.md)
* [Component Architecture](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/component.md)

---

# 4. Key Engineering Problems

## 4.1 Authentication

### Problem

API 요청마다 서버 세션에 의존하지 않으면서 Frontend와 Backend 사이의 인증 상태를 전달해야 했습니다.

### Decision

**HS256 기반 JWT Access Token**을 사용합니다.

Access Token의 기본적인 Signature / Expiration / Claim 검증은 Stateless하게 수행하고, 즉시 무효화가 필요한 경우 별도의 서버 측 상태를 사용합니다.

현재 단일 Backend Application 구조에서는 RS256을 위한 별도의 공개키 배포 및 Key Management를 추가하지 않고 HS256을 선택했습니다.

### Flow

```text
Login
  ↓
AuthService
  ↓
JwtProvider
  ↓
Access Token + Refresh Token
  ↓
Client
```

상세:

* [Authentication Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/authentication-flow.md)
* [ADR-0004 JWT](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0004-jwt.md)

---

# 5. Refresh Token Lifecycle

## Problem

Refresh Token이 탈취된 상태에서 계속 재사용될 경우 공격자가 Token 만료 시점까지 새로운 Access Token을 발급받을 수 있습니다.

또한 동시 Refresh 요청이 발생하면 정상적인 요청과 Replay 요청을 구분하면서 상태 정합성을 유지해야 합니다.

## Decision

**Redis + Strict Refresh Token Rotation**을 사용합니다.

```text
Refresh Request
      ↓
Validate Refresh Token
      ↓
Check Redis State
      ↓
Invalidate Current Token
      ↓
Issue New Refresh Token
      ↓
Store New Token State
```

사용이 완료된 Refresh Token은 단순히 삭제하지 않고 invalidated 상태를 별도로 보존하여 동일 JTI의 재사용을 Replay로 탐지할 수 있도록 구성합니다.

동일 Token Family에서 Replay가 탐지되면 해당 Family의 인증 상태를 Revoked 처리합니다.

### Responsibility

```text
Frontend
 └─ 중복 Refresh 요청 최소화

Backend
 └─ Rotation / Replay Detection의 보안 보장

Redis
 └─ Token State / TTL / Invalidation State
```

상세:

* [Authentication Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/authentication-flow.md)
* [Data Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/data-flow.md)
* [ADR-0003 Redis](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0003-redis.md)
* [ADR-0005 Refresh Token Rotation](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0005-refresh-token-rotation.md)

---

# 6. Authorization / RBAC

## Problem

단순히 `ADMIN`, `USER`와 같은 Role 자체를 API 코드에서 검사하면 역할이 증가할수록 권한 정책과 애플리케이션 코드의 결합도가 높아질 수 있습니다.

## Decision

**Permission-Based RBAC**

```text
User
  ↓
Role
  ↓
Permission
  ↓
Authorization Decision
  ↓
Protected Resource
```

예:

```java
@PreAuthorize("hasAuthority('USER_CREATE')")
```

Role은 비즈니스상의 역할을 표현하고, 실제 Endpoint 접근 제어는 Permission을 기준으로 수행합니다.

따라서 기존 Permission으로 표현할 수 있는 정책 변경은 API 코드를 수정하지 않고 Role-Permission 관계 변경으로 대응할 수 있습니다.

### Data Model

```text
User
 └── User ↔ Role
              └── Role ↔ Permission
```

Role-Permission 관계의 Source of Truth는 MySQL입니다.

상세:

* [Authorization Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/authorization-flow.md)
* [Data Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/data-flow.md)
* [ADR-0006 RBAC](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0006-rbac.md)

---

# 7. Data Architecture

APMS.SR은 데이터의 성격에 따라 MySQL과 Redis의 책임을 분리합니다.

```text
MySQL
 ├── User
 ├── Role
 ├── Permission
 ├── User ↔ Role
 └── Role ↔ Permission

Redis
 ├── Refresh Token State
 └── Token Invalidation State
```

## MySQL

MySQL은 장기적으로 유지되어야 하는 영속 데이터를 담당합니다.

특히 User / Role / Permission 관계를 관계형 모델로 관리하고 Transaction 및 데이터 무결성 제약을 활용합니다.

현재는 Primary / Replica 구조를 도입하지 않고 단일 MySQL을 사용합니다.

## Redis

Redis는 짧은 수명과 빠른 상태 변경이 필요한 인증 상태를 담당합니다.

Native TTL을 이용하여 Token State의 lifecycle을 관리하고, MySQL의 영속 데이터와 인증 상태를 분리합니다.

현재 프로젝트 규모에서는 Redis Cluster / Sentinel을 추가하지 않습니다.

상세:

* [Data Flow](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/data-flow.md)
* [ADR-0002 Database](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0002-database.md)
* [ADR-0003 Redis](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0003-redis.md)

---

# 8. Failure Handling

시스템의 정상 흐름뿐 아니라 주요 장애 지점도 설계 범위에 포함했습니다.

```text
Client
  │
  ▼
Nginx
  │
  ▼
Backend
 ├───────────────┐
 ▼               ▼
MySQL           Redis
 │               │
IAM Data      Token State
```

주요 검토 대상:

* Application Failure
* MySQL Failure
* Redis Failure
* Authentication Failure
* Authorization Failure
* Token Invalidation Failure
* External Request / Network Failure

특히 Redis 장애는 단순한 Infrastructure 장애가 아니라 Authentication / Token Lifecycle에 직접 영향을 주므로 별도의 보안 요구사항으로 관리합니다.

상세:

* [Failure Topology](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/failure-topology.md)
* [Redis Failure Requirement](https://github.com/bluejals13/SA-1/tree/main/docs/01-prd/security/PRD-SEC-005-Redis-Failure.md)

---

# 9. Verification

APMS.SR의 핵심은 기능 구현 자체가 아니라 **실제 동작을 검증하고 결과를 증거로 남기는 것**입니다.

### Verification Areas

| Area           | Verification                         |
| -------------- | ------------------------------------ |
| Authentication | Login / Logout / Refresh             |
| Authorization  | RBAC / Permission 접근 제어              |
| Refresh Token  | Rotation / Replay Detection          |
| Redis          | Token State / TTL / Invalidation     |
| Database       | Schema / Relationship / Migration    |
| Security       | 인증 실패 / 권한 거부 / Token 재사용            |
| Failure        | Redis 및 주요 의존성 장애 상황                 |
| Performance    | k6 Load / Stress Test                |
| Observability  | Application / Infrastructure Metrics |

### Verification Flow

```text
Requirement
    ↓
Test Scenario
    ↓
Execution
    ↓
Observed Result
    ↓
Evidence
    ↓
Verification
```

테스트 및 실행 결과의 상세 내용은 Repository의 검증 문서에서 확인할 수 있습니다.

---

# 10. Performance & Observability

## Performance

단순히 "부하 테스트를 실행했다"가 아니라 동일한 조건에서 측정 가능한 지표를 기준으로 성능을 검증합니다.

주요 지표:

```text
RPS
p50
p95
p99
Error Rate
CPU
Memory
DB / Redis 영향
```

k6 기반 Load / Stress Test를 통해 Baseline 및 최적화 결과를 비교할 수 있는 구조를 구성했습니다.

## Observability

```text
Spring Boot
    │
    ├── Application Metrics
    │
    ▼
Prometheus
    │
    ▼
Grafana
```

주요 관찰 대상:

* JVM
* Request Count
* Response Time
* Application Health
* Host / Container Metrics
* Redis / Database 관련 상태

상세:

* [Performance](https://github.com/bluejals13/SA-1/tree/main/docs/performance/k6-load-test.md)
* [Architecture](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture/architecture-overview.md)

---

# 11. Technical Decisions

주요 기술은 단순히 "사용한 기술"이 아니라 요구사항과 Trade-off를 기준으로 선택했습니다.

| Problem                  | Decision              | Reason                          |
| ------------------------ | --------------------- | ------------------------------- |
| Application Architecture | Monolithic Layered    | 현재 규모에서 복잡도 최소화 + 통합 검증         |
| Persistent Data          | MySQL                 | IAM 관계 모델 / 무결성 / Transaction   |
| Authentication           | HS256 JWT             | Stateless 검증 + 현재 단일 Backend 구조 |
| Token State              | Redis                 | TTL / Low Latency / 상태 분리       |
| Refresh Security         | Strict RTR            | Replay Detection                |
| Authorization            | Permission-Based RBAC | Role과 Permission 분리             |
| Runtime                  | Docker Compose        | 재현 가능한 실행 환경                    |
| Entry Point              | Nginx                 | 외부 요청 진입점 및 Reverse Proxy       |
| Metrics                  | Prometheus            | Runtime Metrics 수집              |
| Visualization            | Grafana               | 운영 상태 확인                        |
| Performance              | k6                    | 실제 HTTP 부하 측정                   |

상세 의사결정은 ADR에서 확인할 수 있습니다.

* [ADR-0001 Architecture](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0001-architecture.md)
* [ADR-0002 Database](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0002-database.md)
* [ADR-0003 Redis](docs/03-adr/0003-redis.md)
* [ADR-0004 JWT](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0004-jwt.md)
* [ADR-0005 Refresh Token Rotation](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0005-refresh-token-rotation.md)
* [ADR-0006 RBAC](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr/0006-rbac.md)

---

# 12. Scope & Limitations

현재 프로젝트의 핵심 범위는 다음과 같습니다.

* Full-Stack Web Application
* Authentication / Authorization
* IAM
* JWT Access Token
* Refresh Token
* Refresh Token Rotation
* Token Replay 방어
* RBAC
* MySQL
* Redis
* Docker / Docker Compose
* Nginx
* CI/CD
* Security Verification
* Performance Verification
* Observability

반대로 현재 단계에서 의도적으로 도입하지 않은 기술도 있습니다.

* Microservices
* Kubernetes
* Kafka / Message Broker
* Redis Cluster / Sentinel
* Database Replica

이는 기술 수준을 보여주기 위한 기술 도입을 피하고, 실제 요구사항과 측정 가능한 문제가 발생했을 때 별도의 설계 결정으로 확장하기 위한 것입니다.

아키텍처 변경이 필요한 경우 기존 ADR을 덮어쓰지 않고 새로운 ADR로 변경 이유와 영향을 기록합니다.

---

# 13. Documentation

APMS.SR의 문서는 하나의 README에 모든 내용을 중복해서 기록하지 않고 역할별로 분리합니다.

| Layer        | Responsibility             | Documentation                           |
| ------------ | -------------------------- | --------------------------------------- |
| Overview     | 프로젝트 목적 / 범위               | [00-overview](https://github.com/bluejals13/SA-1/tree/main/docs/00-overview)         |
| PRD          | 요구사항 / Acceptance Criteria | [01-prd](https://github.com/bluejals13/SA-1/tree/main/docs/01-prd)                   |
| Architecture | 시스템 구조 / Flow              | [02-architecture](https://github.com/bluejals13/SA-1/tree/main/docs/02-architecture) |
| ADR          | 설계 의사결정                    | [03-adr](https://github.com/bluejals13/SA-1/tree/main/docs/03-adr)                   |
| Security     | 인증 / 인가 정책                 | [Security](https://github.com/bluejals13/SA-1/tree/main/docs/reference/security.md)  |
| Performance  | 부하 / 성능 검증                 | [k6](docs/performance/k6-load-test.md)  |
| Operations   | 실행 / 운영 / 장애 대응            | [Operations](docs/operations)           |

### Documentation Principle

```text
README
 └─ 프로젝트의 전체 그림과 핵심 판단

Architecture
 └─ 시스템 구조와 흐름

Reference
 └─ 현재 시스템의 기준 상태

PRD
 └─ 무엇을 만족해야 하는가

ADR
 └─ 왜 이렇게 결정했는가

Verification
 └─ 실제로 동작했는가

Operations
 └─ 어떻게 실행하고 운영하는가
```

문서 간 동일한 내용을 복사하지 않고 Source of Truth를 기준으로 참조하는 것을 원칙으로 합니다.

---

# 14. Quick Start

## Prerequisites

* Docker
* Docker Compose
* Java 17+
* Node.js

## Run

```bash
git clone https://github.com/bluejals13/apms-sr.git
cd apms-sr

docker compose up -d
```

실행 전 환경 변수 및 설정이 필요한 경우 프로젝트의 실행 문서를 확인하십시오.

상세 실행 절차:

* [Quick Start](docs/02_Quick_Start.md)

---

# 15. Service Endpoints

로컬 Docker Compose 환경 기준 주요 서비스입니다.

| Service          | Endpoint                                |
| ---------------- | --------------------------------------- |
| Frontend         | `http://localhost`                      |
| Backend API Docs | `http://localhost:8080/swagger-ui.html` |
| Grafana          | `http://localhost:3000`                 |
| Prometheus       | `http://localhost:9090`                 |

> 실제 접근 주소와 인증 정보는 현재 환경 설정을 기준으로 확인하십시오. Repository에 비밀번호 등의 Secret을 저장하지 않습니다.

---

# 16. API

주요 API 영역:

```text
/api/auth/*
/api/users/*
/api/roles/*
/api/permissions/*
/api/menus/*
/api/audit/*
```

상세 API 계약은 Swagger 및 Backend 문서를 기준으로 확인합니다.

---

# 17. Repository Structure

```text
.
├── backend/
│   └── Spring Boot Application
│
├── frontend/
│   └── React / Vite Application
│
├── nginx/
│   └── Reverse Proxy Configuration
│
├── k6/
│   └── Performance Test
│
├── monitoring/
│   ├── prometheus/
│   └── grafana/
│
├── docs/
│   ├── 00-overview/
│   ├── 01-prd/
│   ├── 02-architecture/
│   ├── 03-adr/
│   ├── reference/
│   ├── performance/
│   └── operations/
│
└── docker-compose.yml
```

---

# 18. Project Summary

APMS.SR은 단순히

> `Spring Boot + React + JWT + Redis + MySQL`

을 사용한 프로젝트가 아닙니다.

핵심은 다음의 전체 흐름을 하나의 프로젝트에서 연결한 것입니다.

```text
Problem
   ↓
Requirement
   ↓
Architecture
   ↓
Design Decision
   ↓
Implementation
   ↓
Test
   ↓
Runtime Execution
   ↓
Measurement
   ↓
Evidence
   ↓
Verification
```

**현재 단계에서 불필요한 분산 시스템을 추가하기보다, 인증·인가·토큰 lifecycle·데이터 정합성·장애·성능·운영 상태를 실제로 구현하고 측정하고 검증하는 것에 집중합니다.**

