# WanderPlan Admin Panel - Architecture Documentation

## Overview
This is a comprehensive admin panel for the WanderPlan platform built with React, Redux Toolkit, and React Router.

## Tech Stack
- **React 19.2** - UI Library
- **Redux Toolkit** - State Management
- **React Router DOM** - Routing
- **Tailwind CSS 4** - Styling
- **Vite** - Build Tool
- **Axios** - HTTP Client
- **Lucide React** - Icons
- **Recharts** - Charts/Analytics

## Project Structure

```
AdminDashboard/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── badge.jsx
│   │   │   ├── avatar.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── select.jsx
│   │   │   └── table.jsx
│   │   ├── admin-header.jsx    # Top navigation bar
│   │   ├── admin-sidebar.jsx   # Side navigation
│   │   └── admin-layout.jsx    # Main layout wrapper
│   │
│   ├── pages/              # Page components
│   │   ├── dashboard.jsx   # Dashboard/Home page
│   │   ├── users.jsx       # User management
│   │   ├── businesses.jsx  # Business owner management
│   │   ├── reviews.jsx     # Review & content moderation
│   │   ├── deals.jsx       # Deals & ads management
│   │   ├── analytics.jsx   # Analytics & insights
│   │   ├── gamification.jsx # Badges & challenges
│   │   ├── reports.jsx     # Reports & moderation
│   │   └── settings.jsx    # System settings
│   │
│   ├── redux/              # State management
│   │   ├── store.js        # Redux store configuration
│   │   └── slices/         # Redux slices
│   │       ├── authSlice.js
│   │       ├── usersSlice.js
│   │       ├── businessesSlice.js
│   │       ├── reviewsSlice.js
│   │       ├── dealsSlice.js
│   │       ├── analyticsSlice.js
│   │       ├── reportsSlice.js
│   │       ├── gamificationSlice.js
│   │       └── settingsSlice.js
│   │
│   ├── routes/             # Routing configuration
│   │   └── AppRoutes.jsx   # All route definitions
│   │
│   ├── services/           # API services
│   │   ├── api.js          # Axios instance & interceptors
│   │   └── adminService.js # All API calls
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.js        # Helper functions (cn, etc.)
│   │
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── vite.config.js         # Vite configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## Application Flow

### 1. Entry Point (`main.jsx`)
- Wraps the app with Redux `Provider`
- Passes the Redux `store` to all components
- Renders the `App` component

### 2. App Component (`App.jsx`)
- Wraps the app with `BrowserRouter`
- Renders `AppRoutes` component

### 3. Routing (`routes/AppRoutes.jsx`)
The application uses nested routing with a layout:

```
/ (AdminLayout)
├── / (Dashboard)
├── /users
├── /businesses
├── /reviews
├── /deals
├── /analytics
├── /gamification
├── /reports
└── /settings
```

**AdminLayout** acts as a wrapper for all pages and includes:
- AdminSidebar (left navigation)
- AdminHeader (top bar)
- Outlet (renders child routes)

### 4. State Management (Redux)

#### Store Configuration
The Redux store is configured with the following slices:

**Auth Slice** (`authSlice.js`)
- Manages admin authentication
- Stores: user, token, isAuthenticated, loading, error
- Actions: login, logout, updateProfile

**Users Slice** (`usersSlice.js`)
- Manages user data
- Stores: users list, filters, pagination, stats
- Actions: setUsers, updateUser, deleteUser, setFilters

**Businesses Slice** (`businessesSlice.js`)
- Manages business owner data
- Stores: businesses list, filters, stats
- Actions: setBusinesses, updateBusiness, verifyBusiness

**Reviews Slice** (`reviewsSlice.js`)
- Manages reviews and content
- Stores: reviews list, filters, stats
- Actions: setReviews, approveReview, deleteReview

**Deals Slice** (`dealsSlice.js`)
- Manages deals and advertisements
- Stores: deals list, filters, stats
- Actions: setDeals, updateDeal, approveDeal

**Analytics Slice** (`analyticsSlice.js`)
- Manages analytics data
- Stores: engagement data, charts data, stats
- Actions: setUserEngagement, setReviewActivity

**Reports Slice** (`reportsSlice.js`)
- Manages content reports/moderation
- Stores: reports list, filters, stats
- Actions: setReports, resolveReport, dismissReport

**Gamification Slice** (`gamificationSlice.js`)
- Manages badges and challenges
- Stores: badges, challenges, leaderboard
- Actions: addBadge, updateChallenge, setLeaderboard

**Settings Slice** (`settingsSlice.js`)
- Manages system settings
- Stores: general, notifications, security settings
- Actions: updateGeneralSettings, updateSecuritySettings

### 5. API Services (`services/adminService.js`)

All API calls are organized by feature:

**Authentication Services**
- `login(credentials)` - Admin login
- `logout()` - Admin logout
- `getCurrentUser()` - Get current admin details

**User Services**
- `getUsers(params)` - Get all users with filters
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `suspendUser(id)` - Suspend user account
- `getUserStats()` - Get user statistics

**Business Services**
- `getBusinesses(params)` - Get all businesses
- `verifyBusiness(id)` - Verify business
- `rejectBusiness(id, reason)` - Reject business

**Review Services**
- `getReviews(params)` - Get all reviews
- `approveReview(id)` - Approve review
- `deleteReview(id)` - Delete review

**Deals Services**
- `getDeals(params)` - Get all deals
- `createDeal(data)` - Create new deal
- `approveDeal(id)` - Approve deal

**Analytics Services**
- `getUserEngagement(params)` - Get user engagement data
- `getReviewActivity(params)` - Get review activity data
- `getBusinessPerformance(params)` - Get business metrics

**Reports Services**
- `getReports(params)` - Get all reports
- `resolveReport(id, action)` - Resolve a report
- `dismissReport(id)` - Dismiss a report

**Gamification Services**
- `getBadges()` - Get all badges
- `createBadge(data)` - Create new badge
- `getChallenges()` - Get all challenges
- `createChallenge(data)` - Create new challenge

**Settings Services**
- `getSettings()` - Get all settings
- `updateGeneralSettings(data)` - Update general settings
- `updateSecuritySettings(data)` - Update security settings

### 6. HTTP Interceptors (`services/api.js`)

**Request Interceptor**
- Automatically adds JWT token to all requests
- Retrieves token from localStorage

**Response Interceptor**
- Handles 401 errors (unauthorized)
- Redirects to login on authentication failure
- Removes invalid token from localStorage

## Page Components

### Dashboard (`pages/dashboard.jsx`)
- Overview of key metrics
- Quick stats cards
- Recent activity feed

### Users Management (`pages/users.jsx`)
- List all users (contributors & tourists)
- Filter by role, status, level
- User statistics
- Actions: View, Suspend, Delete

### Business Management (`pages/businesses.jsx`)
- List all business owners
- Verification requests
- Business categories
- Actions: Verify, Reject, View Details

### Reviews & Content (`pages/reviews.jsx`)
- All user reviews
- Pending moderation queue
- Filter by rating, status
- Actions: Approve, Reject, Delete

### Deals & Ads (`pages/deals.jsx`)
- Active deals
- Pending approvals
- Revenue tracking
- Actions: Approve, Edit, Delete

### Analytics (`pages/analytics.jsx`)
- User engagement charts (Line/Area charts)
- Review activity trends (Bar charts)
- Business performance metrics
- Category distribution (Pie chart)

### Gamification (`pages/gamification.jsx`)
- Badge management
- Challenge creation
- Leaderboard display
- Points system configuration

### Reports & Moderation (`pages/reports.jsx`)
- Content reports queue
- Flagged content
- Moderation actions
- Report resolution

### Settings (`pages/settings.jsx`)
- General settings (site name, URL, etc.)
- Notification preferences
- Security settings (2FA, password policy)
- Admin profile management

## Navigation Flow

### Sidebar Navigation
The sidebar (`admin-sidebar.jsx`) provides navigation to:
1. Dashboard (/)
2. Users (/users)
3. Business Owners (/businesses)
4. Reviews & Content (/reviews)
5. Deals & Ads (/deals)
6. Analytics (/analytics)
7. Gamification (/gamification)
8. Reports & Moderation (/reports)
9. Settings (/settings)

Active route is highlighted using React Router's `useLocation` hook.

### Header Actions
The header (`admin-header.jsx`) includes:
- Global search bar
- Notifications bell with indicator
- Admin profile dropdown
  - Settings (navigates to /settings)
  - Support
  - Logout (dispatches logout action)

## State Management Pattern

### Typical Redux Flow:

1. **Component mounts** → Dispatch fetch action
2. **Action triggers** → Call API service
3. **API responds** → Update Redux state
4. **State changes** → Component re-renders

Example: Loading users
```javascript
// In component
useEffect(() => {
  dispatch(setLoading(true));
  usersService.getUsers({ page: 1, limit: 10 })
    .then(data => {
      dispatch(setUsers(data.users));
      dispatch(setStats(data.stats));
    })
    .catch(error => {
      dispatch(setError(error.message));
    });
}, []);
```

## Authentication Flow

1. Admin enters credentials on login page
2. `authService.login()` sends POST request to `/api/admin/login`
3. Server validates and returns JWT token
4. Token stored in localStorage
5. Redux state updated with user info and token
6. All subsequent requests include token in Authorization header
7. On logout, token removed and user redirected to login

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Key Features

✅ **Complete routing setup** with nested routes
✅ **Redux Toolkit** for state management
✅ **API service layer** with Axios interceptors
✅ **Authentication** with JWT tokens
✅ **Reusable UI components** with Tailwind CSS
✅ **Responsive design** with mobile support
✅ **Charts and analytics** with Recharts
✅ **Type-safe** component props
✅ **Error handling** and loading states
✅ **Search and filtering** capabilities

## Integration with Backend

The admin panel expects the following API endpoints from the Server:

### Auth Endpoints
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/me` - Get current admin

### User Endpoints
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/users/:id/suspend` - Suspend user

### Business Endpoints
- `GET /api/admin/businesses` - Get all businesses
- `POST /api/admin/businesses/:id/verify` - Verify business

### Review Endpoints
- `GET /api/admin/reviews` - Get all reviews
- `POST /api/admin/reviews/:id/approve` - Approve review

### Analytics Endpoints
- `GET /api/admin/analytics/stats` - Get overall stats
- `GET /api/admin/analytics/user-engagement` - User engagement data

(See `services/adminService.js` for complete API specification)

## Next Steps

1. **Connect to real backend API** - Update VITE_API_BASE_URL
2. **Add authentication pages** - Login/Forgot Password screens
3. **Implement protected routes** - Add route guards
4. **Add more UI polish** - Loading skeletons, animations
5. **Error boundaries** - Graceful error handling
6. **Unit tests** - Add test coverage
7. **Real-time updates** - WebSocket integration
8. **Export functionality** - CSV/PDF exports for reports

## Troubleshooting

### Path alias issues
If imports with `@/` don't work:
- Check `vite.config.js` has path alias configuration
- Restart the dev server

### Redux state not persisting
- Check localStorage for token
- Verify API interceptors are working
- Check Redux DevTools

### Routing issues
- Ensure `BrowserRouter` wraps the entire app
- Check route paths match exactly
- Verify `Outlet` is in AdminLayout

## Support

For issues or questions, refer to:
- React Router: https://reactrouter.com
- Redux Toolkit: https://redux-toolkit.js.org
- Tailwind CSS: https://tailwindcss.com
