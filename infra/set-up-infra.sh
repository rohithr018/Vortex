#!/bin/bash
set -e

terraform init
terraform apply -auto-approve

echo "[kafka_nodes]" > inventory.ini
terraform output -json kafka_ips | jq -r '.[]' | nl -w1 -s' ' | awk '{print "node"$1" ansible_host="$2" ansible_user=ubuntu"}' >> inventory.ini

echo "Generated inventory.ini:"
cat inventory.ini

ansible-playbook -i inventory.ini playbook.yml
