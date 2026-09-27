# V5 — Insert Test Users

## Purpose

로컬 개발 및 API 테스트 환경에서 즉시 사용할 수 있는 초기 사용자(User) 계정을 생성하고, 각각 일반 사용자(`USER`)와 시스템 관리자(`ADMIN`) 역할을 부여하여 인증 및 인가 테스트 기반을 마련한다.

## Migration

`V5__insert_test_users.sql`

## Inserted Data

### users (초기 사용자 계정 삽입)

| id | username | password (Hash) | status | email | 용도 |
| --- | --- | --- | --- | --- | --- |
| `1` | `fpfns` | `$2a$10$mLxWb...` | ACTIVE | `testuser@test.com` | 일반 사용자 권한 테스트 |
| `2` | `test` | `$2a$10$eFZu4...` | ACTIVE | `admin@test.com` | 관리자 권한 테스트 |

### user_roles (초기 사용자 권한 부여)

| user_id | 할당된 Role | 삽입 방식 |
| --- | --- | --- |
| `1` (`fpfns`) | **USER** | 서브쿼리(`SELECT id FROM roles WHERE name = 'USER'`)를 통한 동적 매핑 |
| `2` (`test`) | **ADMIN** | 서브쿼리(`SELECT id FROM roles WHERE name = 'ADMIN'`)를 통한 동적 매핑 |

## Design Notes

### 보안을 고려한 암호화 테스트 데이터

테스트용 초기 데이터임에도 불구하고 비밀번호를 평문(Plain Text)으로 하드코딩하지 않았습니다. Spring Security의 BCryptPasswordEncoder 검증 로직이 정상 작동하도록 해싱된 결과값(`$2a$10$...`)을 삽입하여, 실제 운영 환경과 동일한 로그인 인증(Authentication) 프로세스를 테스트할 수 있게 구성했습니다.

### 서브쿼리를 활용한 안전한 관계 매핑

`user_roles` 테이블에 Role ID를 삽입할 때 매직 넘버(예: `1`, `2`)를 직접 입력하지 않고, `WHERE name = 'USER'`와 같은 서브쿼리를 사용하여 ID 값이 변경되더라도 안전하게 권한이 매핑되도록 처리했습니다.

## Migration Boundary

V4:
시스템 기본 Permission 목록 생성 및 Role-Permission 관계 매핑

V5:
로컬 개발 및 테스트를 위한 사용자(USER, ADMIN) 계정 초기화 및 Role 부여

V6:
`USER_ROLE_MANAGE` 권한 추가 및 ADMIN Role 연결

## Verification

| Item | Result |
| --- | --- |
| users 테이블에 `fpfns`, `test` 계정 정상 삽입 | ✅ |
| 삽입된 계정의 password가 BCrypt Hash 형태로 저장됨 | ✅ |
| `fpfns` 계정에 USER Role 할당 | ✅ |
| `test` 계정에 ADMIN Role 할당 | ✅ |

## 현재 사용 중인 Flyway, V5__insert_test_users.sql

[migration/V5__insert_test_users.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/src/main/resources/db/migration/V5__insert_test_users.sql)