# CS-Fork Frontend & CS-Socket Backend Integration

This document describes the complete integration between the cs-fork Next.js frontend and cs-socket Go backend for a real-time customer service chat system.

## Architecture Overview

### Backend (cs-socket)
- **Technology**: Go with Gin framework
- **Database**: PostgreSQL
- **Real-time**: WebSocket connections
- **Authentication**: JWT tokens
- **Port**: 8080

### Frontend (cs-fork)
- **Technology**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time**: WebSocket client
- **Port**: 3000

## Key Features

### Authentication System
- JWT-based authentication
- Role-based access (customer, agent, super-agent)
- Persistent login with token refresh
- Automatic WebSocket connection on login

### Real-time Chat
- WebSocket connections for instant messaging
- User online/offline status tracking
- Message history with pagination
- Multi-user chat support

### User Management
- User profiles with avatars
- Role-based permissions
- Online status indicators
- Agent assignment to customers

## Project Structure

```
c:\Job\
├── AWS-Ubuntu\cs-socket\          # Go Backend
│   ├── main.go                    # Main server entry point
│   ├── go.mod & go.sum           # Go dependencies
│   ├── .env.example              # Environment configuration template
│   ├── internal\
│   │   ├── config\               # Configuration management
│   │   ├── database\             # Database connection & migrations
│   │   ├── handlers\             # HTTP route handlers
│   │   ├── middleware\           # Authentication middleware
│   │   ├── models\               # Data models
│   │   ├── services\             # Business logic
│   │   └── websocket\            # WebSocket hub management
│   └── README.md
│
├── cs-fork\                       # Next.js Frontend
│   ├── src\
│   │   ├── app\                  # Next.js app router
│   │   ├── components\           # React components
│   │   ├── contexts\             # React contexts (Auth, Chat, Settings)
│   │   ├── lib\                  # API client & utilities
│   │   └── types\                # TypeScript type definitions
│   ├── .env.local                # Environment variables
│   └── package.json
│
├── start-integration.bat          # Windows startup script
└── start-integration.sh           # Unix startup script
```

## Setup Instructions

### Prerequisites
1. **Go 1.21+** installed
2. **Node.js 18+** installed
3. **PostgreSQL** database running
4. **Git** for version control

### Database Setup
1. Create a PostgreSQL database:
   ```sql
   CREATE DATABASE cs_socket;
   ```

2. Update database configuration in `cs-socket\.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_postgres_user
   DB_PASSWORD=your_postgres_password
   DB_NAME=cs_socket
   ```

### Backend Setup
1. Navigate to backend directory:
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

4. Run the backend:
   ```bash
   go run main.go
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd c:\Job\cs-fork
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Quick Start (Both Services)
Use the provided startup scripts:

**Windows:**
```cmd
start-integration.bat
```

**Unix/Linux/MacOS:**
```bash
./start-integration.sh
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/me` - Get current user
- `GET /api/users` - List users (agents/admins)
- `PUT /api/users/status` - Update online status

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get specific chat
- `POST /api/chats/:id/messages` - Send message
- `GET /api/chats/:id/messages` - Get messages
- `PUT /api/chats/:id/status` - Update chat status

### WebSocket
- `GET /api/ws` - WebSocket connection (authenticated)

## WebSocket Events

### Client → Server
- Chat message sending
- User status updates

### Server → Client
- `user_connected` - User comes online
- `user_disconnected` - User goes offline  
- `new_message` - New chat message received

## Default Test Users

The system includes seeded test users:

| Username | Password | Role | Name |
|----------|----------|------|------|
| agent1 | password123 | agent | Agent John |
| agent2 | password123 | super-agent | Agent Sarah |
| customer1 | password123 | customer | Customer Mike |
| customer2 | password123 | customer | Customer Lisa |

## Development Workflow

1. **Backend Development**:
   - Modify Go code in `cs-socket/`
   - Server auto-restarts on changes (with tools like `air`)
   - Check logs for debugging

2. **Frontend Development**:
   - Modify React/Next.js code in `cs-fork/src/`
   - Hot-reload enabled by default
   - Use browser dev tools for debugging

3. **Database Changes**:
   - Add migrations to `database/database.go`
   - Update models in `models/models.go`
   - Restart backend to apply changes

## Troubleshooting

### Common Issues

1. **Connection Refused Error**:
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **WebSocket Connection Failed**:
   - Check backend is running on port 8080
   - Verify JWT token is valid
   - Check CORS configuration

3. **Frontend API Errors**:
   - Verify `NEXT_PUBLIC_API_URL` in `.env.local`
   - Check backend API endpoints are accessible
   - Ensure proper authentication headers

### Debug Mode

Enable debug logging by setting:
```env
GIN_MODE=debug
```

## Production Deployment

### Backend
1. Build the Go binary:
   ```bash
   go build -o cs-socket main.go
   ```

2. Set production environment variables
3. Run with process manager (PM2, systemd)

### Frontend
1. Build the Next.js app:
   ```bash
   npm run build
   npm start
   ```

2. Configure reverse proxy (Nginx)
3. Set production API URL

## Contributing

1. Follow Go and TypeScript best practices
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages

## License

This project is part of the customer service platform integration.