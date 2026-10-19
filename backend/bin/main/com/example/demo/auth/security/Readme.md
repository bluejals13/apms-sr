

# 🔐 현재 인증 시스템 구조 요약

| 영역                            | 현재 역할          | 저장 위치                | 동작 방식                             | 상태           |
| ----------------------------- | -------------- | -------------------- | --------------------------------- | ------------ |
| **JWT (Access Token)**        | API 인증 본체      | 클라이언트 (Header)       | 서버는 서명 검증만                        | ✔️ stateless |
| **Cookie (Refresh Token 전달)** | refresh 전달 채널  | 브라우저 HttpOnly Cookie | `/refresh` 요청 시 자동 포함             | ✔️ 전달용       |
| **Refresh Token (JWT)**       | 재발급 권한         | Redis (jti 기준)       | Redis 값과 JWT jti 비교               | ✔️ stateful  |
| **Redis (refresh store)**     | refresh 유효성 저장 | Redis                | `refresh:jti:userId → jti`        | ✔️ 핵심 저장소    |
| **Blacklist (logout 차단)**     | 탈취/로그아웃 차단     | Redis                | `blacklist:jti → true`            | ✔️ 보조 보안     |
| **JTI (JWT ID)**              | 토큰 고유 식별자      | JWT 내부 + Redis       | refresh/blacklist 매칭 기준           | ✔️ 핵심 키      |
| **Access Token 검증**           | API 접근 허용      | JWT만 사용              | signature + exp + blacklist check | ✔️ stateless |

---

# 🔄 전체 흐름 (초압축)

## 1) 로그인

```
ID/PW → 서버 인증
→ Access JWT 발급 (stateless)
→ Refresh JWT 발급 (jti 포함)
→ Redis에 jti 저장
→ Refresh는 Cookie로 저장
```

---

## 2) API 요청

```
Client → Access Token
→ JWT 검증
→ blacklist 체크
→ user 로딩
→ 인증 완료
```

---

## 3) Refresh 요청

```
Cookie refresh token →
JWT 검증 →
jti 추출 →
Redis jti 비교 →
일치하면:
    → 새 access + refresh 발급
    → Redis jti 교체
```

---

## 4) Logout

```
Redis refresh 제거
Access token blacklist 등록
→ 즉시 refresh 차단 + access 제한(가능 범위)
```

---

# 🧠 핵심 구조 한 줄 요약

> ✔️ Access는 JWT로만 처리 (stateless)
> ✔️ Refresh는 Redis jti로 통제 (stateful)
> ✔️ Logout은 blacklist + Redis 삭제로 무효화
> ✔️ Cookie는 refresh 전달용 통로

---

# ⚡ 핵심 이해 포인트 (중요)

* JWT = “신분증”
* Redis = “재발급 허가 리스트”
* Cookie = “refresh 전달 봉투”
* Blacklist = “퇴출 명단”
* JTI = “토큰 일련번호”

---


