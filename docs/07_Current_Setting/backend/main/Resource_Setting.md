
 # Backend Resource 설정

 ## 1\. 개요

 `backend/src/main/resources` 디렉터리는 Spring Boot 애플리케이션 실행에 필요한 설정 파일을 관리합니다.

 현재 `main` 브랜치에서는 다음 두 파일을 사용합니다.

 - `application.yaml`
- `application.properties`

 각 파일은 Backend 실행 환경에 필요한 데이터베이스, Redis, JPA, Flyway, JWT, Actuator 등의 설정을 담당합니다.

 > 기준 브랜치: `main`

 ## 2\. Resource 디렉터리 구조

```
backend/
└── src/
    └── main/
        └── resources/
            ├── application.yaml
            └── application.properties
```

 Spring Boot는 `src/main/resources`에 위치한 `application.*` 설정 파일을 애플리케이션 실행 시 자동으로 읽습니다.

---

 # 3\. application.yaml

 `application.yaml`은 Spring Boot의 주요 애플리케이션 설정을 계층적인 YAML 구조로 관리합니다.

 현재 `main` 브랜치에서는 Redis, JPA, Flyway, JWT, Actuator 관련 설정이 정의되어 있습니다.  GitHub

 ## 3.1 Redis 설정

```
spring:
  data:
    redis:
      host: ${SPRING_REDIS_HOST:localhost}
      port: ${SPRING_REDIS_PORT:6379}
      repositories:
        enabled: false
```

 ### Host

```
host: ${SPRING_REDIS_HOST:localhost}
```

 Redis 서버의 Host를 설정합니다.

 환경 변수 `SPRING_REDIS_HOST`가 존재하면 해당 값을 사용하고, 환경 변수가 없을 경우 기본값으로 `localhost`를 사용합니다.

 즉,

```
SPRING_REDIS_HOST 존재
        ↓
환경 변수 값 사용

SPRING_REDIS_HOST 없음
        ↓
localhost 사용
```

 와 같은 방식으로 동작합니다.

 ### Port

```
port: ${SPRING_REDIS_PORT:6379}
```

 Redis 연결 Port를 설정합니다.

 기본값은 Redis의 일반적인 Port인 `6379`입니다.

 ### Redis Repository 비활성화

```
repositories:
  enabled: false
```

 Spring Data Redis Repository 기능을 비활성화합니다.

 현재 프로젝트에서는 Redis를 Repository 기반 데이터 접근보다는 Redis 자체의 기능을 활용하는 형태로 구성하기 위한 설정으로 볼 수 있습니다.

---

 # 4\. JPA 설정

```
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

 ## 4.1 `ddl-auto`

```
ddl-auto: validate
```

 Hibernate가 Entity와 실제 데이터베이스 스키마를 비교하여 일치하는지 검증하도록 설정합니다.

 `validate`에서는 Hibernate가 데이터베이스의 테이블을 직접 생성하거나 변경하지 않습니다.

 따라서 데이터베이스 Schema 변경은 Flyway Migration을 통해 관리하고, JPA는 현재 Schema가 Entity와 일치하는지 검증하는 구조입니다.

 ### 설정 목적

```
Entity
  ↓
Hibernate Schema 검증
  ↓
DB Schema
```

 DB 구조가 Entity와 맞지 않는 경우 애플리케이션 실행 과정에서 문제를 확인할 수 있습니다.

---

 # 5\. Flyway 설정

```
spring:
  flyway:
    enabled: true
    baseline-on-migrate: false
```

 ## 5.1 Flyway 활성화

```
enabled: true
```

 애플리케이션 실행 시 Flyway Migration을 활성화합니다.

 Flyway를 이용하여 데이터베이스 Schema 변경 이력을 Migration 파일로 관리할 수 있습니다.

 ## 5.2 Baseline 설정

```
baseline-on-migrate: false
```

 Migration 수행 시 기존 데이터베이스에 자동으로 Baseline을 생성하지 않도록 설정합니다.

 따라서 현재 프로젝트에서는 Migration 이력을 명확하게 관리하고, 기존 데이터베이스를 임의로 Baseline 처리하지 않는 방향으로 설정되어 있습니다.

---

 # 6\. JWT 설정

```
spring:
  jwt:
    secret: this_is_a_very_long_secret_key_for_jwt_signing_123456
    expiration: 3600000
    access-expiration: 3600000
    refresh-expiration: 604800000
```

 JWT 인증에 필요한 Secret 및 Token 만료 시간을 설정합니다.  GitHub

 ## 6.1 JWT Secret

```
secret: this_is_a_very_long_secret_key_for_jwt_signing_123456
```

 JWT 서명 및 검증에 사용하는 Secret Key입니다.

 실제 운영 환경에서는 Secret Key를 소스 코드에 직접 작성하기보다는 환경 변수 또는 Secret 관리 시스템을 사용하는 것이 적절합니다.

 ## 6.2 Token 만료 시간

```
expiration: 3600000
access-expiration: 3600000
refresh-expiration: 604800000
```

 현재 설정값은 밀리초 기준으로 구성되어 있습니다.

 | 설정 | 값 | 시간 |
| --- | --- | --- |
| `expiration` | `3600000` | 1시간 |
| `access-expiration` | `3600000` | 1시간 |
| `refresh-expiration` | `604800000` | 7일 |

따라서 현재 설정에서는 Access Token의 만료 시간이 1시간, Refresh Token의 만료 시간이 7일로 설정되어 있습니다.

---

 # 7\. Actuator / Prometheus 설정

```
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
```

 Spring Boot Actuator Endpoint 중 다음 Endpoint를 외부 HTTP 환경에 노출합니다.

 - `prometheus`
- `health`
- `info`

 ## 7.1 Prometheus

```
/prometheus
```

 Prometheus가 Backend의 Metric 정보를 수집할 수 있도록 Endpoint를 노출합니다.

 ## 7.2 Health

```
/health
```

 애플리케이션의 상태를 확인하기 위한 Health Endpoint입니다.

 Docker, Kubernetes 등의 환경에서 애플리케이션 상태 확인 용도로 활용할 수 있습니다.

 ## 7.3 Info

```
/info
```

 애플리케이션 정보를 확인하기 위한 Endpoint입니다.

---

 # 8\. Health 상세 정보

```
management:
  endpoint:
    health:
      slow-details: always
```

 Health Endpoint에서 상세 정보를 확인할 수 있도록 설정되어 있습니다.

 이를 통해 애플리케이션의 Health 상태뿐만 아니라 관련 구성 요소의 상태 정보를 확인할 수 있습니다.

---

 # 9\. application.properties

 `application.properties`는 주로 **실행 환경 및 인프라 연결 정보**를 설정합니다.

 현재 `main` 브랜치에서는 서버 Port, MySQL, JPA, Flyway, Redis 설정이 포함되어 있습니다.  GitHub

---

 # 10\. Server 설정

```
server.port=8080
```

 Backend 애플리케이션이 `8080` Port에서 실행되도록 설정합니다.

 따라서 기본적인 Backend 접근 주소는 다음과 같은 형태가 됩니다.

```
http://localhost:8080
```

---

 # 11\. MySQL 설정

```
spring.datasource.url=jdbc:mysql://mysql:3306/eventdb?serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=password
```

 MySQL 데이터베이스와 Backend를 연결하기 위한 설정입니다.  GitHub

 ## 11.1 Database URL

```
spring.datasource.url=jdbc:mysql://mysql:3306/eventdb?serverTimezone=Asia/Seoul&useUnicode=true&characterEncoding=UTF-8
```

 현재 Docker 환경의 MySQL 컨테이너를 대상으로 연결하도록 구성되어 있습니다.

 | 항목 | 값 |
| --- | --- |
| DB Host | `mysql` |
| Port | `3306` |
| Database | `eventdb` |
| Timezone | `Asia/Seoul` |
| Encoding | UTF-8 |

여기서 `mysql`은 일반적인 외부 서버 주소가 아니라 Docker Compose 등에서 정의한 MySQL 서비스 이름으로 사용되는 구성입니다.

 ## 11.2 JDBC Driver

```
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
```

 MySQL JDBC Driver를 사용하도록 설정합니다.

 ## 11.3 Database 계정

```
spring.datasource.username=root
spring.datasource.password=password
```

 MySQL 접속 계정을 설정합니다.

 > 운영 환경에서는 DB 계정 및 비밀번호를 Repository에 직접 저장하지 않고 환경 변수나 Secret 관리 기능을 사용하는 것이 권장됩니다.

---

 # 12\. JPA 설정

```
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

 ## 12.1 Schema 검증

```
spring.jpa.hibernate.ddl-auto=validate
```

 `application.yaml`의 설정과 동일하게 Hibernate가 Entity와 DB Schema를 검증하도록 합니다.

 Schema 생성 및 변경은 Hibernate가 아닌 Flyway에서 담당하도록 분리되어 있습니다.

 ## 12.2 SQL 출력

```
spring.jpa.show-sql=true
```

 JPA가 실행하는 SQL을 로그에 출력합니다.

 개발 단계에서 실제 실행되는 SQL을 확인할 때 유용합니다.

 ## 12.3 SQL Formatting

```
spring.jpa.properties.hibernate.format_sql=true
```

 Hibernate가 출력하는 SQL을 보기 쉽게 Formatting합니다.

 예를 들어 여러 줄로 구성된 SQL을 사람이 읽기 쉬운 형태로 출력할 수 있습니다.

---

 # 13\. Flyway 설정

```
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=false
```

 `application.yaml`과 동일하게 Flyway Migration을 활성화하고 자동 Baseline 생성을 비활성화합니다.

 즉, 프로젝트의 데이터베이스 변경은 Flyway Migration을 기준으로 관리합니다.

---

 # 14\. Redis 설정

```
spring.data.redis.host=redis
spring.data.redis.port=6379
spring.data.redis.repositories.enabled=false
```

 Docker 환경에서 실행되는 Redis 서비스에 연결하도록 구성되어 있습니다.  GitHub

 | 설정 | 값 |
| --- | --- |
| Host | `redis` |
| Port | `6379` |
| Redis Repository | 비활성화 |

`application.yaml`과 비교하면 Redis Host 설정 방식에 차이가 있습니다.

 ### application.yaml

```
host: ${SPRING_REDIS_HOST:localhost}
```

 환경 변수를 우선 사용하고 기본값으로 `localhost`를 사용합니다.

 ### application.properties

```
spring.data.redis.host=redis
```

 Docker 환경의 Redis 서비스 이름인 `redis`를 직접 지정합니다.

 따라서 두 설정 파일을 함께 사용할 경우 **설정 우선순위와 실제 실행 환경에 따른 적용 값을 확인할 필요가 있습니다.**

---

 # 15\. YAML과 Properties의 역할

 현재 설정을 기능별로 정리하면 다음과 같습니다.

 | 기능 | `application.yaml` | `application.properties` |
| --- | --- | --- |
| Server Port | - | `8080` |
| MySQL | - | O |
| JPA | O | O |
| Flyway | O | O |
| Redis | O | O |
| JWT | O | - |
| Actuator | O | - |
| Prometheus | O | - |

즉, 현재 프로젝트에서는 두 파일이 완전히 동일한 설정을 가지고 있는 것이 아니라 서로 다른 설정을 포함하고 있습니다.

 특히 다음 영역은 `application.yaml`에서 관리합니다.

 - JWT
- Actuator
- Prometheus
- Redis 환경 변수 기반 설정
- JPA/Flyway 기본 설정

 반면 `application.properties`에서는 다음과 같은 실행 환경 설정이 관리됩니다.

 - Server Port
- MySQL 연결 정보
- JPA SQL 출력
- Docker Redis 연결 정보

---

 # 16\. 설정 구조 요약

 전체적인 Backend 설정 흐름은 다음과 같습니다.

```
Spring Boot Application
        │
        ├── application.yaml
        │      ├── Redis
        │      ├── JPA
        │      ├── Flyway
        │      ├── JWT
        │      └── Actuator / Prometheus
        │
        └── application.properties
               ├── Server
               ├── MySQL
               ├── JPA
               ├── Flyway
               └── Redis
```

 인프라 관점에서는 다음과 같은 구조입니다.

```
             ┌───────────────┐
             │ Spring Boot   │
             │    Backend    │
             └───────┬───────┘
                     │
          ┌──────────┼──────────┐
          │          │          │
          ▼          ▼          ▼
       MySQL       Redis      Actuator
      :3306       :6379         │
          │          │           ▼
          │          │       Prometheus
          │          │
          └────┬─────┘
               │
          Application
             Data
```

---

 # 17\. 운영 환경 적용 시 주의사항

 현재 `main`의 설정에는 개발 및 Docker 환경에서 바로 사용할 수 있는 값들이 포함되어 있습니다.

 특히 다음 값은 운영 환경에서 별도의 Secret 관리가 필요합니다.

```
spring.datasource.username=root
spring.datasource.password=password
```

 그리고 JWT Secret 역시 현재 설정 파일에 직접 작성되어 있습니다.

```
spring:
  jwt:
    secret: this_is_a_very_long_secret_key_for_jwt_signing_123456
```

 운영 환경에서는 다음과 같은 형태로 분리하는 것을 권장합니다.

```
spring:
  jwt:
    secret: ${JWT_SECRET}
```

 DB 역시 다음과 같이 환경 변수로 관리할 수 있습니다.

```
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
```

 이를 통해 민감한 인증 정보를 Git Repository에 직접 저장하지 않고 실행 환경에서 주입할 수 있습니다.

---

 # 18\. 최종 정리

 현재 `resources` 설정은 크게 다음 역할로 구분됩니다.

 ### `application.yaml`

 **애플리케이션 기능 및 공통 설정**

 - Redis
- JPA Schema Validation
- Flyway
- JWT 인증
- Actuator
- Prometheus
- Health Check

 ### `application.properties`

 **실행 및 인프라 연결 설정**

 - Server Port
- MySQL Connection
- JPA SQL Logging
- Flyway
- Docker Redis

 두 파일을 함께 사용하면서 Backend 애플리케이션의 실행 환경과 인증/모니터링 관련 설정을 구성하고 있습니다.

 다만 동일한 설정이 YAML과 Properties에 중복되어 있는 부분이 있으므로, 추후에는 `application.yaml` 하나로 통합하거나 `application-local.yaml`, `application-dev.yaml`, `application-prod.yaml` 등의 Profile 기반 설정으로 분리하면 환경별 설정을 보다 명확하게 관리할 수 있습니다.

 참고로 **현재 `main`의 실제 파일을 확인해서 작성한 내용**입니다. `application.yaml`에는 JWT/Actuator 등이 있고, `application.properties`에는 MySQL/Docker/SQL 출력 설정 등이 실제로 들어 있습니다.  GitHub+1

