#!/bin/bash
set -e

# Use PORT from environment, default to 8080 for local dev
export PORT=${PORT:-8080}

# Substitute PORT env var in nginx config
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start supervisord (manages both backend and frontend)
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
