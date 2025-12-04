# Docker Setup Quick Reference

## 🚀 Quick Start

### Start Everything

```bash
cd backend
make docker-up
```

This starts:
- PostgreSQL 17 database
- FastAPI application
- Automatically runs migrations

Access:
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

---

## 📋 Common Commands

### Starting & Stopping

```bash
make docker-up          # Start all services
make docker-down        # Stop all services
make docker-logs        # View logs
make docker-shell       # Open shell in API container
```

### Database Migrations

```bash
make docker-migrate              # Run migrations
make docker-migrate-create       # Create new migration
make docker-migrate-rollback     # Rollback last migration
make docker-db-shell            # Open database shell
make docker-db-reset            # Reset database (deletes data!)
```

### Manual Commands

```bash
# Run migrations
docker-compose exec api uv run alembic upgrade head

# Create migration
docker-compose exec api uv run alembic revision --autogenerate -m "message"

# Access database
docker-compose exec db psql -U codeinterview -d codeinterview

# View API logs
docker-compose logs -f api

# Restart services
docker-compose restart
```

---

## 🔄 Development Workflow

### 1. Start Services

```bash
make docker-up
```

### 2. Make Code Changes

Edit files locally (they sync automatically via volumes):
- `app/models/models.py` - Database models
- `app/api/*.py` - API endpoints
- `app/services/*.py` - Business logic

### 3. Create Migration (if models changed)

```bash
make docker-migrate-create
# Enter: "Add new field to sessions"
```

### 4. Apply Migration

```bash
make docker-migrate
```

### 5. Test Changes

```bash
# View logs
make docker-logs

# Test API
curl http://localhost:8000/api/v1/health

# Or visit http://localhost:8000/docs
```

---

## 🗄️ Database Operations

### Access Database

```bash
# Using Makefile
make docker-db-shell

# Or manually
docker-compose exec db psql -U codeinterview -d codeinterview
```

### Common SQL Commands

```sql
-- List tables
\dt

-- Describe table
\d sessions

-- View data
SELECT * FROM sessions;

-- Check migration version
SELECT * FROM alembic_version;

-- Exit
\q
```

### Reset Database

```bash
# ⚠️ This deletes all data!
make docker-db-reset
```

---

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check what's running
docker-compose ps

# View logs
docker-compose logs

# Rebuild
docker-compose up --build
```

### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec db pg_isready -U codeinterview

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Migrations Not Running

```bash
# Check API logs
docker-compose logs api

# Manually run migrations
make docker-migrate

# Check migration status
docker-compose exec api uv run alembic current
```

### Port Already in Use

```bash
# Stop services
make docker-down

# Check what's using port 8000
lsof -i :8000

# Kill process if needed
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Volume Permission Issues

```bash
# Remove volumes and start fresh
docker-compose down -v
make docker-up
```

---

## 📦 Data Persistence

### Volumes

Database data persists in Docker volumes:

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect backend_postgres_data

# Backup volume
docker run --rm -v backend_postgres_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz /data

# Restore volume
docker run --rm -v backend_postgres_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/db-backup.tar.gz -C /
```

### Database Backup

```bash
# Backup database
docker-compose exec db pg_dump -U codeinterview codeinterview > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T db psql -U codeinterview -d codeinterview
```

---

## 🔧 Environment Variables

### Using .env File

Create `backend/.env`:

```env
DATABASE_URL=postgresql://codeinterview:password@db:5432/codeinterview
CORS_ORIGINS=["http://localhost:3000"]
SESSION_EXPIRATION_HOURS=24
```

### Override in docker-compose.yml

```yaml
services:
  api:
    environment:
      DATABASE_URL: postgresql://codeinterview:newpassword@db:5432/codeinterview
```

---

## 🚀 Production Deployment

### Build Production Image

```bash
docker build -t codeinterview-api:latest .
```

### Run with External Database

```bash
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  codeinterview-api:latest
```

### Docker Compose Production

See [MIGRATIONS.md](./MIGRATIONS.md#docker-production-deployment) for production setup.

---

## 📚 Additional Resources

- [MIGRATIONS.md](./MIGRATIONS.md#docker-setup--migrations) - Detailed migration guide
- [README.md](./README.md#docker-deployment) - Full backend documentation
- [docker-compose.yml](./docker-compose.yml) - Service configuration

---

## ⚡ Quick Reference Table

| Task | Command |
|------|---------|
| Start services | `make docker-up` |
| Stop services | `make docker-down` |
| View logs | `make docker-logs` |
| Run migrations | `make docker-migrate` |
| Create migration | `make docker-migrate-create` |
| Database shell | `make docker-db-shell` |
| API shell | `make docker-shell` |
| Reset database | `make docker-db-reset` |
| Rebuild | `docker-compose up --build` |
| Check status | `docker-compose ps` |
