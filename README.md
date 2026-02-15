# 🚗 Team A - ParkEase (Smart Parking System)

A comprehensive team-developed full-stack parking management solution with real-time slot availability, automated payment processing, and interactive mapping features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Team](#team)

## 🎯 Overview

Team A - ParkEase is a modern parking management system designed to streamline the parking experience for both users and administrators. This project was developed as a collaborative effort to solve urban parking challenges through real-time slot availability, automated check-in/check-out, dynamic pricing, and comprehensive analytics.

## ✨ Features

### User Features
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access control
- 🗺️ **Interactive Map** - Real-time parking slot visualization using Leaflet
- 📍 **Location-Based Search** - Filter slots by city, area, and place type
- ⏰ **Real-Time Updates** - Live slot availability via Socket.IO
- 🎫 **Digital QR Tickets** - Scannable e-tickets for bookings
- 💳 **Multiple Payment Methods** - UPI, Credit Card, PayPal support
- 📊 **Booking History** - Track all past and current bookings
- 🌓 **Dark Mode** - Eye-friendly dark theme support
- 📱 **Responsive Design** - Optimized for mobile and desktop

### Admin Features
- 📈 **Analytics Dashboard** - Revenue tracking and booking statistics
- 👥 **User Management** - View and manage registered users
- 🅿️ **Slot Management** - Create, update, and monitor parking slots
- ⚠️ **Alert System** - Create and manage slot/area alerts
- 📄 **Report Generation** - Downloadable CSV reports
- 💰 **Revenue Tracking** - Real-time revenue analytics with charts

### Technical Features
- ⚡ **Real-Time Communication** - WebSocket-based live updates
- 🔒 **Security** - Helmet, rate limiting, input validation
- 📝 **Professional Logging** - Winston logger with file rotation
- 🗄️ **Database Optimization** - Indexed queries for performance
- 🛡️ **Error Handling** - Centralized error management
- 🔄 **Auto Slot Release** - Automated cleanup of expired bookings

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI library
- **Leaflet** - Interactive maps
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations
- **React QR Code** - QR ticket generation

### Backend
- **Spring Boot 3.2** - Java backend framework
- **Spring Data MongoDB** - MongoDB integration
- **Spring WebSocket** - Real-time updates via STOMP
- **Spring Security** - Authentication and authorization
- **JWT** - Token-based authentication
- **BCrypt** - Password hashing
- **SLF4J/Logback** - Logging framework
- **Spring Validation** - Input validation
- **Spring Scheduling** - Automated tasks (slot release)
- **Maven** - Dependency management

### Security & DevOps
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │ ← Frontend
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─── HTTP/REST ────┐
         │                  │
         └─── WebSocket ────┤
                            │
                     ┌──────▼──────────┐
                     │  Spring Boot    │ ← Backend
                     │   (Port 8080)   │
                     └──────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
     ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
     │ MongoDB │      │ WebSocket│      │Scheduler│
     │  Atlas  │      │   STOMP  │      │  Tasks  │
     └─────────┘      └─────────┘      └─────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Java 17+ (for validator service)
- Maven 3.6+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Manasa-bejugam/Team-A---ParkEase.git
cd Team-A---ParkEase
```

2. **Backend Setup (Spring Boot)**
```bash
cd parking-validator
# Edit src/main/resources/application.properties with your MongoDB URI
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

3. **Frontend Setup**
```bash
cd myapp2/myapp
npm install
npm start
```

Frontend runs on `http://localhost:3000`

### Quick Start Script
```bash
# Run all services at once (Windows)
run_all.bat

# Or manually:
# Terminal 1: Spring Boot Backend
cd parking-validator && mvn spring-boot:run

# Terminal 2: React Frontend
cd myapp2/myapp && npm start
```

### Admin Access

1. Start the Spring Boot backend
2. Use the `/api/admin/generate-invite` endpoint (if available)
3. Or register with role "user" first, then manually update the role in MongoDB to "admin"

**Default Test Admin** (if seeded):
- Email: `admin@parking.com`  
- Password: `admin123`

**Note**: The backend automatically seeds sample data on first startup.

## 🔐 Configuration

### Backend (application.properties)
```properties
# Server Configuration
server.port=8080

# MongoDB Configuration
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/smartparking

# JWT Configuration
jwt.secret=your_super_secret_jwt_key_min_64_chars_for_hs512_algorithm
jwt.expiration=86400000

# Logging
logging.level.com.parking.validator=DEBUG
```

### Frontend (config.js)
```javascript
export const BACKEND_URL = isDevelopment
  ? 'http://localhost:8080'
  : 'https://your-production-backend-url.com';
  
export const API_BASE_URL = `${BACKEND_URL}/api`;
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/update-profile` - Update profile

### Slots
- `GET /api/slots` - Get all slots
- `POST /api/slots` - Create slot (admin)
- `PUT /api/slots/:id` - Update slot (admin)
- `DELETE /api/slots/:id` - Delete slot (admin)

### Bookings
- `POST /api/bookings/create` - Create booking
- `GET /api/bookings/my-bookings` - User's bookings
- `POST /api/bookings/:id/check-in` - Check in
- `POST /api/bookings/:id/check-out` - Check out
- `GET /api/bookings/:id/fee-details` - Get fee details

### Payments
- `POST /api/payments/process` - Process payment

### Analytics (Admin)
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/activity` - Recent activity

### Reports (Admin)
- `GET /api/reports/usage` - Usage report
- `GET /api/reports/revenue` - Revenue report

## 🧪 Testing

### Manual Testing
1. Register a new user
2. Login with credentials
3. Book a parking slot
4. Check in to the slot
5. Check out from the slot
6. Process payment
7. Verify payment status
8. Check admin dashboard for revenue

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Team

**Team A - ParkEase**
- **Manasa Bejugam** - Lead Developer ([@Manasa-bejugam](https://github.com/Manasa-bejugam))
- **Vishnu Chaithanya** - [GitHub](https://github.com/vishnuchaithanya1)
- **Sathvika** - [GitHub](https://github.com/Sathvika2955)
- **Sandeep** - [GitHub](https://github.com/YedelliSandeep010)
- **Boomika** - [GitHub](https://github.com/BoomikaSanthos)

Developed collaboratively by Team A.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**⭐ If you found this project helpful, please give it a star!**