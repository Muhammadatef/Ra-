# Ra Platform - Food Truck Management System

A comprehensive management platform for ice cream and burger truck businesses.

## 🚀 Quick Start

### Option 1: One-Command Start (Recommended)
```bash
./run.sh
```

### Option 2: Manual Setup
1. Start database:
   ```bash
   docker-compose up -d postgres
   ```

2. Setup backend:
   ```bash
   cd backend
   npm install
   DB_HOST=localhost npm run quick-seed
   DB_HOST=localhost npm run dev
   ```

3. Setup frontend (in new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📊 Access the Platform

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/api/health

## 🏢 Sample Data

The platform includes sample data with:

### Companies
- **Arctic Delights Ice Cream Co.** (Washington)
- **Frozen Paradise Trucks** (Washington)
- **Golden State Burger Co.** (California)
- **Pacific Coast Grill** (California)

### Data Overview
- 📊 **4 Companies** (2 ice cream, 2 burger)
- 📍 **8 Locations** (4 in Washington, 4 in California)
- 👥 **200 Employees** (50 per company)
- 🚚 **20 Trucks** (5 per company)
- 💰 **850+ Sales Records** (last 30 days)
- 📦 **Full Inventory** for all trucks

## 🎯 Features

### Dashboard
- Real-time business metrics
- Sales analytics and trends
- Truck performance tracking
- Low stock alerts
- Business type breakdown

### Management Pages
- **Companies**: Business overview and statistics
- **Employees**: Staff management with filtering
- **Trucks**: Fleet management and maintenance tracking
- **Sales**: Transaction history and analytics
- **Inventory**: Stock management and reorder alerts

## 🛠 Technology Stack

### Backend
- Node.js + Express
- PostgreSQL database
- Docker for containerization
- RESTful API design

### Frontend
- React 18
- Material-UI (MUI)
- Recharts for analytics
- Responsive design

## 📱 Dashboard Features

### Overview Cards
- Total companies, employees, trucks
- Revenue tracking
- Active fleet monitoring

### Analytics
- 14-day sales trends
- Truck performance metrics
- Business type comparisons
- Payment method analytics

### Alerts
- Low stock notifications
- Maintenance reminders
- Performance insights

## 🔧 API Endpoints

### Companies
- `GET /api/companies` - List all companies
- `GET /api/companies/:id` - Get company details

### Employees
- `GET /api/employees` - List employees (paginated)
- Filters: company, status, location

### Trucks
- `GET /api/trucks` - List trucks
- Filters: company, status

### Sales
- `GET /api/sales` - Sales history (paginated)
- `GET /api/sales/summary` - Sales analytics

### Inventory
- `GET /api/inventory` - Inventory items
- `GET /api/inventory/truck/:id` - Truck-specific inventory

### Dashboard
- `GET /api/dashboard/overview` - Key metrics
- `GET /api/dashboard/sales-analytics` - Sales trends
- `GET /api/dashboard/truck-performance` - Performance data
- `GET /api/dashboard/low-stock` - Stock alerts

## 🗂 Project Structure

```
ra-platform/
├── backend/
│   ├── routes/           # API route handlers
│   ├── config/           # Database configuration
│   ├── scripts/          # Data seeding scripts
│   └── server.js         # Express server
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Dashboard pages
│   │   └── services/     # API services
│   └── public/
├── database/
│   └── init.sql          # Database schema
├── docker-compose.yml    # Docker services
├── run.sh               # Quick start script
└── README.md
```

## 🐳 Docker Services

- **postgres**: PostgreSQL 15 database
- **backend**: Node.js API server
- **frontend**: React development server

## 🔍 Sample Business Scenarios

### Ice Cream Trucks (Washington)
- **Arctic Delights**: Premium ice cream with locations in Seattle & Tacoma
- **Frozen Paradise**: Family-friendly treats in Spokane & Bellevue
- Seasonal menu items, cold storage tracking
- Mobile payment processing

### Burger Trucks (California)
- **Golden State Burger**: Gourmet burgers in LA & San Francisco
- **Pacific Coast Grill**: Fresh ingredients in San Diego & Sacramento
- Hot food preparation, inventory turnover
- High-volume lunch service

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps
# Restart database
docker-compose restart postgres
```

### Port Conflicts
- Frontend: Default port 3000
- Backend: Default port 3001
- Database: Default port 5432

### Dependencies Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance

- Backend API: ~50ms average response time
- Database: Optimized indexes for common queries
- Frontend: Responsive design with pagination
- Real-time updates: Dashboard refreshes automatically

---

**Ra Platform** - Streamlining food truck operations across Washington and California! 🍦🍔