# Smart Event Registration and Feedback Management System

A comprehensive digital platform built with Spring Boot that simplifies event organization and participation within institutions. The system enables faculty and coordinators to create events, manage participant registrations, track attendance, and collect structured feedback.

## 🎯 Features

### Core Functionalities
- **User Management**: Role-based authentication (Admin, Organizer, User)
- **Event Management**: Create, update, delete, and manage events
- **Registration System**: Event registration with automatic waitlist management
- **Attendance Tracking**: Mark and track participant attendance
- **Feedback Collection**: Post-event feedback with ratings and comments
- **Real-time Updates**: Event status management and participant tracking

## 🏗️ System Architecture

### Technology Stack
- **Backend**: Spring Boot 3.2.0
- **Database**: H2 (In-memory)
- **Security**: Spring Security with JWT
- **Build Tool**: Maven
- **Java Version**: 17

### Database Schema

#### Tables
1. **users** - User information and credentials
2. **roles** - System roles (USER, ORGANIZER, ADMIN)
3. **user_roles** - User-Role mapping
4. **events** - Event details and metadata
5. **registrations** - Event registrations and attendance
6. **feedbacks** - User feedback and ratings

### Entity Relationships
```
User (1) ----< (N) Event (Organizer)
User (1) ----< (N) Registration
Event (1) ----< (N) Registration
User (1) ----< (N) Feedback
Event (1) ----< (N) Feedback
User (N) ----< (N) Role
```

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

### Installation

1. **Clone or navigate to the project directory**
```bash
cd "f:/java project ws/smart-event-system"
```

2. **Build the project**
```bash
mvn clean install
```

3. **Run the application**
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Accessing H2 Console
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:eventdb`
- Username: `sa`
- Password: `password`

## 📡 API Endpoints

### Authentication Module

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "phone": "1234567890",
  "roles": ["user"]
}
```

#### Login
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["ROLE_USER"]
}
```

### Event Management Module

#### Create Event (Organizer/Admin only)
```http
POST /api/events
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "startDateTime": "2024-12-01T09:00:00",
  "endDateTime": "2024-12-01T17:00:00",
  "location": "Main Auditorium",
  "maxParticipants": 100
}
```

#### Get All Events
```http
GET /api/events
Authorization: Bearer {token}
```

#### Get Event by ID
```http
GET /api/events/{id}
Authorization: Bearer {token}
```

#### Update Event
```http
PUT /api/events/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Event Title",
  "description": "Updated description",
  "startDateTime": "2024-12-01T10:00:00",
  "endDateTime": "2024-12-01T18:00:00",
  "location": "Conference Hall",
  "maxParticipants": 150
}
```

#### Delete Event
```http
DELETE /api/events/{id}
Authorization: Bearer {token}
```

#### Get My Events (Organizer)
```http
GET /api/events/my-events
Authorization: Bearer {token}
```

#### Update Event Status
```http
PATCH /api/events/{id}/status?status=COMPLETED
Authorization: Bearer {token}
```

### Registration Module

#### Register for Event
```http
POST /api/registrations/event/{eventId}
Authorization: Bearer {token}
```

#### Cancel Registration
```http
DELETE /api/registrations/{id}
Authorization: Bearer {token}
```

#### Mark Attendance (Organizer only)
```http
PATCH /api/registrations/{id}/attendance
Authorization: Bearer {token}
```

#### Get Event Registrations (Organizer only)
```http
GET /api/registrations/event/{eventId}
Authorization: Bearer {token}
```

#### Get My Registrations
```http
GET /api/registrations/my-registrations
Authorization: Bearer {token}
```

### Feedback Module

#### Submit Feedback
```http
POST /api/feedbacks
Authorization: Bearer {token}
Content-Type: application/json

{
  "eventId": 1,
  "rating": 5,
  "comment": "Excellent event!"
}
```

#### Get Event Feedbacks
```http
GET /api/feedbacks/event/{eventId}
Authorization: Bearer {token}
```

#### Get My Feedbacks
```http
GET /api/feedbacks/my-feedbacks
Authorization: Bearer {token}
```

#### Get Average Rating
```http
GET /api/feedbacks/event/{eventId}/average-rating
Authorization: Bearer {token}
```

#### Delete Feedback
```http
DELETE /api/feedbacks/{id}
Authorization: Bearer {token}
```

## 🔐 Security

### Roles and Permissions

| Role | Permissions |
|------|------------|
| **ROLE_USER** | Register for events, submit feedback, view events |
| **ROLE_ORGANIZER** | All USER permissions + Create/manage events, mark attendance |
| **ROLE_ADMIN** | All permissions |

### JWT Authentication
- All endpoints (except `/api/auth/**`) require JWT token
- Token expires after 24 hours
- Include token in Authorization header: `Bearer {token}`

## 📊 Business Logic

### Registration Workflow
1. User registers for an event
2. System checks available slots
3. If slots available → Status: CONFIRMED
4. If event full → Status: WAITLISTED
5. On cancellation → Promote first waitlisted user

### Feedback Constraints
- User must be registered for the event
- User must have attended the event
- One feedback per user per event

### Event Status Flow
```
DRAFT → UPCOMING → ONGOING → COMPLETED
                    ↓
                CANCELLED
```

## 🧪 Testing

### Using Postman/Thunder Client

1. **Register a new user** with role "organizer"
2. **Login** to get JWT token
3. **Create an event** using the token
4. **Register another user** with role "user"
5. **Register for the event** as the user
6. **Mark attendance** as organizer
7. **Submit feedback** as user

### Sample Test Data

**Organizer Account:**
```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "password123",
  "roles": ["organizer"]
}
```

**User Account:**
```json
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob@example.com",
  "password": "password123",
  "roles": ["user"]
}
```

## 🎨 Design Patterns Used

- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic separation
- **DTO Pattern**: Data transfer between layers
- **Builder Pattern**: Entity construction
- **Singleton Pattern**: Spring beans

## 📝 Validation Rules

### User Registration
- First name: 2-50 characters
- Last name: 2-50 characters
- Email: Valid email format, unique
- Password: 6-40 characters
- Phone: Optional, max 20 characters

### Event Creation
- Title: Required, max 100 characters
- Start date: Must be in future
- End date: Must be after start date
- Max participants: Minimum 1

### Feedback
- Rating: 1-5 (required)
- Comment: Optional

## 🐛 Error Handling

The system provides comprehensive error handling:

- **400 Bad Request**: Validation errors, business rule violations
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Unexpected errors

## 📈 Future Enhancements

- Email notifications for registrations and reminders
- Event categories and tags
- Advanced search and filtering
- Export attendance reports
- Event capacity analytics
- Multi-language support
- File upload for event images
- Calendar integration

## 👥 Contributors

This project is developed as part of an institutional event management initiative.

## 📄 License

This project is for educational purposes.

---

**Note**: This is a development setup using H2 in-memory database. For production, configure a persistent database like PostgreSQL or MySQL.
