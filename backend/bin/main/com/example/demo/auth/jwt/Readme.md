# JwtProvider

JWT 토큰 생성 / 검증 / 파싱을 담당하는 클래스

---

# 구조

```text id="a1"
createToken()
getUserId()
validate()
parseClaims() (private)
```

---

# 역할

* Access Token 생성
* Token 유효성 검증
* JWT에서 userId 추출

---

# 설정

| 항목             | 설명         |
| -------------- | ---------- |
| jwt.secret     | 서명 키       |
| jwt.expiration | 만료 시간 (ms) |

---

# 1. createToken

```text id="b2"
userId → JWT 생성 → token 반환
```

* subject = userId
* issuedAt / expiration 포함
* HS256 서명

---

# 2. getUserId

```text id="c3"
token → claims → subject → userId
```

---

# 3. validate

```text id="d4"
JWT 파싱 성공 여부 확인
true / false 반환
```

---

# 흐름

```text id="e5"
createToken → 발급
validate → 검증
getUserId → 인증 정보 추출
```

---

# 특징

* Stateless 인증
* HS256 기반 JWT
* Spring Security Filter와 연동
