# SmartPark Backend API

Base URL (local): http://localhost:3000

This document lists the server API endpoints, expected payloads and example responses for the SmartPark backend found in `src/routes` and `src/controllers`.

---

## Authentication / User

### POST /user/register
- Content-Type: multipart/form-data
- File field: `vehiclePhoto` (single file)
- Purpose: Register a new user (optionally upload a vehicle photo)

Request body (JSON example):
```
{
  "userId": "u123",           
  "name": "Alice",
  "email": "alice@example.com",
  "phone": "9123456789",
  "password": "secret",
  "role": "driver",          
  "plateNumber": "KA01AB1234",
  "vehicleType": "car",
  "brand": "Toyota",
  "homeLat": 12.9716,
  "homeLon": 77.5946,
  "homeLabel": "Home",
  "officeLat": 12.9352,
  "officeLon": 77.6245,
  "officeLabel": "Office",
  "maxPricePerHour": 100
}
```

Note: this endpoint accepts multipart/form-data when uploading a file. Include the above fields as form fields and attach the file under the `vehiclePhoto` field. When sending JSON-only requests (no file), send the same shape as application/json.

Successful response (201):
{
  "success": true,
  "message": "User registered successfully",
  "user": { /* user object saved in DB */ }
}

Errors:
- 400 Validation errors (list of messages)
- 500 Server error

---

### POST /user/login/:firebaseId
- Params: `firebaseId` (in URL)
- Purpose: Find a user by `userId` derived from firebaseId (simple lookup)
- No body required

Successful response (200):
{
  "user": { /* user object or null */ }
}

Errors:
- 500 User not found or server error

---

## Parking spaces

### POST /parking/create
- Content-Type: multipart/form-data
- File field: `photos` (array, up to 5 files)
- Purpose: Create a parking space with optional photos

Request body (JSON example):
```
{
  "ownerId": "u123",            
  "title": "MG Road Parking",
  "description": "Covered parking near MG Road",
  "address": "123 MG Road, Bangalore",
  "landmark": "Near Central Mall",
  "lat": 12.9716,
  "lon": 77.5946,
  "hourlyRate": 50,
  "dailyRate": 350,
  "supportedVehicleTypes": ["car","bike"]
}
```

Note: to upload photos include the above fields as form-data fields and attach files under the `photos` key (array). When sending JSON-only requests (no files), use the same JSON shape as application/json.

Notes:
- Uploaded photos are available in `req.files` and their `path` is stored as photo URLs.

Successful response (201):
{
  "success": true,
  "message": "Parking space created successfully",
  "data": { /* parking space document */ }
}

Errors:
- 400 Validation error
- 500 Server error

---

### POST /parking/addSlot
- Purpose: Add one or more slots to an existing parking space
- Content-Type: application/json

Request body:
{
  "spaceId": "<parkingSpaceId>",
  "slots": [
    {
      "slotNumber": "A1",
      "vehicleType": "car", // optional, default "car"
      "pricePerHour": 50 // optional
    }
  ]
}

Successful response (201):
{
  "success": true,
  "message": "<n> slots added successfully",
  "data": [ /* created slot objects */ ]
}

Errors:
- 400 Validation error
- 404 Space not found
- 500 Server error

---

### GET /parking/getNearby?lat=<lat>&lon=<lon>&maxDistance=<meters>
- Purpose: Find nearby parking spaces with available slots
- Query params:
  - lat (required)
  - lon (required)
  - maxDistance (optional, default 2000 meters)

Successful response (200):
{
  "success": true,
  "message": "Nearby parking spaces found",
  "count": <n>,
  "data": [ /* array of nearby parking spaces with slotDetails */ ]
}

Errors:
- 400 missing lat/lon
- 404 none found
- 500 server error

---

## Booking

### POST /booking/bookSlot
- Content-Type: application/json
- Purpose: Reserve a parking slot in a zone/parking space

Request body:
{
  "userId": "<userId>",
  "zoneId": "<parkingSpaceId>",
  "departureLocation": { "lat": <num>, "lon": <num> },
  "destinationLocation": { "lat": <num>, "lon": <num> },
  "ETA": "<ISO date string>",
  "timeOfBooking": "<ISO date string>" // optional
}

Successful response (201):
{
  "success": true,
  "message": "Parking slot booked successfully",
  "data": {
    "bookingId": "<id>",
    "zoneId": "<id>",
    "slotId": "<id>",
    "ETA": "<ISO>",
    "bookingToken": "<JWT token>"
  }
}

Errors:
- 400 validation or no available slots
- 404 parking space not found
- 500 server error

---

### POST /booking/startSession
- Content-Type: application/json
- Purpose: Start an active parking session using a booking token
- Accepts `bookingToken` in request body OR headers

Request body example:
{ "bookingToken": "<JWT from booking response>" }

Successful response (200):
{
  "success": true,
  "message": "Parking session started successfully",
  "data": {
    "bookingId": "<id>",
    "slotId": "<id>",
    "zoneId": "<id>",
    "checkInTime": "<ISO>",
    "parkingToken": "<JWT for parking session>"
  }
}

Errors:
- 400 missing token
- 401 invalid or expired booking token
- 404 booking/session/slot not found
- 500 server error

---

# POST /booking/cancelSession

### Overview
Cancel an active booking session before it begins and release the reserved parking slot.  
This endpoint invalidates the current booking, frees the slot, and updates the available slot count in the corresponding parking zone.

---

### Request

- **Method:** `POST`  
- **URL:** `/booking/cancelSession`  
- **Content-Type:** `application/json`  
- **Purpose:** Cancel a parking booking using a valid booking token.  
- **Accepts:** `bookingToken` in the **request body** or **headers**.  

---

### Request Body Example

```json
{
  "bookingToken": "<JWT from booking response>"
}

```


```
Successful Response (200)
{
  "success": true,
  "message": "Booking session cancelled and deleted successfully",
  "data": {
    "bookingId": "<id>",
    "slotId": "<id>",
    "zoneId": "<id>"
  }
}
```


## Notes & Recommendations

- Files are uploaded using multer + Cloudinary; uploaded files are available on the controller as `req.file` (single) or `req.files` (array). The controllers store `file.path` (Cloudinary URL) in DB.
- Many endpoints expect IDs (userId, spaceId, zoneId, slotId) as strings (MongoDB ObjectId strings). Validate them before using in production.
- Required environment variables (not shown here) include Cloudinary keys, MONGO_URI, BOOKING_SECRET, PARKING_SECRET.
- For production, use HTTPS and secure JWT secret management; avoid printing secrets in logs.

---

If you'd like, I can:
- Add example curl commands for each endpoint.
- Generate a Postman collection or an OpenAPI (Swagger) spec from these controllers.

