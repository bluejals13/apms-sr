package com.example.demo.config.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class MdcLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            
        // Actuator/Health Check 등 불필요한 요청 패스
        String uri = request.getRequestURI();
        if (uri.startsWith("/actuator")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Nginx X-Real-IP 추출
            String clientIp = request.getHeader("X-Real-IP");
            if (clientIp == null) clientIp = request.getRemoteAddr();
            
            // 고유 Trace ID 생성
            String traceId = UUID.randomUUID().toString().substring(0, 8);

            MDC.put("traceId", traceId);
            MDC.put("clientIp", clientIp);
            
            // 사용자 정보(SecurityContextHolder)가 있다면 MDC.put("user", username); 도 가능

            filterChain.doFilter(request, response);
        } finally {
            MDC.clear(); // 스레드 풀 재사용으로 인한 MDC 오염 방지
        }
    }
}