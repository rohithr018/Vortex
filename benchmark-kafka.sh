#!/bin/bash

# Run inside Ansible after cluster start
BROKERS="kafka-1:19092,kafka-2:19092,kafka-3:19092"
TOPIC="vortex-benchmark"
RECORD_SIZE=100
NUM_RECORDS=1000000
PARTITIONS=6
REPLICATION=3
ACKS=all

echo "==== Creating topic across 3-node cluster ===="
docker exec kafka-1 kafka-topics.sh \
  --create \
  --bootstrap-server "$BROKERS" \
  --topic "$TOPIC" \
  --partitions "$PARTITIONS" \
  --replication-factor "$REPLICATION" \
  --if-not-exists

echo "==== Producer performance test ===="
docker exec kafka-1 kafka-producer-perf-test.sh \
  --topic "$TOPIC" \
  --num-records "$NUM_RECORDS" \
  --record-size "$RECORD_SIZE" \
  --throughput -1 \
  --producer-props bootstrap.servers="$BROKERS" acks="$ACKS"

echo "==== Consumer performance test ===="
docker exec kafka-2 kafka-consumer-perf-test.sh \
  --bootstrap-server "$BROKERS" \
  --topic "$TOPIC" \
  --messages "$NUM_RECORDS" \
  --threads 3 \
  --timeout 60000

echo "==== Benchmark Complete ===="
