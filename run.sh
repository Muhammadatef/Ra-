#!/bin/bash

echo "🚀 Starting Ra Platform (Simplified)"

# Kill any existing processes
pkill -f "npm run dev"
pkill -f "npm start"
docker-compose down

# Start only PostgreSQL
echo "📊 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for database
echo "⏳ Waiting for database..."
sleep 10

# Navigate to backend and run quick setup
echo "🔧 Setting up backend..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Run quick seed
echo "🌱 Quick seeding database..."
DB_HOST=localhost npm run quick-seed

echo "🎯 Starting backend server..."
DB_HOST=localhost npm run dev &

# Wait for backend to start
sleep 5

# Navigate to frontend and start
echo "🎨 Setting up frontend..."
cd ../frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

echo "🌐 Starting frontend..."
BROWSER=none npm start &

echo ""
echo "🎉 Ra Platform is running!"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo "📈 API Health: http://localhost:3001/api/health"
echo ""
echo "The dashboard will open automatically in a few seconds..."
echo "Press Ctrl+C to stop"

# Wait a bit then try to open browser
sleep 8
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3000 2>/dev/null &
elif command -v open > /dev/null; then
    open http://localhost:3000 2>/dev/null &
fi

# Keep script running
wait