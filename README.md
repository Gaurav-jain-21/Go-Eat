# GoEat - AI Powered Food Delivery Platform

```txt
Microservices + MERN + RAG AI + Payments + Notifications + Geo-location
```

## Project Overview

GoEat is a modern AI-powered food delivery platform built using a complete microservices architecture.

The platform allows users to:

* discover nearby restaurants
* order food online
* make secure payments
* receive real-time notifications
* interact with an AI chatbot
* get AI-powered food recommendations

The system is designed with scalability, modularity, and production-level backend architecture in mind.

---

# Features

## Authentication & Authorization

* JWT Authentication
* Role-Based Access Control
* Email Verification
* Login/Register
* Protected Routes
* Token Middleware
* Admin/User/Hotel Roles

---

## User Features

* Register/Login
* Browse Nearby Hotels
* Search Foods
* Add To Cart
* Place Orders
* Track Orders
* Payment Integration
* Notifications
* Profile Management
* AI Chatbot

---

## Hotel Features

* Hotel Registration
* Add/Edit/Delete Foods
* Manage Orders
* Update Order Status
* Dashboard Management

---

## Admin Features

* Manage Users
* Manage Hotels
* Manage Orders
* Manage Payments
* System Monitoring

---

# AI Features

* RAG-based AI Chatbot
* AI Food Recommendation System
* Vector Search using ChromaDB
* Embedding-based Retrieval
* Groq LLM Integration
* Semantic Food Search

---

# Payments

* Razorpay Integration
* PayPal Integration
* Refund Support
* Payment Verification
* Payment Tracking

---

# Notifications

* Real-time Notifications
* Email Notifications
* Socket.io Integration
* Order Status Updates
* Refund Notifications

---

# Geo Location Features

* Nearby Hotels
* Radius-based Search
* Location Detection
* Delivery Availability Check

---

# Microservices Architecture

```txt
Frontend (React + Vite)
        │
        ▼
API Gateway (Port 5000)
        │
 ┌───────────────────────────────┐
 │                               │
 ▼                               ▼

Auth Service           : 4001
User Service           : 4002
Hotel Service          : 4003
Location Service       : 4004
Order Service          : 4005
Payment Service        : 4006
Notification Service   : 4007
RAG AI Service         : 4008
```

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router DOM
* Framer Motion
* Socket.io Client

---

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* Socket.io
* API Gateway

---

## AI Stack

* FastAPI
* ChromaDB
* Sentence Transformers
* Groq LLM
* RAG Architecture

---

## Payments

* Razorpay
* PayPal

---

# Folder Structure

```txt
GoEat/
│
├── goeat-client/
│
├── services/
│   ├── auth-service/
│   ├── user-service/
│   ├── hotel-service/
│   ├── location-service/
│   ├── order-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── rag-ai-service/
│   └── api-gateway/
│
└── README.md
```

---

# Installation Guide

# 1. Clone Repository

```bash
git clone https://github.com/your-username/goeat.git
```

```bash
cd goeat
```

---

# 2. Install Frontend

```bash
cd goeat-client
npm install
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# 3. Setup Backend Services

Install dependencies inside every service:

Example:

```bash
cd services/auth-service
npm install
npm run dev
```

Do the same for:

```txt
user-service
hotel-service
location-service
order-service
payment-service
notification-service
api-gateway
```

---

# 4. Setup AI Service

```bash
cd services/rag-ai-service
```

Create virtual environment:

```bash
python -m venv venv
```

Activate:

## Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run:

```bash
python main.py
```

---

# Environment Variables

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## Backend Example `.env`

```env
PORT=4001
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

# API Gateway

All frontend requests go through:

```txt
http://localhost:5000
```

---

# Running Order

Start services in this order:

```txt
auth-service
user-service
hotel-service
location-service
order-service
payment-service
notification-service
rag-ai-service
api-gateway
frontend
```

---

# API Examples

## Register User

```http
POST /api/auth/register
```

---

## Login User

```http
POST /api/auth/login
```

---

## Nearby Hotels

```http
GET /api/location/nearby
```

---

## Add To Cart

```http
POST /api/cart/add
```

---

## Place Order

```http
POST /api/orders/place
```

---

## AI Chat

```http
POST /api/ai/chat
```

---

# AI Chat Example

```json
{
  "message": "Suggest me veg food under 300"
}
```

---

# Future Improvements

* Docker Support
* Kubernetes Deployment
* Kafka Integration
* Redis Caching
* CI/CD Pipeline
* Swagger Documentation
* Recommendation Engine Enhancement
* Mobile App
* Live Delivery Tracking

---

# Screenshots

## Home Page

*Add screenshot here*

## Hotel Dashboard

*Add screenshot here*

## AI Chatbot

*Add screenshot here*

## Cart & Orders

*Add screenshot here*

---

# Deployment

## Frontend

* Vercel
* Netlify

## Backend

* Railway
* Render
* AWS EC2

## Database

* MongoDB Atlas

---

# Security Features

* JWT Authentication
* Password Hashing
* Protected APIs
* Rate Limiting
* Role-Based Access Control
* Secure Payment Verification

---

# Performance Features

* Microservices Architecture
* Vector Database
* AI Retrieval Optimization
* API Gateway Routing
* Real-time Notifications

---

# Author

## Gaurav Kumar Borad

Computer Engineering Student

Interested in:

* AI/ML
* Backend Engineering
* Microservices
* Full Stack Development

---

# License

This project is licensed under the MIT License.

---

# GitHub Push Commands

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Initial commit"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/your-username/goeat.git
```

```bash
git push -u origin main
```

---

# Important Note

Before pushing to GitHub:

## Add `.env` files to `.gitignore`

Example:

```txt
.env
node_modules
venv
__pycache__
```

Never push:

* API keys
* JWT secrets
* MongoDB credentials
* Razorpay secrets
* Groq API keys
