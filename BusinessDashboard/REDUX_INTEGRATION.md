# Business Dashboard - Redux Integration

## Setup Complete ✅

The Business Dashboard has been fully integrated with Redux Toolkit and RTK Query for state management and API communication.

## Features Implemented

### 1. Redux Store
- **Location**: `src/redux/store.js`
- Configured with RTK Query middleware
- Auto-setup of listeners for refetch behaviors

### 2. API Integration (`src/redux/api/businessApi.js`)
Endpoints:
- `registerBusiness` - Register new business
- `verifyBusinessEmail` - Verify email with OTP
- `loginBusiness` - Business login with status handling
- `getBusinessProfile` - Fetch business profile data
- `resendOTP` - Resend OTP for verification

### 3. Authentication State (`src/redux/slices/businessAuthSlice.js`)
State management for:
- Business data
- JWT token (persisted in localStorage)
- Authentication status
- Business approval status
- Pending business data (for OTP flow)

### 4. Pages

#### Signup Page (`/signup`)
- Full registration form with Redux
- Real-time validation
- Business type selection
- Navigates to OTP verification after registration

#### OTP Verification Page (`/verify-email`)
- 6-digit OTP input
- Auto-formatting
- Resend OTP with countdown timer
- Session persistence for pending business data

#### Login Page (`/login`)
- Email/password authentication
- Status-based feedback:
  - ✅ **Approved**: Successful login → Dashboard
  - ⏳ **Pending**: Shows waiting message
  - ❌ **Rejected**: Shows rejection reason
  - 🚫 **Suspended**: Shows suspension notice

#### Protected Routes
- All dashboard routes require authentication
- Auto-redirect to login if not authenticated
- Only approved businesses can access dashboard

### 5. Dashboard Shell
- Displays business name and logo
- Profile dropdown with business info
- Logout functionality clears Redux state

## Environment Setup

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

## Usage Flow

### Business Registration
1. User fills signup form → `/signup`
2. API call to register business
3. Business created with `status: pending`
4. OTP sent to email
5. Redirect to `/verify-email`

### Email Verification
1. User enters 6-digit OTP
2. API verifies OTP
3. Business marked as `isVerified: true`
4. Status remains `pending` (awaiting admin approval)
5. Redirect to `/login` with success message

### Login Attempt
1. User enters credentials
2. API checks status:
   - If `approved` → Login successful, set token, redirect to dashboard
   - If `pending` → Show "Pending approval" message
   - If `rejected` → Show rejection reason
   - If `suspended` → Show suspension notice

### Admin Approval (Server Side)
1. Admin approves business via Admin Dashboard
2. Business status changed to `approved`
3. Approval email sent to business
4. Business can now login successfully

## State Persistence

### LocalStorage
- `businessToken` - JWT token for authenticated sessions

### SessionStorage
- `pendingBusinessId` - Business ID during OTP verification
- `pendingEmail` - Email during OTP verification

## API Error Handling

All API calls include error handling with user-friendly messages:
- Network errors
- Validation errors
- Status-based login restrictions
- OTP expiration/invalid errors

## Protected Routes

Protected routes check:
1. Is user authenticated? (has token)
2. Is business approved? (status === 'approved')

If either check fails → Redirect to `/login`

## Testing

### Test Registration
1. Navigate to `/signup`
2. Fill form with business details
3. Submit → Should redirect to OTP verification
4. Check email for OTP

### Test OTP Verification
1. Enter 6-digit OTP
2. Submit → Should verify and show pending approval message
3. Redirect to login

### Test Login (Pending Status)
1. Try to login with registered credentials
2. Should show "Pending approval" message
3. Cannot access dashboard

### Test Login (After Approval)
1. Admin approves business in backend
2. Login with same credentials
3. Should receive token and access dashboard
4. See business name in header

## Redux DevTools

The app supports Redux DevTools for debugging:
- View state changes
- Track API calls
- Monitor token storage
- Debug authentication flow

## Next Steps

1. ✅ Backend API ready
2. ✅ Frontend Redux integration complete
3. ✅ All auth pages functional
4. 🔄 Admin dashboard integration (separate project)
5. 🔄 Add more protected dashboard pages
6. 🔄 Implement profile editing
7. 🔄 Add business document upload

## Troubleshooting

### Can't login after registration
- Check if email is verified
- Check if admin has approved the business
- Verify API URL in `.env`

### OTP not received
- Check SMTP configuration in server `.env`
- Use resend OTP button
- Check spam folder

### Redux state not persisting
- Check browser localStorage
- Ensure Redux store is wrapped in Provider
- Check token expiration (30 days)

### API calls failing
- Verify server is running on port 5000
- Check CORS configuration
- Verify API endpoints match server routes
