\# Backend build.gradle 실제 설정 및 Flyway sql 파일 과 연결



## 현재 build.gradle 설정 파일

[backend/build.gradle](https://github.com/bluejals13/apms-sr/blob/feature/auth@0603@1401/backend/build.gradle)





\[application.properties](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/application.properties)



\[application.yaml](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/application.yaml)







\[V1\_\_init\_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V1\_\_init\_schema.sql)



\[V2\_\_init\_authority\_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V2\_\_init\_authority\_schema.sql)



\[V3\_\_init\_common\_schema.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V3\_\_init\_common\_schema.sql)



\[V4\_\_insert\_permissions.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V4\_\_insert\_permissions.sql)



\[V5\_\_insert\_test\_users.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V5\_\_insert\_test\_users.sql)



\[V6\_\_add\_user\_role\_manage\_permission.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/main/resources/db/migration/V6\_\_add\_user\_role\_manage\_permission.sql)





\---



\## 테스트 H2 설정 파일 연결



\[application-test.properties](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/application-test.properties)



\[security-test-data.sql](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/backend/src/test/resources/sql/security-test-data.sql)











