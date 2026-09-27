# Backend Resource Setting

## 주요 설정

| 영역 | 설정 | 목적 |
|---|---|---|
| Server | `server.port` | Backend Port |
| MySQL | `spring.datasource.*` | DB 연결 |
| JPA | `ddl-auto=validate` | Entity / Schema 검증 |
| Flyway | `flyway.enabled=true` | DB Migration |
| Redis | `spring.data.redis.*` | Redis 연결 |
| JWT | `jwt.*` | Token 설정 |
| Actuator | `management.endpoints.*` | Monitoring |

## 핵심 설정

### JPA / Flyway

```text
Flyway
  ↓
Database Schema 변경

JPA ddl-auto=validate
  ↓
Entity ↔ Schema 검증
```

## Redis

<!-- Refresh Token 등 실제 프로젝트에서 사용하는 부분만 간단히 설명 -->

## JWT

<!-- Access / Refresh Token 설정의 의미만 설명 -->

## Configuration Source

application.properties
application.yaml
application-test.properties
