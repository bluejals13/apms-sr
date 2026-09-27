
# AUTH Runtime Verification Evidence

## 1. 목적

APMS.SR 인증(Authentication) 흐름이 실제 실행 환경에서 정상 동작하는지 검증한다.

검증 범위:

* Login
* Access Token 발급
* JWT 사용자 식별자 확인
* DB 사용자 상태 확인
* Refresh Token Redis 저장 상태
* Refresh Token 재발급
* 인증된 Protected API 접근
* Frontend 인증 상태 연동

---

## 2. Login

### Request

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"********"}'
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

### Result

* Login: **PASS**
* Access Token 발급: **PASS**
* 인증 방식: `Bearer`

---

## 3. Access Token / JWT Payload

Login 응답으로 발급된 Access Token을 JWT Payload 기준으로 확인한다.

> 아래 Payload는 서버 응답 JSON에 별도로 출력된 값이 아니라, 실제 발급된 JWT를 디코딩하여 확인한 값이다.

```json
{
  "sub": "2",
  "jti": "52f17d36-64ce-4066-b62c-6d4dae79e04d",
  "username": "test",
  "type": "access",
  "iat": 1790417412,
  "exp": 1790421012
}
```

### 확인 결과

| 항목         | 확인값          |
| ---------- | ------------ |
| Subject    | `2`          |
| Username   | `test`       |
| Token Type | `access`     |
| JTI        | UUID         |
| Issued At  | `1790417412` |
| Expiration | `1790421012` |

`sub=2`와 `username=test`는 이후 DB 및 Protected API 검증과 연결된다.

---

## 4. User Database

JWT의 사용자 식별 정보가 실제 DB 사용자와 일치하는지 확인한다.

### Query

```sql
SELECT id, username, status
FROM users
WHERE username = 'test';
```

### Result

```text
+----+----------+--------+
| id | username | status |
+----+----------+--------+
|  2 | test     | ACTIVE |
+----+----------+--------+
```

### Result

* JWT `sub=2`
* DB `users.id=2`
* DB `username=test`
* DB `status=ACTIVE`

→ JWT 사용자 식별 정보와 실제 DB 사용자가 일치한다.

---

## 5. Refresh Token / Redis

Refresh Token 상태가 사용자 단위 Redis Key로 관리되는지 확인한다.

### Redis

```text
127.0.0.1:6379> TYPE auth:refresh:user:2
string

127.0.0.1:6379> GET auth:refresh:user:2
"68bf5f3c-520f-4f00-ab4a-6395ea86bfa2"

127.0.0.1:6379> TTL auth:refresh:user:2
(integer) 603717
```

### 확인 결과

| 항목        | 결과                    |
| --------- | --------------------- |
| Redis Key | `auth:refresh:user:2` |
| Type      | `string`              |
| Value     | Refresh Token 식별값     |
| TTL       | `603717` seconds      |

→ 사용자 ID `2`를 기준으로 Refresh Token 상태가 Redis에서 관리되고 있음을 확인한다.

---

## 6. Refresh

Refresh Token Cookie를 이용하여 Access Token 재발급을 요청한다.

### Request

```bash
curl -i -X POST http://localhost:8080/api/auth/refresh \
  --cookie "refreshToken=<REFRESH_TOKEN>"
```

### Result

```text
HTTP/1.1 200
Set-Cookie: refreshToken=...
```

Response:

```json
{
  "status": "SUCCESS",
  "message": "토큰이 성공적으로 재발급되었습니다.",
  "data": {
    "accessToken": "<NEW_ACCESS_TOKEN>"
  }
}
```

### Result

* Refresh 요청: **PASS**
* HTTP Status: `200`
* Access Token 재발급: **PASS**
* Refresh Token Cookie 처리: **PASS**

---

## 7. Protected API

발급된 Access Token을 사용하여 인증이 필요한 API에 접근한다.

### Request

```bash
curl -i http://localhost:8080/api/users/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### Result

```text
HTTP/1.1 200
Content-Type: application/json
```

Response:

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

### Result

* Bearer Access Token 인증: **PASS**
* Protected API 접근: **PASS**
* HTTP Status: `200`
* User ID: `2`
* Username: `test`
* Role: `ADMIN`
* Permissions: `14`

이 결과를 통해 다음 흐름을 실제 실행 결과로 연결할 수 있다.

```text
Login
  ↓
Access Token 발급
  ↓
JWT sub=2 / username=test
  ↓
users.id=2 / username=test
  ↓
Authorization: Bearer
  ↓
GET /api/users/me
  ↓
HTTP 200
  ↓
User ID=2 / ADMIN / Permissions=14
```

---

## 8. Frontend Runtime

실행 중인 Frontend에서도 인증 사용자와 API 응답이 정상적으로 연결되는지 확인한다.

### Console

```text
auth user:
{id: 2, username: 'test', roles: Array(1), permissions: Array(14)}

loading: false
error: null

USER API RESPONSE
(3) [{…}, {…}, {…}]
```

### User API Response

```json
{
  "status": "SUCCESS",
  "message": "요청이 성공적으로 처리되었습니다.",
  "data": [
    {
      "id": 1,
      "username": "fpfns",
      "status": "ACTIVE",
      "passwordChangedAt": null
    },
    {
      "id": 2,
      "username": "test",
      "status": "ACTIVE",
      "passwordChangedAt": null
    },
    {
      "id": 4,
      "username": "blue",
      "status": "ACTIVE",
      "passwordChangedAt": null
    }
  ]
}
```

### Result

* Frontend Auth User: **PASS**
* Auth User ID: `2`
* Username: `test`
* User API Response: **PASS**
* Loading: `false`
* Error: `null`

---

## 9. Evidence Trace

```text
[Login]
POST /api/auth/login
        │
        ▼
[Access Token]
JWT issued
        │
        ├── sub=2
        └── username=test
        │
        ▼
[Database]
users.id=2
users.username=test
users.status=ACTIVE
        │
        ▼
[Authorization]
Bearer Access Token
        │
        ▼
[Protected API]
GET /api/users/me
        │
        ▼
HTTP 200
        │
        ├── id=2
        ├── username=test
        ├── role=ADMIN
        └── permissions=14
```

Refresh 흐름:

```text
[Login]
   │
   ▼
[Refresh Token]
   │
   ▼
Redis
auth:refresh:user:2
   │
   ▼
POST /api/auth/refresh
   │
   ▼
HTTP 200
   │
   ▼
New Access Token
```

---

## 10. Runtime Verification Result

| 검증 항목               | 결과   |
| ------------------- | ---- |
| Login               | PASS |
| Access Token 발급     | PASS |
| JWT 사용자 식별          | PASS |
| DB 사용자 확인           | PASS |
| Redis Refresh State | PASS |
| Refresh             | PASS |
| Protected API       | PASS |
| Frontend Auth State | PASS |
| User API            | PASS |

### Conclusion

실행 환경에서 APMS.SR의 기본 인증 흐름을 확인하였다.

```text
Login
→ JWT Access Token
→ DB User Identity
→ Redis Refresh State
→ Refresh
→ Bearer Authentication
→ Protected API
→ Frontend Auth State
```

현재 확인된 런타임 결과는 **Authentication 흐름의 정상 동작을 입증하는 근거**로 사용한다.

> 단, `ADMIN`의 개별 Permission이 실제 각 API에서 허용/거부되는지는 본 문서의 범위를 넘어가며, RBAC Runtime Verification에서 별도로 검증한다.

---
