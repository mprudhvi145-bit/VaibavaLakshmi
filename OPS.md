
# Operations Playbook

## 1. Monitoring & Logging

### Health Checks
*   **API**: `GET /api/health` -> Should return `200 OK` and uptime.
*   **Frontend**: Load homepage. If blank, check Nginx logs.

### Logs
*   **Location**: `docker logs vl_backend`
*   **Format**: JSON structured logs.
*   **Key Errors to Watch**:
    *   `database_connection_failed`
    *   `payment_verification_failed`
    *   `shiprocket_auth_error`

## 2. Backup & Recovery

### Automated Backup
Run `scripts/backup-db.sh` via CRON daily (e.g., at 2 AM).
```bash
0 2 * * * /path/to/project/scripts/backup-db.sh >> /var/log/vl_backup.log 2>&1
```

### Disaster Recovery (Restore)
1.  **Stop Backend**: `docker-compose stop backend`
2.  **Unzip Backup**: `gunzip db_backup_YYYYMMDD.sql.gz`
3.  **Restore**:
    ```bash
    cat db_backup_YYYYMMDD.sql | docker exec -i vl_postgres psql -U postgres -d vaibava_db
    ```
4.  **Restart**: `docker-compose start backend`

## 3. Incident Response

| Scenario | Severity | Action |
| :--- | :--- | :--- |
| **API Down** | Critical | Check `docker logs`, restart container `docker-compose restart backend`. |
| **DB Connection Fail** | Critical | Check DB container status. Check disk space. |
| **Payment Failures** | High | Check logs for Gateway errors. Switch to fallback mode if needed. |
| **Slow Search** | Medium | Restart backend to flush in-memory cache. |

## 4. Go-Live Checklist

- [ ] **SSL Enabled**: Domain has HTTPS (use Certbot/Traefik).
- [ ] **Secrets Set**: Default passwords changed in `.env`.
- [ ] **Safe Mode**: `OPERATOR_SAFE_MODE=true` confirmed.
- [ ] **Backup Test**: Ran backup script manually and verified file size > 0.
- [ ] **Payment Test**: Processed 1 real transaction (refunded immediately).
- [ ] **Email/WhatsApp**: Verified OTP/Notification delivery.

## 5. Security Hardening
*   **Firewall**: Close port 5432 (DB) to outside world. Only allow 80/443.
*   **Rate Limit**: Backend enforces limits on `/api/auth` routes.
*   **Safe Mode**: Prevents accidental catalog wipes via Admin UI.
