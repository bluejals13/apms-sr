package com.example.demo.monitoring;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class BodyLoggingFilter extends OncePerRequestFilter {

    private final LogStore logStore;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    public BodyLoggingFilter(LogStore logStore) {
        this.logStore = logStore;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();

        if (isExcluded(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);

        filterChain.doFilter(wrappedRequest, response);

        byte[] content = wrappedRequest.getContentAsByteArray();
        String body = content.length > 0 ? new String(content, StandardCharsets.UTF_8) : "";

        // 1. 요청 시간 생성
        String timestamp = LocalDateTime.now().format(FORMATTER);

        // 2. 현재 로그인한 사용자 식별자 추출
        String username = "Anonymous";
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            username = auth.getName();
        }

        logStore.add(new RequestLog(
                timestamp,
                username,
                request.getMethod(),
                uri,
                body
        ));
    }

    private boolean isExcluded(String uri) {
        return uri.startsWith("/api/monitor")
                || uri.startsWith("/api/test/log")
                || uri.startsWith("/actuator")
                || uri.contains("favicon")
                || uri.endsWith(".html");
    }
}