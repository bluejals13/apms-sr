
## 목록- 관련 용어집
[Index-glossary.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/Index-glossary.md)


 # 3\. Database 관련 용어


 ## 3.1 Database

 ### 의미

 데이터를 체계적으로 저장하고 관리하는 시스템 또는 공간이다.

 쉽게 말하면:

 > "프로그램에서 필요한 데이터를 저장해 놓는 곳"

 이다.

 예:

```
Database
│
├── users
├── roles
├── permissions
├── menu
└── audit_logs
```

 APMS-SR에서는 사용자, Role, Permission 등의 정보를 Database에 저장한다.

---

 ## 3.2 DBMS

 **Database Management System**의 약자다.

 Database를 실제로 관리하고 SQL을 실행하는 프로그램이다.

 예:

 - MySQL
- PostgreSQL
- MariaDB
- Oracle Database

 예를 들어:

```
Java Application
       │
       │ SQL
       ▼
     MySQL
       │
       ▼
    Database
```

---

 ## 3.3 Schema

 Schema는 문맥에 따라 의미가 조금 다르지만, 이 프로젝트에서는 쉽게 다음처럼 이해하면 된다.

 > 데이터베이스에서 테이블, 컬럼, 제약조건 등의 구조를 정의한 것

 예:

```
users 테이블
├── id
├── username
├── password
└── status
```

 이러한 구조 자체를 DB Schema의 일부라고 볼 수 있다.

---

 ## 3.4 Table

 테이블은 데이터를 저장하는 기본 단위다.

 엑셀의 한 시트와 비슷하게 생각하면 쉽다.

 예:

```
users

┌────┬──────────┬──────────┐
│ id │ username │ status   │
├────┼──────────┼──────────┤
│ 1  │ alice    │ ACTIVE   │
│ 2  │ bob      │ ACTIVE   │
└────┴──────────┴──────────┘
```

 APMS-SR의 V1에서는:

```
users
roles
permissions
```

 테이블을 만든다.

---

 ## 3.5 Column

 Column은 테이블에서 **어떤 종류의 데이터를 저장할지 정의하는 항목**이다.

 예:

```
users

id
username
password
email
status
```

 여기서 각각이 Column이다.

 쉽게:

 > "이 데이터는 무엇인가?"

 를 정의한다.

---

 ## 3.6 Row

 Row는 테이블에 실제로 저장된 **하나의 데이터 묶음**이다.

 예:

```
users

id | username | status
---|----------|-------
1  | alice    | ACTIVE
```

 위에서:

```
1 | alice | ACTIVE
```

 전체가 하나의 Row다.

 쉽게:

```
Column = 데이터의 종류
Row    = 실제 데이터 한 건
```

 이라고 기억하면 된다.

---

 ## 3.7 Record

 Record는 Row와 거의 같은 의미로 사용된다.

```
Row
≈
Record
```

 예:

```
사용자 1명의 데이터
```

 를 하나의 Record라고 표현할 수 있다.

---

 # 4\. Key 관련 용어

 ## 4.1 Key

 Key는 데이터를 식별하거나 다른 데이터와 연결하기 위해 사용하는 값이다.

 이 프로젝트에서는 특히:

```
Primary Key
Foreign Key
```

 가 중요하다.

---

 ## 4.2 Primary Key (PK)

 Primary Key는 테이블에서 **각 Row를 고유하게 식별하는 값**이다.

 예:

```
id BIGINT PRIMARY KEY
```

 users 테이블:

```
id | username
---|---------
1  | alice
2  | bob
3  | charlie
```

 여기서:

```
1
2
3
```

 이 각각의 사용자 Row를 구분한다.

 따라서:

 > Primary Key = "이 데이터가 누구인지 식별하는 고유 ID"

 라고 기억하면 된다.

---

 ## 4.3 PK

 Primary Key의 줄임말이다.

```
PK = Primary Key
```

 문서에서 다음과 같이 표현할 수 있다.

```
users.id → PK
```

 즉:

 > users 테이블의 id는 Primary Key다.

---

 ## 4.4 Foreign Key (FK)

 Foreign Key는 **다른 테이블의 데이터를 참조하기 위한 Key**다.

 예:

```
user_roles.user_id
        ↓
users.id
```

 의 관계가 있다고 하면:

```
user_roles.user_id
```

 가 Foreign Key가 된다.

 쉽게:

 > Foreign Key = "다른 테이블의 데이터를 가리키는 ID"

 이다.

---

 ## 4.5 FK

 Foreign Key의 줄임말이다.

```
FK = Foreign Key
```

 예:

```
user_roles.user_id → FK
```

---
