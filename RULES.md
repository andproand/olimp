# Project Rules & Deployment Guide

## Server Details
- **IP:** 77.73.235.58
- **User:** root
- **Password:** `0S*IqigwcJHi`
- **Project Path:** `/root/olymptracker`
- **N8N Path:** `/opt/beget/n8n`

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
scp c:\AG\olimp\docker-compose.yml root@77.73.235.58:/root/olymptracker/
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



