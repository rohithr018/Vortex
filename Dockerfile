FROM node:18

RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g npm-run-all

WORKDIR /app

COPY frontend ./frontend
COPY backend ./backend
COPY package.json .

RUN npm install
RUN cd frontend && npm install
RUN cd backend && npm install

EXPOSE 3000 5000

CMD ["npm-run-all", "--parallel", "start-frontend", "start-backend"]