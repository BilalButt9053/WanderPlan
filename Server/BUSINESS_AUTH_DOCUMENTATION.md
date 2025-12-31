# Business Authentication System with Admin Approval

## Overview
This system implements a complete business registration and authentication flow that requires admin approval before businesses can access the platform.

## Architecture

### Database Models

#### Business Model (`business-modal.js`)
- Stores all business information
- Fields:
  - `businessName`: Name of the business
  - `ownerName`: Owner's full name
  - `email`: Business email (unique)
  - `password`: Hashed password
  - `phone`: Contact phone number
  - `businessType`: Type of business (hotel, restaurant, tour, etc.)
  - `address`: Business address object
  - `documents`: Array of uploaded documents
  - `status`: pending | approved | rejected | suspended
  - `isVerified`: Email verification status
  - `subscription`: Subscription plan details
  - `approvedBy`: Admin who approved the business
  - `approvedAt`: Approval timestamp
  - `rejectionReason`: Reason if rejected

### API Endpoints

#### Business Authentication Routes (`/api/business`)

1. **POST `/api/business/register`**
   - Register a new business
   - Sends OTP for email verification
   - Sets status to 'pending'
   - Body:
     ```json
     {
       "businessName": "string",
       "ownerName": "string",
       "email": "string",
       "password": "string",
       "phone": "string",
       "businessType": "hotel|restaurant|tour|activity|transport|other",
       "address": {
         "street": "string",
         "city": "string",
         "state": "string",
         "country": "string",
         "zipCode": "string"
       }
     }
     ```

2. **POST `/api/business/verify-email`**
   - Verify business email with OTP
   - Body:
     ```json
     {
       "businessId": "string",
       "otp": "string"
     }
     ```

3. **POST `/api/business/login`**
   - Business login
   - Returns token only if status is 'approved'
   - Returns appropriate message for pending/rejected/suspended status
   - Body:
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```

4. **GET `/api/business/profile`**
   - Get business profile (requires authentication)
   - Headers: `Authorization: Bearer <token>`

#### Admin Business Management Routes (`/api/admin/businesses`)

All routes require admin authentication:
- Headers: `Authorization: Bearer <admin-token>`

1. **GET `/api/admin/businesses`**
   - Get all businesses
   - Optional query param: `?status=pending|approved|rejected|suspended`

2. **GET `/api/admin/businesses/stats`**
   - Get business statistics
   - Returns counts by status

3. **GET `/api/admin/businesses/:id`**
   - Get single business details

4. **POST `/api/admin/businesses/:id/approve`**
   - Approve a pending business
   - Sends approval email to business

5. **POST `/api/admin/businesses/:id/reject`**
   - Reject a business application
   - Body:
     ```json
     {
       "reason": "string"
     }
     ```
   - Sends rejection email with reason

6. **POST `/api/admin/businesses/:id/suspend`**
   - Suspend an approved business
   - Body:
     ```json
     {
       "reason": "string"
     }
     ```

7. **PATCH `/api/admin/businesses/:id`**
   - Update business details
   - Cannot update: password, status, approvedBy, approvedAt

8. **DELETE `/api/admin/businesses/:id`**
   - Delete a business

## Business Registration Flow

### Step 1: Business Registration
1. Business fills registration form
2. Server creates business with `status: 'pending'` and `isVerified: false`
3. OTP generated and sent to business email
4. Business receives email with OTP

### Step 2: Email Verification
1. Business enters OTP
2. Server verifies OTP
3. Business marked as `isVerified: true`
4. Status remains 'pending' (awaiting admin approval)

### Step 3: Admin Review
1. Admin logs into admin dashboard
2. Views pending businesses
3. Reviews business details and documents
4. Approves or rejects business

### Step 4: Business Login
1. If **approved**: Business can login and access dashboard
2. If **pending**: Cannot login, shown "Pending approval" message
3. If **rejected**: Cannot login, shown rejection reason
4. If **suspended**: Cannot login, shown suspension message

## Email Notifications

### Registration Email
- Sent immediately after registration
- Contains OTP for email verification
- Mentions admin approval requirement

### Approval Email
- Sent when admin approves business
- Contains login link to business dashboard
- Welcome message

### Rejection Email
- Sent when admin rejects business
- Contains rejection reason
- Contact support information

## Security Features

1. **Password Hashing**: Bcrypt with 10 salt rounds
2. **JWT Tokens**: 30-day expiration
3. **Token Verification**: Middleware checks business authentication
4. **Status Checks**: Login blocked for non-approved businesses
5. **Admin-Only Routes**: Business management requires admin privileges

## Integration with Business Dashboard

### Frontend Integration

1. **Signup Page** (`/signup`)
   - Calls `/api/business/register`
   - Redirects to OTP verification

2. **OTP Verification** (create new page)
   - Calls `/api/business/verify-email`
   - Shows success message about pending approval

3. **Login Page** (`/login`)
   - Calls `/api/business/login`
   - Handles different status responses
   - Stores token and redirects to dashboard if approved

4. **Dashboard** (all pages)
   - Include `Authorization: Bearer <token>` header
   - Calls `/api/business/profile` to get business data

### Frontend Status Handling

```javascript
// Login response handling
if (response.status === 'pending') {
  // Show: "Your account is pending approval"
}
if (response.status === 'rejected') {
  // Show: "Your application was rejected: {reason}"
}
if (response.status === 'suspended') {
  // Show: "Your account has been suspended"
}
if (response.status === 'approved') {
  // Store token and redirect to dashboard
}
```

## Admin Dashboard Integration

Add new pages/sections:

1. **Business Management**
   - List all businesses with status filters
   - Approve/Reject buttons
   - View business details

2. **Business Statistics**
   - Total businesses
   - By status (pending, approved, rejected, suspended)
   - Recently registered

## Environment Variables

Add to `.env`:
```
BUSINESS_DASHBOARD_URL=http://localhost:5174
```

## Testing the Flow

### Test Business Registration
```bash
curl -X POST http://localhost:5000/api/business/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Hotel",
    "ownerName": "John Doe",
    "email": "test@hotel.com",
    "password": "password123",
    "phone": "+1234567890",
    "businessType": "hotel"
  }'
```

### Test Business Login (will fail until approved)
```bash
curl -X POST http://localhost:5000/api/business/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@hotel.com",
    "password": "password123"
  }'
```

### Test Admin Approval
```bash
curl -X POST http://localhost:5000/api/admin/businesses/{businessId}/approve \
  -H "Authorization: Bearer {admin-token}"
```

## Next Steps

1. Create OTP verification page in frontend
2. Add business management section to admin dashboard
3. Update business dashboard to use new auth endpoints
4. Implement document upload for business verification
5. Add business profile editing functionality
6. Create business settings page
