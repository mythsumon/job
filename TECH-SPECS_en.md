# SonGon (JobMongol) Technical Specifications

## Platform Overview
**SonGon (JobMongol)** is Mongolia's premier fully responsive job portal SaaS platform. Through a subscription-based revenue model, it provides innovative features including AI recommendations, real-time chat, and automated employment/termination integration.

## Core Technology Stack

### Frontend Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | React | 18.3.1 | UI Library |
| **Language** | TypeScript | 5.6.3 | Type Safety |
| **Build Tool** | Vite | 5.4.14 | High-speed Bundling |
| **Router** | Wouter | 3.3.5 | Lightweight Routing |
| **State** | React Query | 5.60.5 | Server State Management |
| **Styling** | TailwindCSS | 3.4.17 | Utility CSS |
| **UI Kit** | Radix UI + shadcn/ui | Latest | Accessibility Components |
| **Icons** | Lucide React | 0.453.0 | Icon Library |
| **Animation** | Framer Motion | 11.13.1 | Animation |
| **Forms** | React Hook Form | 7.55.0 | Form Management |
| **Validation** | Zod | 3.24.2 | Schema Validation |

### Backend Stack
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | Latest | Server Runtime |
| **Framework** | Express.js | 4.21.2 | Web Framework |
| **Language** | TypeScript | 5.6.3 | Type Safety |
| **Database** | PostgreSQL | Latest | Relational Database |
| **ORM** | Drizzle ORM | 0.39.1 | Type-safe ORM |
| **Authentication** | JWT + bcrypt | Latest | Authentication/Security |
| **WebSocket** | ws | 8.18.0 | Real-time Communication |
| **Validation** | Zod | 3.24.2 | Input Validation |

### Development & Build Tools
| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Build** | esbuild | 0.25.0 | Server Bundling |
| **Migration** | Drizzle Kit | 0.30.4 | DB Migration |
| **Process** | concurrently | 9.1.2 | Concurrent Process Execution |
| **Environment** | dotenv | 16.5.0 | Environment Variable Management |

## Database Structure

### Connection Information
```
Host: 192.168.0.171 (Primary) / 203.23.49.100 (Fallback)
Port: 5432
Database: jobmongolia
User: jobmongolia_user
Password: JobMongolia2025R5
```

### Major Table Structure

#### Users (Users)
```sql
id, username, password, email, full_name
ovog, ner, mongolian_id, citizenship_type
user_type (candidate/employer/admin)
profile_picture, location, phone, bio, skills
```

#### Companies (Companies)
```sql
id, name, logo, size, status, description
industry, location, culture, benefits
website, founded, employee_count
```

#### Jobs (Job Postings)
```sql
id, company_id, title, description, requirements
location, employment_type, experience_level
salary_min, salary_max, skills, benefits
is_featured, is_active, views, status
```

#### Applications (Applications)
```sql
id, user_id, job_id, resume_id
status (pending/reviewed/interview/accepted/rejected)
cover_letter, applied_at
```

## Architecture Design

### Folder Structure
```
┌─ client/          # React Frontend
├─ server/          # Express Backend  
├─ shared/          # Shared Types/Schema
├─ migrations/      # DB Migration
└─ scripts/         # Development Scripts
```

### API Design
- **RESTful API**: `/api/*` endpoints
- **WebSocket**: Real-time chat
- **Authentication**: JWT Bearer token
- **Error Handling**: Unified error response

### Security Structure
- **CORS**: Domain whitelist
- **Rate Limiting**: API call restriction
- **Data Validation**: Zod schema validation
- **SQL Injection**: Prevention through ORM

## Development Environment

### Required Dependencies
- **Node.js**: 18.x or higher
- **PostgreSQL**: 13.x or higher
- **NPM**: 8.x or higher

### Port Configuration
- **Backend API**: 5000 (fixed)
- **Frontend Dev**: 5173/5174
- **Database**: 5432

### Environment Variables
```env
NODE_ENV=development|production
DB_HOST=192.168.0.171
DB_PORT=5432
DB_NAME=jobmongolia
DB_USER=jobmongolia_user
DB_PASSWORD=JobMongolia2025R5
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

## Deployment Specifications

### Build Process
```bash
npm run build  # Frontend + Backend build
npm run start  # Production server execution
```

### Production Optimization
- **Code Splitting**: Vendor/Utils chunk separation
- **Bundle Optimization**: Tree-shaking + Minification
- **Security Enhancement**: Source map removal, console.log removal
- **Caching**: Static resource caching

## Internationalization (i18n)

### Supported Languages
- **Korean** (ko) - Default
- **English** (en)
- **Mongolian** (mn/mn_clean)

### Implementation Method
- Context API-based language state management
- JSON translation files (`/client/src/i18n/locales/`)
- Dynamic language loading

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Mobile */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large Screen */
```

### Mobile-First Design
- Progressive Web App (PWA) support
- Touch gesture optimization
- Mobile-specific navigation

## State Management Pattern

### Client State
- **Local State**: useState/useReducer
- **Global State**: Context API
- **Server State**: React Query

### Server State Caching
- **Query Caching**: React Query automatic caching
- **Invalidation**: Automatic refresh after mutation
- **Background Update**: Stale-while-revalidate

## Performance Optimization

### Frontend
- **Code Splitting**: Route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: WebP format usage
- **Bundle Analysis**: webpack-bundle-analyzer

### Backend
- **Connection Pooling**: PostgreSQL connection pool
- **Response Caching**: node-cache utilization
- **Compression**: gzip compression
- **Rate Limiting**: API call restriction

## Security Configuration

### Authentication & Authorization
- **JWT Tokens**: 15-minute expiration
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access**: User type verification
- **Session Management**: Secure cookie handling

### Data Protection
- **Input Sanitization**: XSS prevention
- **SQL Injection**: ORM-based protection
- **CORS Policy**: Restricted domain access
- **Rate Limiting**: DDoS protection

### Mongolian-Specific Security
- **Citizen ID Validation**: 2-letter + 8-digit format
- **Employment Integration**: Secure citizen_id handling
- **Privacy Compliance**: Personal data encryption

## API Documentation

### Authentication Endpoints
```
POST /api/auth/register    - User registration
POST /api/auth/login       - User login
POST /api/auth/logout      - User logout
GET  /api/auth/me          - Current user profile
```

### Job Management Endpoints
```
GET    /api/jobs           - List job postings
GET    /api/jobs/:id       - Get job details
POST   /api/jobs           - Create job posting
PUT    /api/jobs/:id       - Update job posting
DELETE /api/jobs/:id       - Delete job posting
POST   /api/jobs/:id/apply - Apply to job
```

### Company Management Endpoints
```
GET    /api/companies      - List companies
GET    /api/companies/:id  - Get company details
POST   /api/companies      - Register company
PUT    /api/companies/:id  - Update company profile
```

### Chat System Endpoints
```
GET    /api/chats          - List user chats
POST   /api/chats          - Start new chat
GET    /api/chats/:id      - Get chat messages
POST   /api/chats/:id      - Send message
```

## Monitoring & Analytics

### Performance Metrics
- **Response Time**: API endpoint performance
- **Database Queries**: Query execution time
- **User Engagement**: Feature usage statistics
- **Error Rates**: Application error tracking

### Business Metrics
- **User Registration**: Daily/monthly signups
- **Job Applications**: Application success rates
- **Company Engagement**: Posting and hiring metrics
- **Subscription Metrics**: Revenue and retention

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: User flow testing
- **Visual Regression**: UI consistency testing

### Backend Testing
- **Unit Tests**: Function and module testing
- **API Tests**: Endpoint testing
- **Database Tests**: Data integrity testing
- **Load Tests**: Performance under stress

## Deployment Pipeline

### Development Workflow
```
Feature Branch → Pull Request → Code Review → Testing → Staging → Production
```

### CI/CD Pipeline
- **Automated Testing**: Run test suites on commit
- **Build Process**: Automated build and packaging
- **Deployment**: Automated deployment to staging/production
- **Rollback**: Quick rollback capability

This technical specification provides a comprehensive overview of the JobMongol platform architecture, ensuring scalable and maintainable development practices. 