# 🚗 Smart Parking System

A comprehensive full-stack parking management solution with real-time slot availability, automated payment processing, and interactive mapping features.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## 🎯 Overview

Smart Parking is a modern parking management system designed to streamline the parking experience for both users and administrators. The application provides real-time slot availability, automated check-in/check-out, dynamic pricing, and comprehensive analytics.

**Live Application**: [https://smart-parking-brown.vercel.app](https://smart-parking-brown.vercel.app)

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
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Winston** - Logging
- **Express Validator** - Input validation

### Microservices
- **Java Spring Boot** - Booking validation service
- **Maven** - Dependency management

### Security & DevOps
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **Morgan** - HTTP request logging
- **CORS** - Cross-origin resource sharing
- **Vercel** - Frontend deployment
- **Render/Railway** - Backend deployment

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │ ← Frontend (Vercel)
│   (Port 3000)   │
└────────┬────────┘
         │
         ├─── HTTP/REST ────┐
         │                  │
         └─── WebSocket ────┤
                           │
                    ┌──────▼──────┐
                    │  Express    │ ← Backend (Render)
                    │  (Port 5000)│
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ MongoDB │      │  Java   │      │ Socket  │
    │         │      │Validator│      │   IO    │
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
git clone https://github.com/Manasa-bejugam/smartParking.git
cd smartParking
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm start
```

3. **Frontend Setup**
```bash
cd myapp2/myapp
npm install
npm start
```

4. **Java Validator Service** (Optional)
```bash
cd parking-validator
mvn spring-boot:run
```

### Quick Start Script
```bash
# Run all services at once (Windows)
run_all.bat

# Or manually:
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd myapp2/myapp && npm start

# Terminal 3: Validator
cd parking-validator && mvn spring-boot:run
```

### 4. Frontend (React)
```bash
cd myapp2/myapp
npm install
npm start
```
Runs on `http://localhost:3000`

### 5. Generate Admin Invite Token (Required for Admin Registration)
```bash
cd backend
node generateInvite.js
```
This will generate a 24-hour valid admin invite token and save it to `invite_token.txt`. Use this token when registering as an admin.

**Note**: The token expires after 24 hours for security. Generate a new one if needed.

## Admin Access

To create an admin account:
1. Generate an admin invite token: `node backend/generateInvite.js`
2. Copy the token from `backend/invite_token.txt`
3. Register with role "admin" and paste the token in the admin secret field
4. Login with your admin credentials

**Default Test Admin** (if seeded):
- Email: `admin@parking.com`  
- Password: `admin123`

## 🔐 Environment Variables

### Backend (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/smartparking
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
PORT=5000
NODE_ENV=development
JAVA_VALIDATOR_URL=http://localhost:8080/api/validate-slot
JAVA_ANALYTICS_URL=http://localhost:8080/api/analytics
```

### Frontend (config.js)
```javascript
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend.onrender.com/api'
  : 'http://localhost:5000/api';
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

## 🌐 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Add environment variables
6. Deploy

### Backend (Render/Railway)
1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables
6. Deploy

## 📸 Screenshots

### User Dashboard
![User Dashboard](docs/screenshots/user-dashboard.png)

### Interactive Map
![Map View](docs/screenshots/map-view.png)

### Admin Analytics
![Admin Dashboard](docs/screenshots/admin-dashboard.png)

### QR Ticket
![QR Ticket](docs/screenshots/qr-ticket.png)

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

### API Testing
Use the provided Thunder Client/Postman collection in `/docs/api-collection.json`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Manasa Bejugam**
- GitHub: [@Manasa-bejugam](https://github.com/Manasa-bejugam)
- Project Link: [https://github.com/Manasa-bejugam/smartParking](https://github.com/Manasa-bejugam/smartParking)

## 🙏 Acknowledgments

- Leaflet for mapping functionality
- Socket.IO for real-time features
- MongoDB Atlas for database hosting
- Vercel for frontend hosting
- React community for excellent documentation

---

**⭐ If you found this project helpful, please give it a star!**
