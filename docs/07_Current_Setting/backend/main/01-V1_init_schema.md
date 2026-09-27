
# V1 — Initial Schema

> Database Migration 변경 기록

---

## 1. Migration Identity

| 항목 | 값 |
| --- | --- |
| Version | V1 |
| Migration | `V1__init_schema.sql` |
| Status | CURRENT |
| Last Verified | 2026-09-27 |

---

## 2. Purpose

APMS-SR의 인증 및 인가 기능에서 사용할 핵심 기본 테이블(`users`, `roles`, `permissions`)을 초기 생성하고 기본 데이터 구조를 정의한다.

---

## 3. Scope

### Included

* `users` 테이블 생성 (사용자 정보)
* `roles` 테이블 생성 (사용자 역할)
* `permissions` 테이블 생성 (시스템 권한)

### Not Included

* User와 Role 간의 관계 테이블 설정 (V2에서 진행)
* Role과 Permission 간의 관계 테이블 설정 (V2에서 진행)
* 실제 초기 권한 및 사용자 데이터 삽입 (V3~V5에서 진행)
* JPA Entity 구현 및 Spring Security 인증/인가 흐름

---

## 4. Source of Truth

| 대상 | Source |
| --- | --- |
| Migration | `backend/src/main/resources/db/migration/V1__init_schema.sql` |
| 관련 설정 | `00_Glossary.md` (용어 및 기본 개념) |

## 현재 사용 중인 Flyway, V1__init_schema.sql
[migration/V1__init_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V1__init_schema.sql)


---

## 5. Change Summary

| Object | Action | Purpose |
| --- | --- | --- |
| `users` | CREATE | 시스템 사용자 기본 정보 및 상태 저장 |
| `roles` | CREATE | 시스템에서 사용하는 역할(Role) 저장 |
| `permissions` | CREATE | 시스템에서 수행할 수 있는 권한(Permission) 저장 |

---

## 6. Schema Changes

### 6.1 `users`

| Column / Element | Type | Constraint | Purpose |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | User 식별자 |
| `username` | `VARCHAR(255)` | NOT NULL, UNIQUE | 사용자 계정 식별 이름 |
| `password` | `VARCHAR(255)` | NOT NULL | 사용자 비밀번호 (Hash 값 저장) |
| `email` | `VARCHAR(255)` |  | 사용자 이메일 |
| `status` | `VARCHAR/ENUM` | NOT NULL | 사용자 현재 상태 (ACTIVE, DELETED 등) |
| `created_at` | `DATETIME(6)` |  | 데이터 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 데이터 최종 수정 시간 |

---

### 6.2 `roles`

| Column / Element | Type | Constraint | Purpose |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | Role 식별자 |
| `name` | `VARCHAR(255)` |  | Role 이름 (예: ADMIN, USER) |
| `level` | `INT` | NOT NULL, DEFAULT 10 | Role의 권한 레벨 |
| `is_system` | `BOOLEAN` |  | 시스템에서 기본 관리하는 Role 여부 |
| `created_at` | `DATETIME(6)` |  | 데이터 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 데이터 최종 수정 시간 |

---

### 6.3 `permissions`

| Column / Element | Type | Constraint | Purpose |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | Permission 식별자 |
| `name` | `VARCHAR(255)` |  | Permission 식별 이름 (예: USER_READ) |
| `description` | `VARCHAR(255)` |  | 사람이 읽고 이해하기 위한 권한 설명 |
| `created_at` | `DATETIME(6)` |  | 데이터 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 데이터 최종 수정 시간 |

---

## 7. Constraints

| Constraint | 대상 | 목적 |
| --- | --- | --- |
| PK | `users.id`, `roles.id`, `permissions.id` | 각 테이블의 데이터를 고유하게 식별 |
| UNIQUE | `users.username` | 동일한 사용자 이름 중복 생성 방지 |
| NOT NULL | `users.username`, `users.password`, `users.status`, `roles.level` | 시스템 구동 및 인증에 필수적인 데이터 누락 방지 |

---

## 8. Design Rationale

### 독립적인 엔티티 테이블 분리 생성

**Fact**

User, Role, Permission 테이블을 생성하되 서로 참조하는 Foreign Key(FK)나 연결 테이블을 V1에 포함하지 않았다.

**Rationale**

User와 Role, Role과 Permission은 모두 다대다(N:M) 관계이므로 중간 테이블이 필수적이다. 테이블 기본 구조 생성("그릇 만들기")과 관계 설정("그릇 연결하기")의 책임을 분리하여 Migration 이력을 명확히 관리하기 위함이다.

**Application Policy**

V1에서는 각 엔티티의 단일 관리만 가능하며, 실제 권한 검증 등은 V2에서 관계가 맺어진 후 작동한다.

---

### 비밀번호 저장 구조 설계

**Fact**

`password` 컬럼을 `VARCHAR(255)`로 설정하였다.

**Rationale**

사용자의 평문 비밀번호를 그대로 저장하지 않고, BCrypt 등의 해싱 알고리즘을 거친 길이가 긴 Hash 값을 저장하기 위해 충분한 길이의 문자열 타입으로 할당하였다.

**Application Policy**

Security 레이어에서 사용자 가입 및 로그인 시 평문 비밀번호를 해싱 및 대조하는 과정을 반드시 거쳐야 한다.

---

## 9. Migration Boundary

### This Migration

기본 엔티티 테이블(`users`, `roles`, `permissions`)의 독립적 스키마 생성 ("그릇 만들기")

### Previous Migration

해당 없음 (최초 Migration)

### Next Migration

V2 — Initial Authority Schema (생성된 테이블 간의 N:M 관계를 정의하는 `user_roles`, `role_permissions` 테이블 생성)

---

## 10. Verification

| Check | Expected | Actual | Result |
| --- | --- | --- | --- |
| `users`, `roles`, `permissions` 생성 확인 | 3개의 테이블이 DB에 생성되어야 함 | 테이블 생성됨 | ✅ |
| PK 할당 검증 | 각 테이블의 `id`가 Primary Key로 등록 | PK 정상 등록됨 | ✅ |
| `username` UNIQUE 확인 | 중복된 `username` 삽입 시 에러 발생 | UNIQUE 속성 적용됨 | ✅ |
| 관계 테이블 미포함 여부 확인 | 외래키 및 중간 테이블이 존재하지 않아야 함 | 독립 테이블로만 존재 | ✅ |

---

## 11. Impact

| 변경 대상 | 영향 영역 |
| --- | --- |
| Database Schema | 신규 프로젝트 데이터베이스 초기 뼈대 구축 완료 |
| Flyway History | `flyway_schema_history` 테이블에 V1 성공 이력 기록 |

---

## 12. Related Documents

* `00_Glossary.md` (Project Glossary)
* `02_V2__init_authority_schema.md` (Next Migration)

