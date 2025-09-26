# CS Socket - Customer Service WebSocket Backend

A Go-based WebSocket server for real-time customer service chat functionality.

## Features

- Real-time chat with WebSocket support
- JWT-based authentication
- PostgreSQL database integration
- RESTful API endpoints
- User management and status tracking
- Chat management and message history

## Prerequisites

- Go 1.21 or higher
- PostgreSQL database
- Node.js (for frontend integration)

## Installation

1. Clone the repository and navigate to cs-socket directory:
```bash
cd c:\Job\AWS-Ubuntu\cs-socket
```

2. Install Go dependencies:
```bash
go mod tidy
```

3. Copy environment configuration:
```bash
copy .env.example .env
```

4. Update the `.env` file with your database credentials and configuration.

5. Create the PostgreSQL database:
```sql
CREATE DATABASE cs_socket;
```

6. Run the server:
```bash
go run main.go
```

The server will start on port 8080 (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/me` - Get current user info
- `GET /api/users` - Get all users (for agents/admins)
- `PUT /api/users/status` - Update user online status

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get specific chat
- `POST /api/chats/:id/messages` - Send message
- `GET /api/chats/:id/messages` - Get chat messages
- `PUT /api/chats/:id/status` - Update chat status
- `DELETE /api/chats/:id` - Delete chat

### WebSocket
- `GET /api/ws` - WebSocket connection endpoint (requires authentication)

## WebSocket Events

### Client to Server:
- Message sending and chat interactions

### Server to Client:
- `user_connected` - User comes online
- `user_disconnected` - User goes offline
- `new_message` - New message in chat

## Database Schema

The application automatically creates the following tables:
- `users` - User accounts and profiles
- `chats` - Chat sessions between customers and agents
- `messages` - Chat messages

## Integration with Frontend

This backend is designed to work with the cs-fork Next.js frontend. Make sure to:

1. Update the frontend API endpoints to point to this server
2. Configure CORS origins in the .env file
3. Ensure JWT tokens are properly handled in frontend requests

## Development

To run in development mode:
```bash
go run main.go
```

To build for production:
```bash
go build -o cs-socket main.go
```