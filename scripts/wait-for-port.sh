#!/usr/bin/env bash

HOST=${1:-127.0.0.1}
PORT=${2:-8080}
TIMEOUT=30

echo "⏳ Waiting for $HOST:$PORT to be ready..."

for i in $(seq 1 $TIMEOUT); do
  nc -z $HOST $PORT >/dev/null 2>&1 && {
    echo "✅ $HOST:$PORT is ready"
    exit 0
  }
  sleep 1
done

echo "❌ Timeout waiting for $HOST:$PORT"
exit 1
