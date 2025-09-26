# API Documentation

## Overview

This document provides comprehensive API documentation for the Chat Backend service, including all endpoints, request/response formats, and authentication requirements.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All protected endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "timestamp": "2025-09-26T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-09-26T10:30:00Z"
}
```

## Authentication Endpoints

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request:**
```json
{
  "username": "agent1",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "agent1",
      "email": "agent1@example.com",
      "name": "Agent One",
      "role": "agent",
      "avatar": null,
      "isOnline": true,
      "createdAt": "2025-09-26T10:00:00Z",
      "updatedAt": "2025-09-26T10:30:00Z"
    }
  }
}
```

### POST /auth/register

Register a new user account.

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securepassword",
  "name": "New User",
  "role": "customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "username": "newuser",
      "email": "newuser@example.com",
      "name": "New User",
      "role": "customer",
      "avatar": null,
      "isOnline": false,
      "createdAt": "2025-09-26T10:30:00Z",
      "updatedAt": "2025-09-26T10:30:00Z"
    }
  }
}
```

### POST /auth/logout

Logout the current user (invalidate token).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## User Management Endpoints

### GET /users/me

Get current user information.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "agent1",
    "email": "agent1@example.com",
    "name": "Agent One",
    "role": "agent",
    "avatar": null,
    "isOnline": true,
    "createdAt": "2025-09-26T10:00:00Z",
    "updatedAt": "2025-09-26T10:30:00Z"
  }
}
```

### GET /users

Get all users (agents and customers).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `role` (optional): Filter by user role (`customer`, `agent`, `super-agent`)
- `online` (optional): Filter by online status (`true`, `false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "agent1",
      "name": "Agent One",
      "role": "agent",
      "avatar": null,
      "isOnline": true
    }
  ]
}
```

### PUT /users/status

Update user online status.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "isOnline": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

## Chat Management Endpoints

### GET /chats

Get all chats for the current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by chat status (`active`, `closed`, `archived`)
- `limit` (optional): Limit number of results (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "customerId": "550e8400-e29b-41d4-a716-446655440001",
      "agentId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "active",
      "createdAt": "2025-09-26T10:00:00Z",
      "updatedAt": "2025-09-26T10:30:00Z",
      "customer": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Customer One",
        "avatar": null,
        "isOnline": true
      },
      "agent": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Agent One",
        "avatar": null,
        "isOnline": true
      },
      "lastMessage": {
        "id": "550e8400-e29b-41d4-a716-446655440020",
        "content": "Hello, how can I help you?",
        "timestamp": "2025-09-26T10:30:00Z",
        "senderId": "550e8400-e29b-41d4-a716-446655440000"
      },
      "isActive": true
    }
  ]
}
```

### POST /chats

Create a new chat session.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "customerId": "550e8400-e29b-41d4-a716-446655440001",
  "agentId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "agentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "createdAt": "2025-09-26T10:30:00Z",
    "updatedAt": "2025-09-26T10:30:00Z",
    "isActive": true
  }
}
```

### GET /chats/{id}

Get specific chat details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "customerId": "550e8400-e29b-41d4-a716-446655440001",
    "agentId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "active",
    "createdAt": "2025-09-26T10:00:00Z",
    "updatedAt": "2025-09-26T10:30:00Z",
    "customer": { ... },
    "agent": { ... },
    "messages": [ ... ],
    "isActive": true
  }
}
```

### GET /chats/{id}/messages

Get messages for a specific chat.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `limit` (optional): Limit number of messages (default: 50)
- `offset` (optional): Offset for pagination (default: 0)
- `before` (optional): Get messages before this timestamp

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440020",
      "chatId": "550e8400-e29b-41d4-a716-446655440010",
      "senderId": "550e8400-e29b-41d4-a716-446655440001",
      "content": "Hello, I need help with my account",
      "type": "text",
      "timestamp": "2025-09-26T10:00:00Z",
      "sender": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Customer One",
        "role": "customer",
        "avatar": null
      }
    }
  ]
}
```

### POST /chats/{id}/messages

Send a message in a chat.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "content": "Hello, how can I help you today?",
  "type": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440021",
    "chatId": "550e8400-e29b-41d4-a716-446655440010",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello, how can I help you today?",
    "type": "text",
    "timestamp": "2025-09-26T10:30:00Z"
  }
}
```

### PUT /chats/{id}/status

Update chat status.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "closed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Chat status updated successfully"
}
```

### PUT /chats/{id}/archive

Archive a chat.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Chat archived successfully"
}
```

### PUT /chats/{id}/unarchive

Unarchive a chat.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Chat unarchived successfully"
}
```

### DELETE /chats/{id}

Delete a chat and all its messages.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

## Additional Endpoints

### GET /available-agents

Get list of available agents for customers.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Agent One",
      "role": "agent",
      "isOnline": true,
      "avatar": null
    }
  ]
}
```

### GET /available-customers

Get list of customers for agents.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Customer One",
      "role": "customer",
      "isOnline": true,
      "avatar": null
    }
  ]
}
```

### GET /archived-chats

Get archived chats for the current user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "customerId": "550e8400-e29b-41d4-a716-446655440001",
      "agentId": "550e8400-e29b-41d4-a716-446655440000",
      "status": "archived",
      "createdAt": "2025-09-25T10:00:00Z",
      "updatedAt": "2025-09-26T09:00:00Z",
      "customer": { ... },
      "agent": { ... },
      "lastMessage": { ... }
    }
  ]
}
```

## WebSocket Events

### Connection

Connect to WebSocket endpoint:

```
ws://localhost:8080/api/ws?token=<jwt_token>
```

### Client → Server Events

#### send_message
```json
{
  "type": "send_message",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010",
    "content": "Hello!",
    "messageType": "text"
  }
}
```

#### join_chat
```json
{
  "type": "join_chat",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

#### leave_chat
```json
{
  "type": "leave_chat",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

#### typing_start
```json
{
  "type": "typing_start",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

#### typing_stop
```json
{
  "type": "typing_stop",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010"
  }
}
```

### Server → Client Events

#### new_message
```json
{
  "type": "new_message",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440021",
    "chatId": "550e8400-e29b-41d4-a716-446655440010",
    "senderId": "550e8400-e29b-41d4-a716-446655440000",
    "content": "Hello!",
    "timestamp": "2025-09-26T10:30:00Z",
    "type": "text",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Agent One",
      "role": "agent"
    }
  }
}
```

#### user_status_change
```json
{
  "type": "user_status_change",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "isOnline": true
  }
}
```

#### chat_status_updated
```json
{
  "type": "chat_status_updated",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010",
    "status": "closed"
  }
}
```

#### user_typing
```json
{
  "type": "user_typing",
  "data": {
    "chatId": "550e8400-e29b-41d4-a716-446655440010",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "isTyping": true
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | JWT token is invalid or expired |
| `ACCESS_DENIED` | User doesn't have permission |
| `USER_NOT_FOUND` | User not found |
| `CHAT_NOT_FOUND` | Chat not found |
| `MESSAGE_NOT_FOUND` | Message not found |
| `INVALID_INPUT` | Request validation failed |
| `INTERNAL_ERROR` | Internal server error |
| `DATABASE_ERROR` | Database operation failed |
| `WEBSOCKET_ERROR` | WebSocket connection error |

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute per IP
- **API endpoints**: 100 requests per minute per user
- **WebSocket messages**: 60 messages per minute per connection

## Data Types and Validation

### User Roles
- `customer`: Regular customer user
- `agent`: Support agent
- `super-agent`: Senior agent with extended permissions

### Chat Status
- `active`: Chat is currently active
- `closed`: Chat has been closed
- `archived`: Chat has been archived

### Message Types
- `text`: Plain text message
- `image`: Image attachment
- `file`: File attachment
- `system`: System-generated message

### Validation Rules

#### Username
- Length: 3-50 characters
- Pattern: alphanumeric and underscore only
- Must be unique

#### Email
- Must be valid email format
- Must be unique

#### Password
- Minimum length: 6 characters
- Must contain at least one letter and one number

#### Message Content
- Maximum length: 10,000 characters
- Cannot be empty for text messages