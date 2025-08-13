# Vortex

Vortex is a **cloud-native deployment service** inspired by **Vercel**, designed for **static website hosting**.  
It features **Node.js microservices**, a **Kafka-based log pipeline**, and a **modern React frontend** to provide a scalable and seamless user experience.

---

## 📊 Performance Results

<p align="left">
  <img src="./perf-results.png" alt="Vortex Performance Results" width="750"/>
</p>

---

## 🏗️ Architecture

<p align="left">
  <img src="./Architecture.png" alt="Vortex Architecture" width="800"/>
</p>

**Overview:**

1. **Frontend** (React + Vite) → Communicates with the backend via REST APIs.
2. **Backend** (Node.js + Express) → Handles authentication, deployments, GitHub integration, and log streaming.
3. **Build Server** → Docker-based isolated environment for compiling and delivering static files and project assets.
4. **Kafka** → High-throughput log pipeline for real-time log streaming.
5. **MongoDB** → Stores user profiles, deployment data, and metadata.
6. **ClickHouse** → Consumes logs from Kafka for high-efficiency log storage and fast querying.

---

## ⚙️ Tech Stack

**Frontend:** React, Vite, Redux  
**Backend:** Node.js, Express
**Messaging & Logs:** Apache Kafka  
**Databases:** MongoDB, ClickHouse  
**Builds:** Docker, Shell scripts  
**CI/CD:** GitHub Actions
