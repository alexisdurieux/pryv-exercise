CREATE TABLE users(
    username VARCHAR(50) PRIMARY KEY,
    password_digest VARCHAR(40) NOT NULL,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    token VARCHAR(40),
    token_created_ts TIMESTAMP
);