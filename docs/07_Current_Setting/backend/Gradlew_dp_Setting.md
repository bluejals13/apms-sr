
# Backend `build.gradle` 실제 설정 및 Flyway SQL 파일 연결

 ## 1\. Backend 설정 파일

 ### `build.gradle`

[backend/build.gradle](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/build.gradle)


 ### Spring 설정 파일

 [application.properties](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/application.properties)

[application.yaml](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/application.yaml)


---

 ## 2\. Flyway Migration SQL 파일

 Flyway에서 사용하는 SQL 파일은 다음 경로에 위치합니다.

 `backend/src/main/resources/db/migration/`


 ### Migration 파일

[V1__init_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V1__init_schema.sql)

[V2__init_authority_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V2__init_authority_schema.sql)

[V3__init_common_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V3__init_common_schema.sql)


[V4__insert_permissions.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V4__insert_permissions.sql)

[V5__insert_test_users.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V5__insert_test_users.sql)

[V6__add_user_role_manage_permission.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V6__add_user_role_manage_permission.sql)



---

 ## 3\. 테스트 H2 설정

 ### 테스트 설정 파일

[application-test.properties](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/application-test.properties)



 ### 테스트 데이터 SQL

[security-test-data.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/sql/security-test-data.sql)



---

 ## 4\. 파일 구조

```
backend/
├── build.gradle
│
└── src/
    ├── main/
    │   └── resources/
    │       ├── application.properties
    │       ├── application.yaml
    │       │
    │       └── db/
    │           └── migration/
    │               ├── V1__init_schema.sql
    │               ├── V2__init_authority_schema.sql
    │               ├── V3__init_common_schema.sql
    │               ├── V4__insert_permissions.sql
    │               ├── V5__insert_test_users.sql
    │               └── V6__add_user_role_manage_permission.sql
    │
    └── test/
        └── resources/
            ├── application-test.properties
            └── sql/
                └── security-test-data.sql
```

 이 정도로 **원문 내용은 건드리지 않고 제목·구조·순서만 정리**하는 게 맞습니다.