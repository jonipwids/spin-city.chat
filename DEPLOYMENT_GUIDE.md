# Deployment Guide

This guide covers deployment strategies for both the chat backend (Go) and frontend (Next.js) applications.

## Prerequisites

- **Production Server**: Linux/Windows server with Docker support
- **Database**: PostgreSQL 12+ instance
- **Domain**: Configured domain with SSL certificate
- **Load Balancer**: Nginx or similar (recommended)

## Backend Deployment

### Option 1: Binary Deployment

#### 1. Build the Application

```bash
# On development machine
cd chat-backend

# Build for Linux
GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o cs-chat main.go

# Build for Windows
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o cs-chat.exe main.go
```

#### 2. Server Setup

```bash
# Create application directory
sudo mkdir -p /opt/chat-backend
sudo chown $USER:$USER /opt/chat-backend

# Upload binary
scp cs-chat user@server:/opt/chat-backend/

# Make executable
chmod +x /opt/chat-backend/cs-chat
```

#### 3. Environment Configuration

```bash
# Create production environment file
cat > /opt/chat-backend/.env << EOF
DATABASE_URL=postgres://username:password@localhost:5432/cs_socket_prod?sslmode=require
PORT=8080
SERVER_MODE=production
JWT_SECRET=your-super-secure-production-jwt-secret-here
CORS_ENABLED=true
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
EOF
```

#### 4. Systemd Service

```bash
# Create systemd service file
sudo cat > /etc/systemd/system/chat-backend.service << EOF
[Unit]
Description=Chat Backend Service
After=network.target postgresql.service

[Service]
Type=simple
User=chatapp
WorkingDirectory=/opt/chat-backend
ExecStart=/opt/chat-backend/cs-chat
Restart=always
RestartSec=5
Environment=PATH=/usr/bin:/usr/local/bin
EnvironmentFile=/opt/chat-backend/.env

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/chat-backend

[Install]
WantedBy=multi-user.target
EOF

# Create user
sudo useradd -r -s /bin/false chatapp
sudo chown -R chatapp:chatapp /opt/chat-backend

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable chat-backend
sudo systemctl start chat-backend
sudo systemctl status chat-backend
```

### Option 2: Docker Deployment

#### 1. Create Dockerfile

```dockerfile
# Multi-stage build
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -ldflags="-s -w" -o cs-chat main.go

# Production image
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/

COPY --from=builder /app/cs-chat .

# Create non-root user
RUN adduser -D -s /bin/sh chatapp
USER chatapp

EXPOSE 8080

CMD ["./cs-chat"]
```

#### 2. Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cs_socket_prod
      POSTGRES_USER: chatapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  chat-backend:
    build: .
    environment:
      DATABASE_URL: postgres://chatapp:${DB_PASSWORD}@postgres:5432/cs_socket_prod?sslmode=disable
      PORT: 8080
      SERVER_MODE: production
      JWT_SECRET: ${JWT_SECRET}
      CORS_ENABLED: "true"
      CORS_ALLOWED_ORIGINS: https://your-frontend-domain.com
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - chat-backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 3. Environment File

```bash
# .env file for Docker Compose
DB_PASSWORD=your-secure-database-password
JWT_SECRET=your-super-secure-production-jwt-secret-here
```

#### 4. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f chat-backend

# Scale backend if needed
docker-compose up -d --scale chat-backend=3
```

## Frontend Deployment

### Option 1: Static Export (Recommended)

#### 1. Configure for Static Export

```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
}

module.exports = nextConfig
```

#### 2. Build and Export

```bash
cd chat-frontend

# Install production dependencies
npm ci --only=production

# Build and export
npm run build

# Files will be in 'out' directory
ls -la out/
```

#### 3. Deploy to Web Server

```bash
# Upload to server
rsync -avz --delete out/ user@server:/var/www/chat-frontend/

# Nginx configuration
sudo cat > /etc/nginx/sites-available/chat-frontend << EOF
server {
    listen 80;
    server_name your-frontend-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-frontend-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    root /var/www/chat-frontend;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' wss: https:;" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Handle client-side routing
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy (optional - if not using separate backend domain)
    location /api/ {
        proxy_pass http://localhost:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # WebSocket proxy
    location /api/ws {
        proxy_pass http://localhost:8080/api/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/chat-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: Vercel Deployment

#### 1. Vercel Configuration

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend-api.com"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "https://your-backend-api.com"
    }
  }
}
```

#### 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd chat-frontend
vercel --prod
```

### Option 3: Docker Deployment

```dockerfile
# Dockerfile for frontend
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

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

## Database Migration

### Production Database Setup

```sql
-- Create production database
CREATE DATABASE cs_socket_prod;

-- Create dedicated user
CREATE USER chatapp WITH PASSWORD 'secure_production_password';
GRANT ALL PRIVILEGES ON DATABASE cs_socket_prod TO chatapp;

-- Configure security
ALTER DATABASE cs_socket_prod SET log_statement = 'all';
ALTER USER chatapp SET statement_timeout = '30s';
```

### Backup Strategy

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/chat-db"
DB_NAME="cs_socket_prod"

mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U chatapp -d $DB_NAME > "$BACKUP_DIR/backup_$DATE.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

### Setup Cron Job

```bash
# Add to crontab
crontab -e

# Backup database daily at 2 AM
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

## Load Balancing & High Availability

### Nginx Load Balancer

```nginx
upstream chat_backend {
    least_conn;
    server 127.0.0.1:8080 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8081 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:8082 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name api.your-domain.com;
    
    location /api/ {
        proxy_pass http://chat_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ws {
        proxy_pass http://chat_backend/api/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

## Monitoring & Logging

### Application Monitoring

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Monitor application
sudo systemctl status chat-backend
sudo journalctl -u chat-backend -f

# Monitor resources
htop
iotop
nethogs
```

### Log Management

```bash
# Configure logrotate
sudo cat > /etc/logrotate.d/chat-backend << EOF
/var/log/chat-backend/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 chatapp chatapp
    postrotate
        systemctl reload chat-backend
    endscript
}
EOF
```

### Health Checks

```bash
#!/bin/bash
# health-check.sh

# Backend health check
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "Backend: OK"
else
    echo "Backend: FAILED"
    # Restart service if needed
    sudo systemctl restart chat-backend
fi

# Database health check
if pg_isready -h localhost -p 5432 -U chatapp > /dev/null 2>&1; then
    echo "Database: OK"
else
    echo "Database: FAILED"
fi

# Disk space check
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage: WARNING - $DISK_USAGE%"
fi
```

## Security Considerations

### SSL/TLS Configuration

```bash
# Generate SSL certificate using Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d api.your-domain.com
```

### Firewall Configuration

```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from trusted-ip to any port 5432  # Database access
sudo ufw enable
```

### Security Headers

```nginx
# Add to Nginx configuration
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Performance Optimization

### Database Optimization

```sql
-- Optimize PostgreSQL settings
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;

-- Reload configuration
SELECT pg_reload_conf();

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_chats_user_status ON chats(customer_id, agent_id, status);
CREATE INDEX CONCURRENTLY idx_users_role_online ON users(role, is_online);
```

### Backend Optimization

```go
// Add to main.go for production optimizations
func init() {
    // Set GOMAXPROCS to match container limits
    if maxProcs := os.Getenv("GOMAXPROCS"); maxProcs != "" {
        if n, err := strconv.Atoi(maxProcs); err == nil {
            runtime.GOMAXPROCS(n)
        }
    }
    
    // Enable GC optimizations
    debug.SetGCPercent(20) // Lower GC pressure
}
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
```bash
# Check database status
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"

# Check connections
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

#### 2. WebSocket Connection Issues
```bash
# Test WebSocket endpoint
wscat -c "ws://localhost:8080/api/ws?token=YOUR_JWT_TOKEN"

# Check Nginx WebSocket proxy
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost/api/ws
```

#### 3. SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in /path/to/certificate.crt -text -noout

# Test SSL configuration
curl -I https://your-domain.com
```

#### 4. High Memory Usage
```bash
# Monitor memory usage
free -h
ps aux --sort=-%mem | head

# Check for memory leaks
valgrind --tool=memcheck --leak-check=full ./cs-chat
```

## Maintenance

### Regular Maintenance Tasks

```bash
#!/bin/bash
# maintenance.sh - Run weekly

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean old logs
sudo journalctl --vacuum-time=30d

# Analyze database
sudo -u postgres psql -d cs_socket_prod -c "ANALYZE;"

# Restart services if needed
sudo systemctl restart chat-backend
sudo systemctl restart nginx

echo "Maintenance completed: $(date)"
```

### Scheduled Maintenance

```bash
# Add to crontab
0 3 * * 0 /opt/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
```

This deployment guide provides comprehensive instructions for deploying the chat system in production environments with proper security, monitoring, and maintenance considerations.