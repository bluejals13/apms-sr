# AUTH — ERD / Entity / API Specification

## 1. Scope

본 문서는 APMS.SR Authentication 영역의 **데이터 구조(ERD), Entity 구조, API 명세**를 정의한다.

Runtime 실행 결과는 별도의 `AUTH Runtime Verification Evidence`에서 검증한다.

```text
AUTH Specification
├── ERD
├── Entity
└── API
```

---

# 2. ERD

## 2.1 Authentication 관련 데이터 구조

Authentication은 영속 데이터인 `users`와 Refresh Token 상태를 관리하는 Redis를 함께 사용한다.

```text
┌──────────────────────┐                          ┌────────────────────────────┐
│        users         │                          │           Redis            │
├──────────────────────┤                          ├────────────────────────────┤
│ PK id                │                          │ auth:refresh:user:{userId} │
│    username          │                          │                            │
│    password          │                          │ Refresh Token Identifier   │
│    status             │ ─────── user.id ──────▶ │ TTL                        │
│    password_changed  │                          │                            │
│    email             │                          │                            │
└──────────────────────┘                          └────────────────────────────┘

```

### 관계

| Source     | 관계       | Target                   | 설명                    |
| ---------- | -------- | ------------------------ | --------------------- |
| `users.id` | 1 : 0..1 | `auth:refresh:user:{id}` | 사용자별 Refresh Token 상태 |
| `users.id` | 1 : N    | Access Token             | JWT의 `sub`로 사용자 식별    |
| `users.id` | 1 : 1    | `/api/users/me`          | 인증된 현재 사용자 조회         |

> Redis는 관계형 DB 테이블이 아니므로 ERD의 물리적 테이블 관계와 동일하게 취급하지 않고, **Authentication State Store**로 표현한다.

---

# 3. User Entity

## 3.1 User Entity

Authentication에서 사용자 식별의 기준이 되는 Entity이다.

| Field               | Type          | 역할         |
| ------------------- | ------------- | ---------- |
| `id`                | Long          | 사용자 식별자    |
| `username`          | String        | 로그인 식별자    |
| `password`          | String        | 암호화된 비밀번호  |
| `status`            | UserStatus    | 사용자 상태     |
| `passwordChangedAt` | LocalDateTime | 비밀번호 변경 시각 |

### 핵심 관계

```text
User.id
  │
  ├── JWT.sub
  │
  ├── Redis auth:refresh:user:{id}
  │
  └── /api/users/me response.id
```

즉 Authentication에서 사용자 식별은 다음과 같이 연결된다.

```text
users.id
   ↓
JWT sub
   ↓
Authenticated User
   ↓
Protected API
```

---

# 4. Authentication API Specification

## 4.1 API Overview

| Method | Endpoint            | 목적                        | 인증               |
| ------ | ------------------- | ------------------------- | ---------------- |
| `POST` | `/api/auth/login`   | 사용자 로그인 및 Access Token 발급 | 불필요              |
| `POST` | `/api/auth/refresh` | Access Token 재발급          | Refresh Token 필요 |
| `GET`  | `/api/users/me`     | 현재 인증 사용자 조회              | Access Token 필요  |

---

# 5. POST /api/auth/login

## 목적

사용자 계정 정보를 검증하고 Access Token을 발급한다.

### Request

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "username": "test",
  "password": "********"
}
```

### Response

```json
{
  "status": "SUCCESS",
  "message": "로그인에 성공했습니다.",
  "data": {
    "accessToken": "<ACCESS_TOKEN>",
    "grantType": "Bearer"
  }
}
```

### Authentication Flow

```text
username/password
      ↓
User Authentication
      ↓
User Identity
      ↓
JWT Access Token
```

### 주요 JWT 정보

| Claim      | 의미           |
| ---------- | ------------ |
| `sub`      | 사용자 ID       |
| `username` | 사용자명         |
| `type`     | Access Token |
| `jti`      | Token 식별자    |
| `iat`      | 발급 시각        |
| `exp`      | 만료 시각        |

---

# 6. POST /api/auth/refresh

## 목적

Refresh Token을 이용하여 새로운 Access Token을 발급한다.

### Request

```http
POST /api/auth/refresh
Cookie: refreshToken=<REFRESH_TOKEN>
```

### Response

```json
{
  "status": "SUCCESS",
  "message": "토큰이 성공적으로 재발급되었습니다.",
  "data": {
    "accessToken": "<NEW_ACCESS_TOKEN>"
  }
}
```

### Authentication State

```text
Refresh Token Cookie
        ↓
Redis
auth:refresh:user:{userId}
        ↓
Refresh Token 검증
        ↓
New Access Token
```

---

# 7. GET /api/users/me

## 목적

Access Token으로 인증된 현재 사용자의 정보를 조회한다.

### Request

```http
GET /api/users/me
Authorization: Bearer <ACCESS_TOKEN>
```

### Response

```json
{
  "status": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": {
    "id": 2,
    "username": "test",
    "roles": [
      "ADMIN"
    ],
    "permissions": [
      "USER_READ",
      "USER_STATUS_UPDATE",
      "USER_DELETE",
      "ROLE_READ",
      "ROLE_CREATE",
      "ROLE_UPDATE",
      "ROLE_DELETE",
      "ROLE_ASSIGN",
      "MENU_READ",
      "MENU_CREATE",
      "MENU_UPDATE",
      "MENU_DELETE",
      "PERMISSION_READ",
      "USER_ROLE_MANAGE"
    ]
  }
}
```

### Response Structure

| Field         | Type          | 설명             |
| ------------- | ------------- | -------------- |
| `id`          | Long          | 현재 사용자 ID      |
| `username`    | String        | 사용자명           |
| `roles`       | Array<String> | 사용자 Role       |
| `permissions` | Array<String> | 사용자 Permission |

> `roles`와 `permissions`는 인증된 사용자의 권한 컨텍스트를 반환하지만, 개별 Permission에 따른 API 허용/거부 정책은 RBAC 명세에서 별도로 정의한다.

---

# 8. Authentication Data / API Mapping

| 데이터 / Claim              | Source             | API / 사용처       | 역할                 |
| ------------------------ | ------------------ | --------------- | ------------------ |
| `users.id`               | MySQL              | Login / 인증      | 사용자 식별             |
| `users.username`         | MySQL              | Login           | 로그인 식별             |
| `users.password`         | MySQL              | Login           | 자격 증명 검증           |
| `users.status`           | MySQL              | Authentication  | 계정 상태              |
| JWT `sub`                | Access Token       | Protected API   | 사용자 ID 전달          |
| JWT `jti`                | Access Token       | Token 식별        | Token 식별자          |
| JWT `exp`                | Access Token       | Security Filter | Access Token 만료    |
| `auth:refresh:user:{id}` | Redis              | Refresh         | 사용자별 Refresh State |
| `roles`                  | Authorization Data | `/users/me`     | Role 정보            |
| `permissions`            | Authorization Data | `/users/me`     | Permission 정보      |

---

# 9. AUTH Traceability

```text
[User Entity]
users.id
users.username
users.status
       │
       ▼
[Login API]
POST /api/auth/login
       │
       ▼
[Access Token]
JWT
 ├─ sub
 ├─ username
 ├─ jti
 └─ exp
       │
       ▼
[Protected API]
Authorization: Bearer
       │
       ▼
GET /api/users/me
       │
       ▼
Authenticated User
```

Refresh 흐름:

```text
[User]
   │
   ▼
[Refresh Token]
   │
   ▼
[Redis]
auth:refresh:user:{userId}
   │
   ▼
POST /api/auth/refresh
   │
   ▼
[New Access Token]
```

---

# 10. Document Boundary

본 문서는 **Authentication의 데이터 구조와 API 계약**을 정의한다.

| 영역                       | 담당 문서                                |
| ------------------------ | ------------------------------------ |
| Authentication 요구사항      | PRD / Acceptance Criteria            |
| Authentication 설계 결정     | ADR                                  |
| ERD / Entity             | 본 문서                                 |
| API Specification        | 본 문서                                 |
| 실제 코드 구현                 | `apms-sr` Backend                    |
| Runtime 동작 검증            | `AUTH Runtime Verification Evidence` |
| Role / Permission 정책     | `FEAT-RBAC-001`                      |
| Permission별 API 허용/거부 검증 | RBAC Runtime Verification            |

```text
Requirement
    ↓
ADR
    ↓
ERD / Entity / API Specification
    ↓
Implementation
    ↓
Runtime Verification
```

이 구조를 통해 AUTH 설계와 실제 구현 및 실행 검증을 서로 추적할 수 있도록 한다.
