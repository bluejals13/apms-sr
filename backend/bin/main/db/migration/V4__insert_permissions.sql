INSERT INTO permissions(name, description)
VALUES
('USER_READ', '사용자 조회'),
('USER_STATUS_UPDATE', '사용자 상태 변경'),
('USER_DELETE', '사용자 삭제'),

('ROLE_READ', 'Role 조회'),
('ROLE_CREATE', 'Role 생성'),
('ROLE_UPDATE', 'Role 수정'),
('ROLE_DELETE', 'Role 삭제'),
('ROLE_ASSIGN', 'Role에 Permission 할당'),

('MENU_READ', '메뉴 조회'),
('MENU_CREATE', '메뉴 생성'),
('MENU_UPDATE', '메뉴 수정'),
('MENU_DELETE', '메뉴 삭제'),

('PERMISSION_READ', 'Permission 조회');


INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN';


INSERT INTO role_permissions(role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p
ON p.name IN (
    'USER_READ',
    'MENU_READ'
)
WHERE r.name = 'USER';
