# Webhook Delivery System

A Stripe-like distributed webhook delivery platform built with event-driven microservices, featuring retry mechanisms, dead letter queues, observability, and a comprehensive frontend dashboard.

## Architecture

### Backend Services

- **API Gateway** (Port 3000): Entry point for all client requests
- **Auth Service** (Port 3001): User authentication and authorization using PostgreSQL
- **Webhook Service** (Port 3002): Webhook CRUD operations using PostgreSQL
- **Event Service** (Port 3003): Event creation and publishing to Kafka using MongoDB
- **Delivery Service** (Port 3004): Core webhook delivery with retry logic using PostgreSQL
- **Retry Service** (Port 3005): Handles failed delivery retries using BullMQ
- **DLQ Service** (Port 3006): Dead Letter Queue for permanently failed events using MongoDB
- **Notification Service** (Port 3007): Email notifications for system events using MongoDB
- **Logs Service** (Port 3008): Centralized logging service using MongoDB
- **Rate Limit Service** (Port 3009): Rate limiting using token bucket algorithm

### Infrastructure

- **PostgreSQL**: User, Webhook, and Delivery Log data
- **MongoDB**: Events, DLQ, Logs, and Notification cache
- **Kafka**: Event streaming and message queuing
- **Redis**: Caching and queue management
- **Prometheus**: Metrics collection
- **Grafana**: Metrics visualization (Port 3010)

### Frontend

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Redux Toolkit**: State management (without asyncThunk)
- **Axios**: HTTP client for API requests

## Database Schema

### PostgreSQL Tables

- **users**: User accounts with authentication
- **webhooks**: Webhook configurations
- **delivery_logs**: Webhook delivery attempt logs

### MongoDB Collections

- **events**: Event data and status
- **dlqevents**: Failed events in dead letter queue
- **logs**: System and application logs
- **usercaches**: User cache for notifications

## Features

### Backend
- ✅ Event-driven architecture with Kafka
- ✅ Automatic retry with exponential backoff
- ✅ Dead Letter Queue for failed events
- ✅ Rate limiting with token bucket algorithm
- ✅ HMAC signature verification
- ✅ Comprehensive logging
- ✅ Metrics collection with Prometheus
- ✅ Email notifications
- ✅ Microservices architecture

### Frontend
- ✅ User authentication (Login/Register)
- ✅ Real-time dashboard with statistics
- ✅ Webhook management (Create, Read, Update, Delete)
- ✅ Event tracking and monitoring
- ✅ Delivery logs with filtering and search
- ✅ Responsive design
- ✅ State management with Redux Toolkit

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd WebHook\ Delivery\ System
```

2. Start all services:
```bash
cd backend
docker-compose up -d
```

3. Run database migrations:
```bash
cd scripts
node migrate.js
```

4. Seed the database (optional):
```bash
node seed.js
```

5. Access the services:
   - Frontend: http://localhost:3001
   - API Gateway: http://localhost:3000
   - Grafana: http://localhost:3010 (admin/admin)

### Manual Setup

#### Backend Setup

1. Install dependencies for each service:
```bash
cd backend/shared && npm install
cd ../services/auth-service && npm install
# Repeat for all services
```

2. Start infrastructure services:
```bash
docker-compose up postgres mongo redis kafka zookeeper -d
```

3. Run migrations and seeds:
```bash
cd backend/scripts
node migrate.js
node seed.js
```

4. Start each service:
```bash
cd ../services/auth-service && npm start
# Repeat for all services
```

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create environment file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
```

3. Start development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Webhooks
- `GET /webhooks` - Get all webhooks
- `POST /webhooks` - Create webhook
- `GET /webhooks/:id` - Get webhook details
- `PUT /webhooks/:id` - Update webhook
- `DELETE /webhooks/:id` - Delete webhook

### Events
- `GET /events` - Get all events
- `POST /events` - Create event
- `GET /events/:id` - Get event details

### Deliveries
- `GET /deliveries` - Get delivery logs
- `GET /deliveries/stats` - Get delivery statistics

### Rate Limiting
- `POST /rate-limit/check` - Check rate limit
- `POST /rate-limit/reset` - Reset rate limit

### Logs
- `GET /logs` - Get system logs
- `POST /logs` - Create log entry
- `GET /logs/stats` - Get log statistics

## Environment Variables

### Backend Services

Each service requires the following environment variables:

**Common:**
- `PORT`: Service port
- `JWT_SECRET`: JWT signing secret

**Database:**
- `POSTGRES_URI`: PostgreSQL connection string
- `MONGO_URI`: MongoDB connection string

**Kafka:**
- `KAFKA_BROKERS`: Kafka broker addresses

**Redis:**
- `REDIS_URI`: Redis connection string

### Frontend

- `NEXT_PUBLIC_API_URL`: API Gateway URL

## Development

### Running Tests

```bash
# Backend tests
cd backend/services/<service-name>
npm test

# Frontend tests
cd frontend
npm test
```

### Code Style

- Backend: ESLint with Node.js rules
- Frontend: ESLint with Next.js rules

## Monitoring

### Prometheus Metrics

Access metrics at http://localhost:9090

### Grafana Dashboard

Access Grafana at http://localhost:3010 (admin/admin)

### Logs

View logs via the Logs Service API or directly from MongoDB.

## Troubleshooting

### Services Not Starting

1. Check if all infrastructure services are running:
```bash
docker-compose ps
```

2. Check service logs:
```bash
docker-compose logs <service-name>
```

3. Verify database connections:
```bash
docker-compose exec postgres psql -U postgres -d webhook_system
docker-compose exec mongo mongosh --eval "db.stats()"
```

### Database Issues

1. Run migrations:
```bash
cd backend/scripts
node migrate.js
```

2. Check database connectivity:
```bash
docker-compose exec postgres pg_isready -U postgres
```

### Kafka Issues

1. Check Kafka topics:
```bash
docker-compose exec kafka kafka-topics --list --bootstrap-server localhost:9092
```

2. Check consumer groups:
```bash
docker-compose exec kafka kafka-consumer-groups --list --bootstrap-server localhost:9092
```

## Project Structure

```
WebHook Delivery System/
├── backend/
│   ├── api-gateway/           # API Gateway
│   ├── services/              # Microservices
│   │   ├── auth-service/      # Authentication
│   │   ├── webhook-service/   # Webhook management
│   │   ├── event-service/     # Event handling
│   │   ├── delivery-service/  # Webhook delivery
│   │   ├── retry-service/     # Retry logic
│   │   ├── dlq-service/       # Dead Letter Queue
│   │   ├── notification-service/ # Notifications
│   │   ├── logs-service/      # Logging
│   │   └── rate-limit-service/ # Rate limiting
│   ├── shared/                # Shared utilities and libraries
│   ├── scripts/               # Database scripts
│   └── docker-compose.yml     # Docker orchestration
└── frontend/                  # Next.js frontend
    ├── src/
    │   ├── app/              # Next.js app router
    │   ├── components/       # React components
    │   ├── redux/           # Redux store and slices
    │   └── lib/             # Utilities and API client
    └── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

## Roadmap

- [ ] Add webhook testing playground
- [ ] Implement webhook replay functionality
- [ ] Add webhook templates
- [ ] Real-time event streaming with WebSocket
- [ ] Advanced analytics and reporting
- [ ] Multi-tenant support
- [ ] Webhook signature verification UI
- [ ] Integration marketplace
#   W e b h o o k - D e l i v e r y - S y s t e m 
 
 






FULL FLOW->  1. User Registration & Login
Client
  │
  ▼
POST /api/auth/register
POST /api/auth/login
  │
  ▼
API Gateway (5000)
  │
  ▼
auth-service (5001)
  │
  ▼
PostgreSQL (users table)
  │
  ▼
Returns JWT token

2. Create a Webhook
Client (with JWT token)
  │
  ▼
POST /api/webhooks/create
  │
  ▼
API Gateway
  │ verifyAuth middleware → validates JWT
  │ rateLimitMiddleware → checks Redis token bucket
  ▼
webhook-service (5002)
  │
  ▼
PostgreSQL (webhooks table)
  │
  ▼
Returns webhook { id, url, eventType, secret }

3. Fire an Event
Client (with JWT token)
  │
  ▼
POST /api/events
  │
  ▼
API Gateway
  │ verifyAuth → validates JWT
  │ rateLimitMiddleware → checks Redis (100 req limit)
  │   if limit exceeded → 429 Too Many Requests ❌
  ▼
event-service (5003)
  │
  ▼
MongoDB Atlas (event-db) → saves event with status: pending
  │
  ▼
Kafka → publishes to TOPICS.EVENTS ("events")
  │
  ▼
Returns { success: true, data: event }

4. Webhook Delivery
Kafka TOPICS.EVENTS
  │
  ▼
delivery-service consumer (delivery-group)
  │
  ▼
GET /api/webhooks?eventType=user.created
  │ → calls webhook-service
  │ → fetches all webhooks for this eventType
  ▼
For each webhook:
  │
  ├── generateSignature(payload, webhook.secret)
  │
  ▼
HTTP POST → webhook.url
  │
  ├── SUCCESS ✅
  │     │
  │     ▼
  │   DeliveryLog (status: success)
  │   publishLog → TOPICS.LOGS → logs-service → MongoDB
  │
  └── FAILURE ❌
        │
        ▼
      DeliveryLog (status: failed)
      publishLog → TOPICS.LOGS → logs-service → MongoDB
      sendMessage → TOPICS.RETRY ("retry-events")

5. Retry Flow
Kafka TOPICS.RETRY
  │
  ▼
retry-service consumer (retry-group)
  │
  ▼
processRetry({ event, webhook, attempt })
  │
  ├── attempt 1 → BullMQ delayed job (60s)
  ├── attempt 2 → BullMQ delayed job (5 min)
  ├── attempt 3 → BullMQ delayed job (15 min)
  └── attempt 4 → no delay → TOPICS.DLQ
  │
  ▼
publishLog → TOPICS.LOGS → logs-service
  │
  ▼
BullMQ Worker fires after delay
  │
  ▼
sendMessage → TOPICS.WEBHOOK_DELIVERY ("webhook-delivery")
  │
  ▼
delivery-service consumer (delivery-retry-group)
  │
  ▼
deliveryEvent(event, webhook, attempt + 1)
  │ → loops back to step 4

6. DLQ Flow
Kafka TOPICS.DLQ ("dead-letter-events")
  │
  ▼
dlq-service consumer (dlq-group)
  │
  ▼
saveToDLQ({ event, webhook, reason: "Max retries exceeded" })
  │
  ▼
MongoDB Atlas (dlq-db) → permanently stored
  │
  ▼
publishLog → TOPICS.LOGS → logs-service

Manual actions via API:
  │
  ├── GET  /api/dlq        → view all failed events
  ├── POST /api/dlq/retry/:id → re-send to TOPICS.EVENTS
  └── DELETE /api/dlq/:id  → remove from DLQ

7. Logging Flow
Any service (delivery, retry, dlq)
  │
  ▼
publishLog(service, level, message, metadata)
  │ fire and forget — never blocks main flow
  ▼
Kafka TOPICS.LOGS ("service-logs")
  │
  ▼
logs-service consumer (logs-group)
  │
  ▼
MongoDB Atlas (logs-db)

Query logs via API:
  ├── GET /api/logs              → all logs (filter by service, level, date)
  └── GET /api/logs/stats        → count by level (info/warn/error)

8. Rate Limiting Flow
Every request to /api/events or /api/webhooks
  │
  ▼
rateLimitMiddleware (api-gateway)
  │
  ▼
POST http://rate-limit-service:5009/check
  │ { identifier: userId or IP }
  ▼
TokenBucket in Redis
  │
  ├── tokens available → allowed ✅
  │     response headers:
  │     X-RateLimit-Limit: 100
  │     X-RateLimit-Remaining: 99
  │
  └── tokens exhausted → blocked ❌
        response: 429 Too Many Requests
        { error: "Too many requests", retryAfter: 10 }

Complete Architecture
                    Client
                      │
                      ▼
              ┌─── API Gateway ───┐
              │   (auth + rate    │
              │    limit check)   │
              └───────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   auth-service  webhook-service  event-service
   (PostgreSQL)  (PostgreSQL)    (MongoDB+Kafka)
                                      │
                                      ▼ TOPICS.EVENTS
                               delivery-service
                               (PostgreSQL+Kafka)
                                 │         │
                              success    failure
                                 │         │
                            logs-service  TOPICS.RETRY
                            (MongoDB)        │
                                        retry-service
                                        (Redis/BullMQ)
                                         │       │
                                      retry    exceeded
                                         │       │
                                    TOPICS.    TOPICS.DLQ
                                    DELIVERY      │
                                         │    dlq-service
                                         │    (MongoDB)
                                         │
                                    delivery-service
                                    (loops back)

Services Summary
ServicePortRoleDatabaseapi-gateway5000Route + Auth + RateLimit—auth-service5001Register/Login/JWTPostgreSQLwebhook-service5002CRUD webhooksPostgreSQLevent-service5003Create + publish eventsMongoDB Atlasdelivery-service5004Deliver webhooks via HTTPPostgreSQLretry-service5005Schedule retries with backoffRedisdlq-service5006Store permanently failed eventsMongoDB Atlaslogs-service5008Store all service logsMongoDB Atlasrate-limit-service5009Token bucket rate limitingRedis