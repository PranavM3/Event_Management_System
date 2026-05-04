# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Build and Run

```bash
cd "f:/java project ws/smart-event-system"
mvn clean install
mvn spring-boot:run
```

The application will start at: `http://localhost:8080`

### Step 2: Access H2 Console (Optional)

Visit: `http://localhost:8080/h2-console`

**Connection Details:**
- JDBC URL: `jdbc:h2:mem:eventdb`
- Username: `sa`
- Password: `password`

---

## 📝 Test the Application

### Using Postman or Thunder Client

#### 1. Register an Organizer

**POST** `http://localhost:8080/api/auth/signup`

```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "email": "alice@example.com",
  "password": "password123",
  "roles": ["organizer"]
}
```

#### 2. Login as Organizer

**POST** `http://localhost:8080/api/auth/signin`

```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Copy the `token` from response!**

#### 3. Create an Event

**POST** `http://localhost:8080/api/events`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Java Workshop 2024",
  "description": "Learn Spring Boot fundamentals",
  "startDateTime": "2024-12-15T10:00:00",
  "endDateTime": "2024-12-15T16:00:00",
  "location": "Computer Lab 101",
  "maxParticipants": 30
}
```

#### 4. Register a User

**POST** `http://localhost:8080/api/auth/signup`

```json
{
  "firstName": "Bob",
  "lastName": "Johnson",
  "email": "bob@example.com",
  "password": "password123",
  "roles": ["user"]
}
```

#### 5. Login as User

**POST** `http://localhost:8080/api/auth/signin`

```json
{
  "email": "bob@example.com",
  "password": "password123"
}
```

**Copy the new `token`!**

#### 6. Register for Event

**POST** `http://localhost:8080/api/registrations/event/1`

**Headers:**
```
Authorization: Bearer USER_TOKEN_HERE
```

#### 7. Mark Attendance (as Organizer)

**PATCH** `http://localhost:8080/api/registrations/1/attendance`

**Headers:**
```
Authorization: Bearer ORGANIZER_TOKEN_HERE
```

#### 8. Submit Feedback (as User)

**POST** `http://localhost:8080/api/feedbacks`

**Headers:**
```
Authorization: Bearer USER_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "eventId": 1,
  "rating": 5,
  "comment": "Excellent workshop! Learned a lot."
}
```

#### 9. View Event Feedbacks

**GET** `http://localhost:8080/api/feedbacks/event/1`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 🎯 Common Use Cases

### For Organizers

1. **View My Events**
   ```
   GET /api/events/my-events
   ```

2. **View Event Registrations**
   ```
   GET /api/registrations/event/{eventId}
   ```

3. **Update Event Status**
   ```
   PATCH /api/events/{id}/status?status=COMPLETED
   ```

### For Users

1. **View All Events**
   ```
   GET /api/events
   ```

2. **View My Registrations**
   ```
   GET /api/registrations/my-registrations
   ```

3. **View My Feedbacks**
   ```
   GET /api/feedbacks/my-feedbacks
   ```

---

## 🔑 Default Roles

| Role | Can Do |
|------|--------|
| **user** | Register for events, submit feedback |
| **organizer** | Create/manage events, mark attendance |
| **admin** | Full access to all features |

---

## 💡 Tips

1. **JWT Token Expires:** Tokens last 24 hours. Login again if expired.

2. **Event Status Flow:**
   - Create event → Status: `UPCOMING`
   - Start event → Change to: `ONGOING`
   - End event → Change to: `COMPLETED`

3. **Registration Logic:**
   - If event has space → Status: `CONFIRMED`
   - If event is full → Status: `WAITLISTED`
   - Cancel registration → First waitlisted gets promoted

4. **Feedback Rules:**
   - Must be registered for the event
   - Must have attended (marked by organizer)
   - One feedback per user per event

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in application.properties
server.port=8081
```

### Cannot Connect to H2
- Ensure application is running
- Check JDBC URL matches: `jdbc:h2:mem:eventdb`

### 401 Unauthorized
- Check if token is included in Authorization header
- Verify token format: `Bearer {token}`
- Token might be expired - login again

### 403 Forbidden
- Check if your role has permission for the endpoint
- Organizers can only modify their own events

---

## 📚 Next Steps

1. Read full [API Documentation](API_DOCUMENTATION.md)
2. Check [README.md](README.md) for detailed information
3. Explore H2 console to see database structure
4. Try creating multiple events and users
5. Test the waitlist functionality

---

## 🎓 Learning Resources

### Spring Boot
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)

### JWT Authentication
- [JWT.io](https://jwt.io/)
- [Spring Security JWT](https://www.baeldung.com/spring-security-oauth-jwt)

### H2 Database
- [H2 Database Documentation](https://www.h2database.com/)

---

Happy Coding! 🎉
