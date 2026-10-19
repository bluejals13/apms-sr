CREATE TABLE menu (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    price INT NOT NULL
);

CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(100),
    created_at DATETIME(6),
    result VARCHAR(255),
    target_id BIGINT,
    target_type VARCHAR(255),
    user_id BIGINT,
    after_value VARCHAR(255),
    before_value VARCHAR(255)
);

INSERT INTO roles(name, description)
VALUES
('ADMIN', 'Administrator'),
('USER', 'Normal User');
