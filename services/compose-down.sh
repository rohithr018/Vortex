#!/bin/bash

echo "======================================================"
echo "Stopping Kafka and ClickHouse services..."
echo "======================================================"

echo -e "\n🛑 Stopping Kafka services..."
docker compose -f kafka/docker-compose.yml down  -v&& echo -e "✅ Kafka services have been stopped!"

echo -e "\n🛑 Stopping ClickHouse services..."
docker compose -f clickhouse/docker-compose.yml down -v && echo -e "✅ ClickHouse services have been stopped!"

echo "======================================================"
echo "All services have been stopped and removed successfully!"
echo "======================================================"
