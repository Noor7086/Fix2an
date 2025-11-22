# Fixa2an Backend API Endpoints

Base URL: `http://localhost:4000`

All APIs are accessible via Thunder Client, Postman, or any API testing tool.

## Health Check
- **GET** `/health` - Check if backend is running
  - Response: `{ "status": "ok" }`

## Authentication
- **POST** `/api/auth/register` - Register a new user
  - Body: `{ name, email, password, phone?, address?, city?, postalCode?, role? }`
  - Response: `{ message, userId }`

## Vehicles
- **POST** `/api/vehicles` - Create a new vehicle
  - Body: `{ customerId, make, model, year, registrationNumber }`

## Upload
- **POST** `/api/upload` - Upload files (images/documents)
  - Content-Type: `multipart/form-data`
  - Body: FormData with file

## Inspection Reports
- **POST** `/api/inspection-reports` - Create inspection report
- **GET** `/api/inspection-reports/:id` - Get report by ID

## Requests
- **POST** `/api/requests` - Create a new request
  - Body: `{ vehicleId, reportId, description, latitude, longitude, address, city, postalCode, customerId }`
- **GET** `/api/requests/customer/:customerId` - Get all requests for a customer
- **GET** `/api/requests/:id` - Get request by ID

## Offers
- **POST** `/api/offers` - Create a new offer
  - Body: `{ requestId, userId, price, note, estimatedDuration, warranty, availableDates }`
- **GET** `/api/offers/requests/available` - Get available requests for workshops
  - Query params: `latitude?, longitude?, radius?`
- **GET** `/api/offers/request/:requestId` - Get offers for a request
- **GET** `/api/offers/:id` - Get offer by ID

## Bookings
- **POST** `/api/bookings` - Create a booking
  - Body: `{ offerId, customerId, scheduledDate }`
- **GET** `/api/bookings/customer/:customerId` - Get bookings for a customer
- **PATCH** `/api/bookings/:id` - Update booking status
  - Body: `{ status }`

## Admin Endpoints

### Stats
- **GET** `/api/admin/stats` - Get overall statistics
  - Response: `{ totalCustomers, totalWorkshops, pendingWorkshops, totalRequests, totalBookings, totalRevenue, monthlyRevenue }`

### Users (Customers)
- **GET** `/api/admin/users` - Get all users
  - Query params: `role?, search?, page?, limit?`
- **PATCH** `/api/admin/users/:id` - Update user status
  - Body: `{ isActive }`

### Workshops
- **GET** `/api/admin/pending-workshops` - Get pending workshops
- **GET** `/api/admin/workshops` - Get all workshops
  - Query params: `verified?, active?, search?, page?, limit?`
- **GET** `/api/admin/workshops/:id` - Get workshop by ID
- **PATCH** `/api/admin/workshops` - Update workshop status
  - Body: `{ id, isVerified?, isActive? }`

### Requests
- **GET** `/api/admin/requests` - Get all requests
  - Query params: `status?, search?, page?, limit?`
- **PATCH** `/api/admin/requests` - Update request status
  - Body: `{ id, status }`

### Offers
- **GET** `/api/admin/offers` - Get all offers
  - Query params: `status?, search?, page?, limit?`

### Bookings
- **GET** `/api/admin/bookings` - Get all bookings
  - Query params: `status?, search?, page?, limit?`

### Payouts
- **GET** `/api/admin/payouts` - Get payout reports
  - Query params: `month?, year?`
- **POST** `/api/admin/payouts/generate` - Generate monthly payout reports
  - Body: `{ month, year }`
- **PATCH** `/api/admin/payouts/:id/mark-paid` - Mark payout as paid

## Notes

1. **CORS Enabled**: Backend accepts requests from any origin
2. **JSON Format**: All requests/responses use JSON
3. **Authentication**: Currently, most endpoints don't enforce authentication at the backend level (relying on frontend checks). For production, you should add authentication middleware.
4. **Error Responses**: All errors return JSON with `message` field
5. **Pagination**: List endpoints support `page` and `limit` query parameters

## Example Thunder Client Setup

1. Base URL: `http://localhost:4000`
2. Headers: `Content-Type: application/json`
3. For file uploads: Use `multipart/form-data`

## Testing Examples

### Health Check
```
GET http://localhost:4000/health
```

### Register User
```
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "CUSTOMER"
}
```

### Get Admin Stats
```
GET http://localhost:4000/api/admin/stats
```

### Get Users
```
GET http://localhost:4000/api/admin/users?page=1&limit=10&search=test
```

