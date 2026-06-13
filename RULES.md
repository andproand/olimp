# Project Rules & Deployment Guide

## Server Details
- **IP:** 104.253.18.168
- **User:** root
- **Project Path:** `/root/olimp`

## Server Infrastructure Rules (104.253.18.168)
- **olimp-gateway.service**: Auth Gateway & Client Static Server (runs on Port 18795). Serves built frontend files from `client/dist` and proxies API requests.
- **olimp-backend.service**: Express Backend Application (runs on Port 3001).
- **olimp-postgres**: Docker container running PostgreSQL 16 (maps port 5432 to loopback `127.0.0.1:5432`).
- n8n & Traefik: **Not installed and not required** on this server.
- DANGER: Never delete volumes or storage directories of the `olimp-postgres` container.

## Database Configuration (Local Docker)
- **Host:** `127.0.0.1`
- **Port:** `5432`
- **Database:** `olimp_db`
- **User:** `olimp_user`
- **Password:** `olimp_password`
- **Connection String:** 
  `postgresql://olimp_user:olimp_password@127.0.0.1:5432/olimp_db?schema=public`

## Deployment Workflow

### 1. Upload Changes (Local PowerShell)
```powershell
# Navigate to project root
cd c:\AG\olimp

# Upload Client Code
scp -r c:\AG\olimp\client\src root@104.253.18.168:/root/olimp/client/
scp c:\AG\olimp\client\package.json root@104.253.18.168:/root/olimp/client/
scp c:\AG\olimp\client\vite.config.ts root@104.253.18.168:/root/olimp/client/

# Upload Server Code
scp -r c:\AG\olimp\server\src root@104.253.18.168:/root/olimp/server/
scp c:\AG\olimp\server\package.json root@104.253.18.168:/root/olimp/server/
scp c:\AG\olimp\server\prisma\schema.prisma root@104.253.18.168:/root/olimp/server/prisma/

# Upload Configs
scp c:\AG\olimp\gateway.js root@104.253.18.168:/root/olimp/
scp c:\AG\olimp\login.html root@104.253.18.168:/root/olimp/
scp c:\AG\olimp\docker-compose.yml root@104.253.18.168:/root/olimp/
```

### 2. Apply Changes (Remote SSH)
**Step 1: Connect**
```bash
ssh root@104.253.18.168
```

**Step 2: Build and Restart Backend**
```bash
cd /root/olimp/server
npm install
npm run build
npx prisma generate
systemctl restart olimp-backend
```

**Step 3: Build Client**
```bash
cd /root/olimp/client
npm install
npm run build
```

**Step 4: Restart Gateway (if gateway.js or login.html changed)**
```bash
systemctl restart olimp-gateway
```

**Step 5: Apply Database Migrations (if needed)**
```bash
cd /root/olimp/server
npx prisma db push
```

## Development Rules
- **Frontend:** React + Vite + Shadcn UI (`c:\AG\olimp\client` / `/root/olimp/client`)
- **Backend:** Node.js + Express + Prisma (`c:\AG\olimp\server` / `/root/olimp/server`)
- **Database:** PostgreSQL (Managed via Docker container `olimp-postgres`)
- **State Management:** React Query / Local State
- **Styling:** Tailwind CSS

## Communication
- Provide information in Russian whenever possible.



