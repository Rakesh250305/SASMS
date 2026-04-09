# Smart Asset & Service Management System
## Major Project Submission Report

## 1. Title Of The Project
Smart Asset & Service Management System (SASMS)

## 2. Abstract
The Smart Asset & Service Management System (SASMS) is a full-stack web application designed to streamline service-based business operations involving asset management, customer booking, provider assignment, and workflow tracking. The system supports three major roles: Admin, User, and Provider. Admins manage services, providers, assets, and booking assignments. Users can browse services, manage addresses, book services, and track their booking progress. Providers receive assigned tasks, update booking status through a structured workflow, and manage their own profile.

The project addresses common operational problems in service organizations such as manual assignment, poor booking visibility, scattered customer communication, and lack of real-time workflow tracking. SASMS offers a centralized platform that improves transparency, coordination, and accountability across all involved roles.

## 3. Problem Statement
In many local service organizations, the management of customers, service requests, assets, and service providers is often handled manually. This results in:
- difficulty in tracking service requests
- inefficient provider assignment
- weak visibility into asset usage
- poor communication between customer and provider
- delays in service completion and status updates

A digital system is needed to automate these operations and provide role-based access, booking visibility, notification handling, and service workflow management.

## 4. Objectives
The main objectives of the project are:
- to build a role-based smart management platform for admin, user, and provider
- to digitize the service booking and task assignment process
- to manage assets and services in a centralized way
- to enable users to track service request status in real time
- to allow providers to update task progress through structured workflow stages
- to improve operational transparency and reduce manual dependency

## 5. Scope Of The Project
The project covers the following scope:
- admin account creation and management
- user registration and login
- provider account creation by admin
- service catalog management
- asset inventory management
- service booking and tracking
- provider task lifecycle management
- notifications for major workflow events
- dark mode support across role dashboards
- profile and address management

The current project is suitable for academic demonstration, prototype deployment, and small-scale organizational use.

## 6. Proposed Solution
The proposed solution is a web-based application built with a React frontend and a Node.js + Express backend. MongoDB is used for persistent data storage. The system introduces separate interfaces and permissions for each role:
- Admin: manages services, providers, assets, and assignments
- User: books services and tracks service progress
- Provider: handles assigned tasks and updates task status

The solution improves coordination by connecting booking creation, task assignment, provider workflow updates, and notifications into one continuous system.

## 7. System Users And Modules
### 7.1 Admin Module
Admin can:
- sign up and log in
- manage store profile
- create, update, and delete assets
- create, update, and delete services
- create and manage providers
- activate or deactivate providers
- view booking requests
- assign providers and assets to bookings
- monitor notifications and dashboard statistics

### 7.2 User Module
User can:
- sign up and log in
- manage profile
- manage saved addresses
- view all available services
- create bookings
- cancel eligible bookings
- track booking details and service progress
- receive notifications

### 7.3 Provider Module
Provider can:
- log in using admin-created credentials
- manage profile and profile photo
- view assigned tasks
- accept or reject tasks
- confirm pickup of assets
- mark work as in progress
- complete assigned tasks
- view notifications and dashboard summary

## 8. Technology Stack
### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- Framer Motion
- React Router
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- multer
- Vercel Blob storage

### Development Tools
- ESLint
- Nodemon
- Git/GitHub

## 9. System Architecture
The application follows a client-server architecture.

### Frontend Layer
- responsible for UI rendering
- handles routing and role-based pages
- sends API requests to backend using Axios

### Backend Layer
- exposes REST APIs
- handles authentication and authorization
- processes business logic for users, admins, providers, bookings, and notifications

### Database Layer
- MongoDB stores all persistent data
- Mongoose models define schemas for user, admin, provider, booking, service, asset, notification, and address

## 10. Database Entities
Main entities used in the project:
- Admin
- User
- Provider
- Service
- Asset
- Booking
- Notification
- UserAddress
- Activity

### Major Relationships
- one admin manages many providers, services, and bookings
- one user can create many bookings and addresses
- one provider can handle many assigned bookings
- one booking belongs to one user, one service, and optionally one provider

## 11. Functional Workflow
### 11.1 User Booking Workflow
1. User registers or logs in
2. User browses available services
3. User selects a service and address
4. User creates a booking
5. Booking is stored with status `pending`
6. Admin receives notification

### 11.2 Admin Assignment Workflow
1. Admin views pending bookings
2. Admin assigns provider and assets
3. Booking status becomes `assigned`
4. User and provider receive notifications

### 11.3 Provider Execution Workflow
1. Provider opens assigned task
2. Provider accepts task
3. Provider confirms assets picked up
4. Provider marks task in progress
5. Provider marks task completed
6. User receives workflow notifications

## 12. User Interface Features
The project includes:
- responsive dashboard screens
- role-specific navigation
- structured cards and detail pages
- dark mode theme support
- toast notifications
- animated sheets and interaction panels
- status badges and workflow trackers

## 13. Security Features
Implemented security features include:
- JWT-based authentication
- role-based route authorization
- protected backend APIs
- password hashing for admin and user accounts
- provider account activation/deactivation by admin

Note:
- provider password creation currently needs improvement in backend implementation before production use.

## 14. Testing And Validation
The following validation activities were performed during audit:
- route and controller review
- frontend build verification
- lint verification
- workflow tracing across roles

### Current Technical Status
- frontend build: passed
- backend test suite: not available
- frontend lint: failing with multiple issues

This indicates that the project is functionally substantial but still requires debugging and cleanup for final polish.

## 15. Major Achievements
The project successfully demonstrates:
- multi-role architecture
- service booking lifecycle
- provider assignment model
- task workflow with status progression
- notification-based communication
- address and profile management
- dark mode support across major modules

## 16. Limitations
Current limitations observed in the project:
- no automated test suite
- unresolved lint issues
- some backend defects require correction
- project depends on environment configuration such as MongoDB and blob storage tokens
- some features require live manual validation before deployment

## 17. Future Enhancements
Possible future improvements:
- automated testing using Jest, React Testing Library, or Playwright
- payment integration for booking settlement
- OTP/email verification for signup and password reset
- real-time notifications using WebSockets
- service rating and review system
- provider availability calendar
- analytics dashboard with charts and reports
- invoice generation and downloadable receipts
- deployment with CI/CD pipeline

## 18. Conclusion
The Smart Asset & Service Management System is a well-structured full-stack academic project that demonstrates strong understanding of role-based system design, service workflow automation, asset handling, and modern web development practices. The project integrates frontend and backend modules effectively and supports real-world use cases involving customers, administrators, and service providers.

With targeted bug fixes, better lint discipline, and additional testing, SASMS can become a polished and convincing final-year major project submission.

## 19. Suggested Annexures
You can attach the following during submission:
- screenshots of admin, user, and provider dashboards
- database schema diagrams
- API route list
- workflow diagrams
- test report
- source code repository structure

## 20. Viva Preparation Points
Be ready to explain:
- why three roles were used
- how JWT authentication works
- how provider assignment changes booking lifecycle
- why MongoDB was chosen
- how notifications are generated
- how dark mode state is shared
- what bugs were found and how they can be fixed
