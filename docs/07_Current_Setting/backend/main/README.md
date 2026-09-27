# Backend Current Setting

> APMS-SR Backend의 `main` 브랜치 기준 현재 설정과
> Database Migration 상태를 기록한다.

## 1. Document Scope

이 디렉터리는 현재 구현된 Backend 설정과
Database Migration의 구조 및 기준을 기록한다.

설계 결정은 ADR,
장애/문제 해결은 TS,

엄연히 main/resource/ 에 해당하는 .yaml , .properties , db/V*_*.sql 에만 국한한다

API 계약은 API 문서를 기준으로 한다.

## 2. Document Responsibility

| 문서 | 책임 |
|---|---|
| README | 문서 탐색 및 책임 정의 |
| Index-glossary | 프로젝트 용어 기준 |
| Resource_Setting | 현재 Backend Resource/설정 |
| V1~Vn | Flyway Migration 변경 기록 |
| sql-flyway_glossary | SQL/Flyway 관리 규칙 |

## 3. Source of Truth

| 대상 | 기준 |
|---|---|
| DB Schema | Flyway Migration |
| Application Resource | 실제 Resource 파일 |
| Entity Mapping | JPA Entity |
| API | Controller / API 문서 |
| 설계 결정 | ADR |
| 테스트 결과 | Test / Test Result |

## 4. Reading Order

1. README
2. Index-glossary
3. Resource_Setting
4. 필요한 Flyway Migration
5. 관련 Source Code / Test

## 5. Current State

- Branch: `main`
- Scope: Backend
- Purpose: 현재 구현 상태 기록