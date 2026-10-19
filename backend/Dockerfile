FROM gradle:8.1-jdk17 AS build

WORKDIR /home/gradle/project

COPY . .

RUN chmod +x gradlew
# DB가 없는 빌드 환경이므로 테스트 생략 (-x test), plain jar 생성 방지
RUN ./gradlew clean build -x test --no-daemon

FROM eclipse-temurin:17-jdk

# curl 설치 (Healthcheck 용도)
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# *-SNAPSHOT.jar 만 명시적으로 복사 (plain.jar 충돌 방지)
COPY --from=build /home/gradle/project/build/libs/*-SNAPSHOT.jar app.jar

EXPOSE 8080

# Spring Security 설정에서 /actuator/health가 permitAll 되어 있어야 동작함
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]