FROM ubuntu:focal

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y curl git openjdk-11-jdk maven jq && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get upgrade -y

WORKDIR /home/app

COPY main.sh main.sh
COPY script.js script.js
COPY package*.json ./
COPY .env .env

RUN chmod +x main.sh script.js

ENTRYPOINT ["/home/app/main.sh"]
