CREATE DATABASE IF NOT EXISTS logs;

CREATE TABLE IF NOT EXISTS logs.build_logs (
    log_uuid UUID DEFAULT generateUUIDv4(),
    deployment_id UUID,
    log_message String,
    log_level String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (deployment_id, created_at);
