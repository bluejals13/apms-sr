DELETE FROM user_roles;
DELETE FROM users;

INSERT INTO users (
    id,
    username,
    password,
    status,
    email
) VALUES (
    1,
    'testuser',
    '$2a$10$eFZu4rKvdovHaBfx0w91Pe8bxWl.GNOQA5i2NP2rgHq1.ydzGY2je',
    'ACTIVE',
    'testuser@test.com'
);

INSERT INTO users (
    id,
    username,
    password,
    status,
    email
) VALUES (
    2,
    'admin',
    '$2a$10$mLxWbOKAz6/EAO14u.SQB.vtZTwQBt3kQb0qeGMdwm2nnvoX8Pwji',
    'ACTIVE',
    'admin@test.com'
);

INSERT INTO user_roles (user_id, role_id)
SELECT 1, id
FROM roles
WHERE name = 'USER';

INSERT INTO user_roles (user_id, role_id)
SELECT 2, id
FROM roles
WHERE name = 'ADMIN';
