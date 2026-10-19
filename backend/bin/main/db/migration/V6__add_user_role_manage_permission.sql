-- V6: USER_ROLE_MANAGE Permission 추가 및 ADMIN Role 연결
-- 목적: UserAdminController.assignRoles()의 @PreAuthorize("hasAuthority('USER_ROLE_MANAGE')") 지원

INSERT INTO permissions (name, description)
VALUES ('USER_ROLE_MANAGE', '사용자 역할 부여');

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name = 'USER_ROLE_MANAGE'
WHERE r.name = 'ADMIN';
