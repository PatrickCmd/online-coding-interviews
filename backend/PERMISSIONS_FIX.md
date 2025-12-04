# Fixing PostgreSQL Permissions for Migrations

## The Problem

When running Alembic migrations, you might encounter:
```
psycopg2.errors.InsufficientPrivilege: permission denied for schema public
```

This happens because the `codeinterview` user doesn't have sufficient permissions on the `public` schema.

## Quick Fix

### Option 1: Use the Makefile (Recommended)

The `db-setup` command now automatically grants all necessary permissions:

```bash
make db-setup
```

This will:
1. Create the database and user
2. Grant database privileges
3. **Grant schema permissions** (fixes the issue)
4. Grant permissions on existing tables and sequences
5. Set default privileges for future objects

### Option 2: Manual Fix

If you already have the database set up, run these commands:

```bash
# Grant schema permissions
psql -U postgres -d codeinterview -c "GRANT ALL ON SCHEMA public TO codeinterview;"

# Grant permissions on existing objects
psql -U postgres -d codeinterview -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO codeinterview;"
psql -U postgres -d codeinterview -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO codeinterview;"

# Set default privileges for future objects
psql -U postgres -d codeinterview -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeinterview;"
psql -U postgres -d codeinterview -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO codeinterview;"
```

## Verification

After granting permissions, verify they're set correctly:

```bash
# Connect to database
psql -U postgres -d codeinterview

# Check schema permissions
\dn+

# Check table permissions (after creating tables)
\dp

# Exit
\q
```

## Now Run Migrations

Once permissions are fixed, migrations should work:

```bash
# Create initial migration
make db-migrate-create
# Enter: "Initial migration"

# Apply migration
make db-migrate
```

## Why This Happens

PostgreSQL 15+ changed the default permissions on the `public` schema. Previously, all users had CREATE privileges on `public` by default. Now, only the database owner has these privileges.

## Permanent Solution

The updated `make db-setup` command now includes all necessary permission grants, so you won't encounter this issue again when setting up fresh databases.

## Alternative: Use Superuser

If you're in development and want to avoid permission issues entirely:

```bash
# Make user a superuser (development only!)
psql -U postgres -c "ALTER USER codeinterview WITH SUPERUSER;"
```

⚠️ **Warning**: Don't use superuser in production!

## Production Recommendations

For production databases:

1. **Use least privilege**: Grant only necessary permissions
2. **Separate users**: Different users for migrations vs. application
3. **Migration user**: Has schema modification rights
4. **Application user**: Has only data manipulation rights (SELECT, INSERT, UPDATE, DELETE)

Example production setup:

```sql
-- Migration user (for deployments)
CREATE USER codeinterview_migrate WITH PASSWORD 'secure_password';
GRANT ALL ON SCHEMA public TO codeinterview_migrate;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO codeinterview_migrate;

-- Application user (for running app)
CREATE USER codeinterview_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE codeinterview TO codeinterview_app;
GRANT USAGE ON SCHEMA public TO codeinterview_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO codeinterview_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO codeinterview_app;
```

## Troubleshooting

### Still getting permission errors?

1. **Check current user permissions**:
   ```bash
   psql -U postgres -d codeinterview -c "\du codeinterview"
   ```

2. **Check schema permissions**:
   ```bash
   psql -U postgres -d codeinterview -c "\dn+"
   ```

3. **Re-run setup**:
   ```bash
   make db-reset  # Drops and recreates with correct permissions
   ```

### Can't connect as postgres user?

On macOS with Homebrew PostgreSQL:
```bash
# Check if PostgreSQL is running
brew services list

# Start PostgreSQL
brew services start postgresql@17

# Connect as your macOS user (usually has superuser privileges)
psql postgres
```

On Linux:
```bash
# Switch to postgres user
sudo -u postgres psql
```

## Summary

**The fix is now built into the Makefile!**

Just run:
```bash
make db-setup
```

And you'll have all the necessary permissions for migrations to work. ✅
