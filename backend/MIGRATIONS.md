# Database Migrations Guide

## Overview

This project uses **Alembic** for database migrations. Alembic tracks changes to your database schema and allows you to version control your database structure.

## Prerequisites

- PostgreSQL database set up and running
- Database user with proper permissions
- Environment variables configured in `.env`

## Quick Start

### 1. Set Up Database

```bash
# Create database and user
make db-setup

# Grant schema permissions (important!)
psql -U postgres -d codeinterview -c "GRANT ALL ON SCHEMA public TO codeinterview;"
```

### 2. Run Existing Migrations

```bash
# Apply all pending migrations
make db-migrate
```

### 3. Create New Migration

```bash
# Autogenerate migration from model changes
make db-migrate-create
# You'll be prompted to enter a migration message

# Or manually
uv run alembic revision --autogenerate -m "Add new column to sessions"
```

### 4. Apply Migration

```bash
# Apply all pending migrations
make db-migrate
```

## Common Commands

| Command | Description |
|---------|-------------|
| `make db-migrate` | Apply all pending migrations |
| `make db-migrate-create` | Create new migration (autogenerate) |
| `make db-migrate-rollback` | Rollback last migration |
| `make db-migrate-history` | Show migration history |
| `make db-migrate-current` | Show current migration version |

## Manual Commands

### Create Migration

```bash
# Autogenerate from model changes
uv run alembic revision --autogenerate -m "description"

# Create empty migration
uv run alembic revision -m "description"
```

### Apply Migrations

```bash
# Upgrade to latest
uv run alembic upgrade head

# Upgrade by 1 version
uv run alembic upgrade +1

# Upgrade to specific version
uv run alembic upgrade abc123
```

### Rollback Migrations

```bash
# Downgrade by 1 version
uv run alembic downgrade -1

# Downgrade to specific version
uv run alembic downgrade abc123

# Downgrade to base (remove all)
uv run alembic downgrade base
```

### View Migration Info

```bash
# Show current version
uv run alembic current

# Show migration history
uv run alembic history

# Show verbose history
uv run alembic history --verbose
```

## Migration Workflow

### 1. Modify Models

Edit your SQLAlchemy models in `app/models/models.py`:

```python
# Example: Add new column
class Session(Base):
    __tablename__ = "sessions"
    
    # ... existing columns ...
    
    # New column
    description = Column(String(500), nullable=True)
```

### 2. Generate Migration

```bash
make db-migrate-create
# Enter: "Add description column to sessions"
```

This creates a new file in `alembic/versions/` with the migration code.

### 3. Review Migration

Open the generated migration file and review the changes:

```python
def upgrade() -> None:
    # Auto-generated upgrade commands
    op.add_column('sessions', sa.Column('description', sa.String(length=500), nullable=True))

def downgrade() -> None:
    # Auto-generated downgrade commands
    op.drop_column('sessions', 'description')
```

### 4. Apply Migration

```bash
make db-migrate
```

### 5. Verify Changes

```bash
# Check current version
make db-migrate-current

# Or connect to database
psql -U codeinterview -d codeinterview
\d sessions  # Show table structure
```

## Troubleshooting

### Permission Denied Error

If you get `permission denied for schema public`:

```bash
# Grant permissions to user
psql -U postgres -d codeinterview -c "GRANT ALL ON SCHEMA public TO codeinterview;"
psql -U postgres -d codeinterview -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO codeinterview;"
psql -U postgres -d codeinterview -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO codeinterview;"
```

### Migration Conflicts

If you have conflicting migrations:

```bash
# Check current state
uv run alembic current

# Check history
uv run alembic history

# Merge heads if needed
uv run alembic merge heads -m "merge migrations"
```

### Reset Migrations

To start fresh (⚠️ **DESTRUCTIVE**):

```bash
# Drop all tables
make db-reset

# Remove migration history
rm alembic/versions/*.py

# Create initial migration
make db-migrate-create
# Enter: "Initial migration"

# Apply migration
make db-migrate
```

## Best Practices

### 1. Always Review Auto-Generated Migrations

Alembic's autogenerate is smart but not perfect. Always review:
- Column types are correct
- Indexes are created where needed
- Foreign keys are properly defined
- Default values are appropriate

### 2. Test Migrations

```bash
# Apply migration
make db-migrate

# Test your application
make test

# If issues, rollback
make db-migrate-rollback
```

### 3. Never Edit Applied Migrations

Once a migration is applied and committed to version control:
- **Never** edit it
- Create a new migration to fix issues
- Only edit if it hasn't been shared with others

### 4. Descriptive Messages

Use clear, descriptive migration messages:

✅ Good:
- "Add email column to users table"
- "Create index on sessions.expires_at"
- "Add cascade delete to participants"

❌ Bad:
- "Update"
- "Fix"
- "Changes"

### 5. One Logical Change Per Migration

Keep migrations focused:
- ✅ One migration: Add email column
- ✅ Another migration: Add email index
- ❌ One migration: Add email, change password type, add index

## Production Deployment

### 1. Include Migrations in Deployment

```bash
# In your deployment script
uv run alembic upgrade head
```

### 2. Backup Before Migrating

```bash
# Backup database
pg_dump -U codeinterview codeinterview > backup.sql

# Run migration
make db-migrate

# If issues, restore
psql -U codeinterview codeinterview < backup.sql
```

### 3. Zero-Downtime Migrations

For production systems:

1. **Make changes backward compatible**
   - Add columns as nullable first
   - Populate data
   - Make non-nullable in next migration

2. **Use multiple deployments**
   - Deploy 1: Add column (nullable)
   - Deploy 2: Populate data
   - Deploy 3: Make non-nullable

---

## Docker Setup & Migrations

### Quick Start with Docker

The easiest way to run the backend with database:

```bash
# Start all services (PostgreSQL + API)
make docker-up

# Or manually
docker-compose up -d
```

This automatically:
- ✅ Creates PostgreSQL database
- ✅ Sets up proper permissions
- ✅ Runs migrations on startup

### Docker Services

The `docker-compose.yml` includes:

1. **PostgreSQL 17** - Database server
2. **API** - FastAPI application

### Database Setup with Docker

#### Option 1: Automatic (Recommended)

Migrations run automatically when the API container starts (via the startup event in `app/main.py`).

```bash
# Start services
docker-compose up -d

# Check logs to verify migrations ran
docker-compose logs api
```

#### Option 2: Manual Migration

Run migrations manually in the container:

```bash
# Start services
docker-compose up -d

# Run migrations
docker-compose exec api uv run alembic upgrade head
```

### Creating Migrations with Docker

```bash
# Create new migration
docker-compose exec api uv run alembic revision --autogenerate -m "Add new column"

# The migration file is created in your local alembic/versions/ folder
# (because of volume mounting)

# Apply the migration
docker-compose exec api uv run alembic upgrade head
```

### Docker Migration Commands

```bash
# Check current migration version
docker-compose exec api uv run alembic current

# View migration history
docker-compose exec api uv run alembic history

# Rollback last migration
docker-compose exec api uv run alembic downgrade -1

# Access database directly
docker-compose exec db psql -U codeinterview -d codeinterview
```

### Docker Database Access

#### Connect to PostgreSQL Container

```bash
# Using docker-compose
docker-compose exec db psql -U codeinterview -d codeinterview

# Or using docker directly
docker exec -it <container_id> psql -U codeinterview -d codeinterview
```

#### Run SQL Commands

```bash
# List tables
docker-compose exec db psql -U codeinterview -d codeinterview -c "\dt"

# Describe table
docker-compose exec db psql -U codeinterview -d codeinterview -c "\d sessions"

# Run custom query
docker-compose exec db psql -U codeinterview -d codeinterview -c "SELECT * FROM sessions;"
```

### Docker Volumes

Database data persists in a Docker volume:

```bash
# View volumes
docker volume ls

# Inspect volume
docker volume inspect backend_postgres_data

# Remove volume (⚠️ deletes all data)
docker volume rm backend_postgres_data
```

### Reset Database in Docker

```bash
# Stop services
docker-compose down

# Remove volumes (deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d

# Migrations will run automatically
```

### Docker Development Workflow

#### 1. Start Services

```bash
docker-compose up -d
```

#### 2. Make Model Changes

Edit `app/models/models.py` locally:

```python
class Session(Base):
    # ... existing fields ...
    description = Column(String(500), nullable=True)  # New field
```

#### 3. Create Migration

```bash
# Create migration in container
docker-compose exec api uv run alembic revision --autogenerate -m "Add description to sessions"
```

#### 4. Review Migration

The migration file appears in your local `alembic/versions/` folder. Review it.

#### 5. Apply Migration

```bash
# Apply migration
docker-compose exec api uv run alembic upgrade head

# Or restart services (auto-applies)
docker-compose restart api
```

#### 6. Verify Changes

```bash
# Check table structure
docker-compose exec db psql -U codeinterview -d codeinterview -c "\d sessions"
```

### Docker Environment Variables

Configure in `docker-compose.yml`:

```yaml
services:
  api:
    environment:
      DATABASE_URL: postgresql://codeinterview:password@db:5432/codeinterview
      CORS_ORIGINS: '["http://localhost:3000"]'
```

Or use `.env` file:

```bash
# Create .env in backend/
DATABASE_URL=postgresql://codeinterview:password@db:5432/codeinterview
CORS_ORIGINS=["http://localhost:3000"]
```

### Troubleshooting Docker

#### Migrations Not Running

```bash
# Check API logs
docker-compose logs api

# Manually run migrations
docker-compose exec api uv run alembic upgrade head
```

#### Database Connection Issues

```bash
# Check if database is ready
docker-compose exec db pg_isready -U codeinterview

# Check database logs
docker-compose logs db

# Restart services
docker-compose restart
```

#### Permission Issues in Docker

Docker handles permissions automatically, but if you encounter issues:

```bash
# Access database as postgres user
docker-compose exec db psql -U postgres -d codeinterview

# Grant permissions
GRANT ALL ON SCHEMA public TO codeinterview;
```

#### Container Won't Start

```bash
# View logs
docker-compose logs api

# Rebuild containers
docker-compose up --build

# Remove and recreate
docker-compose down
docker-compose up -d
```

### Docker Production Deployment

#### Build Production Image

```bash
# Build image
docker build -t codeinterview-api:latest .

# Run migrations before starting
docker run --rm \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  codeinterview-api:latest \
  uv run alembic upgrade head

# Start application
docker run -d \
  -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host/db \
  codeinterview-api:latest
```

#### Docker Compose for Production

```yaml
version: '3.8'

services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: codeinterview
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: codeinterview
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://codeinterview:${DB_PASSWORD}@db:5432/codeinterview
    depends_on:
      - db
    restart: unless-stopped

volumes:
  postgres_data:
```

### Docker Best Practices

1. **Use health checks** - Ensure database is ready before running migrations
2. **Volume backups** - Regularly backup the postgres_data volume
3. **Environment variables** - Never commit passwords to git
4. **Multi-stage builds** - Optimize Docker image size
5. **Logging** - Configure proper logging for production

---

## Docker Integration

### Update Dockerfile

The migrations run automatically on container start via the startup event in `app/main.py`.

To run migrations manually in Docker:

```bash
# Run migration in container
docker-compose exec api uv run alembic upgrade head

# Create migration in container
docker-compose exec api uv run alembic revision --autogenerate -m "description"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run migrations
  run: |
    cd backend
    uv run alembic upgrade head
```

### Pre-deployment Check

```bash
# Check for pending migrations
uv run alembic current
uv run alembic history
```

## Additional Resources

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Migration Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

## Quick Reference

```bash
# Common workflow
make db-migrate-create     # Create migration
make db-migrate            # Apply migrations
make db-migrate-current    # Check current version

# Rollback if needed
make db-migrate-rollback   # Undo last migration

# View history
make db-migrate-history    # See all migrations
```
