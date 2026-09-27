
---

# RBAC Database Structure & API Specification

## 1. RBAC Database ERD (Entity-Relationship Diagram)

현재 구동 중인 APMS.SR 시스템의 사용자, 역할, 권한, 감사 로그의 데이터베이스 구조와 관계를 시각화한 ERD입니다.

```mermaid
erDiagram
    users {
        bigint id PK "사용자 식별자"
        varchar(255) username UK "로그인 식별자"
        varchar(255) password "암호화된 비밀번호"
        datetime(6) password_changed_at "비밀번호 변경 시각"
        enum status "ACTIVE, SUSPENDED, DELETE_PENDING, DELETED"
        varchar(255) email "이메일"
    }

    roles {
        bigint id PK "Role 식별자"
        varchar(255) name UK "Role 이름"
        varchar(255) description "Role 설명"
        int level "Role 권한 레벨 (기본 10)"
        tinyint(1) is_system "시스템 관리 Role 여부"
    }

    permissions {
        bigint id PK "Permission 식별자"
        varchar(100) name UK "권한 이름 (Authority)"
        varchar(255) description "권한 설명"
    }

    user_roles {
        bigint user_id PK, FK
        bigint role_id PK, FK
    }

    role_permissions {
        bigint role_id PK, FK
        bigint permission_id PK, FK
    }

    menu {
        bigint id PK "메뉴 식별자"
        varchar(255) name "메뉴 이름"
        int price "가격"
    }

    audit_logs {
        bigint id PK "로그 식별자"
        varchar(100) action "수행 작업"
        datetime(6) created_at "발생 시각"
        varchar(255) result "작업 결과"
        bigint target_id "대상 객체 ID"
        varchar(255) target_type "대상 객체 종류"
        bigint user_id "작업 수행자 ID"
        varchar(255) before_value "변경 전 값"
        varchar(255) after_value "변경 후 값"
    }

    %% Relationships
    users ||--o{ user_roles : "부여받음 (1:N)"
    roles ||--o{ user_roles : "할당됨 (1:N)"
    
    roles ||--o{ role_permissions : "포함함 (1:N)"
    permissions ||--o{ role_permissions : "할당됨 (1:N)"

```

---

## 2. RBAC 기반 API 명세서 (API Specification)

제공된 컨트롤러 코드(`MenuAdminController`, `UserAdminController`, `RoleAdminController`, `PermissionAdminController`, `UserController`)를 기준으로 작성된 API 명세입니다.

대부분의 관리자 기능은 `/api/admin/*` 경로를 사용하며, Spring Security의 `@PreAuthorize("hasAuthority('...')")`를 통해 엄격하게 인가(Authorization) 처리됩니다.

### 2.1 User Domain (사용자 관리 및 마이페이지)

**관리자 권한 API (`/api/admin/users`)**

| Method | Endpoint | 역할 및 기능 | 필요 권한 (Authority) |
| --- | --- | --- | --- |
| `GET` | `/api/admin/users` | 사용자 목록 조회 | `USER_READ` |
| `PATCH` | `/api/admin/users/{id}/status` | 사용자 상태 변경 | `USER_STATUS_UPDATE` |
| `DELETE` | `/api/admin/users/{id}/soft` | 계정 삭제 대기 상태로 변경 (Soft Delete) | `USER_DELETE` |
| `DELETE` | `/api/admin/users/{id}` | 계정 영구 삭제 | `USER_DELETE` |
| `POST` | `/api/admin/users/{id}/roles` | 특정 사용자에게 Role 부여 | `USER_ROLE_MANAGE` |

**일반 사용자 API (`/api/users`)**

| Method | Endpoint | 역할 및 기능 | 필요 권한 (Authority) |
| --- | --- | --- | --- |
| `POST` | `/api/users/signup` | 회원가입 | *(Permit All 예정)* |
| `GET` | `/api/users/me` | 내 정보 조회 | *(Authenticated)* |
| `PATCH` | `/api/users/me/password` | 내 비밀번호 변경 | *(Authenticated)* |

### 2.2 Role Domain (역할 관리)

**관리자 권한 API (`/api/admin/roles`)**

| Method | Endpoint | 역할 및 기능 | 필요 권한 (Authority) |
| --- | --- | --- | --- |
| `GET` | `/api/admin/roles` | Role 목록 조회 | `ROLE_READ` |
| `POST` | `/api/admin/roles` | 신규 Role 생성 | `ROLE_CREATE` |
| `PATCH` | `/api/admin/roles/{id}` | 기존 Role 정보 수정 | `ROLE_UPDATE` |
| `DELETE` | `/api/admin/roles/{id}` | Role 삭제 | `ROLE_DELETE` |
| `POST` | `/api/admin/roles/{roleId}/permissions` | Role에 Permission 목록 할당 | `ROLE_ASSIGN` |

### 2.3 Permission Domain (권한 조회)

**관리자 권한 API (`/api/admin/permissions`)**

| Method | Endpoint | 역할 및 기능 | 필요 권한 (Authority) |
| --- | --- | --- | --- |
| `GET` | `/api/admin/permissions` | 전체 Permission 목록 조회 | `PERMISSION_READ` |
| `GET` | `/api/admin/permissions/{id}` | 특정 Permission 상세 조회 | `PERMISSION_READ` |

### 2.4 Menu Domain (메뉴 관리)

**관리자 권한 API (`/api/admin/menus`)**

| Method | Endpoint | 역할 및 기능 | 필요 권한 (Authority) |
| --- | --- | --- | --- |
| `GET` | `/api/admin/menus` | 전체 메뉴 목록 조회 | `MENU_READ` |
| `GET` | `/api/admin/menus/{id}` | 특정 메뉴 상세 조회 | `MENU_READ` |
| `POST` | `/api/admin/menus` | 신규 메뉴 생성 | `MENU_CREATE` |
| `PATCH` | `/api/admin/menus/{id}` | 기존 메뉴 수정 | `MENU_UPDATE` |
| `DELETE` | `/api/admin/menus/{id}` | 특정 메뉴 삭제 | `MENU_DELETE` |

