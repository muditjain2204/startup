# MASTER PRODUCT DEVELOPMENT PROMPT — SMARTROAD AI

## 1. YOUR ROLE

Act as a senior product architect, UI/UX designer, full-stack engineer, AI/ML engineer and SaaS product developer.

Your responsibility is to design and build a production-quality web application called **SmartRoad AI**.

Do not build a basic landing page or a static dashboard. Build a complete, functional, multi-role road infrastructure management platform.

Follow clean architecture, reusable components, scalable database design, secure authentication and professional UI/UX principles.

Read all requirements before starting development.

---

## 2. PRODUCT OVERVIEW

SmartRoad AI is an AI-powered road damage detection and road repair management platform designed initially for the Indian market.

The platform connects:

1. Citizens who report road damage.
2. Government administrators who verify damage and manage repair contracts.
3. Registered contractors who bid for repair projects and execute road repairs.

### Core workflow

Citizen reports road damage → GPS and video collection → AI damage detection → Admin verification → Repair contract creation → Eligible contractor notification → Competitive bidding → Contract award → Repair tracking → Admin inspection and completion.

The system must have three independent portals:

- Admin Portal
- Contractor Portal
- Citizen/User Portal

Each portal must have different permissions, dashboards, navigation and workflows.

---

## 3. TECHNOLOGY STACK

Use the following stack:

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- React Hook Form
- Zod
- TanStack Query where appropriate

### Backend
- Node.js
- Express.js
- TypeScript
- REST APIs
- JWT authentication
- Role-Based Access Control

### Database
- PostgreSQL
- PostGIS for geographical queries
- Prisma ORM

### AI / Computer Vision
- Python
- FastAPI
- OpenCV
- YOLO object detection
- Image/video processing pipeline

### Infrastructure
- Cloud object storage for videos and images
- OpenStreetMap for maps
- QR code generation library
- WebSockets or Firebase for notifications

Use environment variables for all secrets and external credentials.

Do not hardcode API keys.

---

# 4. DESIGN SYSTEM AND USER EXPERIENCE

The platform must look like a premium enterprise SaaS product.

Design inspiration:
- Linear
- Vercel
- Stripe Dashboard
- Modern government technology platforms
- Professional GIS monitoring dashboards

### Design direction

Use a clean, modern, minimal and data-focused design.

Visual language:
- Light background.
- White and subtle grey surfaces.
- Deep navy typography.
- Professional blue as the primary accent.
- Green for completed/approved states.
- Amber for pending states.
- Red for critical damage and rejected states.
- Subtle borders and shadows.
- Consistent spacing.
- Rounded cards.
- Clean typography.

Avoid:
- Generic AI-generated dashboard designs.
- Excessive gradients.
- Too many colors.
- Unnecessary animations.
- Overcrowded dashboards.
- Oversized cards.
- Fake charts and meaningless metrics.

### UX requirements

- Fully responsive.
- Desktop-first enterprise dashboard.
- Mobile-first reporting experience.
- Functional sidebar navigation.
- Search and filtering.
- Pagination.
- Loading skeletons.
- Empty states.
- Error states.
- Toast notifications.
- Confirmation dialogs.
- Accessible forms.
- Clear status indicators.

Use consistent reusable design components throughout the application.

---

# 5. PUBLIC LANDING WEBSITE

Create a professional public-facing landing website.

### Navigation

- Home
- How It Works
- Features
- Solutions
- For Contractors
- About Us
- Contact
- Login
- Get Started

### Hero section

Headline:

"Building Smarter Roads Through Artificial Intelligence."

Subheadline:

"Detect road damage, connect verified contractors, and manage infrastructure repairs through one intelligent platform."

CTA buttons:
- Report Road Damage
- Explore Platform

Visual:
Create a sophisticated road infrastructure monitoring visual with a map, road damage detection markers, AI scanning interface and real-time monitoring indicators.

### Landing page sections

1. Hero section.
2. Platform overview.
3. How SmartRoad AI works.
4. AI-powered damage detection.
5. QR-based reporting.
6. Intelligent contractor allocation.
7. Transparent competitive bidding.
8. Repair progress tracking.
9. Analytics and reporting.
10. Stakeholder benefits.
11. Future vision.
12. Contact and footer.

Add professional illustrations, map visuals and subtle animations.

---

# 6. AUTHENTICATION AND ROLE MANAGEMENT

Create secure authentication for three roles:

- ADMIN
- CONTRACTOR
- USER

Features:

- Registration.
- Login.
- Logout.
- Password hashing.
- JWT access and refresh token handling.
- Forgot password.
- Password reset.
- Protected routes.
- Role-based permissions.
- Session management.

Users must not be able to access unauthorized dashboards or APIs.

Contractor registration must remain pending until approved by an administrator.

---

# 7. ADMIN PORTAL

Create a comprehensive administration dashboard.

## A. Admin Dashboard

Display:

- Total registered users.
- Total contractors.
- Total QR scans.
- Total uploaded videos.
- Total detected potholes.
- Pending damage reports.
- Approved reports.
- Rejected reports.
- Active contracts.
- Completed contracts.
- Total bids.
- Ongoing repairs.

Include:
- KPI cards.
- Damage detection trends.
- Monthly repair statistics.
- Damage severity distribution.
- Geographic damage distribution.
- Recent activity.
- Pending approvals.
- Contract performance.

All analytics must come from actual database records.

## B. User Management

Features:

- View users.
- Search users.
- Filter users.
- View user profiles.
- Suspend accounts.
- Block accounts.
- View submitted reports.
- View user activity.

## C. Contractor Management

Features:

- View contractor registrations.
- Approve/reject registrations.
- Verify GST details and documents.
- View licenses.
- View previous experience.
- View equipment and workforce.
- Configure operating geographical areas.
- Configure contractor operating radius.
- View performance history.
- Suspend contractors.

## D. QR Management

Features:

- Generate QR codes.
- Activate/deactivate QR codes.
- Display QR codes.
- Download QR codes.
- Track QR scans.
- View scan history.
- View associated reports.
- Record timestamps and scan locations.

QR codes must contain secure public reporting URLs, not private user credentials.

## E. AI Detection Management

Allow administrators to configure:

- Minimum pothole size.
- Minimum estimated depth.
- Damage severity.
- Damage category.
- AI confidence threshold.
- Minimum evidence requirements.
- GPS accuracy requirements.
- Location-based eligibility.

These parameters should be configurable through the dashboard.

## F. Damage Report Management

Create a comprehensive damage verification interface.

Each report must display:

- Detection ID.
- Damage category.
- AI confidence.
- Estimated severity.
- GPS coordinates.
- Map location.
- Video evidence.
- Photo evidence.
- Timestamp.
- Reporting source.
- QR identifier.
- Processing status.

Admin actions:

- Approve.
- Reject.
- Edit detection details.
- Merge duplicate reports.
- Request additional evidence.
- Create repair contract.

Only approved damage records can proceed to contract creation.

## G. Contract Management

Administrators can:

- Create repair contracts.
- Select verified damage records.
- Define repair requirements.
- Set project budgets.
- Define geographical eligibility.
- Set bidding deadlines.
- Publish contracts.
- View submitted bids.
- Award contracts.
- Cancel contracts.

## H. Bid Management

Display:

- Contractor name.
- Bid amount.
- Contractor distance.
- Verification status.
- Previous performance.
- Technical eligibility.

Rank eligible bids by price.

The lowest eligible bid should be recommended, but the administrator retains final award authority.

Keep bids confidential until the configured disclosure stage.

## I. Maps and Analytics

Create an interactive GIS-based dashboard.

Display:
- Pothole locations.
- Damage severity markers.
- Pending repairs.
- Active contracts.
- Completed repairs.
- Contractor locations where appropriate.

Allow filtering by:
- City.
- Area.
- Damage severity.
- Report status.
- Contract status.
- Date range.

---

# 8. CONTRACTOR PORTAL

Create a separate contractor experience.

## A. Registration

Collect:

- Name/company name.
- Email.
- Mobile number.
- Business address.
- GST details where applicable.
- Company registration documents.
- Licenses.
- Previous work experience.
- Machinery and equipment.
- Workforce details.
- Operating geographical area.

Show application status:
- Pending verification.
- Approved.
- Rejected.
- Suspended.

Only approved contractors can submit bids.

## B. Contractor Dashboard

Display:

- Available contracts.
- New notifications.
- Active bids.
- Won contracts.
- Lost bids.
- Ongoing projects.
- Completed projects.
- Payment status.
- Performance history.

## C. Available Contracts

Display contract cards with:

- Project title.
- Location.
- Distance from contractor.
- Damage type.
- Repair requirements.
- Estimated budget.
- Bidding deadline.
- Contract status.

Allow contractors to filter contracts based on location, budget and deadline.

Only show contracts for which the contractor is geographically eligible.

## D. Bidding System

Contractors can:

- View contract details.
- Review damage evidence.
- Submit price bids.
- Edit bids before the deadline, subject to configured rules.
- Withdraw bids where permitted.
- Track bid status.

Show:
- Submitted.
- Under review.
- Awarded.
- Not selected.

## E. Project Management

After winning a contract, contractors can:

- Accept the project.
- Update work status.
- Upload before-repair photographs.
- Upload progress photographs.
- Upload after-repair photographs.
- Submit completion reports.
- Request inspection.

---

# 9. CITIZEN / USER PORTAL

Build a mobile-friendly user experience.

## A. User Dashboard

Display:

- QR reporting option.
- Report road damage.
- Upload video.
- Upload photographs.
- My reports.
- Report status.
- Repair status.
- Notifications.
- Profile.

## B. QR-Based Reporting

This is a critical feature of the MVP.

Complete workflow:

1. Admin generates QR code.
2. User scans QR code.
3. Secure reporting page opens.
4. Ask for camera and location permissions.
5. Open mobile camera.
6. Allow road video recording.
7. Allow photograph capture.
8. Collect GPS coordinates.
9. Collect timestamp.
10. Upload evidence.
11. Send report for AI processing.

Capture GPS coordinates at intervals during recording when supported.

Validate GPS accuracy.

Clearly distinguish QR scan location from actual damage location.

Allow users to review their evidence before submitting.

## C. Manual Reporting

Users should also be able to:

- Upload existing road videos.
- Upload photographs.
- Select road location on a map.
- Add a description.
- Submit reports.

## D. My Reports

Show:

- Report ID.
- Submitted date.
- Damage category.
- Location.
- Current status.
- AI detection result.
- Admin verification status.
- Repair status.

---

# 10. AI ROAD DAMAGE DETECTION ENGINE

Create a separate Python FastAPI service for computer vision.

Use YOLO and OpenCV for the initial detection architecture.

Detect:

- Potholes.
- Road cracks.
- Broken road surfaces.
- Other configurable damage categories.

### Processing workflow

1. Receive uploaded media.
2. Validate media format and size.
3. Extract video frames.
4. Run object detection.
5. Identify damage.
6. Estimate severity.
7. Calculate confidence.
8. Associate GPS metadata where available.
9. Check configured admin thresholds.
10. Create detection records.
11. Send results to the main backend.

Store:

- Damage category.
- Confidence score.
- Estimated severity.
- Evidence frame.
- GPS location.
- Timestamp.
- Processing status.

Important:

Do not pretend that a real AI model exists if it has not been integrated.

Create a clean AI service interface and use a clearly labelled mock detection provider during initial frontend development.

Make it possible to replace the mock provider with a trained YOLO model later.

Do not treat model confidence as proof of actual damage.

---

# 11. DUPLICATE DAMAGE DETECTION

Implement duplicate detection using:

- GPS proximity.
- Visual similarity.
- Time information.

If multiple reports refer to the same physical pothole:

- Flag them as potential duplicates.
- Show related reports.
- Allow admin review.
- Merge records.
- Prevent duplicate repair contracts.

Do not automatically merge uncertain detections without appropriate verification.

---

# 12. GEOGRAPHICAL CONTRACTOR ALLOCATION

Use PostgreSQL with PostGIS.

Each contractor should have:

- Registered location.
- Operating radius.
- Service area.
- Approval status.

When an admin publishes a repair contract:

1. Read project GPS location.
2. Find contractors within the eligible geographical range.
3. Check contractor approval status.
4. Check eligibility.
5. Notify matching contractors.
6. Allow eligible contractors to submit bids.

Use configurable radius calculations.

---

# 13. REPAIR CONTRACT AND BIDDING WORKFLOW

Implement the complete workflow:

1. Admin selects verified damage.
2. Admin creates a repair contract.
3. Admin defines requirements.
4. Admin sets estimated budget.
5. Admin sets eligible geographical radius.
6. Admin defines deadline.
7. System finds eligible contractors.
8. Contractors receive notifications.
9. Contractors submit bids.
10. System ranks eligible bids.
11. Admin reviews bids.
12. Admin awards the contract.

Maintain an audit trail for important decisions.

Never automatically award public contracts simply because a bid is lowest.

---

# 14. REPAIR TRACKING

Implement these statuses:

- Contract Awarded.
- Work Accepted.
- Work Started.
- Work in Progress.
- Work Submitted for Inspection.
- Inspection Approved.
- Completed.

Require contractors to upload:

- Before photographs.
- Progress photographs.
- After photographs.
- Completion report.

Admin must be able to inspect and approve completed work.

Maintain a timeline of all project activities.

---

# 15. NOTIFICATION SYSTEM

Implement in-app notifications for:

### Citizens
- Report submitted.
- AI processing completed.
- Damage approved.
- Damage rejected.
- Repair contract created.
- Repair started.
- Repair completed.

### Contractors
- New eligible contract.
- Bidding deadline reminder.
- Bid submitted.
- Bid awarded.
- Bid not selected.
- Project status updates.
- Inspection results.

### Admin
- New damage report.
- AI detection completed.
- Contractor registration.
- New bid.
- Repair inspection request.

---

# 16. DATABASE DESIGN

Design a normalized PostgreSQL database using Prisma.

Create appropriate models for:

- User.
- ContractorProfile.
- ContractorDocument.
- QRCode.
- QRScan.
- DamageReport.
- DamageDetection.
- DamageEvidence.
- DetectionThreshold.
- RepairContract.
- ContractEligibility.
- Bid.
- RepairProject.
- RepairUpdate.
- Notification.
- AuditLog.

Include:

- Proper relationships.
- Foreign keys.
- Unique constraints.
- Indexes.
- Created and updated timestamps.
- Geospatial support using PostGIS.

Use migrations and seed data.

---

# 17. SECURITY AND RELIABILITY

Implement:

- Role-based authorization.
- Input validation.
- File upload validation.
- Secure media access.
- Rate limiting.
- Secure authentication.
- Audit logs.
- QR token validation.
- Duplicate submission protection.
- GPS anomaly checks.
- Confidential bidding.
- Error handling.

Protect privacy by minimizing unnecessary collection of identifiable faces and vehicle number plates.

All camera and location permissions must be explicitly requested from users.

---

# 18. DEVELOPMENT PHASES

Do not attempt to build every advanced feature in one step.

Develop in the following order.

### Phase 1 — Foundation
- Project structure.
- Database.
- Authentication.
- Role-based access.
- Three portal layouts.
- Basic dashboards.

### Phase 2 — QR Reporting
- QR generation.
- QR scanning.
- Camera access.
- GPS collection.
- Video/photo uploads.
- Damage report management.

### Phase 3 — AI Integration
- FastAPI service.
- YOLO integration.
- Video processing.
- Damage classification.
- Detection thresholds.
- Duplicate detection.
- Admin verification.

### Phase 4 — Contractor Management
- Contractor registration.
- Document verification.
- Geographical allocation.
- Contract creation.
- Notifications.
- Competitive bidding.

### Phase 5 — Repair Management
- Project status updates.
- Before/after evidence.
- Inspection.
- Completion approval.
- Payment status.

### Phase 6 — Advanced Platform
- Vehicle camera integration.
- Automatic monitoring.
- Multi-city support.
- Predictive maintenance.
- Advanced infrastructure analytics.

---

# 19. DEVELOPMENT RULES

These rules are mandatory.

1. First inspect the existing project structure before modifying files.
2. Create a clear architecture and implementation plan.
3. Build reusable components.
4. Use TypeScript strictly.
5. Avoid unnecessary dependencies.
6. Do not use hardcoded dashboard metrics in production.
7. Use realistic seed data for development.
8. Every visible button must perform a real action.
9. Every form must have validation.
10. Every table must support relevant search and filtering.
11. Every dashboard must be connected to its actual backend APIs.
12. Use proper loading, error and empty states.
13. Maintain clean API contracts.
14. Do not duplicate business logic across frontend and backend.
15. Never expose secrets to the frontend.
16. Do not implement fake AI results as genuine detections.
17. Maintain clear documentation.
18. Write meaningful tests for important workflows.

---

# 20. FIRST EXECUTION TASK

Before writing code:

1. Understand the complete product.
2. Create the system architecture.
3. Define the folder structure.
4. Design the database schema.
5. Define API endpoints.
6. Identify external dependencies.
7. Break the work into milestones.

Then start implementing Phase 1.

Prioritize a polished, fully functional foundation before moving to advanced AI and bidding functionality.

At the end of each phase:

- Run the application.
- Test all implemented workflows.
- Fix TypeScript errors.
- Fix API errors.
- Verify database operations.
- Report completed features.
- Report remaining work.

## FINAL PRODUCT GOAL

Build SmartRoad AI as a scalable, professional infrastructure technology platform that can eventually be presented to municipal corporations, government departments, infrastructure organizations and contractors in India.

The final product should demonstrate a complete journey:

**Report → Detect → Verify → Contract → Bid → Repair → Inspect → Complete.**