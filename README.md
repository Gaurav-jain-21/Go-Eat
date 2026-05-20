# GoEat - AI Powered Food Delivery Platform

GoEat is a microservices-based food delivery platform with a React frontend, Node.js backend services, MongoDB Atlas storage, and a FastAPI AI service for chat, RAG, and recommendations.

## Features

* JWT authentication and role-based access for users, hotels, and admins
* Hotel profile creation and food management
* Food browsing, cart, orders, payments, reviews, notifications, and delivery tracking
* API gateway for routing frontend requests to backend services
* AI chat, RAG support, and food recommendation endpoints
* MongoDB Atlas support through a shared root `.env`

## Tech Stack

* Frontend: React, Vite, Tailwind CSS, Axios, React Router
* Backend: Node.js, Express, MongoDB, Mongoose, JWT
* AI service: FastAPI, ChromaDB, Sentence Transformers, Groq-compatible OpenAI client
* Deployment/runtime: Docker, Docker Compose, Nginx

## Project Structure

```txt
Go-Eat/
|-- frontend/
|   |-- Dockerfile
|   |-- nginx.conf
|   `-- src/
|-- backend/
|   |-- Dockerfile
|   |-- api-gateway/
|   |-- auth-service/
|   |-- user-service/
|   |-- hotel-service/
|   |-- food-service/
|   |-- cart-service/
|   |-- order-service/
|   |-- payment-service/
|   |-- notification-service/
|   |-- admin-service/
|   |-- review-rating-service/
|   |-- delivery-tracking-service/
|   |-- recommendation-service/
|   `-- ai-service/
|-- docker-compose.yml
|-- .env.example
`-- .dockerignore
```

## Services

Frontend requests go to the API gateway at `http://localhost:5000`.

```txt
frontend                       host 5173 -> container 80
api-gateway                    5000
auth-service                   5001
user-service                   5002
hotel-service                  5003
food-service                   5004
cart-service                   5005
order-service                  5006
payment-service                5007
ai-service                     8000
notification-service           5009
admin-service                  5010
review-rating-service          5011
delivery-tracking-service      5012
recommendation-service         5013
```

## Environment Setup

Create a root `.env` from the example:

```powershell
Copy-Item .env.example .env
```

Update at least these values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/goeat?retryWrites=true&w=majority
JWT_SECRET=change_this_to_a_long_random_secret
VITE_API_URL=http://localhost:5000
```

Optional integrations:

```env
EMAIL_USER=
EMAIL_PASS=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

For MongoDB Atlas, make sure your current IP is allowed in Atlas Network Access.

## Docker Setup

Start Docker Desktop first, using Linux containers.

Build and run everything:

```powershell
$env:COMPOSE_PARALLEL_LIMIT=1
docker compose up --build
```

Or run in the background:

```powershell
$env:COMPOSE_PARALLEL_LIMIT=1
docker compose up -d --build
```

Open:

```txt
Frontend:    http://localhost:5173
API gateway: http://localhost:5000
```

Check container status:

```powershell
docker compose ps
docker compose ps -a
```

View logs:

```powershell
docker compose logs --tail=100 api-gateway
docker compose logs --tail=100 hotel-service
docker compose logs --tail=100 ai-service
```

Stop services:

```powershell
docker compose down
```

## Rebuilding Individual Services

If npm fails during parallel Docker builds, rebuild one service at a time:

```powershell
$env:COMPOSE_PARALLEL_LIMIT=1
docker compose build --no-cache cart-service
docker compose up -d cart-service
docker compose logs --tail=50 cart-service
```

Repeat with any service name from `docker compose config --services`.

The shared backend Dockerfile pins npm and verifies `express` during build so broken dependency images fail early.

## Local Development Without Docker

Install and run the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Run a Node service:

```powershell
cd backend/auth-service
npm install
npm run dev
```

Run the AI service:

```powershell
cd backend/ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Examples

```http
POST /api/auth/register
POST /api/auth/login
POST /api/hotels
GET  /api/hotels
POST /api/foods
POST /api/cart/add
POST /api/orders/place
POST /api/payments
POST /api/reviews
POST /api/ai/chat
```

AI chat request:

```json
{
  "message": "Suggest me veg food under 300"
}
```

## Troubleshooting

If only the frontend is running, check all containers:

```powershell
docker compose ps -a
```

If a service exits with `Cannot find module 'express'`, rebuild that service without cache:

```powershell
docker compose build --no-cache <service-name>
docker compose up -d <service-name>
```

If backend services exit with MongoDB errors, check `MONGO_URI` and Atlas IP access.

If the AI service fails with a ChromaDB collection error, rebuild the AI image. The AI `.dockerignore` excludes the local `vector_db` so Docker starts from a clean Chroma database:

```powershell
docker compose build --no-cache ai-service
docker compose up -d ai-service
```

## Security Notes

Never commit real secrets. Keep `.env` private and use `.env.example` for placeholders.

Do not push:

* MongoDB credentials
* JWT secrets
* Email credentials
* Razorpay secrets
* Groq API keys

## Author

Gaurav Kumar Borad

Computer Engineering Student interested in AI/ML, backend engineering, microservices, and full stack development.
