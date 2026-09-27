# V6 — Add User Role Manage Permission

## Purpose

애플리케이션 계층(`UserAdminController.assignRoles()`)의 접근 제어를 담당하는 `@PreAuthorize("hasAuthority('USER_ROLE_MANAGE')")`를 지원하기 위해, 신규 권한(Permission)을 DB에 추가하고 관리자(ADMIN) 역할에 연결한다.

## Migration

`V6__add_user_role_manage_permission.sql`

## Inserted Data

### permissions (신규 권한 삽입)

| name | description |
| --- | --- |
| `USER_ROLE_MANAGE` | 사용자 역할 부여 |

### role_permissions (권한 매핑 추가)

| Role | 매핑된 신규 Permission | 삽입 방식 |
| --- | --- | --- |
| **ADMIN** | `USER_ROLE_MANAGE` | `JOIN`을 통한 동적 권한 매핑 |

## Design Notes

### 애플리케이션 보안 정책과 DB 데이터의 동기화

V6는 시스템이 진화하면서 "새로운 API 엔드포인트 보호가 필요할 때 DB를 어떻게 업데이트하는가"를 보여주는 대표적인 사례입니다. `UserAdminController`에 역할 부여 기능이 추가됨에 따라, 이를 인가(Authorization)하기 위한 `USER_ROLE_MANAGE` 권한을 DB에 명시적으로 추가하여 Spring Security의 `@PreAuthorize`와 매핑되도록 설계했습니다.

### 안전하고 유연한 권한 할당 쿼리

권한을 Role에 매핑할 때, `role_id`나 `permission_id`를 하드코딩하지 않고 두 테이블(`roles`, `permissions`)을 `JOIN`하여 식별자(name) 기반으로 매핑 데이터를 삽입했습니다. 이 방식은 각 데이터의 PK 값이 환경마다 다르더라도 안전하게 마이그레이션이 동작함을 보장합니다.

## Migration Boundary

V5:
로컬 개발 및 테스트를 위한 사용자(USER, ADMIN) 계정 초기화 및 Role 부여

V6:
특정 컨트롤러 로직(역할 부여) 보호를 위한 신규 Permission(`USER_ROLE_MANAGE`) 추가 및 ADMIN Role 매핑

## Verification

| Item | Result |
| --- | --- |
| permissions 테이블에 `USER_ROLE_MANAGE` 삽입 | ✅ |
| role_permissions에 ADMIN과 신규 권한의 관계 데이터 삽입 | ✅ |
| 애플리케이션 구동 시 `@PreAuthorize` 정상 동작 여부 지원 | ✅ |

## 현재 사용 중인 Flyway, V6__add_user_role_manage_permission.sql

[migration/V6__add_user_role_manage_permission.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/src/main/resources/db/migration/V6__add_user_role_manage_permission.sql)