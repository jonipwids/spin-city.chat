# Chat Backend - Go WebSocket Server 🚀

A high-performance, real-time customer service WebSocket server built with Go, featuring JWT authentication, PostgreSQL integration, and comprehensive chat management.

## 🌟 Features

- **Real-time Communication**: WebSocket-powered instant messaging with connection pooling
- **Secure Authentication**: JWT-based authentication with role-based access control
- **Database Integration**: PostgreSQL with automatic migrations and seeding
- **RESTful API**: Comprehensive REST endpoints for chat management
- **User Management**: Online status tracking and user roles (customer, agent, super-agent)
- **Chat Operations**: Create, archive, delete, and manage chat sessions
- **Message History**: Persistent message storage with timestamps
- **CORS Support**: Configurable cross-origin resource sharing
- **Health Monitoring**: Built-in health check endpoint

## 🏗️ Architecture

```
Client (Frontend) ←→ HTTP/WebSocket ←→ Gin Router ←→ Auth Middleware
                                           ↓
                                    Route Handlers
                                           ↓
                                    Service Layer
                                           ↓
                                   Database Layer ←→ PostgreSQL
                                           ↓
                                    WebSocket Hub ←→ Connected Clients
```

## 📁 Project Structure

```
chat-backend/
├── main.go                 # Application entry point
├── go.mod                 # Go module dependencies
├── go.sum                 # Dependency checksums
├── .env.example           # Environment variables template
├── reset-db.go           # Database reset utility
├── bin/                  # Compiled binaries
│   ├── cs-chat           # Linux binary
│   └── cs-chat.exe       # Windows binary
└── internal/
    ├── config/           # Configuration management
    │   └── config.go     # Config loading and validation
    ├── database/         # Database layer
    │   ├── database.go   # Connection and migrations
    │   └── seed.go       # Initial data seeding
    ├── handlers/         # HTTP request handlers
    │   ├── auth.go       # Authentication endpoints
    │   ├── chat.go       # Chat management endpoints
    │   ├── user.go       # User management endpoints
    │   └── websocket.go  # WebSocket connection handler
    ├── middleware/       # HTTP middleware
    │   └── auth.go       # JWT authentication middleware
    ├── models/          # Data models
    │   └── models.go    # Struct definitions and requests
    ├── services/        # Business logic layer
    │   ├── auth.go      # Authentication service
    │   ├── chat.go      # Chat management service
    │   └── user.go      # User management service
    └── websocket/       # WebSocket management
        └── hub.go       # Connection hub and broadcasting
```

## 🛠️ Prerequisites

- **Go 1.21+** - Modern Go version with generics support
- **PostgreSQL 12+** - Primary database
- **Git** - Version control

## ⚡ Quick Start

### 1. Environment Setup

```bash
# Clone and navigate
git clone <repository>
cd chat-backend

# Install dependencies
go mod tidy

# Setup environment
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file:

```env
# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/cs_socket?sslmode=disable

# Server Configuration
PORT=8080
SERVER_MODE=development  # or "production"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# CORS Configuration
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 3. Database Setup

```sql
-- Create database
CREATE DATABASE cs_socket;

-- Create user (optional)
CREATE USER cs_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE cs_socket TO cs_user;
```

### 4. Run the Server

```bash
# Development mode
go run main.go

# Or build and run
go build -o cs-chat main.go
./cs-chat
```

The server will start on `http://localhost:8080`

## 📡 API Reference

### 🔐 Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "agent1",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-uuid",
    "username": "agent1",
    "name": "Agent One",
    "role": "agent",
    "isOnline": true
  }
}
```

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "name": "New User",
  "role": "customer"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### 👥 User Management Endpoints

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Get All Users
```http
GET /api/users
Authorization: Bearer <token>
```

#### Update Online Status
```http
PUT /api/users/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "isOnline": true
}
```

### 💬 Chat Management Endpoints

#### Get User's Chats
```http
GET /api/chats
Authorization: Bearer <token>
```

#### Create New Chat
```http
POST /api/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "agentId": "agent-uuid"  // optional
}
```

#### Get Specific Chat
```http
GET /api/chats/{chat-id}
Authorization: Bearer <token>
```

#### Send Message
```http
POST /api/chats/{chat-id}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hello, how can I help you?",
  "type": "text"
}
```

#### Get Chat Messages
```http
GET /api/chats/{chat-id}/messages
Authorization: Bearer <token>
```

#### Update Chat Status
```http
PUT /api/chats/{chat-id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "active"  // or "closed", "archived"
}
```

#### Archive/Unarchive Chat
```http
PUT /api/chats/{chat-id}/archive
PUT /api/chats/{chat-id}/unarchive
Authorization: Bearer <token>
```

#### Delete Chat
```http
DELETE /api/chats/{chat-id}
Authorization: Bearer <token>
```

### 🔌 WebSocket Connection

#### Connect to WebSocket
```http
GET /api/ws
Authorization: Bearer <token>
Upgrade: websocket
Connection: Upgrade
```

## 📡 WebSocket Events

### Client → Server Events

#### Send Message
```json
{
  "type": "send_message",
  "data": {
    "chatId": "chat-uuid",
    "content": "Hello!",
    "messageType": "text"
  }
}
```

#### Join Chat Room
```json
{
  "type": "join_chat",
  "data": {
    "chatId": "chat-uuid"
  }
}
```

### Server → Client Events

#### New Message
```json
{
  "type": "new_message",
  "data": {
    "id": "message-uuid",
    "chatId": "chat-uuid",
    "senderId": "user-uuid",
    "content": "Hello!",
    "timestamp": "2025-09-26T10:30:00Z",
    "sender": {
      "id": "user-uuid",
      "name": "Agent One",
      "role": "agent"
    }
  }
}
```

#### User Status Change
```json
{
  "type": "user_status_change",
  "data": {
    "userId": "user-uuid",
    "isOnline": true
  }
}
```

#### Chat Status Updated
```json
{
  "type": "chat_status_updated",
  "data": {
    "chatId": "chat-uuid",
    "status": "active"
  }
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    avatar TEXT,
    is_online BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Chats Table
```sql
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES users(id),
    agent_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | string | - | PostgreSQL connection string |
| `PORT` | string | `8080` | Server port |
| `SERVER_MODE` | string | `development` | Server mode (development/production) |
| `JWT_SECRET` | string | - | JWT signing secret |
| `CORS_ENABLED` | bool | `true` | Enable CORS |
| `CORS_ALLOWED_ORIGINS` | string | - | Comma-separated allowed origins |

### Default Users

The application seeds the database with test users:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `agent1` | `password123` | `agent` | Support Agent |
| `agent2` | `password123` | `super-agent` | Senior Agent |
| `customer1` | `password123` | `customer` | Test Customer |
| `customer2` | `password123` | `customer` | Test Customer |

## 🔍 Development

### Running Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with race detection
go test -race ./...
```

### Building

```bash
# Build for current platform
go build -o cs-chat main.go

# Build for Linux
GOOS=linux GOARCH=amd64 go build -o bin/cs-chat main.go

# Build for Windows
GOOS=windows GOARCH=amd64 go build -o bin/cs-chat.exe main.go
```

### Database Reset

```bash
# Reset database (drops all data)
go run reset-db.go
```

## 🚀 Deployment

### Production Build

```bash
# Build optimized binary
go build -ldflags="-s -w" -o cs-chat main.go

# Set production environment
export SERVER_MODE=production
export JWT_SECRET=your-production-secret
export DATABASE_URL=your-production-db-url

# Run
./cs-chat
```

### Docker Deployment

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -ldflags="-s -w" -o cs-chat main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/cs-chat .
CMD ["./cs-chat"]
```

## 🔍 Monitoring

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

### Logging

The application logs structured JSON output:

```json
{
  "level": "info",
  "time": "2025-09-26T10:30:00Z",
  "message": "CS Socket Server starting on port 8080",
  "environment": "development"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Ensure database exists

2. **JWT Token Invalid**
   - Check JWT_SECRET is set
   - Verify token format in Authorization header

3. **WebSocket Connection Failed**
   - Ensure proper authentication
   - Check CORS configuration

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:8080 | xargs kill`

## 📈 Performance

- **Concurrent Connections**: Supports thousands of WebSocket connections
- **Database Pooling**: Automatic connection pooling with pgx
- **Memory Usage**: ~10MB base memory footprint
- **Response Time**: Sub-millisecond API response times

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- Follow Go conventions and `gofmt`
- Add comments for exported functions
- Write tests for new features
- Update documentation

## 📄 License

This project is part of the Spin City platform ecosystem.

---

*Built with Go 🐹 for high-performance real-time communication*