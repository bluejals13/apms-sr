
 Backend build.gradle 설정 문서


현재 build.gradle 설정 파일
[backend/build.gradle](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/build.gradle)



# Backend `build.gradle` 설정

 ## 1\. 개요

 본 문서는 `backend` 모듈에서 사용하는 Gradle 빌드 및 의존성 설정을 정리한 문서입니다.

 현재 Backend는 **Spring Boot 3.3.2**, **Java 17**을 기반으로 구성되어 있으며, 웹 애플리케이션 개발에 필요한 인증/인가, 데이터베이스, Redis, 데이터베이스 마이그레이션, 검증, 모니터링 및 테스트 환경을 포함합니다.

 - Spring Boot: `3.3.2`
- Java: `17`
- Build Tool: Gradle
- Repository: Maven Central
- Database: MySQL
- Cache / Session: Redis
- ORM: Spring Data JPA
- Database Migration: Flyway
- Authentication / Authorization: Spring Security + JWT
- Monitoring: Spring Actuator + Prometheus

 ## 2\. Gradle Plugin 설정

```
plugins {
    id 'java'
    id 'org.springframework.boot' version '3.3.2'
    id 'io.spring.dependency-management' version '1.1.3'
}
```

 ### Java Plugin

 `java` 플러그인을 사용하여 Java 프로젝트를 빌드할 수 있도록 구성합니다.

 ### Spring Boot Plugin

 Spring Boot 애플리케이션의 빌드 및 실행에 필요한 Gradle 기능을 제공합니다.

 현재 Spring Boot 버전은 `3.3.2`입니다.

 ### Dependency Management

 Spring 생태계에서 사용하는 라이브러리들의 버전을 일관성 있게 관리하기 위해 `io.spring.dependency-management` 플러그인을 사용합니다.

 ## 3\. 프로젝트 기본 설정

```
group = 'com.example'
version = '0.0.1-SNAPSHOT'
```

 프로젝트의 Group과 Version을 지정합니다.

 현재 프로젝트 버전은 개발 단계에서 사용하는 `0.0.1-SNAPSHOT`으로 설정되어 있습니다.

 ## 4\. Java 버전 설정

```
java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(17)
    }
}
```

 Java 17을 프로젝트의 기본 Java 버전으로 사용합니다.

 Gradle Toolchain을 사용하기 때문에 개발 환경에 설치된 Java 버전과 관계없이 프로젝트에서 지정한 Java 버전을 기준으로 빌드할 수 있습니다.

 ## 5\. Repository 설정

```
repositories {
    mavenCentral()
}
```

 외부 라이브러리 의존성은 Maven Central Repository에서 가져옵니다.

 ## 6\. 의존성 설정

 ### 6.1 Spring Security 및 인증

```
implementation 'org.springframework.boot:spring-boot-starter-security'
implementation 'org.springframework.boot:spring-boot-starter-oauth2-resource-server'

implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

 Backend의 인증 및 인가 기능을 구현하기 위한 의존성입니다.

 #### Spring Security

 Spring Security를 이용하여 다음과 같은 보안 기능을 구현할 수 있습니다.

 - 인증(Authentication)
- 인가(Authorization)
- API 접근 제어
- Security Filter 구성
- 사용자 권한 관리

 #### OAuth2 Resource Server

 OAuth2 Resource Server 기능을 사용하여 JWT 기반 인증을 처리할 수 있도록 구성되어 있습니다.

 #### JJWT

 `jjwt` 라이브러리는 JWT의 생성 및 검증을 위해 사용합니다.

 구성은 다음과 같습니다.

 | 의존성 | 용도 |
| --- | --- |
| `jjwt-api` | JWT API |
| `jjwt-impl` | JWT 구현체 |
| `jjwt-jackson` | JSON 직렬화/역직렬화 |

JJWT 버전은 `0.11.5`입니다.

 ## 7\. Web 설정

```
implementation 'org.springframework.boot:spring-boot-starter-web'
```

 Spring MVC 기반의 REST API 및 웹 애플리케이션 개발을 위한 의존성입니다.

 Controller를 이용한 HTTP API 개발과 JSON 기반 요청/응답 처리를 지원합니다.

 ## 8\. Redis 설정

```
implementation 'org.springframework.boot:spring-boot-starter-data-redis'
```

 Redis 연동을 위한 Spring Data Redis 의존성입니다.

 Redis를 활용하여 캐시, 임시 데이터 저장, 세션 관리 등의 기능을 구현할 수 있습니다.

 ## 9\. JPA 및 MySQL 설정

```
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
runtimeOnly 'com.mysql:mysql-connector-j'
```

 ### Spring Data JPA

 JPA 기반의 데이터 접근 계층을 구성합니다.

 Entity와 Repository를 이용하여 데이터베이스 CRUD 및 객체 중심의 데이터 접근을 구현할 수 있습니다.

 ### MySQL

```
runtimeOnly 'com.mysql:mysql-connector-j'
```

 MySQL 데이터베이스와 Backend 애플리케이션을 연결하기 위한 JDBC Driver입니다.

 ## 10\. Flyway 설정

```
implementation 'org.flywaydb:flyway-core:11.0.0'
implementation 'org.flywaydb:flyway-mysql:11.0.0'
```

 데이터베이스 스키마를 버전 단위로 관리하기 위해 Flyway를 사용합니다.

 Flyway를 통해 데이터베이스 변경 사항을 Migration 파일로 관리할 수 있습니다.

 예를 들어 다음과 같은 형태로 데이터베이스 변경 이력을 관리할 수 있습니다.

```
V1__init.sql
V2__add_user.sql
V3__add_auth.sql
```

 이를 통해 개발 환경과 운영 환경에서 동일한 순서로 데이터베이스 변경 사항을 적용할 수 있습니다.

 ## 11\. Validation 설정

```
implementation 'org.springframework.boot:spring-boot-starter-validation'
```

 DTO의 입력값 검증을 위해 Spring Validation을 사용합니다.

 예를 들어 다음과 같은 검증 기능을 사용할 수 있습니다.

```
@NotNull
@NotBlank
@Email
@Size
```

 Controller에서 `@Valid` 등을 사용하여 클라이언트 요청 데이터의 유효성을 검증할 수 있습니다.

 ## 12\. Actuator 및 Monitoring

```
implementation 'org.springframework.boot:spring-boot-starter-actuator'
implementation 'io.micrometer:micrometer-registry-prometheus'
```

 애플리케이션 상태 및 운영 지표를 확인하기 위한 모니터링 환경입니다.

 ### Spring Actuator

 애플리케이션의 상태 및 운영 정보를 확인할 수 있는 Endpoint를 제공합니다.

 ### Prometheus

 Micrometer Prometheus Registry를 사용하여 애플리케이션의 Metric을 Prometheus 형식으로 노출할 수 있습니다.

 이를 이용하면 향후 Prometheus 및 Grafana 등을 활용한 모니터링 환경을 구성할 수 있습니다.

 ## 13\. Thymeleaf

```
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
```

 서버 사이드 HTML 렌더링을 위한 Thymeleaf를 사용합니다.

 현재 Backend가 REST API 중심으로 구성되는 경우 실제 사용 여부에 따라 해당 의존성을 제거할 수 있습니다.

 ## 14\. 테스트 설정

 ### Spring Boot Test

```
testImplementation 'org.springframework.boot:spring-boot-starter-test'
```

 Spring Boot 애플리케이션의 단위 테스트 및 통합 테스트를 위한 기본 테스트 환경을 제공합니다.

 ### Spring Security Test

```
testImplementation 'org.springframework.security:spring-security-test'
```

 Security가 적용된 Controller 및 인증/인가 로직을 테스트하기 위한 라이브러리입니다.

 ### H2

```
testImplementation 'com.h2database:h2'
```

 테스트 환경에서 사용할 수 있는 인메모리 데이터베이스입니다.

 개발/운영 환경에서는 MySQL을 사용하면서 테스트에서는 H2를 사용하여 데이터베이스 테스트를 독립적으로 수행할 수 있습니다.

 ## 15\. Lombok

```
compileOnly 'org.projectlombok:lombok'
annotationProcessor 'org.projectlombok:lombok'

testCompileOnly 'org.projectlombok:lombok'
testAnnotationProcessor 'org.projectlombok:lombok'
```

 Lombok을 사용하여 반복적인 Java 코드를 줄입니다.

 대표적으로 다음과 같은 기능을 사용할 수 있습니다.

 - `@Getter`
- `@Setter`
- `@Builder`
- `@NoArgsConstructor`
- `@AllArgsConstructor`
- `@RequiredArgsConstructor`

 `compileOnly`와 `annotationProcessor`를 사용하여 Lombok이 애플리케이션의 runtime dependency로 포함되지 않도록 구성합니다.

 ## 16\. 테스트 실행 설정

```
tasks.named('test') {
    useJUnitPlatform()
}
```

 JUnit Platform을 사용하여 테스트를 실행하도록 설정합니다.

 Spring Boot에서 사용하는 JUnit 5 기반 테스트를 실행하기 위한 설정입니다.

 ## 17\. 전체 의존성 구성

 | 구분 | 라이브러리 | 목적 |
| --- | --- | --- |
| Framework | Spring Boot 3.3.2 | Backend 애플리케이션 |
| Language | Java 17 | 개발 언어 |
| Security | Spring Security | 인증/인가 |
| Auth | OAuth2 Resource Server | JWT 기반 Resource Server |
| JWT | JJWT 0.11.5 | JWT 생성 및 검증 |
| Web | Spring Web | REST API |
| Cache | Spring Data Redis | Redis 연동 |
| ORM | Spring Data JPA | ORM 및 데이터 접근 |
| Database | MySQL Connector | MySQL 연결 |
| Migration | Flyway 11.0.0 | DB Schema Migration |
| Validation | Spring Validation | 요청 데이터 검증 |
| Monitoring | Spring Actuator | 애플리케이션 모니터링 |
| Metrics | Micrometer Prometheus | Prometheus Metric |
| Template | Thymeleaf | 서버 사이드 HTML |
| Test | Spring Boot Test | 테스트 |
| Security Test | Spring Security Test | 보안 테스트 |
| Test DB | H2 | 테스트용 DB |
| Utility | Lombok | Boilerplate 코드 감소 |

## 18\. 구성 요약

 현재 `backend/build.gradle`은 단순한 Spring Boot 웹 애플리케이션을 넘어 **인증/인가, 데이터베이스, Redis, DB Migration, Validation, 모니터링 및 테스트까지 포함한 Backend 개발 환경**을 구성하고 있습니다.

 특히 인증 영역에서는 Spring Security와 OAuth2 Resource Server, JJWT를 함께 사용하고 있으며, 데이터 영역에서는 JPA와 MySQL을 사용하고 Flyway를 통해 데이터베이스 변경 이력을 관리하도록 구성되어 있습니다.

 또한 Actuator와 Prometheus 연동을 통해 향후 애플리케이션 상태 및 Metric을 수집할 수 있는 기반이 마련되어 있습니다.

 ### 참고

 - `backend/build.gradle` — `main` 브랜치 기준
- Spring Boot: `3.3.2`
- Java: `17`
- JJWT: `0.11.5`
- Flyway: `11.0.0`

