# CS-Fork - Customer Service Chat Frontend

A real-time customer service chat application built with Next.js 15, TypeScript, and Tailwind CSS. This frontend integrates with the cs-socket Go backend to provide a seamless chat experience for customers and support agents.

## Features

- 🔐 **JWT Authentication** - Secure login system with role-based access
- 💬 **Real-time Chat** - WebSocket-powered instant messaging
- 👥 **Multi-role Support** - Customer, Agent, and Super-agent roles
- 🌙 **Dark/Light Mode** - Toggle between themes
- 📱 **Responsive Design** - Mobile-first approach with responsive layout
- ⚡ **Live Status** - Real-time online/offline user indicators
- 🎯 **Chat Management** - Easy chat selection and message history

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Context API
- **Real-time**: WebSocket connections
- **Build Tool**: Turbopack

## Getting Started

### Prerequisites

- Node.js 18+ installed
- cs-socket backend running (see [Integration Guide](docs/INTEGRATION_GUIDE.md))
- PostgreSQL database configured

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cs-fork
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local` with your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

4. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Default Test Users

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| agent1 | password123 | agent | Support Agent |
| agent2 | password123 | super-agent | Senior Agent |
| customer1 | password123 | customer | Customer User |
| customer2 | password123 | customer | Customer User |

## Project Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChatInterface.tsx  # Chat messaging UI
│   ├── ChatList.tsx       # Chat sidebar
│   ├── Dashboard.tsx      # Main dashboard
│   ├── LoginForm.tsx      # Authentication form
│   └── Settings.tsx       # User settings
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── ChatContext.tsx    # Chat state management
│   └── SettingsContext.tsx # User preferences
├── lib/                   # Utilities
│   ├── backend-api.ts     # API client
│   ├── mockData.ts        # Mock data for development
│   └── websocket.ts       # WebSocket connection
└── types/
    └── index.ts           # TypeScript definitions
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Integration

This frontend is designed to work with the cs-socket Go backend. For complete setup instructions including backend configuration, see the [Integration Guide](docs/INTEGRATION_GUIDE.md).

### Quick Start (Full Stack)

Use the provided scripts to start both frontend and backend:

**Windows:**

```cmd
docs\start-integration.bat
```

**Unix/Linux/MacOS:**

```bash
./docs/start-integration.sh
```

## API Integration

The frontend communicates with the backend through:

- **REST API** - Authentication, user management, chat operations
- **WebSocket** - Real-time messaging and status updates
- **JWT Tokens** - Secure authentication headers

## Development

### Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API base URL (default: `http://localhost:8080`)

### Styling

This project uses Tailwind CSS v4 with custom design tokens for consistent theming across light and dark modes.

### State Management

- **AuthContext** - User authentication and session management
- **ChatContext** - Chat selection and message state
- **SettingsContext** - User preferences and theme settings

## Contributing

1. Follow TypeScript and React best practices
2. Use ESLint configuration for code consistency
3. Test components thoroughly
4. Update documentation for new features

## License

This project is part of the customer service platform integration.
