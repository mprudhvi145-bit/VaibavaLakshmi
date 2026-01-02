# Production Deployment Guide

## 1. Prerequisites
- Docker & Docker Compose v2+
- Node.js 16+
- PostgreSQL 14+ (or RDS)
- Redis 6+ (or ElastiCache)

## 2. Environment Variables
Create `.env.production` in `packages/medusa-backend`:
```env
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/db_name
REDIS_URL=redis://host:6379
JWT_SECRET=super_secure_random_string
COOKIE_SECRET=super_secure_random_string
ADMIN_CORS=https://admin.yourdomain.com
STORE_CORS=https://www.yourdomain.com
SHIPROCKET_EMAIL=...
SHIPROCKET_PASSWORD=...
WHATSAPP_API_KEY=...
```

## 3. Database Migration
Run this *before* starting the backend for the first time:
```bash
cd packages/medusa-backend
npm run build
medusa migrations run
medusa user -e admin@admin.com -p supersecret
```

## 4. Docker Deployment (Railway/Render)
1. Fork this repo.
2. Connect Railway to GitHub.
3. Railway will detect `docker-compose.yml`.
4. Add the Variables from Step 2 into Railway Dashboard.
5. Deploy.

## 5. Verification
- **Health Check**: `GET https://api.yourdomain.com/health` -> `200 OK`
- **Admin Panel**: `https://admin.yourdomain.com` -> Login successful.
- **Workflow Test**: Place order on storefront -> Check database for `order` record -> Check logs for `[Notification] WhatsApp sent`.
