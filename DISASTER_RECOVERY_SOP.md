# Disaster Recovery SOP

**Priority:** CRITICAL  
**Audience:** Operator / System Admin  
**Goal:** Restore service availability within 30 minutes of catastrophic failure.

---

## Scenario A: Accidental Data Deletion / Corruption
**Symptoms:** Missing orders, corrupted product data, "Internal Server Error".

### 1. Stop the Backend
Prevent new data from entering the system while restoring.
```bash
cd docker
docker-compose stop backend
```

### 2. Identify Backup
List available backups inside the database container.
```bash
docker exec -it medusa-db ls -lh /backups
# Look for the latest file before the incident, e.g., medusa_db_20231027_090000.sql.gz
```

### 3. Execute Restore
Run the restore script. You will be asked to confirm.
```bash
docker exec -it medusa-db /scripts/restore-db.sh medusa_db_20231027_090000.sql.gz
```
*Input `DESTROY_AND_RESTORE` when prompted.*

### 4. Restart Backend
```bash
docker-compose start backend
```
*Verify system health at `http://localhost:9000/health`*

---

## Scenario B: Failed Deployment (Bad Code)
**Symptoms:** White screen of death, boot loops, API 502 Bad Gateway.

### 1. Revert Docker Image
Edit `docker-compose.yml` to point to the previous working tag or git commit.
```yaml
# Change from:
image: medusa-backend:latest
# To:
image: medusa-backend:v1.0.4  # Previous known good version
```

### 2. Redeploy
```bash
docker-compose up -d --build backend
```

---

## Scenario C: Scheduled Maintenance (Manual Backup)
Before making major changes (e.g., bulk importing 5000 products), force a backup.

```bash
docker exec medusa-db /scripts/backup-db.sh
```
*Success Output: `[Timestamp] ✅ Backup Created Successfully`*

