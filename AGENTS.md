# 26-05adf Project Agent Map

## 1. Project Overview
- Full-stack application with monitoring and load testing.
- Docker Compose based containerized environment.

## 2. Directory Map
- `/backend/`: 백엔드 API 서버 소스코드
- `/frontend/`: 프론트엔드 UI 소스코드
- `/infra/nginx/`: 웹 서버 및 리버스 프록시 설정
- `/infra/monitoring/`: Prometheus, Grafana 등 모니터링 설정
- `/verification/performance/k6/`: 부하 테스트 스크립트 및 성능 검증
- `docker-compose.yml`: 전체 인프라 실행 컨테이너 오케스트레이션

## 3. Agent Rules
- 코드를 탐색할 때 무작정 전체 파일을 읽지 마세요.
- 작업 대상(예: 백엔드 API 수정)에 따라 해당하는 디렉터리(`/backend/`)의 코드만 먼저 분석하세요.