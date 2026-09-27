
# V1 — Initial Schema

## Purpose

사용자 인증/인가 시스템의 기본 Entity를 위한
초기 Database Schema를 생성한다.

## Migration

`V1__init_schema.sql`

## Tables

### users

| Column | Type | Constraint | Default |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | - |
| password | VARCHAR(255) | | - |
| username | VARCHAR(255) | UNIQUE | - |
| password_changed_at | DATETIME(6) | | - |
| status | ENUM | NOT NULL | ACTIVE |
| email | VARCHAR(255) | | - |

### roles

| Column | Type | Constraint | Default |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | - |
| name | VARCHAR(255) | NOT NULL, UNIQUE | - |
| description | VARCHAR(255) | | - |
| level | INT | NOT NULL | 10 |
| is_system | BOOLEAN | NOT NULL | FALSE |

### permissions

| Column | Type | Constraint | Default |
|---|---|---|---|
| id | BIGINT | PK, AUTO_INCREMENT | - |
| description | VARCHAR(255) | | - |
| name | VARCHAR(100) | NOT NULL, UNIQUE | - |

## Design Notes

### User Status

`ACTIVE`, `DELETED`, `DELETE_PENDING`, `SUSPENDED`를
사용하여 User lifecycle 상태를 관리한다.

### Role

`level`과 `is_system`을 통해 Role의 관리 특성을 표현한다.

## Migration Boundary

V1:
기본 Entity Table 생성

V2:
<!-- 실제 V2 내용 -->

## Verification

| Item | Result |
|---|---|
| users 생성 | ✅ |
| roles 생성 | ✅ |
| permissions 생성 | ✅ |
| Schema validation | ✅ |

## 현재 사용 중인 Flyway, V1__init_schema.sql
[migration/V1__init_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V1__init_schema.sql)


