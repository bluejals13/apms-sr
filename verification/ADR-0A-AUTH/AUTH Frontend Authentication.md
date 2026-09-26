
# AUTH Frontend Authentication

## 1. Document Purpose

본 문서는 APMS-SR Frontend에서 구현된 **인증(Authentication) 처리 구조와 상태 흐름**을 정리한다.

Backend의 인증 정책 및 API 계약은 별도 문서에서 정의하고, 실제 실행 결과는 Runtime Verification 문서에서 검증한다.

본 문서에서는 그 사이의 **Frontend 구현 책임**을 다룬다.

### Related Documents

| 문서                                      | 책임                                              |
| --------------------------------------- | ----------------------------------------------- |
| `AUTH-ERD, API-spec.md`                 | Authentication 데이터 구조 및 API 계약                  |
| `AUTH Runtime Verification Evidence.md` | Login / Refresh / Protected API 등 실제 Runtime 검증 |
| `AUTH Frontend Authentication.md`       | Frontend 인증 상태·복구·API 소비 구조                     |

---

# 2. Frontend Authentication Scope

Frontend Authentication은 다음 책임으로 구성된다.

```text
사용자 Login / Signup
        ↓
HTTP API 호출
        ↓
Access Token 관리
        ↓
인증 상태 유지
        ↓
Application Bootstrap
        ↓
Refresh Token 기반 인증 복구
        ↓
/api/users/me
        ↓
현재 사용자 상태 확인
        ↓
Header / Page 등 UI에서 인증 상태 소비
```

Frontend는 Refresh Token 자체를 직접 관리하는 것이 아니라 Backend가 관리하는 Refresh Token 기반 세션을 이용하여 Access Token을 갱신하고 인증 상태를 복구한다.

---

# 3. Authentication Architecture

```text
                         Backend
                            │
             ┌──────────────┼──────────────┐
             │              │              │
             ▼              ▼              ▼
        /auth/login   /auth/refresh    /users/me
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    http.ts    │
                    │ HTTP / Auth   │
                    │ Refresh /401  │
                    └───────┬───────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌─────────────────┐      ┌─────────────────┐
       │ auth.bootstrap   │      │   auth.store    │
       │ Initial Recovery │      │ Token / Status  │
       └────────┬────────┘      └────────┬────────┘
                │                        │
                └────────────┬───────────┘
                             ▼
                       ┌───────────┐
                       │  useMe    │
                       │ /users/me │
                       └─────┬─────┘
                             ▼
                       ┌───────────┐
                       │  useAuth  │
                       └─────┬─────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
           Header          Login          Signup
```

Frontend 인증 구조는 다음과 같이 역할을 분리한다.

| 영역                  | 책임                             |
| ------------------- | ------------------------------ |
| `http.ts`           | HTTP 요청 및 인증 실패/Refresh 처리     |
| `auth.bootstrap.ts` | 애플리케이션 시작 시 인증 상태 복구           |
| `auth.store.ts`     | Access Token 및 인증 서비스 상태 관리    |
| `useMe.ts`          | 현재 로그인 사용자 조회                  |
| `useAuth.ts`        | 컴포넌트에서 인증 상태 접근                |
| `useLoginForm.ts`   | Login 입력·검증·인증 처리              |
| `useSignupForm.ts`  | Signup 입력·검증·회원가입 처리           |
| `Header.tsx`        | 인증 상태에 따른 전역 UI                |
| `AuthHeader.tsx`    | 인증 관련 페이지 Header               |
| `AuthLayout.tsx`    | Login / Signup 등 인증 페이지 Layout |

---

# 4. HTTP Authentication Layer

## 4.1 `http.ts`

**Source**

`frontend/src/api/http.ts`

Frontend API 요청의 공통 HTTP 계층에서 인증 상태를 처리한다.

주요 책임은 다음과 같다.

```text
API Request
    ↓
Access Token 사용
    ↓
API Response
    │
    ├── 정상
    │    └── Response 반환
    │
    ├── 401
    │    └── Refresh
    │          ↓
    │       새 Access Token
    │          ↓
    │       원래 요청 재시도
    │
    └── 인증 서비스 장애
         └── 별도 상태 처리
```

Refresh 성공 시 새 Access Token을 Frontend Auth Store에 반영하고 기존 요청을 다시 수행한다.

따라서 각 API 호출부에서 개별적으로 Token Refresh를 구현하지 않고 공통 HTTP 계층에서 인증 갱신을 처리한다.

### 핵심 책임

* Access Token을 이용한 인증 요청
* 인증 실패 시 Refresh 처리
* 새 Access Token 저장
* 기존 요청 재시도
* 인증 서비스 장애 상태 전달

---

# 5. Authentication State

## 5.1 `auth.store.ts`

**Source**

`frontend/src/store/auth.store.ts`

Zustand를 이용하여 Frontend 인증 상태를 중앙에서 관리한다.

주요 상태:

```text
token
authServiceUnavailable
```

주요 동작:

```text
setToken()
login()
logout()
setAuthServiceUnavailable()
```

### 상태 책임

| 상태                       | 의미                              |
| ------------------------ | ------------------------------- |
| `token`                  | 현재 Frontend에서 사용하는 Access Token |
| `authServiceUnavailable` | 인증 관련 Backend/서비스 장애 상태         |

Frontend 인증 상태의 변경은 개별 컴포넌트가 직접 관리하지 않고 Auth Store를 통해 수행한다.

---

# 6. Application Bootstrap

## 6.1 `auth.bootstrap.ts`

**Source**

`frontend/src/auth/auth.bootstrap.ts`

Application 시작 시 기존 인증 상태를 복구하는 역할을 담당한다.

Frontend가 새로 로드되면 기존 JavaScript 메모리 상태는 초기화될 수 있으므로 Access Token만으로 인증 상태를 유지할 수 없다.

따라서 Bootstrap 과정에서 Backend의 Refresh API를 이용하여 인증 상태를 복구한다.

```text
Application Start
       ↓
Authentication Bootstrap
       ↓
Refresh 요청
       │
       ├── 성공
       │     ↓
       │  새 Access Token 저장
       │     ↓
       │  인증 상태 복구
       │
       ├── 401
       │     ↓
       │  Logout / 인증 상태 초기화
       │
       └── 503
             ↓
          인증 서비스 장애 상태 유지
```

### 중요한 구분

`401`과 `503`을 동일하게 처리하지 않는다.

| 결과                        | Frontend 처리                   |
| ------------------------- | ----------------------------- |
| Refresh 성공                | Access Token 저장 및 인증 복구       |
| `401 Unauthorized`        | 유효한 인증 상태가 아니므로 Logout/상태 초기화 |
| `503 Service Unavailable` | 인증 서비스 장애 상태로 처리              |

이를 통해 일시적인 인증 인프라 장애를 사용자 인증 실패와 동일하게 처리하지 않는다.

---

# 7. Current User

## 7.1 `useMe.ts`

**Source**

`frontend/src/queries/useMe.ts`

현재 인증된 사용자의 정보를 Backend `/api/users/me` API를 통해 조회한다.

```text
auth.store
     │
     │ Access Token
     ▼
   useMe
     │
     │ GET /api/users/me
     ▼
   Backend
     │
     ▼
Current User
```

Query는 Access Token이 존재하는 경우에 활성화된다.

이를 통해 Frontend에서는 현재 사용자 정보를 별도의 로컬 사용자 객체로 직접 유지하기보다 Backend의 `/api/users/me` 응답을 기준으로 현재 사용자 상태를 확인한다.

### 조회 결과

현재 사용자 정보에는 프로젝트의 인증/인가 모델에 따라 다음 정보가 포함될 수 있다.

```text
User
 ├── id
 ├── username
 ├── roles
 └── permissions
```

---

# 8. Authentication Hook

## 8.1 `useAuth.ts`

**Source**

`frontend/src/auth/hooks/useAuth.ts`

`useAuth`는 개별 UI 컴포넌트가 Auth Store와 User Query의 내부 구현을 직접 알 필요가 없도록 인증 관련 상태를 하나의 Hook으로 추상화한다.

개념적으로:

```text
Component
    ↓
useAuth()
    ├── authentication state
    ├── current user
    └── logout
```

이를 통해 Header, Page 등 UI 계층에서는 인증 구현 세부사항보다 사용자 관점의 인증 상태에 집중할 수 있다.

---

# 9. Login Flow

## 9.1 `useLoginForm.ts`

**Source**

`frontend/src/auth/hooks/useLoginForm.ts`

Login 과정의 입력 처리와 인증 요청을 담당한다.

```text
Login Form
    ↓
Input Validation
    ↓
Login API
    ↓
Backend Authentication
    ↓
Access Token
    ↓
Auth Store
    ↓
Authenticated State
```

인증 서비스 장애와 일반적인 인증 실패를 구분하여 처리한다.

---

## 9.2 `Login.tsx`

**Source**

`frontend/src/pages/Login.tsx`

Login UI를 구성하고 `useLoginForm`을 연결한다.

따라서 UI 컴포넌트에서 직접 HTTP 인증 로직을 구현하지 않고:

```text
Login.tsx
    ↓
useLoginForm
    ↓
Auth Service / API
```

구조로 역할을 분리한다.

---

# 10. Signup Flow

## 10.1 `useSignupForm.ts`

**Source**

`frontend/src/auth/hooks/useSignupForm.ts`

Signup 과정의 입력값 검증과 회원가입 API 호출을 담당한다.

```text
Signup Form
    ↓
Input Validation
    ↓
Signup API
    ↓
Backend
    ↓
Signup Success
    ↓
Login Page
```

Frontend 입력 검증과 Backend 검증은 별개의 책임이며, Frontend 검증만으로 서버 측 입력 검증을 대체하지 않는다.

---

## 10.2 `Signup.tsx`

**Source**

`frontend/src/pages/Signup.tsx`

Signup UI를 담당하며 실제 입력 처리와 API 호출은 `useSignupForm`으로 분리한다.

---

# 11. User API

## 11.1 `user.api.ts`

**Source**

`frontend/src/api/user.api.ts`

User 관련 API를 Frontend에서 사용할 수 있도록 API 계층으로 분리한다.

이를 통해 Page/Component에서 직접 HTTP 요청을 작성하지 않고 API 계층을 통해 Backend User API를 소비한다.

```text
Component / Hook
       ↓
    user.api
       ↓
      http
       ↓
    Backend API
```

Authentication과 User Management 사이의 API 소비 책임을 분리하는 역할을 한다.

---

# 12. Authentication UI

## 12.1 `Header.tsx`

**Source**

`frontend/src/components/Header.tsx`

전역 Header에서 현재 인증 상태에 따라 사용자에게 제공되는 UI를 변경한다.

개념적으로:

```text
Authenticated
    ├── Logout
    ├── Dashboard
    └── Monitor

Unauthenticated
    ├── Login
    └── Signup
```

따라서 Header는 인증 시스템 자체를 구현하지 않고 `useAuth` 등을 통해 인증 상태를 소비하는 UI 계층이다.

---

## 12.2 `AuthHeader.tsx`

**Source**

`frontend/src/components/AuthHeader.tsx`

Login / Signup 등 인증 관련 화면에서 사용하는 Header UI를 담당한다.

Authentication API나 Token 상태를 직접 관리하지 않고 인증 페이지의 Presentation/Layout 책임을 가진다.

---

## 12.3 `AuthLayout.tsx`

**Source**

`frontend/src/layout/AuthLayout.tsx`

Login / Signup 등 인증 페이지의 공통 Layout을 제공한다.

```text
AuthLayout
 ├── AuthHeader
 └── Authentication Page
       ├── Login
       └── Signup
```

인증 처리 로직과 화면 Layout을 분리한다.

---

# 13. End-to-End Frontend Authentication Flow

전체 Frontend 인증 흐름은 다음과 같다.

```text
                    Application Start
                           │
                           ▼
                  auth.bootstrap.ts
                           │
                           ▼
                    Refresh Request
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
           Success        401          503
              │            │            │
              ▼            ▼            ▼
         Save Token      Logout      Service
              │                       Unavailable
              └──────────┬────────────┘
                         ▼
                    auth.store
                         │
                         ▼
                      useMe
                         │
                         ▼
                  /api/users/me
                         │
                         ▼
                      useAuth
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
          Header        Page       User UI
```

Login의 경우:

```text
Login.tsx
    ↓
useLoginForm
    ↓
Login API
    ↓
Access Token
    ↓
auth.store
    ↓
useMe
    ↓
Authenticated UI
```

API 요청 중 Access Token이 만료된 경우:

```text
API Request
    ↓
401
    ↓
http.ts
    ↓
Refresh API
    ↓
New Access Token
    ↓
auth.store
    ↓
Original Request Retry
```

---

# 14. Frontend Authentication Responsibility Matrix

| Component                     | Responsibility | Authentication Role     |
| ----------------------------- | -------------- | ----------------------- |
| `api/http.ts`                 | HTTP 공통 처리     | Token / Refresh / Retry |
| `api/user.api.ts`             | User API       | Backend API 소비          |
| `auth.bootstrap.ts`           | 초기 인증 복구       | Refresh 기반 상태 복구        |
| `store/auth.store.ts`         | 인증 상태          | Token / Service Status  |
| `queries/useMe.ts`            | 현재 사용자 조회      | `/api/users/me`         |
| `auth/hooks/useAuth.ts`       | 인증 추상화         | UI 계층에 인증 상태 제공         |
| `auth/hooks/useLoginForm.ts`  | Login 처리       | 입력 / 인증 요청              |
| `pages/Login.tsx`             | Login UI       | Form 연결                 |
| `auth/hooks/useSignupForm.ts` | Signup 처리      | 입력 / 회원가입 요청            |
| `pages/Signup.tsx`            | Signup UI      | Form 연결                 |
| `components/Header.tsx`       | 전역 UI          | 인증 상태 소비                |
| `components/AuthHeader.tsx`   | 인증 Header      | 인증 페이지 UI               |
| `layout/AuthLayout.tsx`       | 인증 Layout      | 인증 페이지 구조               |

---

# 15. Security Considerations

Frontend Authentication에서 다음 원칙을 적용한다.

### 15.1 Access Token과 Refresh Token의 책임 분리

Frontend는 Access Token을 API 인증에 사용하고, Refresh Token의 실제 저장 및 관리 책임은 Backend 인증 구조에 둔다.

```text
Frontend
 └── Access Token

Backend / Cookie
 └── Refresh Token
```

---

### 15.2 Token Refresh 중앙화

각 API에서 개별적으로 Refresh를 수행하지 않고 HTTP 공통 계층에서 처리한다.

이를 통해 인증 갱신 로직의 중복을 줄이고 API 호출 계층의 일관성을 유지한다.

---

### 15.3 인증 실패와 인증 인프라 장애 구분

다음 상태를 구분한다.

```text
401
→ 인증 자체가 유효하지 않음
→ Logout / 인증 상태 초기화

503
→ 인증 서비스 이용 불가
→ 서비스 장애 상태로 처리
```

따라서 Backend 인증 서비스 장애를 곧바로 사용자의 로그아웃 상태로 간주하지 않는다.

---

### 15.4 Backend 권한 검증을 신뢰 경계로 유지

Frontend의 `roles`, `permissions` 정보는 UI 제어와 사용자 경험을 위한 상태로 사용한다.

실제 API 접근 권한은 Backend의 Spring Security 및 Authorization 정책에 의해 검증되어야 한다.

```text
Frontend
 └── UI 접근 제어

Backend
 └── 실제 API Authorization
```

Frontend에서 버튼이나 메뉴가 보이지 않는 것만으로 API 접근이 보호되는 것은 아니다.

---

# 16. Runtime Verification 연결

본 문서에서 설명한 Frontend 인증 구조의 실제 실행 결과는 다음 문서에서 검증한다.

`AUTH Runtime Verification Evidence.md`

주요 검증 흐름:

```text
Login
  ↓
Access Token
  ↓
Refresh
  ↓
Protected API
  ↓
/api/users/me
  ↓
Frontend Auth State
```

따라서 본 문서는 **구현 구조**, Runtime Verification 문서는 **실행 결과**를 담당한다.

---

# 17. Implementation Evidence

Frontend Authentication의 주요 구현 근거는 다음과 같다.

| 구현 영역                    | Source                                     |
| ------------------------ | ------------------------------------------ |
| HTTP / Refresh           | [api/http.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/api/http.ts)                 |
| User API                 | [api/user.api.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/api/user.api.ts)             |
| Authentication Bootstrap | [auth/auth.bootstrap.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/auth/auth.bootstrap.ts)      |
| Current User Query       | [queries/useMe.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/queries/useMe.ts)            |
| Authentication State     | [store/auth.store.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/store/auth.store.ts)         |
| Authentication Hook      | [hooks/useAuth.ts)](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/auth/hooks/useAuth.ts)       |
| Login Form               | [auth/hooks/useLoginForm.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/auth/hooks/useLoginForm.ts)  |
| Login Page               | [pages/Login.tsx](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/pages/Login.tsx)             |
| Signup Form              | [auth/hooks/useSignupForm.ts](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/auth/hooks/useSignupForm.ts) |
| Signup Page              | [pages/Signup.tsx](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/pages/Signup.tsx)            |
| Authentication Header    | [components/AuthHeader.tsx](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/components/AuthHeader.tsx)   |
| Global Header            | [components/Header.tsx](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/components/Header.tsx)       |
| Authentication Layout    | [layout/AuthLayout.tsx](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/frontend/src/layout/AuthLayout.tsx)       |

---

# 18. Summary

APMS-SR Frontend Authentication은 단일 Login 기능으로 구성되지 않는다.

전체 인증 흐름은 다음과 같이 구성된다.

```text
Login / Signup
      ↓
HTTP Authentication Layer
      ↓
Access Token
      ↓
Auth Store
      ↓
Bootstrap / Refresh
      ↓
Current User Query
      ↓
useAuth
      ↓
Application UI
```

핵심 구현 책임은 다음과 같이 분리되어 있다.

```text
http.ts
→ 인증 요청 / Refresh / Retry

auth.bootstrap.ts
→ Application 시작 시 인증 복구

auth.store.ts
→ 인증 상태 중앙 관리

useMe.ts
→ 현재 사용자 조회

useAuth.ts
→ UI 계층 인증 상태 추상화

Login / Signup Hooks
→ 사용자 인증 입력 흐름

Header / Layout
→ 인증 상태를 소비하는 UI
```

따라서 Frontend Authentication은 Backend의 JWT/Refresh 인증을 단순히 호출하는 수준이 아니라,

**인증 상태 저장 → 초기 복구 → Token Refresh → 현재 사용자 조회 → UI 인증 상태 반영**

으로 이어지는 하나의 Frontend 인증 흐름으로 구성된다.

