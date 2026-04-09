# SASMS Functional Audit Report

## Project
Smart Asset & Service Management System (SASMS)

## Audit Date
April 9, 2026

## Audit Scope
This audit reviewed the current codebase in:
- `SASMS-Frontend`
- `SASMS-Backend`

The goal was to assess:
- implemented modules
- one-to-one workflow coverage between user, admin, and provider
- likely working functionality
- confirmed bugs and engineering risks
- submission readiness

## Method Used
The following checks were performed:
- frontend route and page review
- backend route and controller review
- model and workflow inspection
- production frontend build verification with `npm run build`
- frontend lint run with `npm run lint`

## Important Limitation
This was a code-level functional audit, not a full live end-to-end QA pass with seeded users, backend database data, and browser automation. Because of that, this report distinguishes between:
- `Implemented and likely working`
- `Confirmed bug in code`
- `Needs live verification`

## System Modules Identified
### Authentication
- Login for `admin`, `provider`, and `user`
- Signup for `admin` and `user`
- Forgot password for `admin` and `user`
- JWT-based protected routes

### Admin Module
- Dashboard and statistics
- Profile management
- Settings and dark mode
- Asset CRUD
- Provider CRUD and provider status update
- Service CRUD
- Booking/service request management
- Provider assignment with assets
- Notifications

### User Module
- Dashboard
- Profile management
- Settings and dark mode
- Address CRUD
- Service listing and filtering
- Booking flow
- Booking list and booking details
- Notifications

### Provider Module
- Dashboard
- Profile management
- Settings and dark mode
- Task listing
- Task detail and status transition flow
- Notifications

## One-to-One Workflow Coverage
### User to Admin
Implemented:
- user creates booking
- admin receives notification
- booking appears in admin booking/service request list

### Admin to Provider
Implemented:
- admin assigns provider and assets to booking
- provider receives task notification
- provider sees task in task list

### Provider to User
Implemented:
- provider updates booking status
- user receives in-progress/completed/cancelled notification
- user can view booking status progression

### Shared Secondary Flows
Implemented:
- notifications by role
- profile photo upload/delete for admin, user, provider
- dark mode across admin, user, provider major screens

## Implemented And Likely Working
These sections are clearly implemented in both frontend and backend and are likely to work if the environment variables, MongoDB data, and storage credentials are configured correctly.

### Core login flow
Status: `Likely working`
Evidence:
- frontend login form posts to `/auth/login`
- backend validates email, password, and role
- JWT token and role are stored in local storage

### Admin service lifecycle
Status: `Likely working`
Evidence:
- admin can create, update, and delete services
- services are exposed to users through `/user/allService`
- booking flow references service details correctly

### Admin provider assignment flow
Status: `Likely working`
Evidence:
- admin booking assignment route exists: `/admin/booking/:id/assign`
- assignment updates booking status to `assigned`
- provider and user notifications are created

### Provider task progression
Status: `Likely working`
Evidence:
- provider status transitions are enforced in backend
- transitions supported: `assigned -> accepted -> picked_up -> in_progress -> completed`
- related timestamps are stored
- user notification is sent for `in_progress`, `completed`, and `cancelled`

### User address CRUD
Status: `Likely working`
Evidence:
- routes exist for list/create/update/delete
- frontend page supports add, edit, view, delete
- dark mode support was recently added

### Dark mode flow
Status: `Likely working`
Evidence:
- shared `useDarkMode` hook controls local storage and sync event
- admin, user, and provider pages were updated to use same theme flow

### Toast notification system
Status: `Likely working`
Evidence:
- centralized `ToastContainer` in `src/App.jsx`
- top-only presentation and custom styling are active globally

## Confirmed Bugs And Quality Issues
The issues below are directly visible in the code and should be treated as actual defects or release risks.

### [High] User signup is currently broken by variable name mismatch
Files:
- [userController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\userController.js:14)
- [userController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\userController.js:16)
- [userController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\userController.js:29)
Problem:
- `loweremail` is declared, but `lowerEmail` is used later.
Impact:
- user registration will throw an error before the account is created.
Recommendation:
- standardize on one variable name and add a signup regression test.

### [High] Admin-created provider passwords are stored in plain text
Files:
- [adminController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\adminController.js:484)
- [Provider.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\models\Provider.js:15)
Problem:
- `createProvider` saves `password: req.body.password` directly.
- the `Provider` schema has no hashing middleware.
Impact:
- provider login security is compromised.
- this is a serious academic and real-world security defect.
Recommendation:
- hash provider passwords with `bcrypt.hash(password, 10)` before save.
- audit existing provider records and migrate stored passwords.

### [Medium] User profile violates React hook rules
Files:
- [UserProfile.jsx](D:\web development\Major-Project-2\SASMS\SASMS-Frontend\src\page\user\UserProfile.jsx:16)
- [UserProfile.jsx](D:\web development\Major-Project-2\SASMS\SASMS-Frontend\src\page\user\UserProfile.jsx:31)
Problem:
- `useDarkMode()` is called inside child components after an early `return null` path.
Impact:
- this can cause unstable render behavior and is flagged by lint as a hook-order violation.
Recommendation:
- pass `darkMode` as a prop from the parent instead of calling the hook inside helper components.

### [Medium] Provider task detail expects user email, but backend does not return it
Files:
- [ProviderTaskDetail.jsx](D:\web development\Major-Project-2\SASMS\SASMS-Frontend\src\page\provider\ProviderTaskDetail.jsx:311)
- [bookingController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\bookingController.js:427)
Problem:
- frontend checks `task.user?.email`
- backend populates provider booking user with only `name phone profilePhoto`
Impact:
- provider detail screen cannot show customer email even though UI supports it.
Recommendation:
- include `email` in provider booking population, or remove that field from UI.

### [Medium] Admin activity feed will miss user booking activities
Files:
- [adminController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\adminController.js:272)
- [bookingController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\bookingController.js:96)
Problem:
- admin dashboard reads activities filtered by `tenantId`
- booking activity created by user does not include `tenantId`
Impact:
- admin recent activity feed will be incomplete or misleading.
Recommendation:
- include `tenantId` when creating booking and cancellation activities.

### [Medium] Booking cancellation activity uses wrong action name
Files:
- [bookingController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\bookingController.js:185)
Problem:
- cancellation activity logs `action: "booking_created"`.
Impact:
- reporting and audit history become incorrect.
Recommendation:
- use a separate action such as `booking_cancelled`.

### [Medium] Asset delete activity references undefined variable
Files:
- [adminController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\adminController.js:440)
Problem:
- delete flow logs `assetName`, but that variable is not defined in the function.
Impact:
- deletion response may succeed, but server-side activity logging can fail afterward.
Recommendation:
- use `asset.assetName` instead.

### [Medium] Provider dashboard statistics are misleading
Files:
- [bookingController.js](D:\web development\Major-Project-2\SASMS\SASMS-Backend\controllers\bookingController.js:523)
Problem:
- provider stats count only `assigned`, `in_progress`, and `completed`.
- `accepted`, `picked_up`, and `cancelled` are excluded from total.
Impact:
- dashboard totals do not reflect real provider workload.
Recommendation:
- include all provider-relevant states or label the counts more precisely.

### [Medium] Frontend lint health is poor
Status:
- `npm run lint` failed with `305` issues (`291` errors, `14` warnings).
Impact:
- code consistency is weak
- several issues indicate real bugs, unsafe hooks, stale dependencies, and unused code
Recommendation:
- fix hook-rule violations first
- then fix `exhaustive-deps`, unused imports, and prop validation or disable PropTypes lint if not using PropTypes

## Needs Live Verification
These features are implemented, but should still be manually tested in a running environment with real accounts.

### Authentication
- admin signup
- admin login
- user login
- provider login
- forgot password for admin and user

### Booking lifecycle
- user booking creation
- admin assignment with provider and assets
- provider accepted/picked-up/in-progress/completed flow
- user cancellation restrictions

### File uploads
- admin store photo upload/delete
- provider profile photo upload/delete
- user profile photo upload/delete

### Notifications
- new booking notification to admin
- assignment notification to provider and user
- user notification for in-progress/completed/cancelled transitions
- mark single and all notifications as read

### Role settings and passwords
- admin change password
- user change password
- provider change password API
- profile edit persistence for each role

## Test Summary
### Automated/Technical Checks
- Frontend production build: `Passed`
- Frontend lint: `Failed`
- Backend automated tests: `Not present`
- Frontend automated tests: `Not present`

### Overall Project Status
- Core architecture and workflow coverage: `Good`
- Feature completeness for college major project demo: `Good`
- Production readiness: `Not yet ready`
- Security readiness: `Needs fixes before external deployment`

## Suggested Fix Priority
### Priority 1
- fix user signup variable mismatch
- hash provider passwords on creation
- fix user profile hook-rule violation

### Priority 2
- fix admin activity logging issues
- fix provider task detail email mismatch
- correct provider stats calculation

### Priority 3
- reduce lint errors and warnings
- add smoke tests for signup, login, booking, assign, and task completion

## Recommended Manual Test Checklist
### Admin
- sign up and log in as admin
- create asset
- create provider
- create service
- assign provider and assets to booking
- verify admin notifications and activity panel

### User
- sign up and log in as user
- add/edit/delete address
- browse services
- create booking
- cancel booking in allowed status
- verify notifications and booking details

### Provider
- log in with admin-created credentials
- edit profile
- upload and remove profile photo
- open assigned task
- accept task
- confirm asset pickup
- mark work in progress
- complete task
- verify notifications and dashboard counts

## Final Assessment
SASMS is a strong major-project codebase with clear multi-role workflow design and a substantial feature set. The application is good enough for project demonstration after targeted fixes, but it is not fully submission-polished yet because there are confirmed backend defects, one hook-rule violation in the frontend, and a large amount of unresolved lint debt.
