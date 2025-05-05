#!/bin/bash

echo "======================================================"
echo "Starting Kafka and ClickHouse services..."
echo "======================================================"

echo -e "\n🚀 Bringing up Kafka services..."
docker compose -f kafka/docker-compose.yml up -d && echo -e "✅ Kafka services are now up!"

echo -e "\n🚀 Bringing up ClickHouse services..."
docker compose -f clickhouse/docker-compose.yml up -d && echo -e "✅ ClickHouse services are now up!"

echo "======================================================"
echo "All services are up and running successfully!"
echo "======================================================"
