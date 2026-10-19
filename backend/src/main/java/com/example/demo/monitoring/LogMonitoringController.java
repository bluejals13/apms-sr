package com.example.demo.monitoring;

import com.example.demo.common.dto.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
public class LogMonitoringController {

    // 1. 일반 시스템/비즈니스 로거 (Root 기본 설정 적용)
    private static final Logger log = LoggerFactory.getLogger(LogMonitoringController.class);
    
    // 2. 보안 감사 전용 로거 (logback-spring.xml 지정 이름)
    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    private final LogStore logStore;

    public LogMonitoringController(LogStore logStore) {
        this.logStore = logStore;
    }

    // [기능 1] 로그 파일(Audit/System) 분리 및 MDC 주입 테스트
    @GetMapping("/test/log")
    public String triggerLogSeparationTest() {
        log.info("========== 로그 분리 테스트 시작 ==========");
        log.info("이것은 일반 비즈니스 로직 로그입니다. 정상적인 API 처리 과정을 기록합니다.");
        log.error("이것은 일반 에러 로그입니다. 에러 내용도 backend.log에 남아야 합니다.");

        MDC.put("eventType", "MANUAL_TEST");
        auditLog.info("이것은 분리된 보안 감사(Audit) 로그입니다. Wazuh 수집용 파일에만 찍혀야 합니다.");
        MDC.remove("eventType");

        log.info("========== 로그 분리 테스트 종료 ==========");
        return "로그 분리 테스트 완료! 서버의 logs/ 폴더를 확인해 보세요.";
    }

    // [기능 2] BodyLoggingFilter가 수집한 최신 API 요청 로그 데이터 조회 (Admin UI용)
    @GetMapping("/monitor")
    public ApiResponse<List<RequestLog>> getLogs() {
        return ApiResponse.success(logStore.getAll());
    }

    // [기능 3] 실시간 API 요청 SSE 스트리밍
    @GetMapping(value = "/monitor/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs() {
        SseEmitter emitter = new SseEmitter(60 * 60 * 1000L); // 1시간 타임아웃
        logStore.addEmitter(emitter);

        try {
            // 연결 즉시 현재까지 누적된 로그 목록을 클라이언트에 1회 전송
            emitter.send(SseEmitter.event().name("init").data(logStore.getAll()));
        } catch (IOException e) {
            emitter.complete();
        }

        return emitter;
    }
}