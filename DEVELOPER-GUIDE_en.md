# JobMongol Developer Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Core Feature Flows](#core-feature-flows)
4. [Technology Stack](#technology-stack)
5. [Development Environment Setup](#development-environment-setup)
6. [Database Structure](#database-structure)
7. [API Design](#api-design)
8. [Frontend Structure](#frontend-structure)
9. [Backend Structure](#backend-structure)
10. [Deployment Guide](#deployment-guide)
11. [Security Considerations](#security-considerations)
12. [Performance Optimization](#performance-optimization)
13. [Development Workflow](#development-workflow)

---

## Project Overview

### Platform Introduction
JobMongol is a next-generation job portal platform targeting the Mongolian market. Beyond a simple job posting board, it provides innovative features such as AI-based matching, real-time chat, and employment integration systems, aiming to become Mongolia's No.1 recruitment platform.

### Core Value Proposition
- **AI-based Smart Matching**: Optimally connecting job seekers with companies
- **Real-time Communication**: WebSocket-based instant chat system
- **Fully Responsive Design**: Mobile-first approach
- **Multi-language Support**: Korean, English, and Mongolian support
- **Subscription-based SaaS Model**: Sustainable revenue structure

### User Types
1. **Job Seeker (Candidate)**: Individual users looking for employment
2. **Employer (Company)**: Companies looking to hire talent
3. **Administrator (Admin)**: Operations team managing the platform

---

## System Architecture

### Overall Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Express)     │◄──►│   (PostgreSQL)  │
│   Port: 5173    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  External APIs  │◄─────────────┘
                        │  (Stripe, AI)   │
                        └─────────────────┘
```

### Technology Layer Structure
- **Presentation Layer**: React 18 + TypeScript
- **Business Logic Layer**: Express.js + Node.js
- **Data Access Layer**: Drizzle ORM
- **Data Storage Layer**: PostgreSQL
- **Caching Layer**: Node-cache (Redis integration planned)

---

## Core Feature Flows

### Core Business Rules
1. **Mongolian ID Verification**: All users must verify identity with Mongolian citizen registration number or foreign registration number
2. **Company Approval Process**: Company registration requires administrator approval
3. **Chat Rules**: Companies must initiate chat first; job seekers cannot start chat independently
4. **Employment Integration**: Automatic employment/termination information integration based on citizen_id

### Major Features
1. **Job Posting Management**: Company job posting creation, modification, deletion
2. **Applicant Management**: Application reception, evaluation, interview scheduling
3. **Real-time Chat**: Real-time communication between companies and job seekers
4. **AI Matching**: Smart matching between job seekers and job postings
5. **Resume Management**: Detailed resume creation and management for job seekers
6. **Subscription Management**: User-specific subscription plans and payment management

---

## Technology Stack

### Frontend Technologies
| Technology | Version | Purpose | Selection Reason |
|------------|---------|---------|------------------|
| React | 18.3.1 | UI Library | Component-based development, rich ecosystem |
| TypeScript | 5.6.3 | Type System | Type safety during development, improved code quality |
| Vite | 5.4.14 | Build Tool | Fast development server, efficient bundling |
| TailwindCSS | 3.4.17 | CSS Framework | Utility classes, consistent design |
| React Query | 5.60.5 | Server State Management | Caching, synchronization, automatic error handling |
| Wouter | 3.3.5 | Routing | Lightweight router, SPA navigation |
| Radix UI | Latest | UI Components | Accessibility support, easy customization |
| Framer Motion | 11.13.1 | Animation | Smooth UI transitions |

### Backend Technologies
| Technology | Version | Purpose | Selection Reason |
|------------|---------|---------|------------------|
| Node.js | 24.2.0 | Server Runtime | JavaScript ecosystem, asynchronous processing |
| Express.js | 4.21.2 | Web Framework | Simple API construction, middleware support |
| PostgreSQL | Latest | Database | Relational data, ACID properties, scalability |
| Drizzle ORM | 0.39.1 | ORM | TypeScript native, type safety |
| WebSocket | 8.18.0 | Real-time Communication | Instant chat, notification system |
| JWT | Latest | Authentication | Stateless token authentication |
| bcryptjs | Latest | Password Encryption | Secure password storage |

---

## Development Environment Setup

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher
- **PostgreSQL**: 13.x or higher
- **Git**: Latest version

### Installation Process

#### 1. Repository Clone
```bash
git clone https://github.com/your-repo/jobmongol.git
cd jobmongol
```

#### 2. Node.js Installation (Windows)
```bash
# Using winget (Windows 10/11)
winget install OpenJS.NodeJS

# Verify installation in new PowerShell window
node --version
npm --version
```

#### 3. Dependency Installation
```bash
npm install
```

#### 4. Database Configuration
Current project uses the following database servers:
- **Primary**: 192.168.0.171:5432
- **Fallback**: 203.23.49.100:5432
- **Database**: jobmongolia
- **User**: jobmongolia_user
- **Password**: JobMongolia2025R5

#### 5. Development Server Execution
```bash
npm run dev
```

This command simultaneously runs:
- Frontend (Vite): http://localhost:5173
- Backend (Express): http://localhost:5000

### Development Environment Verification
1. Access http://localhost:5173 in browser
2. Check database connection status (console logs)
3. Test API endpoint: http://localhost:5000/api/health

---

## Database Structure

### Core Table Design

#### Users (Users)
```sql
- id: Primary key
- email: Email (unique)
- mongolian_id: Mongolian citizen registration number (2 letters + 8 digits)
- user_type: 'candidate' | 'employer' | 'admin'
- citizenship_type: 'mongolian' | 'foreign'
- profile_picture: Profile image path
- skills: JSON array (tech stack)
- created_at: Account creation date
```

#### Companies (Companies)
```sql
- id: Primary key
- name: Company name
- registration_number: Business registration number
- status: 'pending' | 'approved' | 'rejected'
- industry: Industry sector
- employee_count: Number of employees
- mission, vision, values: Company culture
```

#### Jobs (Job Postings)
```sql
- id: Primary key
- company_id: Company reference
- title: Position title
- description: Job description
- employment_type: Employment type
- salary_min/max: Salary range
- skills: Required skills (JSON)
- is_active: Active status
```

#### Applications (Applications)
```sql
- user_id: Applicant
- job_id: Job posting
- status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected'
- cover_letter: Cover letter
- applied_at: Application date
```

---

## API Design

### RESTful API Structure
All APIs use the `/api` prefix and are designed in RESTful manner with HTTP methods and status codes.

#### Major API Endpoints
```
# Authentication
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/me           - Current user information

# Job Postings
GET    /api/jobs            - Job posting list
GET    /api/jobs/:id        - Job posting details
POST   /api/jobs            - Job posting creation
POST   /api/jobs/:id/apply  - Apply to job posting

# Companies
GET    /api/companies       - Company list
POST   /api/companies       - Company registration
GET    /api/companies/:id   - Company details

# Applications
GET    /api/applications    - Application list
PUT    /api/applications/:id - Application status change
```

---

## Frontend Structure

### Folder Structure
```
client/src/
├── components/          # Reusable components
│   ├── ui/             # Basic UI components (shadcn/ui)
│   ├── auth/           # Authentication components
│   ├── jobs/           # Job posting components
│   ├── companies/      # Company components
│   ├── chat/           # Chat components
│   └── layout/         # Layout components
├── pages/              # Page components
├── contexts/           # React Context
├── hooks/              # Custom hooks
├── i18n/               # Multi-language support
└── utils/              # Utility functions
```

### Core Design Principles
1. **Component-based**: Composed of reusable small components
2. **Type Safety**: TypeScript type definitions for all Props and states
3. **Responsive Design**: Mobile-first approach
4. **Accessibility**: ARIA attributes and keyboard navigation support

---

## Backend Structure

### Folder Structure
```
server/
├── index.ts           # Server entry point
├── routes.ts          # API route definitions
├── auth.ts            # Authentication system
├── db.ts              # Database configuration
├── storage.ts         # Data access layer
└── middleware/        # Middleware
```

### Core Components
1. **Express Server**: RESTful API provision
2. **Drizzle ORM**: Type-safe database access
3. **JWT Authentication**: Stateless token-based authentication
4. **WebSocket**: Real-time chat support
5. **Middleware**: Authentication, validation, error handling

---

## Security Considerations

### Major Security Features
1. **JWT Token Authentication**: 15-minute expiration time
2. **Password Encryption**: bcrypt hashing
3. **Input Validation**: Zod schema validation
4. **SQL Injection Prevention**: ORM usage
5. **Rate Limiting**: API call restrictions

---

## Performance Optimization

### Frontend Optimization
1. **Code Splitting**: Lazy loading with React.lazy()
2. **Image Optimization**: WebP format, lazy loading
3. **Caching**: API response caching with React Query

### Backend Optimization
1. **Database Indexes**: Indexes on frequently queried columns
2. **Connection Pooling**: PostgreSQL connection pool usage
3. **Response Compression**: gzip compression application

---

## Development Workflow

### Git Branch Strategy
```
main          - Production deployment branch
develop       - Development integration branch
feature/*     - Feature development branch
hotfix/*      - Emergency fix branch
```

### Commit Message Rules
```
feat: Add new feature
fix: Bug fix
docs: Documentation change
style: Code formatting
refactor: Code refactoring
test: Test code
chore: Build-related changes
```

### Deployment Process
1. Complete feature development
2. Create Pull Request
3. Conduct code review
4. Verify test passage
5. Merge to develop branch
6. Production deployment

---

## Contact and Support

### Development Inquiries
- **Technical Inquiries**: Use GitHub Issues
- **Urgent Inquiries**: Direct contact with development team
- **Documentation Updates**: Immediate updates when changes occur

### Contribution Guide
1. Create or get assigned an issue
2. Create feature branch
3. Proceed with development
4. Create Pull Request
5. Participate in code review
6. Clean up branch after merge

---

*This document is a comprehensive development guide for the JobMongol project. We will continuously update and improve it so that new developers can easily participate in the project.* 