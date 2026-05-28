FROM node:22-slim AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend/ /app/backend/
COPY default_schema.json /app/default_schema.json
COPY data/ /app/data/
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

RUN cd /app/backend && python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "cd /app/backend && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}"]
