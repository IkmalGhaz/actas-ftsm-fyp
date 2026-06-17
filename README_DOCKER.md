# Docker Deployment — ACTAS-FTSM

Run the full stack (MySQL + Express backend + React frontend) with a single command.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes `docker compose`)
- Git

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/IkmalGhaz/actas-ftsm-fyp.git
cd actas-ftsm-fyp

# 2. Copy the environment template (no changes needed for local dev)
cp .env.example .env

# 3. Build images and start all services
docker compose up --build
```

Then open your browser:

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost            |
| Backend  | http://localhost:5000       |
| MySQL    | localhost:3306 (root, no pw)|

The database is seeded automatically from `seed_buku_panduan.sql` on first run.

## Demo Credentials

| Role          | ID          | Password   |
|---------------|-------------|------------|
| Pelajar (SC)  | A21CS001    | pelajar123 |
| Pelajar (TM)  | A21TM001    | pelajar123 |
| Ketua Program | KP001       | kp123      |
| Pegawai FTSM  | PEGAWAI001  | pegawai123 |

## Useful Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (resets DB)
docker compose down -v

# View backend logs
docker compose logs -f backend

# Rebuild a single service
docker compose up --build backend
```

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable             | Default  | Description                    |
|----------------------|----------|--------------------------------|
| `DB_HOST`            | `db`     | MySQL host (service name)      |
| `DB_PORT`            | `3306`   | MySQL port                     |
| `DB_USER`            | `root`   | MySQL username                 |
| `DB_PASSWORD`        | *(empty)*| MySQL password                 |
| `DB_NAME`            | `actas_db`| Database name                 |
| `PORT`               | `5000`   | Express server port            |
| `MYSQL_ROOT_PASSWORD`| *(empty)*| Root password set in MySQL     |

## Architecture

```
Browser  →  nginx (port 80)  →  React SPA (static)
Browser  →  Express (port 5000)  →  MySQL (port 3306)
```

The React frontend makes API calls directly from the browser to `http://localhost:5000`, so both ports must be accessible from your machine.
