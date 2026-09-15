# [APMS.SR] 프로젝트 통합 문서 시스템 (Project Documentation)

- **Version:** 1.5.0
- **Last Updated:** 2026-08-26
- **Status:** Active

`APMS.SR` 프로젝트의 아키텍처, 개발 가이드, 컨벤션, 보안 정책, 테스트 및 장애 복구 문서를 체계적으로 관리하는 중앙 인덱스입니다.

---

## 1. 핵심 가이드 및 컨벤션 (Core Documentation)

| 문서명 | 경로 | 설명 |
| :--- | :--- | :--- |
| **호스트 환경 설치 가이드** | [`단순 설치.md`](./%EB%8B%A8%EC%88%9C%20%EC%84%A4%EC%B9%98.md) | Ubuntu/Linux 호스트 패키지(OpenJDK 17, Node 20, Gradle) 초기 설치 |
| **시스템 아키텍처 및 포트 구성** | [`01_Architecture_and_Ports.md`](./01_Architecture_and_Ports.md) | Docker Compose 컨테이너 토폴로지, 포트 매핑, 네트워크 트래픽 흐름 |
| **퀵 스타트 및 실행 가이드** | [`02_Quick_Start.md`](./02_Quick_Start.md) | Java 17, Node 20, Docker Compose 기반 원클릭 실행 및 검증 가이드 |
| **백엔드 개발 표준 및 코딩 규칙** | [`03_Backend_Conventions.md`](./03_Backend_Conventions.md) | Record DTO, ApiResponse, GlobalExceptionHandler, JPA 최적화 규약 |
| **프론트엔드 개발 표준 및 코딩 규칙** | [`04_Frontend_Conventions.md`](./04_Frontend_Conventions.md) | React Query, Mutation Invalidation, Type, RBAC Feature Composition 규약 |
| **AI 에이전트 표준 명령어** | [`05_Agent_Commands.md`](./06_Agent_Commands.md) | 에이전트 작업 지시 및 코드 리뷰 표준 프롬프트 모음 |
| **문서 작성 5대 원칙** | [`rules.md`](./rules.md) | Reference, ADR, Troubleshooting, Roadmap, Duplication 5대 원칙 |

---

## 2. 세부 도메인별 문서 구조 (Document Structure)

```text
docs/
├── 단순 설치.md                       # 호스트 OS 환경 설치 가이드 (Prerequisites)
├── 01_Architecture_and_Ports.md       # 시스템 아키텍처 및 포트 구성
├── 02_Quick_Start.md                  # 퀵 스타트 가이드 (Runtime)
├── 03_Backend_Conventions.md          # 백엔드 코딩 컨벤션
├── 04_Frontend_Conventions.md         # 프론트엔드 코딩 컨벤션
├── 05_Agent_Commands.md               # AI 에이전트 표준 명령어
├── rules.md                           # 문서 작성 5대 원칙
│
├── reference/
│   └── security.md                    # 보안, 인증/인가, JWT/Redis 및 RBAC 매트릭스
│
├── testing/
│   └── security-tests.md              # 보안 통합 테스트 데이터, 매트릭스, 결과
│
├── performance/
│   └── k6-load-test.md                # k6 부하/스트레스 테스트 환경, 조건, 결과
│
└── troubleshooting/
    └── 01-redis-failure.md            # Redis 장애 원인 분석 및 복구 기록
```

---

## 3. 도메인별 상세 문서 (Domain References)

### 1) 보안 및 인가 기준 ([`reference/`](./reference/))
* [`reference/security.md`](./reference/security.md): Spring Security Filter Chain, JWT Stateless 인증, Redis Refresh Token Rotation(RTR), Access Token Blacklist 및 RBAC Role-Permission 매핑 정책.

### 2) 테스트 및 품질 검증 ([`testing/`](./testing/))
* [`testing/security-tests.md`](./testing/security-tests.md): H2 인메모리 DB 및 SQL Fixture 기반 보안 테스트 데이터, 시나리오별 검증 매트릭스(Authentication/Authorization/RBAC) 및 실행 결과.

### 3) 성능 및 부하 테스트 ([`performance/`](./performance/))
* [`performance/k6-load-test.md`](./performance/k6-load-test.md): 50 VU 일반 부하 및 70 VU 피크 스트레스 테스트 시나리오, 응답 지연시간(Avg 25ms / P95 40ms) 및 처리량(2,000+ RPS) 결과.

### 4) 장애 분석 및 대응 ([`troubleshooting/`](./troubleshooting/))
* [`troubleshooting/01-redis-failure.md`](./troubleshooting/01-redis-failure.md): Redis 인스턴스 다운 시 인증/인가 장애 영향도 분석, Lettuce 재연결 및 서비스 복구 절차, 재발 방지 대책.
