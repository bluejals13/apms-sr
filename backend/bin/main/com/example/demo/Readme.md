# APMS Backend Architecture

## 개요

APMS(Application Permission Management System)는 사용자 인증(Authentication)과 권한 관리(Authorization)를 중심으로 하는 IAM(Identity & Access Management) 시스템이다.

프로젝트는 기능과 책임에 따라 다음과 같은 상위 영역으로 구성된다.

| 영역             | 역할      | 주요 책임                            |
| -------------- | ------- | -------------------------------- |
| auth           | 인증 및 보안 | 로그인, JWT 발급/검증, Spring Security  |
| iam            | 권한 관리   | 사용자, 역할, 권한, 메뉴 관리               |
| audit          | 감사 로그   | 사용자 활동 및 변경 이력 기록                |
| monitoring     | 운영 모니터링 | 요청/응답 로깅, 상태 모니터링                |
| common         | 공통 기능   | 예외 처리, 공통 응답, 유틸리티               |
| config         | 설정 관리   | JPA, Redis, Security, Swagger 설정 |
| infrastructure | 외부 연동   | Redis, Storage, 외부 API           |

---

# Package Structure

```text
com.example.demo
├── auth
├── iam
├── audit
├── monitoring
├── common
├── config
└── infrastructure
```

---

# 1. Auth

## 목적

사용자 인증(Authentication)과 보안(Security)을 담당한다.

## 주요 기능

* 로그인
* JWT Access Token 발급
* JWT 검증
* 사용자 인증 처리
* Security Filter Chain 구성

## 하위 구성

```text
auth
├── controller
├── service
├── dto
├── jwt
└── security
```

## 범위

포함

* 로그인
* 토큰 생성
* 토큰 검증
* 인증 객체 생성
* Security 설정

제외

* 사용자 관리
* 권한 관리
* 메뉴 관리

---

# 2. IAM (Identity & Access Management)

## 목적

사용자와 권한을 관리하는 핵심 비즈니스 영역이다.

## 주요 기능

* 사용자 관리
* 역할(Role) 관리
* 권한(Permission) 관리
* 메뉴(Menu) 관리

## 하위 구성

```text
iam
├── user
├── role
├── permission
└── menu
```

---

## User

### 역할

시스템 사용자를 관리한다.

### 책임

* 사용자 조회
* 사용자 등록
* 사용자 상태 변경
* 사용자 정보 수정

---

## Role

### 역할

권한 그룹을 관리한다.

### 책임

* 역할 생성
* 역할 수정
* 역할 삭제
* 역할 목록 조회

---

## Permission

### 역할

세부 접근 권한을 관리한다.

### 책임

* 권한 생성
* 권한 수정
* 권한 삭제
* 역할과 권한 매핑

예시

```text
USER_READ
USER_CREATE
USER_UPDATE
USER_DELETE
```

---

## Menu

### 역할

메뉴 접근 제어를 담당한다.

### 책임

* 메뉴 생성
* 메뉴 수정
* 메뉴 삭제
* 메뉴 권한 매핑

예시

```text
사용자 관리
권한 관리
감사 로그
시스템 설정
```

---

# 3. Audit

## 목적

시스템 내 중요 행위의 추적성을 확보한다.

## 주요 기능

* 감사 로그 기록
* 변경 이력 조회
* 사용자 활동 추적

## 기록 대상

* 로그인
* 로그아웃
* 사용자 상태 변경
* 권한 변경
* 역할 변경
* 메뉴 변경

## 하위 구성

```text
audit
├── controller
├── service
├── repository
├── domain
└── dto
```

---

# 4. Monitoring

## 목적

운영 환경의 상태를 관찰하고 문제를 분석한다.

## 주요 기능

* 요청 로깅
* 응답 로깅
* 성능 측정
* 헬스 체크

## 예시

* BodyLoggingFilter
* Actuator
* Health Check
* Metrics

## 하위 구성

```text
monitoring
├── filter
├── controller
├── service
└── dto
```

---

# 5. Common

## 목적

모든 영역에서 사용하는 공통 기능을 제공한다.

## 주요 기능

* 예외 처리
* 공통 응답
* 유틸리티
* 상수 관리

## 하위 구성

```text
common
├── exception
├── response
├── util
├── annotation
└── constant
```

---

## Exception

### 책임

애플리케이션 전역 예외 처리

예시

```text
BusinessException
ErrorCode
GlobalExceptionHandler
```

---

# 6. Config

## 목적

애플리케이션 설정을 관리한다.

## 주요 기능

* JPA 설정
* Redis 설정
* Swagger 설정
* Security 설정

## 예시

```text
JpaConfig
RedisConfig
SwaggerConfig
```

---

# 7. Infrastructure

## 목적

외부 시스템과의 연동을 담당한다.

## 주요 기능

* Redis 연동
* 파일 저장소
* 외부 API 호출

## 하위 구성

```text
infrastructure
├── redis
├── storage
└── external
```

---

# Architecture Summary

| 영역             | 성격     | 설명            |
| -------------- | ------ | ------------- |
| auth           | 인증     | 사용자 인증 및 보안   |
| iam            | 핵심 도메인 | 사용자·권한 관리     |
| audit          | 지원 도메인 | 감사 및 추적       |
| monitoring     | 운영 도메인 | 시스템 모니터링      |
| common         | 공통 모듈  | 공통 기능 제공      |
| config         | 설정 모듈  | 환경 및 프레임워크 설정 |
| infrastructure | 인프라 모듈 | 외부 시스템 연동     |

본 프로젝트의 핵심 도메인은 IAM이며, Auth는 인증을 담당하고 Audit과 Monitoring은 운영 및 추적 기능을 지원한다.
