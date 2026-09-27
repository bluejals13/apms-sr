

# APMS-SR V1 — Initial Schema

 ## 1\. 문서 목적

 V1 Migration에서는 APMS-SR의 인증/인가 기능에서 사용할 **기본 테이블을 생성**한다.

 V1에서 생성하는 테이블은 다음 3개다.

```
users
roles
permissions
```

 각 테이블의 역할은 다음과 같다.

 | Table | 역할 |
| --- | --- |
| `users` | 사용자 정보 저장 |
| `roles` | 사용자 역할 저장 |
| `permissions` | 시스템 권한 저장 |

V1에서는 각 데이터를 저장할 **기본 구조만 정의**한다.

 User와 Role, Role과 Permission의 관계는 V2에서 추가한다.

---

 # 2\. Migration 파일

 파일:

```
V1__init_schema.sql
```

 Migration의 실행 순서는 다음과 같다.

```
V1
 ↓
V2
 ↓
V3
 ↓
V4
 ↓
V5
 ↓
V6
```

 따라서 V1은 이후 Migration이 사용할 **기본 DB 구조를 처음 만드는 단계**다.

 Migration, Version, Naming Convention 등의 용어는 `00_Glossary.md`를 참고한다.

---

 # 3\. V1의 전체 구조

 V1이 완료되면 다음과 같은 기본 테이블이 존재한다.

```
Database
│
├── users
│
├── roles
│
└── permissions
```

 개념적으로는:

```
User
Role
Permission
```

 이라는 세 가지 핵심 데이터를 DB에 저장할 수 있게 되는 것이다.

 아직 다음 관계는 만들어지지 않는다.

```
User ── Role
Role ── Permission
```

---

 # 4\. users

 ## 4.1 목적

 `users`는 시스템 사용자의 기본 정보를 저장한다.

```
users
├── id
├── username
├── password
├── email
├── status
├── created_at
└── updated_at
```

---

 ## 4.2 Column 구조

 | Column | Type | Constraint | 역할 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | 사용자 식별자 |
| `username` | `VARCHAR(255)` | NOT NULL, UNIQUE | 사용자 이름 |
| `password` | `VARCHAR(255)` | NOT NULL | 비밀번호 Hash |
| `email` | `VARCHAR(255)` |  | 사용자 이메일 |
| `status` |  | NOT NULL | 사용자 상태 |
| `created_at` | `DATETIME(6)` |  | 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 수정 시간 |

> PK, NOT NULL, UNIQUE, Data Type 등의 의미는 `00_Glossary.md`를 참고한다.

---

 ## 4.3 주요 설계 포인트

 ### `id`

 User를 고유하게 식별하기 위한 값이다.

 따라서 `users.id`를 PK로 지정한다.

```
users.id
   ↓
User 식별
```

---

 ### `username`

 사용자를 식별하는 이름이다.

 동일한 username을 여러 User가 사용할 수 없도록 `UNIQUE`를 적용한다.

 또한 username이 없는 User를 허용하지 않으므로 `NOT NULL`을 적용한다.

```
username
├── NOT NULL
└── UNIQUE
```

---

 ### `password`

 사용자의 인증에 사용되는 비밀번호 정보를 저장한다.

 DB에는 사용자가 입력한 Plain Text Password가 아니라 **Hash된 값**을 저장한다.

 개념적으로:

```
사용자 Password
      ↓
Password Hash
      ↓
users.password
```

 구체적인 Password Encoding 방식과 인증 흐름은 애플리케이션의 Security 설정에서 다룬다.

---

 ### `status`

 User의 현재 상태를 저장한다.

 V1에서는 다음 상태를 사용한다.

```
ACTIVE
DELETED
DELETE_PENDING
SUSPENDED
```

 이를 통해 User의 단순 존재 여부가 아니라 **현재 상태**를 DB에서 관리할 수 있다.

---

 ### `created_at`

 User가 생성된 시간을 저장한다.

---

 ### `updated_at`

 User 정보가 마지막으로 수정된 시간을 저장한다.

---

 # 5\. roles

 ## 5.1 목적

 `roles`는 시스템에서 사용하는 Role을 저장한다.

 예:

```
ADMIN
USER
```

 구조는 다음과 같다.

```
roles
├── id
├── name
├── level
├── is_system
├── created_at
└── updated_at
```

---

 ## 5.2 Column 구조

 | Column | Type | Constraint | 역할 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | Role 식별자 |
| `name` | `VARCHAR(255)` |  | Role 이름 |
| `level` | `INT` | NOT NULL, DEFAULT 10 | Role Level |
| `is_system` | `BOOLEAN` |  | 시스템 Role 여부 |
| `created_at` | `DATETIME(6)` |  | 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 수정 시간 |

---

 ## 5.3 주요 설계 포인트

 ### `id`

 각 Role을 고유하게 식별하기 위한 값이다.

```
roles.id
   ↓
Role 식별
```

---

 ### `name`

 Role의 이름을 저장한다.

 예:

```
ADMIN
USER
```

 V1에서는 Role이라는 개념과 이를 저장할 구조만 정의한다.

 실제 기본 Role 데이터가 언제 생성되는지는 이후 Migration에서 확인한다.

---

 ### `level`

 Role의 Level을 저장한다.

 기본값은 `10`으로 설정한다.

```
level
  ↓
DEFAULT 10
```

 단, `level` 숫자가 실제 권한 체계에서 어떤 의미를 가지는지는 애플리케이션의 비즈니스 로직을 확인해야 한다.

 따라서 V1에서는 **Role에 Level 속성을 저장한다**는 점에 집중한다.

---

 ### `is_system`

 해당 Role이 시스템에서 관리하는 Role인지 구분하기 위한 값이다.

```
is_system
    ↓
System Role 여부
```

 실제 System Role의 생성, 수정, 삭제 정책은 애플리케이션의 Role 관리 로직과 함께 확인한다.

---

 ### `created_at / updated_at`

 Role의 생성 및 마지막 수정 시간을 저장한다.

---

 # 6\. permissions

 ## 6.1 목적

 `permissions`는 시스템에서 수행할 수 있는 기능 또는 권한을 저장한다.

 예:

```
USER_READ
USER_DELETE
MENU_READ
MENU_CREATE
```

 구조는 다음과 같다.

```
permissions
├── id
├── name
├── description
├── created_at
└── updated_at
```

---

 ## 6.2 Column 구조

 | Column | Type | Constraint | 역할 |
| --- | --- | --- | --- |
| `id` | `BIGINT` | PK | Permission 식별자 |
| `name` | `VARCHAR(255)` |  | Permission 이름 |
| `description` | `VARCHAR(255)` |  | Permission 설명 |
| `created_at` | `DATETIME(6)` |  | 생성 시간 |
| `updated_at` | `DATETIME(6)` |  | 수정 시간 |

---

 ## 6.3 주요 설계 포인트

 ### `id`

 Permission을 고유하게 식별하기 위한 값이다.

---

 ### `name`

 Permission의 코드 이름을 저장한다.

 예:

```
USER_READ
USER_DELETE
MENU_READ
```

 이 값은 이후 Role과 연결되고, 애플리케이션에서는 Spring Security의 Authority와 연결될 수 있다.

---

 ### `description`

 Permission의 의미를 사람이 이해하기 쉽도록 설명하는 값이다.

 예:

```
name
→ USER_READ

description
→ 사용자 조회
```

 즉:

```
name
→ 시스템에서 사용하는 Permission 식별 이름

description
→ 사람이 읽기 위한 설명
```

 으로 사용한다.

---

 ### `created_at / updated_at`

 Permission의 생성 및 마지막 수정 시간을 저장한다.

---

 # 7\. V1에서 중요한 설계 범위

 V1의 역할은 **기본 Entity를 저장할 구조를 만드는 것**이다.

 따라서 다음 세 가지가 핵심이다.

```
users
roles
permissions
```

 그리고 각 테이블은 서로 독립적으로 생성된다.

```
users          roles          permissions
  │              │                │
  │              │                │
  └──────────────┴────────────────┘
         아직 관계 없음
```

---

 # 8\. 왜 관계를 V1에서 만들지 않는가?

 User와 Role은 실제로 서로 관계를 가진다.

```
User
 ↓
Role
```

 또한 Role과 Permission도 관계를 가진다.

```
Role
 ↓
Permission
```

 하지만 각각 여러 개를 가질 수 있는 구조이므로 단순히 한쪽 테이블에 ID 하나를 추가하는 방식으로 처리하기 어렵다.

 예를 들어:

```
alice
 ├── USER
 └── MANAGER
```

 처럼 한 User가 여러 Role을 가질 수 있다.

 반대로:

```
ADMIN
 ├── USER_READ
 ├── USER_DELETE
 ├── MENU_READ
 └── MENU_DELETE
```

 처럼 하나의 Role도 여러 Permission을 가질 수 있다.

 따라서 이 관계는 별도의 관계 테이블을 이용해 관리한다.

 이 작업은 V2에서 진행한다.

---

 # 9\. V1 → V2

 V1:

```
users
roles
permissions
```

 V2:

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

 따라서 두 Migration의 역할을 간단하게 구분하면:

```
V1
→ 기본 데이터를 저장할 테이블 생성

V2
→ 테이블 사이의 관계 생성
```

 이다.

---

 # 10\. V1에서 생성하지 않는 것

 V1에서는 다음 작업을 수행하지 않는다.

 ### User ↔ Role 관계

```
users
  ↕
user_roles
  ↕
roles
```

 V2에서 생성한다.

 ### Role ↔ Permission 관계

```
roles
  ↕
role_permissions
  ↕
permissions
```

 V2에서 생성한다.

 ### 기본 Permission 데이터

```
USER_READ
USER_DELETE
MENU_READ
...
```

 와 같은 실제 Permission 데이터는 이후 Migration에서 삽입한다.

 ### 기본 User 데이터

 테스트 User 등의 실제 데이터 역시 V1의 역할이 아니다.

---

 # 11\. V1 전체 흐름

 V1을 하나의 흐름으로 보면 다음과 같다.

```
                V1
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     users     roles   permissions
       │         │         │
       ↓         ↓         ↓
     User       Role   Permission
```

 여기서 V1은:

 > **User, Role, Permission을 저장할 기본 구조를 만든다.**

 라는 단계다.

 이후 V2에서:

```
User
 ↓
Role
 ↓
Permission
```

 의 관계를 DB 구조로 표현한다.

---

 # 12\. V1 확인 사항

 V1을 확인할 때는 다음을 중심으로 보면 된다.

 - `users`, `roles`, `permissions` 세 테이블이 생성되는가?
- 각 테이블의 PK가 적절하게 정의되어 있는가?
- `users.username`에 `NOT NULL`, `UNIQUE`가 적용되어 있는가?
- User의 상태를 저장할 수 있는가?
- Role의 `level`, `is_system`을 저장할 수 있는가?
- Permission의 `name`, `description`을 저장할 수 있는가?
- 생성/수정 시간을 저장할 수 있는가?
- V1에서 User-Role, Role-Permission 관계를 만들지 않았는가?

---

 # 13\. V1 핵심 요약

```
V1
│
├── users
│   └── 사용자 정보
│
├── roles
│   └── 역할 정보
│
└── permissions
    └── 권한 정보
```

 핵심은 세 문장이다.

```
User
→ 누가 시스템을 사용하는가?

Role
→ 어떤 역할을 가지고 있는가?

Permission
→ 어떤 기능을 수행할 수 있는가?
```

 V1에서는 이 세 가지를 **DB에 저장할 기본 테이블을 만든다.**

 그리고 다음 V2에서:

```
User
 ↓
Role
 ↓
Permission
```

 관계를 실제 DB 구조로 연결한다.

 이 버전에서는 `00_Glossary.md`에 이미 있는 **PK/NULL/UNIQUE/Data Type/Flyway 등의 사전식 설명은 반복하지 않고**, V1에서 필요한 **설계 이유와 구조**만 남겼습니다.