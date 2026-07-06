# Multi-service Dockerfile: builds and runs both frontend (nginx) and backend (uvicorn)
# This creates a single deployable container that serves the React app and proxies /api to FastAPI

# ── Stage 1: Build frontend ────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --silent

COPY frontend/ .
RUN NODE_ENV=production npm run build

# ── Stage 2: Build backend wheels ──────────────────────────────────────────────
FROM python:3.12-slim AS backend-builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

# ── Stage 3: Final runtime image ───────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install nginx, supervisord, and curl for health checks
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        nginx \
        supervisor \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python dependencies
COPY --from=backend-builder /wheels /wheels
COPY backend/requirements.txt .

RUN pip install --no-cache /wheels/* \
    && rm -rf /wheels

# Copy built frontend to nginx directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Copy backend application
COPY backend/ /app

# Copy nginx configuration (monorepo version that proxies to localhost:8000)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy supervisor configuration to manage both services
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Ensure nginx log directories exist
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/access.log /var/log/nginx/error.log

EXPOSE 8080

# Start both services via supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
