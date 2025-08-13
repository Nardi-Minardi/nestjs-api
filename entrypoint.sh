#!/bin/bash
set -e

/usr/local/bin/wait-for-postgres.sh

FLAG_FILE="/usr/src/app/.migrated"

if [ ! -f "$FLAG_FILE" ]; then
  echo "Running migrations..."
  npx prisma migrate deploy

  echo "Running seed..."
  npx prisma db seed

  echo "Migration & seed completed, creating flag file."
  touch "$FLAG_FILE"
else
  echo "Migration & seed already done, skipping."
fi

echo "Starting app..."
exec "$@"
