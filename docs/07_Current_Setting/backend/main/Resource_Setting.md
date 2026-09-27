
# Backend Resource Setting

> Backend의 현재 Resource 및 Application 설정을 기록한다.

---

## 1. Document Scope

### Purpose

Spring Boot 애플리케이션 실행에 필요한 설정 파일을 파악하고, Backend의 현재 Resource 구조 및 실행 환경 설정 내역을 명확히 기록하여 관리하기 위함입니다.

### Scope

`backend/src/main/resources` 디렉터리 내의 주요 설정 파일(`application.yaml`, `application.properties`)을 대상으로 하며, Server, MySQL, Redis, JPA, Flyway, JWT, Actuator 등의 설정을 다룹니다.

### Out of Scope

애플리케이션의 내부 비즈니스 로직, 프론트엔드 환경 설정, 인프라 구축 스크립트 및 CI/CD 배포 파이프라인 등 설정 파일과 직접적인 관련이 없는 내용은 이 문서에서 제외합니다.

---

## 2. Current State

| 항목 | 값 |
|---|---|
| Branch | `main` |
| Status | CURRENT |
| Last Verified | 2026-09-27 |

---

## 3. Resource Map

| Resource | 위치 | 책임 | 현재 사용 |
|---|---|---|---|
| `application.yaml` | `backend/src/main/resources/application.yaml` | 애플리케이션 기능 및 공통 설정 (Redis, JPA 검증, Flyway, JWT, Actuator, Prometheus) | ✅ |
| `application.properties` | `backend/src/main/resources/application.properties` | 실행 및 인프라 연결 설정 (Server Port, MySQL, JPA SQL 출력, Docker Redis 연결) | ✅ |
| `application-test.properties` | `backend/src/main/resources/application-test.properties` | Test 환경 설정 | ✅ |

---

## 4. Application Configuration

### 4.1 application.yaml (애플리케이션 기능 및 공통 설정)

**Source**

`backend/src/main/resources/application.yaml`

**Current Setting**

```yaml
spring:
  data:
    redis:
      host: ${SPRING_REDIS_HOST:localhost}
      port: ${SPRING_REDIS_PORT:6379}
      repositories:
        enabled: false

  jpa:
    hibernate:
      ddl-auto: validate

  flyway:
    enabled: true
    baseline-on-migrate: false

jwt:
  secret: this_is_a_very_long_secret_key_for_jwt_signing_123456
  expiration: 3600000
  access-expiration: 3600000
  refresh-expiration: 604800000

management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info

  endpoint:
    health:
      slow-details: always

```

### 4.2 application.properties (인프라 및 실행 환경 설정)

**Source**

`backend/src/main/resources/application.properties`

**Current Setting**

```properties
server.port=8080

# MySQL - Docker
spring.datasource.url=jdbc:mysql://mysql:3306/eventdb?serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=password

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=false

# Redis - Docker
spring.data.redis.host=redis
spring.data.redis.port=6379
spring.data.redis.repositories.enabled=false

```



