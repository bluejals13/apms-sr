맞아. **V1부터 들어가기 전에 공통 용어집(Glossary)을 하나 먼저 두는 게 훨씬 좋다.**\
 특히 이 프로젝트는 SQL, DB, Flyway, Spring Security, 인증/인가 용어가 섞여 있어서 먼저 단어를 통일해두면 이후 V1\~V6 문서가 훨씬 편해진다.

 아래처럼 \*\*`00_Glossary.md`\*\*를 기준 문서로 두는 것을 추천해.

 # APMS-SR Database & Authentication Glossary

 ## 1\. 문서 목적

 이 문서는 APMS-SR 프로젝트의 Flyway Migration 및 인증/인가 관련 문서를 읽을 때 반복해서 등장하는 공통 용어를 정리한 Glossary(용어집)이다.

 이후 다음 문서를 읽을 때 이 문서를 공통 참고 자료로 사용한다.

```
00_Glossary.md
      │
      ├── 01_V1__init_schema.md
      ├── 02_V2__init_authority_schema.md
      ├── 03_V3__init_common_schema.md
      ├── 04_V4__insert_permissions.md
      ├── 05_V5__insert_test_users.md
      └── 06_V6__add_user_role_manage_permission.md
```

---

 # 2\. 가장 먼저 알아야 하는 핵심 단어

 이 프로젝트를 이해할 때 다음 10개를 먼저 기억한다.

 | 용어 | 한 줄 설명 |
| --- | --- |
| Database | 데이터를 저장하고 관리하는 공간 |
| Table | 데이터를 행과 열 형태로 저장하는 구조 |
| Column | 테이블에서 데이터의 종류를 정의하는 항목 |
| Row | 테이블에 저장된 하나의 데이터 |
| Primary Key | 데이터를 고유하게 식별하는 값 |
| Foreign Key | 다른 테이블의 데이터를 참조하는 값 |
| Migration | 데이터베이스 구조/데이터를 변경하는 작업 |
| Flyway | DB Migration을 버전별로 관리하고 실행하는 도구 |
| Role | 사용자의 역할/그룹 |
| Permission | 사용자가 수행할 수 있는 기능/권한 |

이것만 먼저 이해해도 이후 문서의 상당 부분을 읽을 수 있다.

---
## 기본 DB 와 Key 관련 용어 3~4
[Base-DB , Keyt.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-DB , Keyt.md)

---
## 기본 Constraint 과 Data_Type 관련 용어 5~6
[Base-Constraint , Data_Type.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-Constraint , Data_Type.md)

---
## 기본 SQL 와 Flyway 관련 용어 7~8
[Base-DB , Keyt.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/sql-flyway_glossary/Base-DB , Keyt.md)

---

 # 9\. Authentication / Authorization 관련 용어

 이 프로젝트를 이해하려면 여기부터 중요도가 올라간다.

---

 ## 9.1 Authentication

 **인증**

 > "당신이 누구인지 확인하는 것"

 예:

```
username = alice
password = ****
```

 를 입력했을 때:

```
"이 사용자가 실제 alice인가?"
```

 를 확인하는 것이 Authentication이다.

 쉽게:

```
Authentication
=
Who are you?
```

---

 ## 9.2 Authorization

 **인가**

 > "당신이 무엇을 할 수 있는지 확인하는 것"

 예:

```
alice
```

 가 로그인에 성공했다고 하자.

 그 다음:

```
USER_DELETE
```

 기능을 실행할 수 있는지 확인하는 것이 Authorization이다.

 쉽게:

```
Authorization
=
What are you allowed to do?
```

---

 ## 9.3 Authentication vs Authorization

 둘을 반드시 구분해야 한다.

 | 개념 | 질문 |
| --- | --- |
| Authentication | "너 누구야?" |
| Authorization | "너 이거 해도 돼?" |

예:

```
로그인
 ↓
Authentication
 ↓
alice라는 사용자임을 확인
 ↓
Authorization
 ↓
USER_DELETE 권한이 있는지 확인
```

---

 # 10\. User 관련 용어

 ## 10.1 User

 시스템을 사용하는 사용자다.

 DB에서는:

```
users
```

 테이블에 저장된다.

 예:

```
username = alice
email = alice@example.com
status = ACTIVE
```

---

 ## 10.2 User ID

 사용자를 식별하는 고유 ID다.

 예:

```
user_id = 10
```

 DB의:

```
users.id
```

 와 연결된다.

---

 ## 10.3 Username

 사용자의 로그인 이름 또는 사용자 식별 이름이다.

 V1에서는:

```
username VARCHAR(255) UNIQUE
```

 로 정의되어 있다.

---

 ## 10.4 User Status

 사용자의 현재 상태다.

 APMS-SR V1에서는:

```
ACTIVE
DELETED
DELETE_PENDING
SUSPENDED
```

 가 정의되어 있다.

---

 # 11\. Role 관련 용어

 ## 11.1 Role

 Role은 사용자의 **역할 또는 그룹**이다.

 예:

```
ADMIN
USER
```

 쉽게:

 > "이 사용자는 어떤 종류의 사용자인가?"

 를 표현한다.

---

 ## 11.2 ADMIN

 관리자 역할을 의미하는 Role 이름이다.

 프로젝트에서는 이후 Migration에서 생성된다.

 개념:

```
ADMIN
=
관리자 역할
```

---

 ## 11.3 USER

 일반 사용자 역할을 의미한다.

 개념:

```
USER
=
일반 사용자 역할
```

---

 ## 11.4 Role Level

 Role의 레벨을 숫자로 표현하는 값이다.

 V1에서는:

```
level INT NOT NULL DEFAULT 10
```

 으로 정의되어 있다.

 정확한 비즈니스 규칙은 애플리케이션의 실제 사용처를 함께 확인해야 한다.

---

 ## 11.5 System Role

 시스템에서 기본적으로 관리하는 Role을 의미한다.

 V1의:

```
is_system BOOLEAN
```

 컬럼이 이 정보를 저장한다.

---

 # 12\. Permission 관련 용어

 ## 12.1 Permission

 Permission은 **특정 기능을 수행할 수 있는 권한**이다.

 예:

```
USER_READ
USER_DELETE
MENU_READ
MENU_CREATE
```

 쉽게:

 > "무엇을 할 수 있는가?"

 를 표현한다.

---

 ## 12.2 Permission Name

 Permission을 코드에서 식별하기 위한 이름이다.

 예:

```
USER_READ
```

---

 ## 12.3 Permission Description

 Permission의 사람이 읽기 쉬운 설명이다.

 예:

```
name = USER_READ
description = 사용자 조회
```

---

 # 13\. RBAC 관련 용어

 ## 13.1 RBAC

 **Role-Based Access Control**

 즉:

 > 역할(Role)을 기반으로 접근 권한을 관리하는 방식

 이다.

 APMS-SR의 권한 구조를 이해할 때 매우 중요한 개념이다.

---

 ## 13.2 RBAC의 기본 구조

```
User
  ↓
Role
  ↓
Permission
```

 예:

```
alice
 ↓
USER
 ↓
USER_READ
```

 의미:

 > alice는 USER Role을 가지고 있고, USER Role에는 USER\_READ 권한이 있다.

---

 ## 13.3 User → Role

 한 사용자가 하나 이상의 Role을 가질 수 있도록 설계할 수 있다.

 예:

```
alice
 ├─ USER
 └─ MANAGER
```

 이 관계를 DB에서는 별도의 관계 테이블을 이용해 표현한다.

---

 ## 13.4 Role → Permission

 하나의 Role이 여러 Permission을 가질 수 있다.

 예:

```
ADMIN
 ├─ USER_READ
 ├─ USER_DELETE
 ├─ MENU_READ
 └─ MENU_DELETE
```

---

 # 14\. 관계(Relationship) 관련 용어

 ## 14.1 1:1

 한 데이터와 하나의 데이터가 연결되는 관계다.

```
A → B
```

---

 ## 14.2 1:N

 하나의 데이터가 여러 데이터와 연결되는 관계다.

```
A
├─ B
├─ C
└─ D
```

---

 ## 14.3 N:M

 여러 개의 데이터가 서로 여러 개의 데이터와 연결되는 관계다.

 예:

```
User
 ↕
Role
```

 한 User가 여러 Role을 가질 수 있고,

 한 Role도 여러 User가 가질 수 있다.

 이 프로젝트에서 `user_roles`가 이러한 관계를 표현하는 데 사용된다.

---

 ## 14.4 관계 테이블

 N:M 관계를 DB에 저장하기 위해 사용하는 중간 테이블이다.

 예:

```
users
  ↓
user_roles
  ↓
roles
```

 또는:

```
roles
  ↓
role_permissions
  ↓
permissions
```

---

 # 15\. Authority 관련 용어

 ## 15.1 Authority

 Spring Security에서 **접근 권한을 표현하는 개념**이다.

 예:

```
USER_READ
USER_DELETE
USER_ROLE_MANAGE
```

 같은 값을 Authority로 사용할 수 있다.

---

 ## 15.2 `hasAuthority`

 Spring Security에서 특정 Authority가 있는지 검사할 때 사용하는 표현이다.

 예:

```
@PreAuthorize("hasAuthority('USER_ROLE_MANAGE')")
```

 의미:

 > 현재 인증된 사용자가 `USER_ROLE_MANAGE` Authority를 가지고 있어야 이 메서드를 실행할 수 있다.

---

 ## 15.3 `@PreAuthorize`

 Spring Security에서 **메서드 실행 전에 접근 권한을 검사하는 Annotation**이다.

 예:

```
@PreAuthorize("hasAuthority('USER_ROLE_MANAGE')")
public void assignRoles(...) {
    ...
}
```

 흐름은:

```
메서드 호출
    ↓
@PreAuthorize 검사
    ↓
USER_ROLE_MANAGE 존재?
    ↓
YES → 실행
NO  → 접근 거부
```

---

 # 16\. Audit 관련 용어

 ## 16.1 Audit

 시스템에서 발생한 작업을 추적하고 기록하는 것이다.

 쉽게:

 > "누가 언제 무엇을 했는가?"

 를 기록하는 것.

---

 ## 16.2 Audit Log

 Audit 기록을 저장한 데이터다.

 APMS-SR에서는 V3에서:

```
audit_logs
```

 테이블이 생성된다.

---

 ## 16.3 Audit Log의 예

 예를 들어 관리자가 사용자의 상태를 변경했다면:

```
누가?
→ 관리자

언제?
→ 2026-09-27 13:00

무엇을?
→ USER_STATUS_UPDATE

대상?
→ User ID 10

변경 전?
→ ACTIVE

변경 후?
→ SUSPENDED
```

 와 같은 정보를 기록할 수 있다.

---

 # 17\. Password 관련 용어

 ## 17.1 Password

 사용자가 로그인할 때 입력하는 비밀번호다.

---

 ## 17.2 Plain Text Password

 사용자가 입력한 원래 비밀번호 문자열이다.

 예:

```
hello1234
```

 DB에 그대로 저장하는 방식은 보안상 적절하지 않다.

---

 ## 17.3 Password Hash

 비밀번호를 해시 함수 등을 이용해 변환한 값이다.

 예:

```
$2a$10$....
```

 실제 프로젝트의 테스트 User Migration에서도 해시 형태의 Password가 사용된다.

---

 ## 17.4 BCrypt

 비밀번호를 안전하게 해싱하는 데 널리 사용되는 알고리즘이다.

 개념:

```
원래 비밀번호
      ↓
BCrypt
      ↓
Hash
      ↓
DB
```

---

 # 18\. Spring Security 관련 최소 Glossary

 이후 V6 및 인증/인가 코드를 이해하려면 다음 단어도 알아야 한다.

 ## 18.1 Spring Security

 Spring 애플리케이션에서 인증(Authentication)과 인가(Authorization)를 처리하는 보안 프레임워크다.

---

 ## 18.2 Authentication

 현재 로그인한 사용자가 누구인지 나타내는 인증 정보다.

---

 ## 18.3 Principal

 현재 인증된 사용자를 나타내는 주체다.

 쉽게:

```
현재 로그인한 사용자
```

 라고 이해하면 된다.

---

 ## 18.4 Authority

 현재 사용자가 가지고 있는 권한이다.

 예:

```
USER_READ
MENU_READ
USER_ROLE_MANAGE
```

---

 ## 18.5 `@PreAuthorize`

 메서드 실행 전에 권한을 검사하는 Annotation이다.

```
@PreAuthorize("hasAuthority('USER_ROLE_MANAGE')")
```

---

 # 19\. Migration에서 자주 사용하는 약어

 | 약어 | 원래 표현 | 의미 |
| --- | --- | --- |
| DB | Database | 데이터베이스 |
| DBMS | Database Management System | DB 관리 시스템 |
| SQL | Structured Query Language | DB 질의 언어 |
| DDL | Data Definition Language | DB 구조 정의 |
| DML | Data Manipulation Language | DB 데이터 조작 |
| PK | Primary Key | 기본 키 |
| FK | Foreign Key | 외래 키 |
| N:M | Many-to-Many | 다대다 관계 |
| RBAC | Role-Based Access Control | 역할 기반 접근 제어 |
| API | Application Programming Interface | 프로그램 간 인터페이스 |
| AuthN | Authentication | 인증 |
| AuthZ | Authorization | 인가 |

---

 # 20\. 가장 헷갈리기 쉬운 용어 비교

 ## Authentication vs Authorization

```
Authentication
→ 너 누구야?

Authorization
→ 너 이거 할 수 있어?
```

---

 ## Role vs Permission

```
Role
→ 어떤 역할인가?

Permission
→ 무엇을 할 수 있는가?
```

 예:

```
ADMIN
 ↓
USER_DELETE
```

 ADMIN은 Role이고,

 USER\_DELETE는 Permission이다.

---

 ## User vs Principal

```
User
→ DB에 저장된 사용자 데이터

Principal
→ 현재 인증된 사용자를 나타내는 보안 개념
```

---

 ## Table vs Row vs Column

```
Table
→ 데이터를 담는 전체 구조

Column
→ 데이터의 종류

Row
→ 실제 데이터 한 건
```

 예:

```
users                 ← Table

id | username         ← Column
---|--------
1  | alice             ← Row
```

---

 ## PK vs FK

```
PK
→ 나 자신을 식별

FK
→ 다른 테이블을 참조
```

 예:

```
users.id
  ↑
  PK

user_roles.user_id
  ↑
  FK → users.id
```

---

 # 21\. 이 프로젝트의 핵심 용어 관계도

 이 프로젝트를 이해할 때 가장 중요한 관계를 한 그림으로 표현하면 다음과 같다.

```
                         Authentication
                               │
                               ▼
                            User
                               │
                               │
                               ▼
                             Role
                               │
                               │
                               ▼
                          Permission
                               │
                               ▼
                         Authorization
```

 조금 더 DB 관점에서 보면:

```
┌──────────────┐
│    users     │
└──────┬───────┘
       │
       │ User
       ▼
┌──────────────┐
│     Role     │
└──────┬───────┘
       │
       │ Permission
       ▼
┌──────────────┐
│  Permission  │
└──────────────┘
```

 실제 DB에서는 N:M 관계 때문에 중간 테이블이 들어간다.

```
users
  │
  ▼
user_roles
  │
  ▼
roles
  │
  ▼
role_permissions
  │
  ▼
permissions
```

---

 # 22\. Flyway와 애플리케이션의 관계

 전체 시스템을 보면 다음과 같다.

```
                    Git
                     │
                     ▼
             Flyway SQL Files
                     │
                     ▼
              Database Schema
                     │
                     ▼
             Application Code
                     │
             ┌───────┴────────┐
             ▼                ▼
      Authentication      Authorization
             │                │
             ▼                ▼
           User        Role / Permission
```

 즉 Flyway Migration은 단순한 SQL 파일이 아니라:

 > 애플리케이션이 사용할 데이터베이스 구조와 초기 권한 정책을 코드 형태로 관리하는 방법

 이라고 볼 수 있다.

---

 # 23\. 앞으로 나올 Migration 용어 미리 보기

 이후 V1\~V6을 공부하면서 다음 용어들이 등장한다.

 | 용어 | 처음 등장 |
| --- | --- |
| `users` | V1 |
| `roles` | V1 |
| `permissions` | V1 |
| `user_roles` | V2 |
| `role_permissions` | V2 |
| `menu` | V3 |
| `audit_logs` | V3 |
| `ADMIN` | V3 |
| `USER` | V3 |
| `USER_READ` | V4 |
| `MENU_READ` | V4 |
| `USER_ROLE_MANAGE` | V6 |
| `@PreAuthorize` | 애플리케이션 코드/V6과 연결 |

---

 # 24\. V1\~V6을 읽기 위한 핵심 단어 사전

 마지막으로 정말 자주 나오는 단어만 압축하면 다음과 같다.

```
Database
→ 데이터를 저장하는 곳

Table
→ 데이터를 저장하는 구조

Column
→ 데이터의 종류

Row
→ 데이터 한 건

PK
→ 나를 식별하는 ID

FK
→ 다른 테이블을 가리키는 ID

Migration
→ DB를 변경하는 작업

Flyway
→ Migration을 버전별로 관리/실행하는 도구

User
→ 사용자

Role
→ 사용자 역할

Permission
→ 수행 가능한 기능/권한

Authentication
→ 누구인지 확인

Authorization
→ 무엇을 할 수 있는지 확인

RBAC
→ Role을 기반으로 권한을 관리하는 방식

Authority
→ Spring Security에서 사용하는 권한 정보

@PreAuthorize
→ 메서드 실행 전에 권한을 검사
```

---

 # 25\. 이것만 기억하고 V1로 넘어가기

 V1을 보기 전에 아래 그림을 머릿속에 가지고 있으면 된다.

```
              ┌───────────┐
              │   User    │
              │  사용자    │
              └───────────┘

              ┌───────────┐
              │   Role    │
              │   역할     │
              └───────────┘

              ┌──────────────┐
              │ Permission   │
              │    권한       │
              └──────────────┘
```

 그리고 용어의 차이는:

```
User
"누구?"

Role
"어떤 역할?"

Permission
"무엇을 할 수 있어?"

Authentication
"정말 그 사람 맞아?"

Authorization
"그 사람이 이 기능을 해도 돼?"
```

 이 다섯 문장만 기억하면 된다.

 이후 V1에서는:

```
User
Role
Permission
```

 을 DB에 저장할 **테이블부터 만든다.**

 그 다음 V2에서 이들을 연결하기 시작한다.

 이제 문서 순서는 \*\*`00_Glossary → V1 → V2 → ...`\*\*로 잡으면 돼. 특히 Glossary는 이후 문서에서 반복 설명을 줄이는 **기준 문서** 역할을 하게 하면 좋다.