provider "aws" {
  region = "us-east-1"
}

# Security group
resource "aws_security_group" "kafka_sg" {
  name        = "kafka-single-node-sg"
  description = "Allow SSH and Kafka ports"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Replace with your IP for security
  }

  ingress {
    from_port   = 9092
    to_port     = 9096
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Kafka client & inter-broker ports
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Kafka console
  }

  ingress {
    from_port   = 8123
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # ClickHouse
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Single EC2 instance
resource "aws_instance" "kafka_node" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 20.04
  instance_type = "t3.large"
  key_name      = "<KEY_PAIR_NAME>"       # replace with your key pair
  vpc_security_group_ids = [aws_security_group.kafka_sg.id]

  tags = {
    Name = "kafka-single-node"
  }
}

output "ec2_public_ip" {
  value = aws_instance.kafka_node.public_ip
}
