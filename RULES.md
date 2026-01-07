# Project Rules & Deployment Guide

## Server Details
- **IP:** 77.73.235.58
- **User:** root
- **Password:** `0S*IqigwcJHi`
- **Project Path:** `/root/olymptracker`
- **N8N Path:** `/opt/beget/n8n`

#№ Server Infrastructure Rules (77.73.235.58)
- n8n & Traefik: Ports 80, 443. 
- Main App: Port 3000.
- Shared Database: Postgres 16 (Service name: postgres).
- DANGER: Never delete volumes or storage folders without explicit confirmation.
- DOCKER: Always check API compatibility (Server is Ubuntu 24.04, Docker is latest).

## n8n Co-existence Guidelines (CRITICAL)
1. **Port Isolation**: Always check ports with `ss -tulpn` before changing docker-compose. n8n uses 80/443. App uses 3000. New services must use unique ports (e.g., 3001, 4000).
2. **Database Safety**: Shared Postgres instance. NEVER run `docker compose down -v` or `rm -rf db_storage`. Use unique table prefixes (e.g., `olimp_`) to avoid conflicts with n8n tables.
3. **Resource Limits**: Always add `deploy.resources.limits` to docker-compose services. Limit n8n to 0.5 CPU / 1GB RAM if modifying its config.
4. **Env Safety**: Backup `.env` before changes (`cp .env .env.bak`). Be aware of multiple .env files.
5. **Troubleshooting**: Check logs first: `docker compose logs --tail=50`.

## Database Configuration (Remote)
- **Host:** `n8n-postgres-1`
- **Port:** `5432`
- **Database:** `n8n`
- **User:** `user`
- **Password:** `1tGythIngPZJeuZ`
- **Connection String:** 
  `postgresql://user:1tGythIngPZJeuZ@n8n-postgres-1:5432/n8n?schema=public`

## Deployment Workflow

### 1. Upload Changes (Local PowerShell)
```powershell
# Navigate to project root
cd c:\AG\olimp

# Upload Client Code
scp -r c:\AG\olimp\client\src root@77.73.235.58:/root/olymptracker/client/
scp c:\AG\olimp\client\package.json root@77.73.235.58:/root/olymptracker/client/

# Upload Server Code
scp -r c:\AG\olimp\server\src root@77.73.235.58:/root/olymptracker/server/
scp c:\AG\olimp\server\prisma\schema.prisma root@77.73.235.58:/root/olymptracker/server/prisma/

# Upload Configs
# Upload Configs
scp c:\AG\olimp\docker-compose.yml root@77.73.235.58:/root/olymptracker/

# Upload Public Assets (Logo)
scp -r c:\AG\olimp\client\public root@77.73.235.58:/root/olymptracker/client/
```

### 2. Apply Changes (Remote SSH)
**Step 1: Connect**
```bash
ssh root@77.73.235.58
```

**Step 2: Rebuild Containers**
```bash
cd /root/olymptracker
docker-compose down
docker-compose up -d --build
```

**Step 3: Apply Database Migrations**
```bash
cd /root/olymptracker
docker exec -it olymptracker-server npx prisma db push
```

## Development Rules
- **Frontend:** React + Vite + Shadcn UI (`c:\AG\olimp\client`)
- **Backend:** Node.js + Express + Prisma (`c:\AG\olimp\server`)
- **Database:** PostgreSQL (Managed via Docker)
- **State Management:** React Query / Local State
- **Styling:** Tailwind CSS

## Communication
- Provide information in Russian whenever possible.



