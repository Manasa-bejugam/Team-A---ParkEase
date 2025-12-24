# Smart Parking System (ParkEase)

A full-stack smart parking management system with microservices architecture, real-time updates, payment integration, and analytics.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   React     │ ←──→ │   Node.js    │ ←──→ │  Java Spring    │
│  Frontend   │      │   Backend    │      │     Boot        │
│  (Port 3000)│      │  (Port 5000) │      │   (Port 8080)   │
└─────────────┘      └──────────────┘      └─────────────────┘
                            ↓
                      ┌──────────┐
                      │ MongoDB  │
                      └──────────┘
```

## Project Structure

### `/backend` - Node.js API Server
Main backend service handling authentication, bookings, and real-time updates.

**Key Files:**
- `server.js` - Main server with Socket.IO setup
- `socketHandlers.js` - Real-time event broadcasting
- `routes/` - API endpoints (auth, bookings, slots, analytics, payments)
- `models/` - MongoDB schemas (User, Slot, Booking, Payment)
- `middleware/authMiddleware.js` - JWT authentication
- `jobs/slotReleaseJob.js` - Auto-release slots when parking ends

### `/parking-validator` - Java Spring Boot Microservice
Validation and analytics service (essential for bookings).

**Key Files:**
- `ValidatorApplication.java` - Main Spring Boot app
- `controller/` - REST API endpoints
- `service/ValidationService.java` - Business logic (booking validation)
- `service/AnalyticsService.java` - Analytics calculations
- `model/` - DTOs for request/response
- `pom.xml` - Maven dependencies

### `/myapp2/myapp` - React Frontend
Modern UI with real-time updates and payment flow.

**Key Files:**
- `src/App.jsx` - Main app with Socket.IO integration
- `src/pages/AdminDashboard.jsx` - Analytics dashboard
- `src/components/BookingForm.jsx` - Booking with payment
- `src/components/PaymentSummary.jsx` - Payment UI with timer
- `src/hooks/useSocket.js` - Custom hook for real-time updates
- `src/api.js` - API calls to backend

### `/seed` - Database Initialization
- `slotSeeder.js` - Creates initial parking slots

## Features

1. **Authentication** - JWT-based login with role-based access
2. **Real-Time Updates** - Socket.IO for instant slot updates
3. **Java Validation** - Mandatory validation via Spring Boot service
4. **Payment System** - Timer, calculation, multiple methods
5. **Analytics** - Java-powered statistics and reports
6. **Auto Slot Release** - Background job frees slots automatically

## Setup & Run

### 1. MongoDB
Ensure MongoDB is running locally or update `.env` with your connection string.

### 2. Backend (Node.js)
```bash
cd backend
npm install
node server.js
```
Runs on `http://localhost:5000`

### 3. Java Service
```bash
cd parking-validator
mvn spring-boot:run
```
Runs on `http://localhost:8080`

### 4. Frontend (React)
```bash
cd myapp2/myapp
npm install
npm start
```
Runs on `http://localhost:3000`

## Environment Variables

Create `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017/smart_parking
JWT_SECRET=your_secret_key
PORT=5000
JAVA_VALIDATOR_URL=http://localhost:8080/api
```

## Key Technologies

- **Backend**: Node.js, Express, MongoDB, Socket.IO, JWT
- **Java**: Spring Boot, Maven
- **Frontend**: React, Socket.IO Client
- **Tools**: bcrypt, axios, node-cron

## Admin Login

Email: `admin@parking.com`  
Password: `admin123`

## Documentation

- `milestone1_2_integrated.md` - Complete project report
- `parking-validator/README.md` - Java service documentation

---

**Built for Infosys Springboard Internship - Java Tech Domain**
