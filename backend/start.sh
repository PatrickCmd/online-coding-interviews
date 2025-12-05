#!/bin/bash
set -e

echo "🚀 Starting CodeInterview API..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
python -c "
import time
import sys
from sqlalchemy import create_engine
from app.core.config import get_settings

settings = get_settings()
max_retries = 30
retry_interval = 2

for i in range(max_retries):
    try:
        engine = create_engine(settings.DATABASE_URL)
        conn = engine.connect()
        conn.close()
        print('✅ Database connection successful!')
        sys.exit(0)
    except Exception as e:
        if i < max_retries - 1:
            print(f'⏳ Waiting for database... ({i+1}/{max_retries})')
            time.sleep(retry_interval)
        else:
            print(f'❌ Failed to connect to database: {e}')
            sys.exit(1)
"

# Run database migrations
echo "🔄 Running database migrations..."
uv run alembic upgrade head

# Check migration status
echo "✅ Checking migration status..."
uv run alembic current

# Start the application
echo "🎉 Starting Uvicorn server..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
