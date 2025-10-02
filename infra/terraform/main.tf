provider "aws" {
  region = "us-east-1"
}

# Security group for Kafka cluster
resource "aws_security_group" "kafka_sg" {
  name        = "kafka-sg"
  description = "Allow SSH and Kafka traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # allow SSH (replace with your IP for more security)
  }

  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Kafka external client
  }

  ingress {
    from_port   = 9093
    to_port     = 9093
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Kafka controller quorum
  }

  # allow everything outbound
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 instances (Kafka nodes)
resource "aws_instance" "kafka_nodes" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 20.04
  instance_type = "t2.medium"
  key_name      = "<KEY_PAIR_NAME>"       # replace with your key pair

  vpc_security_group_ids = [aws_security_group.kafka_sg.id]

  tags = {
    Name = "kafka-node-${count.index + 1}"
  }
}

# Output public IPs of nodes
output "kafka_ips" {
  value = [for instance in aws_instance.kafka_nodes : instance.public_ip]
}
