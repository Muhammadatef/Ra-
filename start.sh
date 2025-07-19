#!/bin/bash

echo "🚀 Starting Ra Platform..."

# Stop any existing containers
docker-compose down

# Start PostgreSQL only first
echo "📊 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database to be ready..."
sleep 15

# Check if database is accessible
echo "🔍 Checking database connection..."
until docker exec ra-postgres pg_isready -U ra_user -d ra_platform; do
  echo "Database not ready, waiting..."
  sleep 5
done

echo "✅ Database is ready!"

# Install backend dependencies and seed data
echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "🌱 Seeding database with sample data..."
DB_HOST=localhost npm run seed

echo "🎯 Starting backend server..."
DB_HOST=localhost npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 10

echo "🎨 Installing frontend dependencies..."
cd ../frontend
npm install

echo "🌐 Starting frontend server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Ra Platform is now running!"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📈 Health Check: http://localhost:3001/api/health"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit' INT
wait