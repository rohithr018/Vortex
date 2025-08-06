#!/bin/bash

# Configuration
KAFKA_BIN="/opt/kafka/bin"
BROKER="kafka-broker:19092"
TOPIC="benchmark-topic"
PARTITIONS=3
REPLICATION=1
RECORD_SIZE=100       # in bytes
NUM_RECORDS=1000000   # total number of messages to produce
THROUGHPUT=-1         # -1 = no throttling
ACKS=1                # 0 = no ack, 1 = leader ack, -1 = all ISR

# Create topic
echo "Creating topic..."
$KAFKA_BIN/kafka-topics.sh --create \
  --bootstrap-server $BROKER \
  --topic $TOPIC \
  --partitions $PARTITIONS \
  --replication-factor $REPLICATION || echo "Topic may already exist."

echo "Starting Producer Performance Test..."
$KAFKA_BIN/kafka-producer-perf-test.sh \
  --topic $TOPIC \
  --num-records $NUM_RECORDS \
  --record-size $RECORD_SIZE \
  --throughput $THROUGHPUT \
  --producer-props bootstrap.servers=$BROKER acks=$ACKS

echo "Starting Consumer Performance Test..."
$KAFKA_BIN/kafka-consumer-perf-test.sh \
  --broker-list $BROKER \
  --messages $NUM_RECORDS \
  --topic $TOPIC \
  --threads 1 \
  --timeout 30000
