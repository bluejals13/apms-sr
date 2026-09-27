

# Backend Test Environment Setting

## 1. 개요

* **목적:** 백엔드 통합 테스트 및 Spring Security 인증/인가 로직 검증을 위한 독립적인 격리 테스트 환경(H2 In-Memory DB) 설정 및 데이터 초기화 명세.
* **적용 환경:** Spring Boot `@SpringBootTest` 및 테스트 프로파일(`test`)

## 2. 테스트 환경 설정 (`application-test.properties`)

| 설정 영역 | 주요 속성 (Property) | 값 | 역할 및 목적 |
| --- | --- | --- | --- |
| **Database** | `spring.datasource.url` | `jdbc:h2:mem:testdb;MODE=MySQL;DB_CLOSE_DELAY=-1` | H2 인메모리 DB 사용 및 MySQL 문법 호환 모드 적용 |
| **JPA** | `spring.jpa.hibernate.ddl-auto` | `validate` | Hibernate 자동 생성 방지 (Flyway에 위임) |
| **Flyway** | `spring.flyway.enabled` | `true` | 테스트 구동 시점에도 V1~Vn 마이그레이션 정상 적용 |
| **Redis** | `spring.data.redis.repositories.enabled` | `false` | 테스트 환경에서 불필요한 Redis 의존성 차단 |

### 💡 Design Notes (환경 설정)

* **H2 + MySQL Mode:** 테스트 속도를 높이기 위해 인메모리 DB인 H2를 사용하되, 운영 환경(MySQL)용으로 작성된 Flyway SQL(`V1~V6`)이 테스트 환경에서도 에러 없이 동일하게 실행되도록 `MODE=MySQL` 속성을 부여했습니다.
* **독립성과 멱등성 보장:** 외부 인프라(Docker MySQL, Redis)에 의존하지 않고, 테스트 코드가 실행될 때마다 새롭게 DB가 구축되고 소멸하도록 구성하여 CI/CD 파이프라인에서의 테스트 신뢰성을 높였습니다.

## 3. 테스트 데이터 초기화 (`security-test-data.sql`)

| 대상 테이블 | 수행 작업 (Action) | 설명 |
| --- | --- | --- |
| `user_roles`, `users` | `DELETE` | 기존 데이터 삭제를 통한 테스트 멱등성(Idempotency) 확보 |
| `users` | `INSERT` | 인증 테스트용 계정 2개 (`testuser`, `admin`) 삽입 |
| `user_roles` | `INSERT` | `testuser`에는 USER 권한, `admin`에는 ADMIN 권한 매핑 |

### 💡 Design Notes (초기화 전략)

* **테스트 간 간섭(Side Effect) 방지:** `@Sql` 스크립트 실행 시, 단순히 `INSERT`만 수행하지 않고 관련 테이블의 데이터를 먼저 `DELETE` 하도록 작성했습니다. 이를 통해 여러 테스트가 순서를 보장하지 않고 실행되더라도 데이터 충돌(PK 중복 등)이 발생하지 않도록 방어했습니다.
* **Hash 비밀번호 적용:** 인증 통합 테스트가 실제 로그인 과정과 100% 동일하게 동작하도록 평문이 아닌 BCrypt Hash 비밀번호를 삽입했습니다.

## 4. 관련 파일 맵핑

| 파일 역할 | Source Path |
| --- | --- |
| **설계 파일** | `backend/src/test/resources/application-test.properties` |
| **데이터 파일** | `backend/src/test/resources/sql/security-test-data.sql` |


## [application-test.properties](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/application-test.properties)
## [security-test-data.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/sql/security-test-data.sql)

