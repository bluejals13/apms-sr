# V4 — Insert Permissions & Role Mapping

## Purpose

시스템 운영에 필요한 기본 권한(Permission) 목록을 일괄 등록하고, 사전에 정의된 역할(ADMIN, USER)의 성격에 맞게 권한을 매핑하여 RBAC(역할 기반 접근 제어)의 실질적인 정책을 완성한다.

## Migration

`V4__insert_permissions.sql`

## Inserted Data

### permissions (권한 목록 삽입)

| Domain | Permissions (`name`) |
| --- | --- |
| **USER** | `USER_READ`, `USER_STATUS_UPDATE`, `USER_DELETE` |
| **ROLE** | `ROLE_READ`, `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`, `ROLE_ASSIGN` |
| **MENU** | `MENU_READ`, `MENU_CREATE`, `MENU_UPDATE`, `MENU_DELETE` |
| **PERMISSION** | `PERMISSION_READ` |

### role_permissions (권한 매핑 정책)

| Role | 매핑된 Permission | 부여 방식 |
| --- | --- | --- |
| **ADMIN** | 시스템 내 **모든** 권한 | `CROSS JOIN`을 통한 전체 매핑 |
| **USER** | `USER_READ`, `MENU_READ` | 지정된 읽기(Read) 권한만 선택적 매핑 |

## Design Notes

### ADMIN 권한 할당의 효율성 (CROSS JOIN 활용)

최고 관리자인 `ADMIN`에게 권한을 하나씩 명시적으로 하드코딩하여 부여하지 않고, `CROSS JOIN`을 활용해 등록된 모든 Permission을 일괄 할당했습니다. 이를 통해 이후 새로운 권한이 추가되더라도 쿼리 수정 없이 관리자 권한을 누락 없이 보장할 수 있도록 유지보수성을 높였습니다.

### 최소 권한의 원칙 (Principle of Least Privilege)

일반 `USER`에게는 시스템의 데이터를 변경할 수 있는 생성/수정/삭제 권한을 제외하고, 필요한 최소한의 조회 권한(`USER_READ`, `MENU_READ`)만을 제한적으로 매핑하여 보안의 기본 원칙을 지켰습니다.

## Migration Boundary

V3:
공통 엔티티 스키마 생성 및 기본 Role(`ADMIN`, `USER`) 데이터 삽입

V4:
시스템 기본 Permission 목록 생성 및 Role-Permission 관계 매핑 (RBAC 정책 적용)

V5:
로컬 개발 및 테스트를 위한 USER, ADMIN 계정 초기화 및 Role 부여

## Verification

| Item | Result |
| --- | --- |
| permissions 테이블에 기본 권한 13개 삽입 | ✅ |
| ADMIN 역할에 모든 Permission 매핑 | ✅ |
| USER 역할에 지정된 2개 Permission 매핑 | ✅ |

## 현재 사용 중인 Flyway, V4__insert_permissions.sql

[migration/V4__insert_permissions.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/src/main/resources/db/migration/V4__insert_permissions.sql)