# Parking Analytics & Validation Service - Java Spring Boot

A comprehensive Java Spring Boot microservice for parking slot validation, analytics, and payment calculation.

## Features
- ✅ Vehicle number validation
- ✅ Booking time range validation
- ✅ Minimum/maximum duration checks
- 📊 **Analytics & Reporting** (Revenue, Peak Hours, Slot Usage)
- 💰 **Payment Calculation** (₹20/hour base rate)
- ✅ REST API endpoints for Node.js integration

## Prerequisites
- Java 17 or higher
- Maven 3.6+

## Running the Service

```bash
# Navigate to the parking-validator directory
cd parking-validator

# Run with Maven
mvn spring-boot:run
```

The service will start on **http://localhost:8080**

## API Endpoints

### Health Check
```
GET /api/health
```

### Slot Validation
```
POST /api/validate-slot
Content-Type: application/json

{
  "slotId": "507f1f77bcf86cd799439011",
  "slotNumber": "A1",
  "vehicleNumber": "ABC123",
  "startTime": "2025-12-24T10:00:00",
  "endTime": "2025-12-24T12:00:00"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Slot A1 is valid for booking",
  "slotNumber": "A1"
}
```

### Analytics Statistics
```
POST /api/analytics/stats
Content-Type: application/json

{
  "bookings": [
    {
      "id": "...",
      "slotNumber": "A1",
      "vehicleNumber": "ABC123",
      "startTime": "2025-12-24T10:00:00",
      "endTime": "2025-12-24T12:00:00",
      "status": "BOOKED"
    }
  ]
}
```

**Response:**
```json
{
  "totalBookings": 10,
  "activeBookings": 3,
  "completedBookings": 7,
  "totalRevenue": 450.00,
  "averageDuration": 2.5,
  "peakHour": "14:00 - 15:00",
  "slotUsage": {
    "A1": 5,
    "A2": 3,
    "B1": 2
  }
}
```

### Payment Calculation
```
POST /api/analytics/calculate-payment
Content-Type: application/json

{
  "startTime": "2025-12-24T10:00:00",
  "endTime": "2025-12-24T12:30:00"
}
```

**Response:**
```json
{
  "amount": 50.00,
  "durationHours": 2.5,
  "breakdown": "2.50 hours × ₹20.00/hour = ₹50.00"
}
```

## Validation Rules
1. Vehicle number must be at least 3 characters
2. Start time cannot be in the past
3. End time must be after start time
4. Minimum booking duration: 30 minutes
5. Maximum booking duration: 24 hours

## Pricing
- **Base Rate**: ₹20 per hour
- Calculated based on exact duration
- Rounded to 2 decimal places

## Integration with Node.js Backend
The Node.js backend calls this service for:
1. **Slot validation** before confirming bookings (REQUIRED - no fallback)
2. **Analytics** for admin dashboard
3. **Payment calculation** for booking fees

## Architecture
This microservice demonstrates:
- **REST API development** with Spring Boot
- **Service layer architecture** with business logic separation
- **DTO pattern** for data transfer
- **Microservices integration** with Node.js
- **Business intelligence** features (analytics & reporting)

## Technologies Used
- Java 17
- Spring Boot 3.x
- Maven
- Jackson (JSON processing)

