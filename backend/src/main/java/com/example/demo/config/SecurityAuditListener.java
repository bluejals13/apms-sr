package com.example.demo.config.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
public class SecurityAuditListener {

    // 1. 일반 시스템 로거가 아닌 'SECURITY_AUDIT' 전용 로거 획득
    private static final Logger auditLog = LoggerFactory.getLogger("SECURITY_AUDIT");

    @EventListener
    public void onLoginSuccess(AuthenticationSuccessEvent event) {
        String username = event.getAuthentication().getName();
        
        // 2. MDC에 보안 감사 식별 태그 추가
        MDC.put("eventType", "LOGIN_SUCCESS");
        
        // 3. 전용 로거로 출력 (나중에 logback-spring.xml에서 파일 분리 기준이 됨)
        auditLog.info("User {} successfully logged in.", username);
        
        MDC.remove("eventType");
    }

    @EventListener
    public void onLoginFailure(AuthenticationFailureBadCredentialsEvent event) {
        String username = event.getAuthentication().getName();
        
        MDC.put("eventType", "LOGIN_FAILURE");
        auditLog.warn("Failed login attempt for user: {}", username);
        MDC.remove("eventType");
    }
}