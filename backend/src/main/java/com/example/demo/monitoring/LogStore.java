package com.example.demo.monitoring;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class LogStore {

    private static final int MAX_LOGS = 100;
    private final LinkedList<RequestLog> logs = new LinkedList<>();
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public synchronized void add(RequestLog log) {
        if (logs.size() >= MAX_LOGS) {
            logs.removeFirst();
        }
        logs.addLast(log);

        // 실시간으로 연결된 브라우저(SSE)에 로그 푸시
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("log").data(log));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
    }

    public synchronized List<RequestLog> getAll() {
        return new ArrayList<>(logs);
    }

    public void addEmitter(SseEmitter emitter) {
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
    }
}