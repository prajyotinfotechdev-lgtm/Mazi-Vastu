# Deployment Guide

## VPS Deployment (Recommended)

### Prerequisites

- Ubuntu 22.04+ VPS (2GB+ RAM)
- Docker + Docker Compose
- Nginx (reverse proxy)
- Domain with SSL (Let's Encrypt)

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_DB: majhi_vastu
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  app:
    build: .
    restart: unless-stopped
    depends_on:
      - db
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/majhi_vastu?schema=public
      AUTH_SECRET: ${AUTH_SECRET}
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      VAPID_PUBLIC_KEY: ${VAPID_PUBLIC_KEY}
      VAPID_PRIVATE_KEY: ${VAPID_PRIVATE_KEY}
      VAPID_SUBJECT: ${VAPID_SUBJECT}
      NODE_ENV: production

volumes:
  pgdata:
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

### Nginx Config

```nginx
server {
    listen 443 ssl http2;
    server_name majivastu.com;

    ssl_certificate /etc/letsencrypt/live/majivastu.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/majivastu.com/privkey.pem;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_read_timeout 30s;
    }
}

server {
    listen 80;
    server_name majivastu.com;
    return 301 https://$host$request_uri;
}
```

### Deploy Steps

```bash
# On VPS
cd /opt/majivastu

# Pull latest code
git pull origin main

# Build and restart
docker compose up -d --build

# Run migrations
docker compose exec app npx prisma migrate deploy

# First time: seed
docker compose exec app npx prisma db seed
```

### SSL with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d majivastu.com
```

## Environment Variables

All required variables are documented in `.env.example`.

## Monitoring

- Health check: `GET /api/health`
- Logs: `docker compose logs -f app`
- Database: Prisma Studio (`npx prisma studio`)

## Scaling Considerations (Future)

1. **Rate Limiter**: Replace `InMemoryRateLimiter` with Redis-backed
2. **Notification Worker**: Move outbox processing to a background worker
3. **CDN**: Add Cloudflare or similar CDN in front of Nginx
4. **Database**: Add read replicas for public queries
