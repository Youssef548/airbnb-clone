#!/bin/bash

# Start MongoDB with Docker
echo "Starting MongoDB..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "Waiting for MongoDB to start..."
sleep 5

# Function to cleanup on exit
cleanup() {
  echo "\nStopping servers..."
  kill $SERVER_PID $CLIENT_PID 2>/dev/null
  exit
}

trap cleanup INT TERM

# Start server in background
echo "Starting server on http://localhost:3000..."
pnpm --filter @airbnb/server dev &
SERVER_PID=$!

# Wait a bit for server to start
sleep 3

# Start client in background
echo "Starting client on http://localhost:5173..."
pnpm --filter @airbnb/client dev &
CLIENT_PID=$!

echo ""
echo "================================="
echo "Development servers running:"
echo "   Server: http://localhost:3000"
echo "   Client: http://localhost:5173"
echo "================================="
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait
