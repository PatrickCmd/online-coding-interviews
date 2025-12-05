FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY app ./app

# Copy Alembic configuration and migrations
COPY alembic.ini ./
COPY alembic ./alembic

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 8000

# Run application with startup script
CMD ["./start.sh"]
