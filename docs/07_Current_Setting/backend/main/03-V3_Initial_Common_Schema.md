# V3 — Initial Common Schema

## Purpose

애플리케이션의 공통 도메인(`menu`) 및 시스템 추적을 위한 감사 로그(`audit_logs`) 테이블을 생성하고, RBAC 운영에 필수적인 기본 역할(Role) 데이터를 초기화한다.

## Migration

`V3__init_common_schema.sql`

## Tables

### menu

| Column | Type | Constraint | Default |
| --- | --- | --- | --- |
| id | BIGINT | PK, AUTO_INCREMENT | - |
| name | VARCHAR(255) |  | - |
| price | INT | NOT NULL | - |

### audit_logs

| Column | Type | Constraint | Default |
| --- | --- | --- | --- |
| id | BIGINT | PK, AUTO_INCREMENT | - |
| action | VARCHAR(100) |  | - |
| created_at | DATETIME(6) |  | - |
| result | VARCHAR(255) |  | - |
| target_id | BIGINT |  | - |
| target_type | VARCHAR(255) |  | - |
| user_id | BIGINT |  | - |
| after_value | VARCHAR(255) |  | - |
| before_value | VARCHAR(255) |  | - |

## Inserted Data

### roles (기본 역할 삽입)

| name | description |
| --- | --- |
| `ADMIN` | Administrator (관리자) |
| `USER` | Normal User (일반 사용자) |

## Design Notes

### Audit Log (감사 로그) 설계

시스템의 보안과 운영 투명성을 위해 `audit_logs` 테이블을 도입했습니다. "누가(`user_id`), 언제(`created_at`), 무엇을(`target_type`, `target_id`), 어떻게(`action`, `before/after_value`)" 변경했는지 추적할 수 있도록 컬럼을 구성하여, 데이터 변경에 대한 히스토리 관리를 지원합니다.

### Base Role 초기화

권한 제어(RBAC)의 가장 뼈대가 되는 `ADMIN`과 `USER` 데이터를 스키마 생성 직후 바로 주입하여, 이후 진행될 `permissions` 매핑(V4)과 테스트 사용자 할당(V5)이 가능하도록 마이그레이션 순서를 구성했습니다.

## Migration Boundary

V2:
권한 매핑 테이블(`user_roles`, `role_permissions`) 생성

V3:
공통 엔티티(`menu`, `audit_logs`) 스키마 생성 및 기본 Role(`ADMIN`, `USER`) 데이터 삽입

V4:
시스템 기본 Permission 목록 생성 및 Role-Permission 관계 매핑

## Verification

| Item | Result |
| --- | --- |
| menu 테이블 생성 | ✅ |
| audit_logs 테이블 생성 | ✅ |
| roles 테이블에 ADMIN, USER 정상 삽입 | ✅ |

## 현재 사용 중인 Flyway, V3__init_common_schema.sql

[migration/V3__init_common_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/src/main/resources/db/migration/V3__init_common_schema.sql)