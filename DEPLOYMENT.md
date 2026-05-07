# brAIn IDE - Deployment & Setup Guide

## Overview

brAIn is a comprehensive AI IDE system with 4 specialized sectors:
- **Commercial**: AI Stick for retail and hospitality
- **Business**: Business Hub for automation and analytics
- **Healthcare**: brAIn MED for clinics and pharmacies
- **Industry 4.0**: Edge Box for machine monitoring

## System Architecture

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Database**: MySQL
- **Real-time**: Socket.io for WebSockets
- **Authentication**: JWT-based auth with single admin
- **File Storage**: Multer for uploads
- **VPN**: WireGuard-compatible endpoints

### Frontend Stack
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Real-time Client**: Socket.io client

## Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- Git
- For VPN: WireGuard client (optional)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd brain
npm install
```

### 2. Database Setup

```bash
# Create MySQL database
mysql -u root -p
CREATE DATABASE brain_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Import schema
mysql -u root -p brain_db < backend/database/schema.sql
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

Key configurations:
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET` (generate: `openssl rand -base64 32`)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `CLIENT_ORIGIN` (for CORS)

### 4. Start Development Server

```bash
# Terminal 1: Frontend development server
npm run dev:client

# Terminal 2: Backend development server
npm run dev:server

# Or run both together
npm run dev
```

Access:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Production Deployment

### 1. Build Frontend

```bash
npm run build
```

This creates optimized production build in `dist/` directory.

### 2. Environment Setup for Production

```bash
# Production .env configuration
NODE_ENV=production
PORT=5000
MYSQL_HOST=production-db-host
MYSQL_USER=prod_user
MYSQL_PASSWORD=<strong_password>
JWT_SECRET=<secure_random_key_32_chars_min>
ADMIN_EMAIL=admin@yourcompany.com
CLIENT_ORIGIN=https://yourdomain.com
```

### 3. Database Migration

```bash
# Backup existing database
mysqldump -u user -p brain_db > backup.sql

# Apply schema updates
mysql -u user -p brain_db < backend/database/schema.sql
```

### 4. Start Production Server

```bash
# Using Node directly
npm start

# Or using PM2 (recommended)
npm install -g pm2
pm2 start backend/server.js --name "brain-api"
pm2 save
pm2 startup
```

### 5. Reverse Proxy Setup (Nginx)

```nginx
upstream brain_api {
  server localhost:5000;
}

server {
  listen 80;
  server_name yourdomain.com;

  # Redirect HTTP to HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;

  client_max_body_size 15M;

  # Static files
  location / {
    alias /path/to/brain/dist/;
    try_files $uri $uri/ /index.html;
  }

  # API endpoints
  location /api {
    proxy_pass http://brain_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # WebSocket
  location /socket.io {
    proxy_pass http://brain_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

## Features Implementation Guide

### 1. Admin-Only Authentication

The system enforces strict single-admin access:

```javascript
// Only one admin account allowed
const ADMIN_CREDENTIAL = {
  email: "admin@brain-ai.com",
  password: "Admin123!",  // Change in production
};

// Admin registration blocked
// Client registration only
```

**Demo Credentials:**
- Admin: `admin@brain-ai.com` / `Admin123!`
- Client 1: `nova@brain-ai.com` / `Client123!`
- Client 2: `helios@brain-ai.com` / `Client123!`

### 2. Multi-Language Support with Auto-Detection

```typescript
// Auto-translate based on country selection
const response = await fetch('/api/localization/language/DE');
// Returns: { languageCode: 'de', languageName: 'Deutsch' }

// Supported countries: 50+ with automatic language mapping
```

### 3. VPN Functionality

Endpoints available:
- EU Central (Germany)
- US East
- Asia Pacific (Singapore)
- UK

```typescript
// Initiate VPN connection
const vpn = await initiateVpnConnection(userId, 'vpn-eu-1', 'wireguard');

// Terminate VPN
await terminateVpnConnection(sessionId);
```

### 4. Real-Time Updates via WebSockets

```typescript
// Initialize real-time connection
const socket = initializeRealtime(userId);

// Subscribe to events
socket.on('payment:new', (payment) => {
  console.log('Payment received:', payment);
});

socket.on('cards:assigned', (cards) => {
  console.log('Cards assigned:', cards);
});
```

### 5. Smart Card Management

- **Total Pool**: 2,500+ cards per plan
- **Statuses**: available, assigned, activated
- **Assignment**: By sector and plan
- **Tracking**: Real-time inventory management

### 6. Payment Processing

Supported:
- Visa
- Mastercard
- American Express

Mock gateway included for testing.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login (admin/client)
- `POST /api/auth/register` - Client registration only
- `GET /api/auth/demo` - Get demo credentials
- `GET /api/auth/status` - Check auth status

### Localization
- `GET /api/localization/countries` - Get all countries by region
- `GET /api/localization/language/:countryCode` - Get language for country
- `POST /api/localization/validate` - Validate localization config

### VPN
- `GET /api/vpn/endpoints` - List available endpoints
- `POST /api/vpn/connect` - Initiate VPN connection
- `POST /api/vpn/disconnect/:sessionId` - Terminate VPN
- `GET /api/vpn/status/:userId` - Get VPN status

### Admin Portal
- `GET /api/admin/overview` - Admin dashboard data
- `POST /api/admin/notifications` - Broadcast notification
- `POST /api/admin/cards/assign` - Assign smart cards
- `PATCH /api/admin/activations/:id` - Update activation status
- `PATCH /api/admin/tickets/:id` - Update ticket status

### Client Portal
- `GET /api/client/overview` - Client dashboard data
- View payments, cards, activations, tickets

### Operations
- `GET /api/operations/overview` - Live metrics and timeline
- `GET /api/payments` - Payment history
- `GET /api/cards` - Smart card inventory
- `GET /api/activations` - Device activations
- `GET /api/tickets` - Support tickets

## Monitoring & Logs

### Application Logs
```bash
# View logs
tail -f logs/brain.log

# Log rotation (recommended)
# Use logrotate or PM2 cluster mode
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Performance Metrics
- Monitor Socket.io connections: `/api/operations/overview`
- Real-time activity feed
- Payment processing stats
- Device rollout tracking

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` to git
- Use strong JWT secrets (32+ characters)
- Rotate credentials regularly

### 2. Database
- Use strong MySQL passwords
- Enable SSL for MySQL connections in production
- Regular backups

### 3. API Security
- Rate limiting enabled by default
- CORS restricted to specified origins
- VPN authentication for private mode
- Admin-only access restrictions

### 4. File Uploads
- Max file size: 15MB
- Whitelisted file types
- Secure storage outside web root

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Database replication
- Redis for session management

### Database Optimization
- Index frequently queried columns
- Connection pooling (already configured)
- Query optimization

### Real-time Scaling
- Socket.io Redis adapter for multiple servers
- Sticky sessions configuration

## Troubleshooting

### Database Connection Failed
```bash
# Check MySQL service
sudo systemctl status mysql

# Verify credentials in .env
# Check firewall rules for port 3306
```

### Real-time Connection Issues
```bash
# Check Socket.io server
curl http://localhost:5000/socket.io/

# Verify CORS_ORIGIN in .env
# Check firewall for WebSocket ports
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

## Support & Resources

- **Admin Portal**: Manage all system operations
- **Client Portal**: Client workspace and account management
- **Demo Credentials**: Pre-loaded for testing all features
- **Real-time Dashboard**: Live metrics and activity feed

## License

Proprietary - brAIn AI Systems

---

**Last Updated**: 2026-05-04
**Version**: 0.1.0
