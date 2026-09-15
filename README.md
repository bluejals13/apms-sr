좋아. **기존 `README.md`의 방향은 유지하고**, `Read31me21.md`에서 필요한 내용만 흡수해서 **중복·과한 설명을 줄인 간단한 수정본**으로 잡으면 아래 정도가 좋습니다.

 README.md 수정본

# APMS.SR

 **Authentication & Permission Management System — Security & Reliability**

 인증(Authentication), 인가(Authorization), RBAC, Refresh Token Lifecycle을 중심으로 설계한 IAM 시스템입니다.

 단순 CRUD 구현보다 **보안 요구사항을 명확히 정의하고, 설계 → 구현 → 테스트 → 성능 측정 → 검증**까지 연결하는 것을 목표로 했습니다.

---

 ## 1\. What I Built

 - JWT 기반 Access Token 인증
- Refresh Token Rotation 및 Replay Detection
- Permission-Based RBAC
- User / Role / Permission / Menu 관리
- Audit Log
- Redis 기반 Token State 관리
- MySQL 기반 영속 데이터 관리
- Prometheus / Grafana 기반 모니터링
- Node Exporter / cAdvisor 기반 Infrastructure & Container Metrics
- k6 기반 Load / Stress Test

---

 ## 2\. Architecture

 현재 시스템은 **Monolithic Layered Architecture**로 구성했습니다.

```
                    Client
                      │
                 Nginx / Web
                      │
                React Frontend
                      │
                Spring Boot API
                      │
        ┌─────────────┴─────────────┐
        │                           │
      MySQL                       Redis
   Persistent Data          Token State / TTL
        │
        └─────────────┐
                      │
              Prometheus
                      │
                  Grafana
                      │
          ┌───────────┴───────────┐
          │                       │
    Node Exporter             cAdvisor
     Host Metrics          Container Metrics
```

 현재 규모에서는 Microservices를 도입하기보다 인증·인가·토큰 Lifecycle과 장애 대응을 하나의 시스템에서 일관되게 검증하는 데 집중했습니다.

---

 ## 3\. Authentication

```
Login
  ↓
Credential Validation
  ↓
Access Token + Refresh Token
  ↓
Access Token → API Authentication
Refresh Token → Token Renewal
```

 ### Access Token

 - JWT 기반
- API 요청 인증
- 짧은 만료 시간 적용

 ### Refresh Token

 Strict Rotation 방식을 적용합니다.

```
Refresh Request
      ↓
Validate Token
      ↓
Check Redis State
      ↓
Invalidate Current Token
      ↓
Issue New Refresh Token
      ↓
Store New Token State
```

 사용된 Refresh Token을 다시 사용하는 경우 **Replay Attack**으로 판단하며, 동일 Token Family에 대한 무효화를 수행합니다.

 Redis TTL을 이용하여 Token State의 Lifecycle도 관리합니다.

---

 ## 4\. Authorization / RBAC

 Permission-Based RBAC을 사용합니다.

```
User
  ↓
Role
  ↓
Permission
  ↓
Resource / Action
```

 예:

```
USER_CREATE
USER_READ
USER_UPDATE
USER_DELETE

ROLE_CREATE
ROLE_READ
ROLE_UPDATE
ROLE_DELETE
```

 인증(Authentication)과 인가(Authorization)를 분리하여 접근 제어를 구성했습니다.

---

 ## 5\. Data Architecture

 ### MySQL

 영속적인 비즈니스 및 IAM 데이터를 관리합니다.

 - User
- Role
- Permission
- Menu
- Audit Log

 ### Redis

 인증 상태와 Token Lifecycle을 관리합니다.

 - Refresh Token State
- Token Invalidation State
- TTL 기반 만료 관리

---

 ## 6\. Failure Handling

 외부 의존성 장애가 인증/인가 보안에 미치는 영향을 고려했습니다.

 주요 검토 대상:

 - MySQL 장애
- Redis 장애
- Authentication Failure
- Authorization Failure
- Token Replay
- Expired Token
- Invalid Token

 특히 Redis 장애 시 Token 상태를 신뢰할 수 없는 상황에서 \*\*보안상 허용보다 거부(Fail Closed)\*\*를 우선하는 방향으로 설계했습니다.

---

 ## 7\. Observability

```
Application
    ↓
Prometheus
    ↓
Grafana
```

 수집 범위:

 - Application Metrics
- JVM Metrics
- Host Metrics
- Container Metrics

 Infrastructure 측정에는 **Node Exporter**, Container 측정에는 **cAdvisor**를 사용합니다.

---

 ## 8\. Verification

 기능 구현뿐 아니라 실제 동작 여부를 검증했습니다.

 ### Security

 - JWT 검증
- Refresh Token Rotation
- Refresh Token Replay Detection
- Permission-Based Authorization
- 인증/인가 실패 처리

 ### Performance

 k6를 이용하여 Load / Stress Test를 수행하고 다음 지표를 확인합니다.

 - RPS
- p50
- p95
- p99
- Error Rate

 검증 결과와 테스트 방법은 별도 Verification / Performance 문서에서 관리합니다.

---

 ## 9\. Technical Decisions

 ### Monolith

 현재 시스템 규모에서는 분산 시스템의 복잡성보다 핵심 인증/인가 기능의 일관성과 검증에 집중하기 위해 Monolith를 선택했습니다.

 ### Redis

 Refresh Token과 Token Invalidation State를 빠르게 조회하고 TTL 기반 Lifecycle을 관리하기 위해 사용했습니다.

 ### Permission-Based RBAC

 Role 자체보다 실제 Permission을 기준으로 접근 제어를 수행하여 세밀한 권한 관리가 가능하도록 구성했습니다.

 ### JWT + Refresh Token

 Access Token은 API 인증에 사용하고, Refresh Token은 별도의 Lifecycle을 관리하여 인증 보안과 사용자 경험을 균형 있게 가져가는 구조로 설계했습니다.

---

 ## 10\. Scope & Limitations

 현재 범위에서는 다음 항목을 의도적으로 제외했습니다.

 - Microservices
- Kubernetes
- Kafka
- Redis Cluster / Sentinel
- Database Replication

 필요성이 발생하는 규모와 운영 조건을 기준으로 이후 확장할 수 있도록 구조를 구성했습니다.

---

 ## 11\. Documentation

 상세 설계와 검증 자료는 다음 문서에서 확인할 수 있습니다.

 - Architecture
- PRD
- ADR
- Reference
- Verification
- Performance
- Operations

 각 문서는 해당 영역의 Source of Truth로 관리합니다.

---

 ## 12\. Quick Start

```
git clone https://github.com/bluejals13/apms-sr.git
cd apms-sr
```

 Docker Compose 기반으로 애플리케이션을 실행할 수 있습니다.

 실행 방법과 환경 설정은 Operations 문서를 참고합니다.

---

 ## 13\. Project Goal

 이 프로젝트의 핵심은 단순히 \*\*"로그인과 권한 관리 기능을 구현했다"\*\*가 아닙니다.

 > **Requirement → Architecture → Implementation → Test → Measurement → Evidence → Verification**

 의 흐름을 통해 인증/인가 시스템을 설계하고, 실제 동작과 성능 및 보안 요구사항을 검증하는 것을 목표로 합니다.
