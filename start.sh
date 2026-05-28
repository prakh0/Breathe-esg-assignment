#!/bin/bash
set -e

# Build frontend
cd frontend
corepack enable pnpm
pnpm install
pnpm run build
cd ..

# Install backend dependencies
cd backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
cd ..

# Start the application
cd backend
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}
