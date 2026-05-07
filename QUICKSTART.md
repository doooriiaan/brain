# Quick Start Guide - brAIn AI IDE

## 60-Second Setup

### 1. Install & Configure
```bash
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
```

### 2. Setup Database
```bash
mysql -u root -p
CREATE DATABASE brain_db;
```

### 3. Run Development
```bash
npm run dev
```

Access:
- 🌐 Frontend: `http://localhost:5173`
- 🔌 Backend API: `http://localhost:5000/api`

---

## Demo Credentials

### Admin Portal
- **Email**: `admin@brain-ai.com`
- **Password**: `Admin123!`
- **Access**: All system operations, notifications, payments, cards

### Client Portals
1. **Nova Market** (Commercial)
   - Email: `nova@brain-ai.com`
   - Password: `Client123!`

2. **Helios Clinic** (Healthcare)
   - Email: `helios@brain-ai.com`
   - Password: `Client123!`

3. **Astra Group** (Business)
   - Email: `astra@brain-ai.com`
   - Password: `Client123!`

4. **Factory One** (Industry)
   - Email: `factory@brain-ai.com`
   - Password: `Client123!`

---

## Key Features

### ✅ Admin Portal
- Real-time operations dashboard
- Payment management and tracking
- Smart card inventory & assignment
- Device activation tracking
- Support ticket management
- Broadcast notifications system

### ✅ Client Portal  
- Company metrics and performance
- Payment history and invoicing
- Smart card management
- Device activation status
- Support ticketing
- Account settings

### ✅ Live Features
- Real-time WebSocket updates
- Live activity feed
- Payment notifications
- Card assignment tracking
- Device status monitoring

### ✅ Multi-Language Support
- Automatic country-to-language mapping
- 50+ countries supported
- Language auto-detection
- Real-time translation switching

### ✅ VPN Integration
- Multiple geographic endpoints (EU, US, ASIA, UK)
- WireGuard protocol support
- Secure encrypted connections
- Live connection status

### ✅ 4 Specialized Sectors
1. **Commercial**: AI Stick devices for retail
2. **Business**: Hub for automation & analytics
3. **Healthcare**: MED Assistant for clinics
4. **Industry 4.0**: Edge Box for machines

---

## API Quick Reference

### Authentication
```bash
# Login
POST /api/auth/login
{ "email": "admin@brain-ai.com", "password": "Admin123!", "role": "admin" }

# Register (clients only)
POST /api/auth/register
{ "name": "...", "email": "...", "password": "...", "company": "...", "role": "client" }
```

### Get Countries & Languages
```bash
# All countries by region
GET /api/localization/countries

# Language for specific country
GET /api/localization/language/DE
```

### Real-Time Events
```javascript
// Connect to real-time updates
const socket = io('http://localhost:5000', { query: { userId: 'user-id' } });

// Listen for events
socket.on('payment:new', (data) => console.log('Payment:', data));
socket.on('cards:assigned', (data) => console.log('Cards:', data));
socket.on('activation:status', (data) => console.log('Activation:', data));
```

### Admin Operations
```bash
# Get admin dashboard
GET /api/admin/overview

# Assign smart cards
POST /api/admin/cards/assign
{ "company": "...", "sector": "...", "plan": "...", "deviceKey": "...", "quantity": 10 }

# Update activation status
PATCH /api/admin/activations/:id
{ "status": "live" }

# Broadcast notification
POST /api/admin/notifications
{ "title": "...", "body": "...", "level": "info" }
```

---

## File Structure

```
brain/
├── backend/
│   ├── routes/              # API route definitions
│   ├── controllers/         # Route handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Auth, error handling, VPN
│   ├── config/              # DB, uploads config
│   ├── database/            # MySQL schema
│   ├── app.js              # Express app
│   └── server.js           # Server with Socket.io
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API & real-time services
│   │   ├── utils/          # Animations, helpers
│   │   └── App.tsx         # Main component
│   └── vite.config.js
├── package.json            # Dependencies
├── .env.example            # Environment template
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # Project documentation
```

---

## Development Workflow

### Adding New Features

1. **Backend Service** (src/services)
```javascript
export function newFeature(params) {
  // Business logic
  return result;
}
```

2. **API Controller** (src/controllers)
```javascript
export function newFeatureRequest(request, response) {
  const result = newFeature(request.body);
  response.json(result);
}
```

3. **Route** (src/routes)
```javascript
router.post('/feature', newFeatureRequest);
```

4. **Frontend Integration** (src/services/api.ts)
```typescript
export async function callNewFeature(params) {
  return axios.post('/api/feature', params);
}
```

---

## Real-Time Dashboard Integration

```typescript
import { RealtimeDashboard } from "./components/RealtimeDashboard";

// In your component:
<RealtimeDashboard 
  userId="user-123"
  onPaymentUpdate={(data) => console.log('Payment:', data)}
  onCardUpdate={(data) => console.log('Cards:', data)}
  onActivationUpdate={(data) => console.log('Activation:', data)}
/>
```

---

## Animation Components

Use pre-built animated components:

```typescript
import {
  AnimatedBadge,
  AnimatedMetricCard,
  AnimatedButton,
  AnimatedList,
  AnimatedStatusIndicator,
} from "./components/AnimatedComponents";

// Examples:
<AnimatedBadge label="Online" variant="success" />
<AnimatedMetricCard label="Revenue" value="€2,450" icon={TrendingUp} />
<AnimatedButton onClick={() => {}}>Click Me</AnimatedButton>
```

---

## Common Commands

```bash
# Development
npm run dev              # Run both frontend and backend
npm run dev:client      # Frontend only
npm run dev:server      # Backend only

# Production
npm run build           # Build frontend
npm start               # Start backend server

# Database
mysql -u root -p brain_db < backend/database/schema.sql  # Setup

# Logs
tail -f logs/brain.log  # View logs
```

---

## Next Steps

1. ✅ Start development server (`npm run dev`)
2. ✅ Login with admin credentials
3. ✅ Explore admin portal features
4. ✅ Test client portal with demo accounts
5. ✅ Try real-time features (payments, cards, etc)
6. ✅ Test multi-language switching
7. ✅ Test VPN connections
8. ✅ Read DEPLOYMENT.md for production setup

---

## Support Resources

- **Database Issues**: Check DEPLOYMENT.md → Troubleshooting
- **Real-time Connection**: Verify Socket.io in backend/server.js
- **Build Errors**: Clear node_modules and reinstall
- **Environment**: Copy .env.example and update credentials

---

**Status**: ✅ Ready for Development
**Version**: 0.1.0
**Last Updated**: 2026-05-04
