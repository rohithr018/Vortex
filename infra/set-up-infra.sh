#!/bin/bash
set -e

cd "$(dirname "$0")"

echo "🚀 Applying Terraform..."
cd terraform
terraform init
terraform apply -auto-approve

echo "🌐 Extracting public IPs..."
IPS=$(terraform output -json kafka_ips | jq -r '.[]')
cd ..

echo "[kafka_nodes]" > ansible/inventory.ini
i=1
for ip in $IPS; do
  echo "node${i} ansible_host=${ip} ansible_user=ubuntu" >> ansible/inventory.ini
  ((i++))
done

echo "🧩 Running Ansible playbook..."
cd ansible
ansible-playbook -i inventory.ini playbook.yml
