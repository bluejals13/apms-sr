package com.example.demo.audit.service;

//import com.example.demo.audit.dto.AuditEvent;
import com.example.demo.audit.domain.Audit;
import com.example.demo.audit.domain.AuditAction;
import com.example.demo.audit.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuditService {

    private final AuditRepository auditRepository;

     public void log(
            Long userId,
            AuditAction action,
            String targetType,
            Long targetId,
            String beforeValue,
            String afterValue
    ) {
        Audit audit = Audit.create(
                userId,
                action,
                targetType,
                targetId,
                beforeValue,
                afterValue
        );
    
        auditRepository.save(audit);
        log.info("[AUDIT SAVED] user:{}, action:{}, target:{} {}", userId, action, targetType, targetId);
    }
}
