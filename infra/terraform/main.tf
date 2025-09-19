provider "aws" {
  region = "us-east-1"
}

# Security group to allow SSH + Kafka
resource "aws_security_group" "kafka_sg" {
  name        = "kafka-sg"
  description = "Allow SSH, Kafka "

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 2181
    to_port     = 2181
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 instances
resource "aws_instance" "kafka_nodes" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 20.04 
  instance_type = "t2.medium"
  key_name      = "<KEY_PAIR_NAME>" 

  vpc_security_group_ids = [aws_security_group.kafka_sg.id]

  tags = {
    Name = "kafka-node-${count.index + 1}"
  }

  provisioner "local-exec" {
    command = "echo ${self.public_ip} >> hosts.txt"
  }
}

output "kafka_ips" {
  value = [for instance in aws_instance.kafka_nodes : instance.public_ip]
}
