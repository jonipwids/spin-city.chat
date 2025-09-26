#!/bin/bash

# Start both backend and frontend services

echo "Starting CS Socket Backend and Frontend integration..."

# Function to kill background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit
}

# Set up trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start the Go backend
echo "Starting Go backend..."
cd c:/Job/AWS-Ubuntu/cs-socket
go run main.go &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a bit for backend to start
sleep 3

# Start the Next.js frontend
echo "Starting Next.js frontend..."
cd c:/Job/cs-fork
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🚀 Services are running:"
echo "   - Backend API: http://localhost:8080"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait