# APMS-SR Backend Glossary

> APMS-SR Backend 문서에서 사용하는 용어와
> 프로젝트 내 의미를 정의한다.

---

## 1. Purpose

이 문서는 APMS-SR 프로젝트의 Flyway Migration 및 인증/인가 관련 문서를 읽을 때 반복해서 등장하는 공통 용어를 정리한 Glossary(용어집)이다. 이후 관련된 하위 문서(V1~V6 Migration 등)를 읽을 때 공통 참고 자료로 사용한다.

---

## 2. Definition Rule

용어는 다음 우선순위에 따라 정의한다.

1. **프로젝트의 실제 구현 및 설계**를 우선한다.
2. 구현 또는 설계에서 명확한 정의가 없는 경우 **프로젝트의 공식 문서 및 API 계약**을 기준으로 한다.
3. 프로젝트 기준이 없는 경우 해당 기술 영역에서 **일반적으로 통용되는 의미**를 사용한다.
4. 동일한 용어가 문맥에 따라 다른 의미를 가질 경우, **APMS-SR Backend 문맥에서의 의미를 별도로 명시**한다.
5. 한 번 정의된 용어는 특별한 변경 사유가 없는 한 프로젝트 문서 전체에서 동일한 의미로 사용한다.
6. 정의가 변경되는 경우 관련 문서와 구현에 미치는 영향을 함께 확인한다.

---

## 3. Authentication / Authorization

| 용어 | 프로젝트 내 정의 | 관련 영역 | 관련 문서 |
| --- | --- | --- | --- |
| Authentication (인증) | 현재 로그인한 사용자가 누구인지("당신이 누구인지") 확인하는 과정 및 인증 정보 | Security | Security, V1 |
| Authorization (인가) | 인증된 사용자가 특정 기능을 수행할 수 있는지("무엇을 할 수 있는지") 확인하는 접근 권한 검증 | RBAC | Security, V2, V4 |
| User | 시스템을 사용하는 사용자 (DB의 `users` 테이블에 저장됨) | Account | V1 |
| Role | 사용자에게 부여되는 역할 또는 그룹 (예: ADMIN, USER) | RBAC | V1, V2, V3 |
| Permission | 시스템에서 특정 기능을 수행할 수 있는 권한 단위 (예: USER_READ) | RBAC | V1, V2, V4 |
| Principal | 현재 인증된 사용자를 나타내는 보안 주체 | Security | - |
| Authority | Spring Security에서 접근 권한을 표현하는 개념 (Permission과 매핑) | Security | V6 |

---

## 4. Database

| 용어 | 프로젝트 내 정의 | 관련 영역 | 관련 문서 |
| --- | --- | --- | --- |
| Schema | 테이블, 컬럼, 제약조건 등 DB의 전체적인 구조 | Flyway | V1~Vn |
| Table | 데이터를 저장하는 구조적인 기본 단위 (예: `users`, `roles`) | DB | Base-DB , Key |
| Column | 테이블에서 어떤 종류의 데이터를 저장할지 정의하는 항목 | DB | Base-DB , Key |
| Row (Record) | 테이블에 실제로 저장된 데이터 한 건 | DB | Base-DB , Key |
| Primary Key (PK) | 테이블에서 각 Row(데이터)를 고유하게 식별하는 키 | DB | Base-DB , Key |
| Foreign Key (FK) | 다른 테이블의 데이터를 참조하기 위해 사용하는 식별 키 | DB | Base-DB , Key |
| Constraint | 데이터 무결성을 위해 DB가 지켜야 하는 규칙 (예: UNIQUE, NOT NULL) | DB | Base-Constraint , Data_Type |


## 기본 DB 와 Key 관련 용어 3~4
[Base-DB , Key.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-DB%20%2C%20Key.md)


## 기본 Constraint 과 Data_Type 관련 용어 5~6
[Base-Constraint , Data_Type.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-Constraint%20%2C%20Data_Type.md)


---

## 5. Migration / Flyway

| 용어 | 프로젝트 내 정의 | 관련 문서 |
| --- | --- | --- |
| Migration | Database의 구조(Schema)나 데이터를 변경/초기화하는 작업 단위 | Flyway, V1~V6 |
| Version | Migration이 실행되는 순서를 나타내는 고유 번호 | Flyway |
| Flyway | Database Migration을 버전별로 관리하고 자동 실행해 주는 도구 | Base-SQL , Flyway |
| V1 | Initial Schema (사용자, 역할, 권한의 뼈대가 되는 초기 테이블 생성) | 01_V1__init_schema.md |
| V2 | Relationship Schema (`user_roles`, `role_permissions` 등 N:M 관계 테이블 생성) | 02_V2__init_authority_schema.md |


## 기본 SQL 와 Flyway 관련 용어 7~8
[Base-SQL , Flyway.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-SQL%20%2C%20Flyway.md)


---

## 6. Project-specific Terms

| 용어 | 정의 | 근거 / Source | 관련 문서 |
| --- | --- | --- | --- |
| RBAC | Role-Based Access Control. 사용자에게 부여된 역할(Role)을 기반으로 접근 권한(Permission)을 제어하는 방식. | 구조 설계 | Security |
| Audit Log | 시스템에서 발생한 작업 내역("누가, 언제, 무엇을 했는가")을 추적하고 기록한 데이터 (`audit_logs` 테이블). | 요구사항 | V3 |
| @PreAuthorize | Spring Security에서 메서드 실행 전에 사용자의 권한(Authority)을 검사하는 Annotation. | Spring Security | V6 |
| 관계 테이블 | 다대다(N:M) 관계를 DB에 저장하기 위해 연결 고리 역할을 하는 중간 테이블 (예: `user_roles`). | DB 설계 | V2 |
| BCrypt | DB 저장 전 사용자의 평문 비밀번호를 안전하게 암호화(해싱)하는 알고리즘. | 보안/구현 | V5 |

---

## 7. Related Documents

* 00_Glossary.md
* 01_V1__init_schema.md
* 02_V2__init_authority_schema.md
* 03_V3__init_common_schema.md
* 04_V4__insert_permissions.md
* 05_V5__insert_test_users.md
* 06_V6__add_user_role_manage_permission.md
* [Base-DB , Key.md] Database 및 Key 관련 상세 용어
* [Base-Constraint , Data_Type.md] 제약 조건 및 자료형 관련 상세 용어
* [Base-SQL , Flyway.md] SQL 명령어 및 Flyway 관련 상세 용어

---


