CREATE DATABASE IF NOT EXISTS logs;

CREATE TABLE IF NOT EXISTS logs.log_queue (
    deployment_id String,
    log_message String,
    log_level String
) ENGINE = Kafka('kafka-broker:19092', 'build-logs', 'clickhouse-consumer', 'JSONEachRow')
SETTINGS kafka_skip_broken_messages = 1;

CREATE TABLE IF NOT EXISTS logs.build_logs (
    created_at DateTime64(3, 'Asia/Kolkata'),
    log_uuid UUID DEFAULT generateUUIDv4(),
    deployment_id String,
    log_message String,
    log_level String
) ENGINE = MergeTree
ORDER BY created_at;

CREATE MATERIALIZED VIEW IF NOT EXISTS logs.kafka_queue TO logs.build_logs
AS 
SELECT 
    toTimezone(now(), 'Asia/Kolkata') AS created_at,
    generateUUIDv4() AS log_uuid,
    deployment_id,
    log_message,
    log_level
FROM logs.log_queue;
