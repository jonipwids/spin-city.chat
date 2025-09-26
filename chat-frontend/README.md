# Chat Frontend - Next.js Real-time Chat Interface 💬

A modern, responsive real-time customer service chat application built with Next.js 15, TypeScript, and Tailwind CSS. Features real-time WebSocket communication, JWT authentication, and a beautiful dark/light theme interface.

## 🌟 Features

- **🔐 JWT Authentication** - Secure login system with role-based access control
- **💬 Real-time Chat** - WebSocket-powered instant messaging with typing indicators
- **👥 Multi-role Support** - Customer, Agent, and Super-agent roles with different permissions
- **🌙 Dark/Light Mode** - Toggle between themes with system preference detection
- **📱 Responsive Design** - Mobile-first approach with adaptive layouts
- **⚡ Live Status** - Real-time online/offline user indicators
- **🎯 Chat Management** - Easy chat selection, creation, and history browsing
- **🔔 Notifications** - In-app notifications for new messages and status changes
- **📊 Dashboard** - Comprehensive dashboard with user management
- **🎨 Modern UI** - Clean, intuitive interface with smooth animations
- **🚀 High Performance** - Optimized with Next.js 15 and Turbopack

## 💻 Tech Stack

- **Framework**: Next.js 15 with App Router and React 19
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Context API with custom hooks
- **Real-time**: WebSocket connections with automatic reconnection
- **Build Tool**: Turbopack for fast development builds
- **Authentication**: JWT token-based authentication
- **HTTP Client**: Fetch API with custom wrapper

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   React Client  │ ◄──────────────► │   Go Backend    │
│                 │                  │                 │
│  ┌───────────┐  │    REST API      │  ┌───────────┐  │
│  │Components │  │ ◄──────────────► │  │ Handlers  │  │
│  └───────────┘  │                  │  └───────────┘  │
│  ┌───────────┐  │                  │  ┌───────────┐  │
│  │ Contexts  │  │                  │  │ Services  │  │
│  └───────────┘  │                  │  └───────────┘  │
│  ┌───────────┐  │                  │  ┌───────────┐  │
│  │ Services  │  │                  │  │ Database  │  │
│  └───────────┘  │                  │  └───────────┘  │
└─────────────────┘                  └─────────────────┘
```

## 📁 Project Structure

```
chat-frontend/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── favicon.ico         # App icon
│   │   ├── globals.css         # Global styles & CSS variables
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Home page with auth routing
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx   # Main chat messaging interface
│   │   ├── ChatList.tsx        # Sidebar chat list with search
│   │   ├── ChatTab.tsx         # Individual chat tab component
│   │   ├── Dashboard.tsx       # Main dashboard layout
│   │   ├── FinancialTab.tsx    # Financial information display
│   │   ├── GamesTab.tsx        # Games history and stats
│   │   ├── HelpForm.tsx        # Customer support form
│   │   ├── LoginForm.tsx       # Authentication form
│   │   └── Settings.tsx        # User settings and preferences
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state management
│   │   ├── ChatContext.tsx     # Chat state and WebSocket management
│   │   └── SettingsContext.tsx # User preferences and theme
│   ├── lib/                    # Utilities and services
│   │   ├── backend-api.ts      # API client with error handling
│   │   ├── mockData.ts         # Mock data for development
│   │   └── websocket.ts        # WebSocket connection management
│   └── types/                  # TypeScript definitions
│       └── index.ts            # Type definitions for all models
├── public/                     # Static assets
│   ├── file.svg               # File type icons
│   ├── globe.svg              # Globe icon
│   ├── next.svg               # Next.js logo
│   ├── vercel.svg             # Vercel logo
│   └── window.svg             # Window icon
├── docs/                       # Documentation
│   ├── INTEGRATION_GUIDE.md   # Backend integration guide
│   ├── start-integration.bat  # Windows startup script
│   └── start-integration.sh   # Unix startup script
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── eslint.config.mjs          # ESLint configuration
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies and scripts
├── postcss.config.mjs         # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - Latest LTS version
- **npm/yarn/pnpm** - Package manager
- **Backend Server** - Chat backend running on port 8080

### 1. Installation

```bash
# Clone repository
git clone <repository-url>
cd chat-frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: Enable debug mode
NEXT_PUBLIC_DEBUG=true
```

### 3. Development Server

```bash
# Start development server with Turbopack
npm run dev

# Or with other package managers
yarn dev
pnpm dev
```

### 4. Access Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication & Users

### Default Test Accounts

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `agent1` | `password123` | `agent` | Support Agent with chat management |
| `agent2` | `password123` | `super-agent` | Senior Agent with advanced permissions |
| `customer1` | `password123` | `customer` | Customer with chat initiation |
| `customer2` | `password123` | `customer` | Customer with chat initiation |

### Role Permissions

#### Customer Role
- Create new chat sessions
- Send messages in assigned chats
- View own chat history
- Update profile settings

#### Agent Role
- Accept and manage customer chats
- View customer information
- Send messages in assigned chats
- Archive completed chats

#### Super-Agent Role
- All Agent permissions
- View all chats and messages
- Reassign chats between agents
- Access admin dashboard features
- Manage user statuses

## 💬 Chat Features

### Real-time Messaging
- Instant message delivery via WebSocket
- Typing indicators
- Message status (sent, delivered, read)
- Automatic reconnection on network issues

### Chat Management
- Create new chat sessions
- Archive/unarchive chats
- Delete chat history
- Search chat history
- Filter chats by status

### Message Types
- Text messages with emoji support
- File attachments (images, documents)
- System messages (user joined, left, etc.)
- Timestamps with relative time display

## 🎨 UI/UX Features

### Theme System
```typescript
// Light/Dark mode toggle
const { isDarkMode, toggleTheme } = useSettings();

// System preference detection
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  setIsDarkMode(mediaQuery.matches);
}, []);
```

### Responsive Design
- Mobile-first approach
- Adaptive sidebar on mobile
- Touch-friendly interface
- Optimized for various screen sizes

### Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

## 🔧 Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | string | `http://localhost:8080` | Backend API base URL |
| `NEXT_PUBLIC_DEBUG` | boolean | `false` | Enable debug logging |
| `NEXT_PUBLIC_WS_URL` | string | auto-generated | WebSocket URL (auto-derived from API_URL) |

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        // ... more colors
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

## 📚 Component Documentation

### Core Components

#### Dashboard
Main application layout with sidebar and content area.

```typescript
interface DashboardProps {
  user: User;
  onLogout: () => void;
}
```

#### ChatInterface
Real-time chat messaging interface.

```typescript
interface ChatInterfaceProps {
  chat: Chat;
  onSendMessage: (content: string) => void;
  onTyping: () => void;
}
```

#### ChatList
Sidebar component showing all user chats.

```typescript
interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chat: Chat) => void;
  onCreateChat: () => void;
}
```

### Context Providers

#### AuthContext
Manages user authentication state.

```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
```

#### ChatContext
Manages chat state and WebSocket connections.

```typescript
interface ChatContextType {
  chats: Chat[];
  selectedChat: Chat | null;
  messages: Message[];
  sendMessage: (content: string) => void;
  setSelectedChat: (chat: Chat) => void;
  isConnected: boolean;
}
```

## 🔌 API Integration

### REST API Client

```typescript
// lib/backend-api.ts
class BackendAPI {
  private baseURL: string;
  private token: string | null = null;

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  }

  async getChats(): Promise<Chat[]> {
    const response = await fetch(`${this.baseURL}/api/chats`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}
```

### WebSocket Integration

```typescript
// lib/websocket.ts
class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    const wsUrl = `ws://localhost:8080/api/ws?token=${token}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    };

    this.ws.onclose = () => {
      this.attemptReconnect(token);
    };
  }
}
```

## 🧪 Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build with Turbopack  
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Code Quality

#### ESLint Configuration
```javascript
// eslint.config.mjs
export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    extends: ['next/core-web-vitals', 'next/typescript'],
    rules: {
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    }
  }
];
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 🚀 Deployment

### Production Build

```bash
# Build for production
npm run build

# Test production build locally
npm start
```

### Environment Variables for Production

```env
# Production API URL
NEXT_PUBLIC_API_URL=https://your-api-domain.com

# Disable debug mode
NEXT_PUBLIC_DEBUG=false
```

### Docker Deployment

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Vercel Deployment

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend-api.com"
  }
}
```

## 🔍 Performance

### Optimization Features

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: Aggressive caching for static assets
- **Prefetching**: Automatic page prefetching

### Performance Metrics

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🐛 Troubleshooting

### Common Issues

#### WebSocket Connection Failed
```typescript
// Check WebSocket URL and authentication
const wsUrl = process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') + '/api/ws';
console.log('Connecting to:', wsUrl);
```

#### Authentication Token Issues
```typescript
// Verify token storage and format
const token = localStorage.getItem('auth_token');
console.log('Token:', token?.substring(0, 20) + '...');
```

#### CORS Errors
- Ensure backend CORS is configured for frontend URL
- Check that API_URL environment variable is correct
- Verify protocol (http vs https) matches

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Testing

### Unit Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

```javascript
// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)
```

### Integration Testing

```bash
# Install Cypress
npm install --save-dev cypress

# Run Cypress tests
npm run cypress:open
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes with proper TypeScript types
4. Add tests for new functionality
5. Run linting and type checking
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

### Code Standards

- Use TypeScript for all new code
- Follow React best practices and hooks patterns
- Implement proper error boundaries
- Add proper ARIA labels for accessibility
- Write meaningful commit messages
- Document complex components and functions

## 📄 License

This project is part of the Spin City platform ecosystem.

## 🆘 Support

### Getting Help

- Review this documentation and the backend integration guide
- Check the browser console for error messages
- Verify WebSocket connection status
- Ensure backend server is running and accessible

### Debugging Tips

```typescript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Check WebSocket connection
console.log('WebSocket state:', websocket.readyState);

// Monitor API calls
console.log('API Response:', response);
```

---

*Built with ❤️ using Next.js 15, React 19, and TypeScript*