// AuditAdminController

package com.example.demo.audit;

import com.example.demo.audit.dto.AuditResponse;
import com.example.demo.audit.service.AuditAdminService;

import com.example.demo.common.dto.ApiResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/audits")
@RequiredArgsConstructor
public class AuditAdminController {

    private final AuditAdminService auditAdminService;
    
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    @GetMapping
    public ApiResponse<List<AuditResponse>> getAudits(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action
    ) {
        return ApiResponse.success(auditAdminService.getAudits(userId, action));
    }
    
    @PreAuthorize("hasAuthority('AUDIT_READ')")
    @GetMapping("/{id}")
    public ApiResponse<AuditResponse> getAudit(@PathVariable Long id) {
        return ApiResponse.success(auditAdminService.getAudit(id));
    }
}
