#!/bin/bash
set -eu

DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
MAX_RETRIES="${DB_WAIT_MAX_RETRIES:-60}"
SLEEP_SECONDS="${DB_WAIT_SLEEP_SECONDS:-2}"

if [ -z "${DATABASE_URL:-}" ]; then
  # Fallback to the Compose postgres service if no DATABASE_URL provided
  DATABASE_URL="postgresql://postgres:postgres@postgres:5432/heart-disease?schema=public"
  export DATABASE_URL
  echo "No DATABASE_URL provided — falling back to ${DATABASE_URL}"
fi

if [ -z "${JWT_SECRET:-}" ]; then
  echo "JWT_SECRET is required"
  exit 1
fi

echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
retries=0
until DB_HOST="$DB_HOST" DB_PORT="$DB_PORT" node -e "const net=require('net');const s=net.createConnection({host: process.env.DB_HOST, port: Number(process.env.DB_PORT)});s.on('connect',()=>{s.end();process.exit(0)});s.on('error',()=>process.exit(1));"; do
  retries=$((retries + 1))
  if [ "$retries" -ge "$MAX_RETRIES" ]; then
    echo "Database is not reachable after ${MAX_RETRIES} attempts"
    exit 1
  fi
  sleep "$SLEEP_SECONDS"
done

echo "Applying Prisma migrations..."
npx prisma migrate deploy

if [ "${NODE_ENV:-production}" = "development" ]; then
  echo "Starting Next.js in development mode..."
  exec npm run dev
else
  echo "Starting Next.js in production mode..."
  exec npm run start
fi
