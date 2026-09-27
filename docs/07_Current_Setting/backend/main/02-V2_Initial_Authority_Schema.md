# V2 — Initial Authority Schema

## Purpose

사용자(User), 역할(Role), 권한(Permission) 간의 다대다(N:M) 관계를 매핑하기 위한
중간 관계(Join) 테이블을 생성하여 RBAC(Role-Based Access Control) 권한 구조를 완성한다.

## Migration

`V2__init_authority_schema.sql`

## Tables

### user_roles

| Column | Type | Constraint | Default |
| --- | --- | --- | --- |
| user_id | BIGINT | PK (Composite), FK(users.id), NOT NULL | - |
| role_id | BIGINT | PK (Composite), FK(roles.id), NOT NULL | - |

### role_permissions

| Column | Type | Constraint | Default |
| --- | --- | --- | --- |
| role_id | BIGINT | PK (Composite), FK(roles.id), NOT NULL | - |
| permission_id | BIGINT | PK (Composite), FK(permissions.id), NOT NULL | - |

## Design Notes

### 다대다(N:M) 관계 매핑 (RBAC 구현)

User ↔ Role, Role ↔ Permission 구조는 본질적으로 N:M 관계입니다.
엔티티 테이블에 직접 ID를 넣지 않고 별도의 매핑 테이블을 두어 정규화된 RBAC 접근 제어의 뼈대를 구현했습니다.

### 복합 키 (Composite Primary Key)

관계 테이블에 의미 없는 단일 `id` (대리 키)를 두는 대신, `(user_id, role_id)` 및 `(role_id, permission_id)`를 묶어 복합 Primary Key로 설정했습니다.
이를 통해 동일한 사용자에게 동일한 역할이 두 번 부여되는 등의 중복 매핑 데이터를 원천적으로 차단합니다.

### 외래 키 (Foreign Key) 제약 조건 명시

`CONSTRAINT fk_user_roles_user` 등 외래 키 제약 조건을 명시적으로 선언했습니다.
이를 통해 참조하는 부모 데이터(`users`, `roles`, `permissions`)가 존재하지 않는 잘못된 권한 매핑을 데이터베이스 레벨에서 강제 방지(참조 무결성 보장)합니다.

## Migration Boundary

V1:
기본 독립 Entity Table(`users`, `roles`, `permissions`) 생성

V2:
각 Entity를 연결하는 관계 매핑 테이블(`user_roles`, `role_permissions`) 생성

V3:
공통 스키마 추가 및 기본 Role 데이터(ADMIN, USER) 삽입

## Verification

| Item | Result |
| --- | --- |
| user_roles 테이블 생성 | ✅ |
| role_permissions 테이블 생성 | ✅ |
| 복합 PK(Primary Key) 정상 등록 | ✅ |
| 부모 테이블을 향한 FK(Foreign Key) 제약 조건 확인 | ✅ |

## 현재 사용 중인 Flyway, V2__init_authority_schema.sql

[migration/V2__init_authority_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/src/main/resources/db/migration/V2__init_authority_schema.sql)