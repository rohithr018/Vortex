#!/bin/bash

TOPIC_NAME=$1
NUM_PARTITIONS=1
REPLICATION_FACTOR=1
BROKER="kafka-broker:19092"
KAFKA_BIN_DIR="/opt/kafka/bin"  # Set the Kafka binary directory

# Check if topic exists
if $KAFKA_BIN_DIR/kafka-topics.sh --bootstrap-server $BROKER --list | grep -q "^$TOPIC_NAME$"; then
  echo "Topic '$TOPIC_NAME' already exists."
else
  echo "Creating topic '$TOPIC_NAME'..."
  $KAFKA_BIN_DIR/kafka-topics.sh --bootstrap-server $BROKER --create \
    --topic "$TOPIC_NAME" \
    --partitions $NUM_PARTITIONS \
    --replication-factor $REPLICATION_FACTOR
  echo "Topic '$TOPIC_NAME' created."
fi
