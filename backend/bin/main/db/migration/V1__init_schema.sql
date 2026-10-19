CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    password_changed_at DATETIME(6),
    status ENUM(
        'ACTIVE',
        'DELETED',
        'DELETE_PENDING',
        'SUSPENDED'
    ) NOT NULL DEFAULT 'ACTIVE',
    email VARCHAR(255)
);

CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255),
    level INT NOT NULL DEFAULT 10,
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description VARCHAR(255),
    name VARCHAR(100) NOT NULL UNIQUE
);
