
## Deployment

Demo - https://smart-park-lake.vercel.app/

# SmartPark Predictive Parking System: An Intelligent Solution for Urban Mobility

This proposal presents an **advanced, two-part intelligent transportation system** designed to address the **urban parking challenges** faced by Volkswagen customers.  
By integrating **predictive analytics**, **AI-driven forecasting**, and **secure slot management**, we provide a **seamless, reliable, and futuristic parking experience**.

![](https://github.com/uddalak2005/SmartPark/blob/main/images/big%20picture2.png?raw=true)

---

##  1. Predictive Parking Spot Identification (Forecasting & AI Core)

The **first core component** is an **AI-driven forecasting engine** that predicts **parking space availability** at a specific **location and time**, giving drivers **confidence before they begin their journey**.

###  Technology Stack: A3T-GCN for Spatio-Temporal Forecasting
We leverage the **Attention Temporal Graph Convolutional Network (A3T-GCN)** model for its proven efficiency in **advanced traffic flow and parking availability forecasting**.

####  Core Challenge
Parking availability prediction is a **complex spatio-temporal problem** influenced by:
- **Spatial Correlation** (road network connectivity)
- **Temporal Dynamics** (time-of-day, day-of-week patterns)

####  A3T-GCN Solution
- **Spatial Correlation (GCN):** Models the relationship between adjacent parking areas, learning how nearby traffic and occupancy affect availability.  
- **Temporal Dynamics (GRU + Attention):**  
  - GRU captures short-term trends.  
  - Attention Mechanism weighs long-term patterns (e.g., last Tuesday’s 9 AM behavior) to boost prediction accuracy.  

####  Input Parameters
Our model ingests both **real-time** and **historical data**:
- Real-time congestion data  
- Historical car movement patterns (aggregated & anonymized)  
- Time-series data for parking occupancy (historical & live)  
- External factors like weather and local events  

####  Value Proposition for Volkswagen
- **Enhanced Customer Experience:**  
  Drivers receive accurate forecasts, reducing the stress and time spent searching for parking.  
- **Data-Driven Services:**  
  The prediction engine powers **Smart City integration**, **route optimization**, and **in-vehicle parking assistance** in VW’s operating systems.

---

##  2. Controlled Occupancy & Anti-Fraud System (Allocation & Security)

The **second component** ensures **secure and guaranteed access** to parking slots through digital verification and **AI-driven monitoring**.

### A.  Guaranteed Slot Allocation via QR-Token Matching

#### How It Works:

1. **Crowd-Sourced Parking Prediction Network:**  
   Instead of owning or leasing spaces, We are using **AI-driven prediction models** that analyze **crowd-sourced data, congestion levels, satellite imagery, and historical patterns** to identify **likely available parking zones** in real time.  

2. **Static QR Code:**  
   Each identified or partner parking spot is tagged with a **permanent static QR code** for quick identification and tracking.  

3. **Unique Token System:**  
   - When a user books a predicted slot through the SmartPark app:  
     - A **unique, time-bound token** is generated and linked to that QR code’s ID.  
     - The same token is sent to the user’s app.  
   - On arrival, the user **scans the QR code**:  
     - If **server-token = app-token**, the parking session begins.  
     - This ensures **authenticity** and prevents **QR fraud or link sharing**.


---

### B.  Illegal Parking Conversion & Security Monitoring

We turn **illegal parking** into an **opportunity for customer conversion and system integrity**.

####  Illegal Parking Mitigation:
- Each parking area displays a **contact number** connected to an **AI Agent**.  
- When an unauthorized driver calls:
  - The AI Agent attempts to **book the spot instantly** (if available).  
  - If occupied or reserved, it **redirects to the nearest available legal spot**,  
    converting an illegal parker into a paying customer.

####  Real-Time Occupancy & Security Monitoring (YOLOv11)
A **YOLOv11-based detection system** monitors and validates slot usage.

##### Detection Capabilities:
- **Occupancy Check:** Counts vacant vs. occupied spaces in real time.  
- **Fraud Detection:** Flags discrepancies (e.g., unauthorized or unrecognized vehicles).  
- **Anomaly Alerts:** “Area X has 5 spaces, but camera detects only 4 empty — possible illegal occupation.”

---

##  Payments Integration
To ensure smooth and secure transactions, we integrate **Razorpay Payment Gateway** for:
- Instant digital payments  
- Subscription-based parking  
- Secure refunds and cancellations  

---

##  Priority Parking for Emergency Vehicles
Our system reserves **priority parking** for:
- **Emergency Vehicles** (ambulance, fire services, police)
- **Authorized Service Units** (maintenance or rescue vehicles)

These slots are dynamically monitored and **always kept available** when required.

---

##  Future Plans & Expansions

- **Adult Support Integration:**  
  Assistive parking guidance for elderly or physically challenged drivers.  
- **Expanded Predictive AI:**  
  Integrate city-wide IoT sensors for higher accuracy.  
- **EV Integration:**  
  Add **EV charging availability forecasting** alongside parking prediction.  
- **Smart City Collaboration:**  
  Open APIs for urban mobility partners and traffic authorities.

---

##  Value Proposition Summary

| Feature | Impact |
|----------|---------|
| **A3T-GCN Forecasting** | Accurate, data-driven parking availability prediction |
| **QR-Token Security** | Eliminates fraud and unauthorized parking |
| **YOLOv11 Monitoring** | Real-time validation and anomaly detection |
| **Razorpay Payments** | Fast, secure, and integrated transactions |
| **Emergency & Adult Support** | Inclusivity and social responsibility |
| **Smart City Ready** | Enables VW’s expansion into urban AI ecosystems |

---

###  In a Nutshell:
> The **SmartPark Predictive Parking System** is a **fusion of AI forecasting, real-time security, and customer-first design** — enabling Volkswagen to redefine urban mobility through **predictive intelligence**, **trust**, and **innovation**.



## Screenshots

![ML Metrices](https://github.com/uddalak2005/SmartPark/blob/main/images/Screenshot%202025-11-09%20230021.png?raw=true)

![Accuracy Metrices](https://github.com/uddalak2005/SmartPark/blob/main/images/WhatsApp%20Image%202025-11-10%20at%2021.17.46.jpeg?raw=true)

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

