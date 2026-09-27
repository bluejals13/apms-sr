
## 목록- 관련 용어집
[Index-glossary.md](https://github.com/bluejals13/apms-sr/blob/feature/auth%400603%401401/docs/07_Current_Setting/backend/main/Index-glossary.md)


 # 5\. Constraint 관련 용어


 Constraint는 데이터가 잘못 들어가지 않도록 **DB가 지켜야 하는 규칙**이다.

---

 ## 5.1 Constraint

 예:

```
username VARCHAR(255) UNIQUE
```

 여기서 `UNIQUE`가 Constraint다.

 즉:

 > "username은 중복되면 안 된다."

 라는 DB 규칙이다.

---

 ## 5.2 NOT NULL

```
username VARCHAR(255) NOT NULL
```

 의미:

 > username에는 NULL을 저장할 수 없다.

 즉 값이 반드시 있어야 한다.

---

 ## 5.3 NULL

 NULL은 **값이 없음/알 수 없음**을 의미한다.

 다음은 문자열 `"NULL"`과 다르다.

```
NULL
```

 과

```
"NULL"
```

 은 서로 다른 개념이다.

```
NULL
→ 값 자체가 없음

"NULL"
→ NULL이라는 글자가 들어 있음
```

---

 ## 5.4 UNIQUE

```
username VARCHAR(255) UNIQUE
```

 중복을 허용하지 않는 Constraint다.

 예:

```
alice
bob
charlie
```

 는 가능하지만:

```
alice
alice
```

 는 허용되지 않는다.

---

 ## 5.5 DEFAULT

```
status DEFAULT 'ACTIVE'
```

 값을 지정하지 않았을 때 사용할 기본값이다.

 예:

```
status를 생략
       ↓
ACTIVE 자동 입력
```

---

 ## 5.6 ENUM

 ENUM은 **정해진 값 중 하나만 선택할 수 있도록 하는 자료형**이다.

 예:

```
status ENUM(
    'ACTIVE',
    'DELETED',
    'SUSPENDED'
)
```

 가능:

```
ACTIVE
DELETED
SUSPENDED
```

 불가능:

```
HELLO
TEST
ABC
```

---

 # 6\. Data Type 관련 용어

 ## 6.1 Data Type

 Column에 어떤 종류의 데이터를 저장할지 정의하는 것이다.

 예:

```
BIGINT
VARCHAR(255)
BOOLEAN
DATETIME(6)
```

---

 ## 6.2 BIGINT

 큰 정수형 데이터 타입이다.

 주로 ID 같은 숫자 데이터에 사용할 수 있다.

```
1
2
100
100000
```

---

 ## 6.3 INT

 일반적인 정수형 데이터 타입이다.

 예:

```
1
10
100
```

 APMS-SR에서는 `roles.level` 등에 사용된다.

---

 ## 6.4 VARCHAR

 문자열을 저장하는 타입이다.

```
VARCHAR(255)
```

 은 최대 255 길이의 문자열을 저장할 수 있다는 의미다.

 예:

```
alice
ADMIN
USER_READ
```

---

 ## 6.5 DATETIME

 날짜와 시간을 저장하는 타입이다.

 예:

```
2026-09-27 13:20:10
```

---

 ## 6.6 DATETIME(6)

 날짜와 시간에 더해 소수점 이하 6자리까지 시간 정밀도를 표현할 수 있다.

 예:

```
2026-09-27 13:20:10.123456
```

---

 ## 6.7 BOOLEAN

 참/거짓을 표현한다.

```
TRUE
FALSE
```

 예:

```
is_system BOOLEAN
```

