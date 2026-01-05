
# Deployment Architecture

## 1. Components
*   **Load Balancer (Nginx)**: Serves Frontend static files, proxies API requests if configured, handles SSL.
*   **Frontend**: React SPA (Single Page Application).
*   **Backend**: Node.js/Express API (Stateless).
*   **Database**: PostgreSQL 15 (Persistent Storage).
*   **Volatile**: Redis (Optional for caching, currently using In-Memory for simplicity).

## 2. Environment Variables (.env)
Create a `.env` file in the root directory before running docker-compose.

```ini
# Database
DB_USER=postgres
DB_PASS=production_password_change_me
DB_NAME=vaibava_db

# Backend Security
JWT_SECRET=super_secret_key_change_me_immediately
OPERATOR_SAFE_MODE=true  # Prevents accidental deletes via API

# External Services
SHIPROCKET_EMAIL=...
SHIPROCKET_PASSWORD=...
WHATSAPP_API_KEY=...
```

## 3. Secrets Management
*   **Production**: Use Docker Swarm Secrets or Kubernetes Secrets.
*   **Single Server**: Restrict `.env` file permissions (`chmod 600 .env`).

## 4. Scaling
*   **Backend**: Can run multiple replicas behind a load balancer (Stateless).
*   **Database**: Vertical scaling recommended for <100k products.
