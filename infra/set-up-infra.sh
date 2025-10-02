#!/bin/bash
set -e

# Terraform
terraform init
terraform apply -auto-approve

# Generate inventory.ini for Ansible
echo "[kafka_nodes]" > inventory.ini
terraform output -json kafka_ips | jq -r '.[]' | nl -w1 -s' ' | \
  awk '{print "node"$1" ansible_host="$2" ansible_user=ubuntu"}' >> inventory.ini

echo "Generated Ansible inventory:"
cat inventory.ini

# Run Ansible
ansible-playbook -i inventory.ini playbook.yml
