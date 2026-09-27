
## 목록- 관련 용어집
[Index-glossary.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/Index-glossary.md)


 # 7\. SQL 관련 용어


 ## 7.1 SQL

 **Structured Query Language**의 약자다.

 Database에 명령을 전달하기 위한 언어다.

 예:

```
SELECT * FROM users;
```

```
INSERT INTO users (...);
```

```
CREATE TABLE users (...);
```

---

 ## 7.2 DDL

 **Data Definition Language**

 데이터베이스의 **구조를 정의하거나 변경하는 SQL**이다.

 대표적으로:

```
CREATE TABLE
ALTER TABLE
DROP TABLE
```

 V1은 주로 DDL이다.

---

 ## 7.3 DML

 **Data Manipulation Language**

 DB에 저장된 **데이터를 조작하는 SQL**이다.

 대표적으로:

```
INSERT
UPDATE
DELETE
```

 예:

```
INSERT INTO roles ...
```

---

 ## 7.4 SELECT

 DB에서 데이터를 조회한다.

```
SELECT *
FROM users;
```

 의미:

 > users 테이블의 데이터를 조회한다.

---

 ## 7.5 INSERT

 새로운 데이터를 넣는다.

```
INSERT INTO users (...)
VALUES (...);
```

 의미:

 > users 테이블에 새로운 사용자 데이터를 추가한다.

---

 ## 7.6 UPDATE

 기존 데이터를 변경한다.

```
UPDATE users
SET status = 'SUSPENDED'
WHERE id = 1;
```

---

 ## 7.7 DELETE

 데이터를 삭제한다.

```
DELETE FROM users
WHERE id = 1;
```

---

 ## 7.8 JOIN

 두 개 이상의 테이블을 연결해서 데이터를 조회하거나 처리하는 SQL 기능이다.

 예:

```
users
  │
  JOIN
  │
user_roles
```

 V2 이후부터 매우 중요해진다.

---

 ## 7.9 CROSS JOIN

 두 테이블의 모든 조합을 만든다.

 예:

```
ADMIN × Permission
```

 V4의 `ADMIN → 모든 Permission` 연결을 이해할 때 중요하다.

---

 # 8\. Flyway 관련 용어

 ## 8.1 Flyway

 Flyway는 **Database Migration을 버전으로 관리하는 도구**다.

 쉽게 말하면:

 > "DB 변경 작업도 소스 코드처럼 순서와 버전을 관리하자."

 라는 목적의 도구다.

---

 ## 8.2 Migration

 Migration은 **Database 구조나 데이터를 변경하는 작업 단위**다.

 예:

```
V1 → 테이블 생성
V2 → 관계 테이블 생성
V3 → 기본 데이터 생성
V4 → Permission 생성
```

 각 파일 하나가 하나의 Migration이 될 수 있다.

---

 ## 8.3 Migration File

 Flyway가 실행할 SQL 파일이다.

 예:

```
V1__init_schema.sql
```

---

 ## 8.4 Version

 Migration의 순서를 나타내는 번호다.

 예:

```
V1
V2
V3
V4
```

 일반적으로 낮은 버전에서 높은 버전 순서로 Migration이 적용된다.

---

 ## 8.5 Migration History

 Flyway는 어떤 Migration이 이미 실행되었는지 관리한다.

 대표적으로 Flyway가 관리하는:

```
flyway_schema_history
```

 테이블을 통해 Migration 실행 이력을 저장한다.

 개념적으로:

```
flyway_schema_history

version | description
--------|----------------
1       | init_schema
2       | init_authority_schema
3       | init_common_schema
```

 와 같은 정보를 관리한다.

---

 ## 8.6 Checksum

 Migration 파일의 내용을 검증하기 위해 사용하는 값이다.

 쉽게 말하면:

 > "이미 실행했던 SQL 파일이 나중에 몰래 변경되지 않았는지 확인하기 위한 값"

 이라고 이해하면 된다.

 따라서 이미 적용된 Migration을 임의로 수정하는 것은 주의해야 한다.

---

 ## 8.7 Versioned Migration

 버전 번호를 가진 Migration이다.

 예:

```
V1__init_schema.sql
V2__init_authority_schema.sql
```

---

 ## 8.8 Migration Naming Convention

 일반적인 Flyway SQL Migration 이름은:

```
V<version>__<description>.sql
```

 형태다.

 예:

```
V1__init_schema.sql
```

 분해하면:

```
V1
│
├── Version = 1
│
└── Description = init_schema
```

