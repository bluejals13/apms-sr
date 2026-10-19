package com.example.demo.monitoring;

// 프론트엔드 JSON 구조(timestamp, username, method, uri, body)와 일치하는 불변 DTO
public record RequestLog(
        String timestamp,
        String username,
        String method,
        String uri,
        String body
) {}