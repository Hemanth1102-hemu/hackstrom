# Production-Ready Hackathon Backend Architecture

## Overview
This is a comprehensive full-stack asynchronous architecture incorporating microservices, event-driven processes, containerization, and advanced security best practices. Designed for High Scalability and robust Hackathon judging formats.

## Architecture Flow
```
Client Request -> FastAPI/Express API Layer (JWT Protected) 
               -> Persist state in MySQL 
               -> Publish job to RabbitMQ (task_queue) 
               -> Async Worker Service consumes from Queue (Prefetch = 2 parallel)
               -> Heavy processing execution (AI Prediction Simulation) 
               -> Persist Result in MySQL
```

## Setup & Execution (Dockerized)

Ensure you have Docker and Docker Compose installed.

1. Navigate to the `hackathon-backend` root folder.
2. Run the environment:
   ```bash
   docker-compose up --build -d
   ```
3. The services will boot up:
   - MySQL on port 3306
   - RabbitMQ on port 5672 (15672 for Management UI)
   - Backend API on port 3000
   - Worker Service running in the background communicating with RMQ.

## Security Overview
- **Authentication**: Native JWT with Refresh system mapping to specific ID.
- **2FA flow implemented**: Standard login triggers transient OTP via email (simulated console log) combined with a timed validity check.
- **Encryption**: AES-256-CBC implemented securely across PII strings prior to database input.
- **RBAC Enforcement**: Admin and User roles segregated efficiently via middleware layers mapping internal access logic.
