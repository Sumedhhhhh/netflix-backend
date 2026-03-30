# 🎬 Netflix Backend System (Streaming Platform Backend)

A backend-focused Netflix-like streaming platform built to simulate real-world distributed system design, including authentication, metadata management, and scalable video processing pipelines.

---

## 🚀 Overview

This project focuses on building the **backend architecture of a streaming platform**, emphasizing:

- Scalable API design
- Authentication & authorization
- Database modeling
- Asynchronous processing
- Distributed system components

The goal is to simulate how platforms like Netflix handle **user identity, video metadata, and streaming workflows**, using only open-source tools and running entirely locally.

---

## 🏗️ Architecture


Client
|
v
FastAPI Backend
|
├── Authentication (JWT)
├── Video Metadata Service
├── Watch Progress Service
|
├── PostgreSQL (Primary DB)
├── Redis (Cache + Queue)
├── MinIO (Object Storage)
|
└── Worker Service (Video Processing - upcoming)


---

## ⚙️ Tech Stack

| Component        | Technology              |
|-----------------|------------------------|
| Backend API     | FastAPI                |
| Database        | PostgreSQL             |
| Cache / Queue   | Redis                  |
| Object Storage  | MinIO (S3-compatible)  |
| ORM             | SQLAlchemy             |
| Auth            | JWT (python-jose)      |
| Password Hashing| Bcrypt (passlib)       |
| Containerization| Docker + Docker Compose|

---

## 🔐 Authentication System

Implemented a **stateless authentication system** using JWT.

### Features

- User signup & login
- Secure password hashing (bcrypt)
- JWT-based authentication
- Protected endpoints via dependency injection

### Flow


Login → Generate JWT → Client stores token → Send with every request


## 🗄️ Database Design

### Tables Implemented

#### Users
- id  
- email  
- password_hash  
- created_at  

#### Videos
- id  
- title  
- description  
- release_year  
- duration_s  
- thumbnail_url  
- storage_prefix  
- created_at  

#### Watch Progress
- user_id  
- video_id  
- position_s  
- updated_at  
- version (for concurrency control)  

#### Genres
- basic structure implemented  

---

## 📺 Video Catalog

### Endpoints

#### Get all videos

GET /videos


#### Get video details

GET /videos/{video_id}


#### Create video (admin)

POST /admin/videos


---

## ⏯️ Watch Progress (Continue Watching)

Tracks user playback progress.

### Endpoint

POST /progress


### Features

- Monotonic updates (prevents backward progress)
- Per-user, per-video tracking
- Enables "Continue Watching" functionality

---

## 🔒 Security Considerations

- Passwords are hashed (never stored in plaintext)
- JWT tokens include expiration
- Authentication enforced via dependency injection
- Database session scoped per request

---

## ⚡ System Design Highlights

### Stateless Authentication
- No session storage required
- Horizontally scalable

### Separation of Concerns
- Metadata stored in PostgreSQL
- Media stored in object storage (MinIO)
- Async processing handled by workers

### Cache-Aside Pattern (Planned)


Request → Check Redis → Fallback to DB → Cache result


---

## 🧪 Running the Project

### Prerequisites
- Docker
- Docker Compose

### Start Services

cd infra
docker compose up --build


### Services
- API → http://localhost:8000  
- MinIO Console → http://localhost:9001  

---

## 🔍 Example Usage

### Signup

POST /auth/signup


### Login

POST /auth/login


### Access protected route

GET /videos
Authorization: Bearer <TOKEN>


---

## 🛠️ Challenges Faced

- Dependency conflicts (bcrypt vs passlib)
- Database schema drift (column mismatch)
- Token validation issues
- Docker rebuild and environment syncing

---

## 🚧 Upcoming Features

### 🎥 Video Ingestion Pipeline
- Upload video to MinIO
- Queue processing jobs (Redis)
- Worker service using FFmpeg
- Generate HLS streaming format

### 📡 Streaming Service
- Serve `.m3u8` playlists
- Adaptive bitrate streaming
- Secure streaming URLs

### ⚡ Performance Improvements
- Redis caching layer
- Pagination for catalog
- Rate limiting

### 📊 Observability
- Prometheus metrics
- Grafana dashboards
- Structured logging

---

## 📚 Learning Outcomes

This project demonstrates:

- Backend system design fundamentals
- Real-world authentication patterns
- Database modeling & tradeoffs
- Distributed architecture concepts
- Debugging production-like issues

---

## 💡 Future Improvements

- Microservices decomposition
- CDN simulation with Nginx
- Recommendation system
- Search engine integration
- Multi-profile support (like Netflix)

---

## 🧠 Inspiration

Inspired by real-world streaming architectures used by platforms like Netflix, focusing on **backend scalability and reliability** rather than UI.

---

## 👨‍💻 Author

**Sumedh Bhoir**

---

## ⭐ Why This Project Matters

This project goes beyond CRUD APIs and demonstrates:

- Distributed system thinking
- Production-level backend patterns
- Scalability considerations
- Real-world engineering tradeoffs