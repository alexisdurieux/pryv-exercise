CREATE TABLE resources(
    id VARCHAR(40) PRIMARY KEY,
    data TEXT,
    created_ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_ts TIMESTAMP,
    deleted_ts TIMESTAMP
);