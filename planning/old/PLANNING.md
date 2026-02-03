# my-meal Project: Full Stack Planning Document

## Executive Summary

This document outlines the architecture and technology stack for transitioning the my-meal prototype from a local single-machine application to a multi-platform solution accessible from multiple devices simultaneously. The goal is to create two applications (admin/restaurant app and guest app) that work seamlessly across Android, iOS, Windows, and macOS using a single codebase, without requiring app store registration.

**Recommended Approach**: Progressive Web Application (PWA) with a Node.js backend and PostgreSQL database, deployed on your Hetzner Webhosting XL server.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Technology Options](#frontend-technology-options)
3. [Backend Technology Options](#backend-technology-options)
4. [Database Options](#database-options)
5. [Deployment Strategy](#deployment-strategy)
6. [Development Workflow](#development-workflow)
7. [Technical Challenges & Solutions](#technical-challenges--solutions)
8. [Recommended Tech Stack](#recommended-tech-stack)
9. [Implementation Phases](#implementation-phases)
10. [Hetzner Server Configuration](#hetzner-server-configuration)
11. [CI/CD with GitHub Actions](#github-actions-for-cicd--recommended-enhancement)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Devices                       │
│  (Android, iOS, Windows, macOS via Web Browsers)        │
│                                                           │
│  ┌──────────────────┐        ┌──────────────────┐      │
│  │  Admin/Restaurant │        │   Guest App      │      │
│  │       PWA         │        │      PWA         │      │
│  └──────────────────┘        └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Hetzner Webhosting XL Server                │
│                                                           │
│  ┌──────────────────────────────────────────────┐       │
│  │         Node.js Backend (Express/Fastify)    │       │
│  │                                               │       │
│  │  • REST API endpoints                        │       │
│  │  • Business logic (voting, meal selection)   │       │
│  │  • Authentication/Authorization              │       │
│  │  • File upload handling (images)             │       │
│  └──────────────────────────────────────────────┘       │
│                          │                                │
│                          ▼                                │
│  ┌──────────────────────────────────────────────┐       │
│  │     PostgreSQL/MariaDB Database              │       │
│  │                                               │       │
│  │  • meals_database                            │       │
│  │  • weekly_options                            │       │
│  │  • guest_votes                               │       │
│  │  • meal_plans                                │       │
│  └──────────────────────────────────────────────┘       │
│                                                           │
│  ┌──────────────────────────────────────────────┐       │
│  │         File Storage (images/)               │       │
│  └──────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Client-Server Architecture**: Computation happens on the server; clients are responsible for UI rendering and user interaction
2. **Centralized Data Storage**: Single source of truth on the server database
3. **Stateless API**: RESTful API design for scalability
4. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced features with JS enabled

---

## Frontend Technology Options

### Option 1: Progressive Web App (PWA) ⭐ **RECOMMENDED**

**Technology Stack:**
- **Framework**: React with TypeScript or Svelte
- **Build Tool**: Vite (fast, modern)
- **PWA Features**: Workbox for service workers
- **Styling**: CSS Modules or Tailwind CSS
- **State Management**: React Context API or Zustand (functional approach)
- **HTTP Client**: Fetch API or Axios

**Pros:**
- ✅ Single codebase for all platforms (write once, run everywhere)
- ✅ No app store registration required
- ✅ Instant updates (no app store approval delays)
- ✅ Works offline with service workers (optional feature)
- ✅ Can be "installed" on home screen like native apps
- ✅ Direct browser access via URL
- ✅ React/Svelte have excellent functional programming support
- ✅ TypeScript adds type safety with functional patterns
- ✅ Lower development and maintenance costs
- ✅ Easy testing (browser-based)

**Cons:**
- ❌ Slightly less "native feel" than true native apps (though modern PWAs are very close)
- ❌ Limited access to some device features (camera, notifications work though)
- ❌ iOS Safari has some PWA limitations (improving over time)

**Functional Programming Support:**
- React Hooks are inherently functional
- Functional component patterns
- Immutable state updates
- Libraries: Ramda, fp-ts, lodash/fp

### Option 2: Cross-Platform Framework (Flutter/React Native)

**Technology Stack:**
- **Flutter**: Dart language, Material Design
- **React Native**: JavaScript/TypeScript, React patterns

**Pros:**
- ✅ More native-like UI and performance
- ✅ Better device integration
- ✅ Single codebase for mobile platforms

**Cons:**
- ❌ Requires app store registration for mobile distribution (though you can use TestFlight/APK distribution)
- ❌ Separate builds for each platform
- ❌ More complex setup and build process
- ❌ Desktop support requires additional setup (Flutter Desktop, React Native Windows)
- ❌ Steeper learning curve
- ❌ Dart (Flutter) has less mature functional programming ecosystem than JavaScript/TypeScript

### Option 3: Electron for Desktop + PWA for Mobile

**Technology Stack:**
- **Desktop**: Electron (Chromium + Node.js)
- **Mobile**: PWA or React Native

**Pros:**
- ✅ Full desktop application feel
- ✅ Access to native APIs on desktop

**Cons:**
- ❌ Requires maintaining two different distribution channels
- ❌ Electron apps are large (includes Chromium)
- ❌ No benefit for this use case (web app is sufficient)

### Comparison Summary

| Criteria | PWA | Flutter/RN | Electron + PWA |
|----------|-----|-----------|----------------|
| Single codebase | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| No app store | ⭐⭐⭐ | ❌ | ⭐⭐ |
| Development speed | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Functional programming | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Maintenance | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| User experience | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

**Recommendation**: PWA is the clear winner given your requirements.

---

## Backend Technology Options

### Option 1: Node.js with Express/Fastify ⭐ **RECOMMENDED**

**Technology Stack:**
- **Runtime**: Node.js (v20 LTS) or Bun (modern alternative)
- **Framework**: Fastify (faster) or Express (more mature ecosystem)
- **Language**: TypeScript (type safety + functional patterns)
- **Validation**: Zod or Yup (functional validation schemas)
- **Authentication**: JWT (JSON Web Tokens) with Passport.js
- **File Upload**: Multer or Formidable
- **Database Client**: node-postgres (pg) or Prisma ORM

**Pros:**
- ✅ JavaScript/TypeScript on both frontend and backend (code sharing)
- ✅ Excellent functional programming support (fp-ts, Ramda, Effect)
- ✅ Supported on Hetzner Webhosting (Node.js available)
- ✅ Large ecosystem and community
- ✅ Async/await patterns are naturally functional
- ✅ You already have Node.js experience from prototype
- ✅ Fast development cycle
- ✅ JSON-native (perfect for REST APIs)

**Cons:**
- ❌ Single-threaded (mitigated with clustering or worker threads)
- ❌ Can be less performant than compiled languages for CPU-intensive tasks (not an issue for this project)

**Functional Libraries:**
- **fp-ts**: Complete functional programming library (monads, functors, etc.)
- **Effect**: Modern effect system for TypeScript
- **Ramda**: Functional utilities
- **ts-pattern**: Pattern matching
- **io-ts**: Runtime type checking with functional approach

### Option 2: Deno with Oak Framework

**Technology Stack:**
- **Runtime**: Deno (secure TypeScript runtime)
- **Framework**: Oak (Express-like for Deno) or Fresh (modern)
- **Language**: TypeScript (native, no compilation needed)

**Pros:**
- ✅ TypeScript-first (no build step needed)
- ✅ Secure by default (explicit permissions)
- ✅ Modern standard library
- ✅ Built-in tooling (test, format, lint)
- ✅ Good functional programming patterns

**Cons:**
- ❌ May not be supported on Hetzner Webhosting (needs verification)
- ❌ Smaller ecosystem than Node.js
- ❌ Relatively new (less battle-tested)

### Option 3: Python with FastAPI

**Technology Stack:**
- **Language**: Python 3.10+
- **Framework**: FastAPI or Flask
- **Async**: asyncio with async/await
- **Database**: SQLAlchemy ORM

**Pros:**
- ✅ Excellent for data processing
- ✅ Type hints with Pydantic
- ✅ Fast development
- ✅ Strong functional programming support (toolz, fn.py, PyFunctional)

**Cons:**
- ❌ Different language from frontend (less code sharing)
- ❌ Slower than Node.js for I/O-bound operations
- ❌ Python's functional programming is less idiomatic than JavaScript/Haskell

### Option 4: Functional Languages (Haskell, Scala, F#, Elixir)

**Examples:**
- **Haskell**: Servant or Yesod framework
- **Elixir**: Phoenix framework
- **Scala**: Play or Akka HTTP
- **F#**: Giraffe or Saturn

**Pros:**
- ✅ Pure functional programming
- ✅ Excellent type systems
- ✅ Pattern matching and algebraic data types
- ✅ Elixir/Phoenix is excellent for concurrent systems

**Cons:**
- ❌ Likely not supported on standard Hetzner Webhosting
- ❌ Steeper learning curve
- ❌ Smaller talent pool for maintenance
- ❌ Different language from frontend
- ❌ May be overkill for this project's complexity

### Comparison Summary

| Criteria | Node.js/TS | Deno | Python | Pure FP |
|----------|-----------|------|--------|---------|
| Functional programming | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Hetzner compatibility | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ❌ |
| Frontend alignment | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ❌ |
| Development speed | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| Ecosystem maturity | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ | ⭐⭐ |

**Recommendation**: Node.js with TypeScript provides the best balance of functional programming support, practical deployment, and alignment with frontend technology.

---

## Database Options

### Option 1: PostgreSQL ⭐ **RECOMMENDED**

**Why PostgreSQL:**
- ACID compliance (data integrity for voting)
- JSON/JSONB column support (store complex meal structures)
- Rich query capabilities
- Excellent Node.js support (node-postgres, Prisma)
- Supported on Hetzner Webhosting XL

**Schema Design:**

```sql
-- Meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_path VARCHAR(500),
    dietary_info JSONB,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_vegan BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal combinations table
CREATE TABLE meal_combinations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'meat', 'fish', 'vegetarian'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for meal combinations
CREATE TABLE combination_meals (
    combination_id INTEGER REFERENCES meal_combinations(id),
    meal_id INTEGER REFERENCES meals(id),
    PRIMARY KEY (combination_id, meal_id)
);

-- Weekly options (restaurant selections)
CREATE TABLE weekly_options (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL,
    combination_id INTEGER REFERENCES meal_combinations(id),
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_start_date, combination_id)
);

-- Guest votes
CREATE TABLE guest_votes (
    id SERIAL PRIMARY KEY,
    guest_name VARCHAR(255) NOT NULL,
    week_start_date DATE NOT NULL,
    meat_option_id INTEGER REFERENCES meal_combinations(id),
    fish_option_id INTEGER REFERENCES meal_combinations(id),
    vegetarian_option_1_id INTEGER REFERENCES meal_combinations(id),
    vegetarian_option_2_id INTEGER REFERENCES meal_combinations(id),
    voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guest_name, week_start_date)
);

-- Meal plans (final results)
CREATE TABLE meal_plans (
    id SERIAL PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    monday_combination_id INTEGER REFERENCES meal_combinations(id),
    tuesday_combination_id INTEGER REFERENCES meal_combinations(id),
    wednesday_combination_id INTEGER REFERENCES meal_combinations(id),
    thursday_combination_id INTEGER REFERENCES meal_combinations(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Pros:**
- ✅ Relational integrity ensures data consistency
- ✅ Complex queries for vote aggregation
- ✅ JSONB for flexible dietary info storage
- ✅ Transactions ensure atomicity
- ✅ Excellent performance for this scale
- ✅ Native support on Hetzner

**Cons:**
- ❌ Requires schema migrations (but Prisma handles this well)
- ❌ Slightly more complex setup than JSON files

### Option 2: MariaDB/MySQL

**Why MariaDB:**
- Similar to PostgreSQL but MySQL-compatible
- JSON support (less mature than PostgreSQL)
- Widely supported

**Pros:**
- ✅ Very mature and stable
- ✅ Guaranteed on Hetzner Webhosting
- ✅ Similar schema design to PostgreSQL

**Cons:**
- ❌ JSON support not as robust as PostgreSQL
- ❌ Some advanced features less developed

### Option 3: SQLite with File Locking

**Why SQLite:**
- Single file database
- Zero configuration
- Embeddable

**Pros:**
- ✅ Extremely simple setup
- ✅ No separate database server needed
- ✅ Perfect for moderate traffic

**Cons:**
- ❌ Not ideal for concurrent writes (voting could be problematic)
- ❌ Limited scalability
- ❌ Not recommended for production multi-user applications

### Option 4: NoSQL (MongoDB, CouchDB)

**Why NoSQL:**
- Schema-less flexibility
- JSON-native storage

**Pros:**
- ✅ Very close to current JSON file structure
- ✅ Easy migration from prototype
- ✅ Flexible schema

**Cons:**
- ❌ Likely not available on Hetzner Webhosting XL (needs verification)
- ❌ No ACID guarantees (problematic for voting)
- ❌ Requires additional hosting/setup

### Option 5: Keep JSON Files with Proper Locking

**Why Keep Files:**
- Minimal changes from prototype
- No database setup required

**Pros:**
- ✅ Simple migration path
- ✅ Human-readable
- ✅ Works on any hosting

**Cons:**
- ❌ Race conditions with concurrent access
- ❌ No query capabilities
- ❌ Manual backup management
- ❌ Not scalable
- ❌ Not recommended for multi-user applications

### Comparison Summary

| Criteria | PostgreSQL | MariaDB | SQLite | MongoDB | JSON Files |
|----------|-----------|---------|--------|---------|-----------|
| ACID compliance | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ | ❌ |
| Concurrent writes | ⭐⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐ | ❌ |
| Hetzner support | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | ⭐⭐⭐ |
| Query capabilities | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ❌ |
| JSON support | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Setup complexity | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐ | ⭐⭐⭐ |

**Recommendation**: PostgreSQL offers the best combination of features, reliability, and hosting compatibility.

---

## Deployment Strategy

### Hetzner Webhosting XL Capabilities

According to the specifications, Hetzner Webhosting XL provides:
- **Storage**: 300GB
- **Databases**: 50 databases (MariaDB/PostgreSQL)
- **PHP processes**: 20
- **Memory limit**: 512MB per process
- **SSH access**: Yes
- **Node.js support**: Yes
- **Cronjobs**: 20

### Deployment Architecture on Hetzner

```
┌───────────────────────────────────────────────────┐
│         Hetzner Webhosting XL Server              │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │           Nginx/Apache (Web Server)        │  │
│  │                                             │  │
│  │  • Serves static PWA files                 │  │
│  │  • Reverse proxy to Node.js backend       │  │
│  │  • SSL/TLS termination                     │  │
│  └────────────────────────────────────────────┘  │
│                        │                           │
│                        ▼                           │
│  ┌────────────────────────────────────────────┐  │
│  │      Node.js Backend (Port 3000)           │  │
│  │                                             │  │
│  │  • Managed by PM2 (process manager)       │  │
│  │  • Auto-restart on failure                │  │
│  │  • Logging and monitoring                 │  │
│  └────────────────────────────────────────────┘  │
│                        │                           │
│                        ▼                           │
│  ┌────────────────────────────────────────────┐  │
│  │         PostgreSQL Database                │  │
│  └────────────────────────────────────────────┘  │
│                                                    │
│  ┌────────────────────────────────────────────┐  │
│  │         File Storage (images/)             │  │
│  └────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

### Deployment Options

#### Option 1: Traditional Deployment ⭐ **RECOMMENDED**

**Process:**
1. SSH into Hetzner server
2. Clone Git repository
3. Install dependencies (`npm install`)
4. Build frontend (`npm run build`)
5. Set up PostgreSQL database
6. Run migrations
7. Start Node.js backend with PM2
8. Configure Nginx/Apache reverse proxy

**Tools:**
- **Process Manager**: PM2 (keeps Node.js running, auto-restart)
- **Version Control**: Git
- **Build**: npm scripts
- **Environment**: `.env` files for configuration

**Deployment Script Example:**
```bash
#!/bin/bash
# deploy.sh

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build frontend
cd frontend
npm run build
cd ..

# Run database migrations
npm run migrate

# Restart backend
pm2 restart my-meal-backend

# Copy built frontend to web directory
cp -r frontend/dist/* /var/www/html/my-meal/
```

#### Option 2: Docker Deployment

**Setup:**
- Containerize frontend, backend, and database
- Use Docker Compose for orchestration
- Easier to replicate environment

**Pros:**
- ✅ Consistent environment
- ✅ Easy to test locally
- ✅ Isolated dependencies

**Cons:**
- ❌ Requires Docker support on Hetzner (may need VPS upgrade)
- ❌ More complex initial setup
- ❌ Overkill for this project size

#### Option 3: Platform-as-a-Service (Vercel, Netlify, Railway)

**Setup:**
- Deploy frontend to Vercel/Netlify (free tier)
- Deploy backend to Railway or Render
- Use managed PostgreSQL

**Pros:**
- ✅ Very simple deployment (git push)
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Excellent developer experience

**Cons:**
- ❌ Additional monthly costs
- ❌ Don't utilize existing Hetzner hosting
- ❌ Multiple services to manage

### Recommended Deployment Steps

1. **Initial Setup**:
   ```bash
   # On Hetzner server via SSH
   cd /var/www
   git clone <repository-url> my-meal
   cd my-meal
   npm install
   
   # Install PM2 globally
   npm install -g pm2
   
   # Create PostgreSQL database
   createdb my_meal_db
   ```

2. **Configure Environment**:
   ```bash
   # Create .env file
   cat > .env << EOF
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://user:password@localhost:5432/my_meal_db
   JWT_SECRET=$(openssl rand -base64 32)
   UPLOAD_DIR=/var/www/my-meal/uploads
   EOF
   ```

3. **Build and Start**:
   ```bash
   # Build frontend
   npm run build
   
   # Start backend with PM2
   pm2 start npm --name "my-meal" -- start
   pm2 save
   pm2 startup  # Auto-start on server reboot
   ```

4. **Configure Web Server**:
   ```nginx
   # Nginx configuration example
   server {
       listen 80;
       server_name my-meal.example.com;
       
       # Serve frontend static files
       location / {
           root /var/www/my-meal/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to Node.js
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Serve uploaded images
       location /uploads {
           alias /var/www/my-meal/uploads;
       }
   }
   ```

### GitHub Actions for CI/CD ⭐ **RECOMMENDED ENHANCEMENT**

[GitHub Actions](https://github.com/features/actions) provides powerful automation for continuous integration and deployment, making your development workflow more efficient and reliable.

#### What is GitHub Actions?

GitHub Actions is a CI/CD platform integrated directly into GitHub that allows you to automate workflows triggered by repository events (push, pull request, releases, etc.). It's free for public repositories and includes generous free minutes for private repositories.

**Key Benefits for This Project:**
- ✅ Automated testing on every push/PR
- ✅ Automated deployment to Hetzner on successful merge
- ✅ Consistent build environment
- ✅ No need for separate CI/CD service
- ✅ Free for public repositories
- ✅ Easy to configure with YAML files
- ✅ Large marketplace of pre-built actions

#### Recommended GitHub Actions Workflows

**1. Continuous Integration Workflow** (`.github/workflows/ci.yml`)

This workflow runs tests and checks on every push and pull request:

```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  # Backend tests and linting
  backend:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: my_meal_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'backend/package-lock.json'
      
      - name: Install backend dependencies
        working-directory: ./backend
        run: npm ci
      
      - name: Run database migrations
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/my_meal_test
        run: npx prisma migrate deploy
      
      - name: Run backend tests
        working-directory: ./backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/my_meal_test
          JWT_SECRET: test-secret-key
        run: npm test
      
      - name: Lint backend code
        working-directory: ./backend
        run: npm run lint
      
      - name: Type check
        working-directory: ./backend
        run: npm run type-check
  
  # Frontend tests and linting
  frontend:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'
      
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test
      
      - name: Lint frontend code
        working-directory: ./frontend
        run: npm run lint
      
      - name: Type check
        working-directory: ./frontend
        run: npm run type-check
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
  
  # End-to-end tests
  e2e:
    runs-on: ubuntu-latest
    needs: [backend, frontend]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: my_meal_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Start backend
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/my_meal_test
          JWT_SECRET: test-secret-key
          PORT: 3000
        run: |
          cd backend
          npx prisma migrate deploy
          npm run build
          npm start &
          # Wait for backend to be ready
          sleep 5
      
      - name: Start frontend
        run: |
          cd frontend
          npm run build
          npm run preview &
          # Wait for frontend to be ready
          sleep 5
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

**2. Continuous Deployment Workflow** (`.github/workflows/deploy.yml`)

This workflow automatically deploys to Hetzner when changes are merged to main:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:  # Allow manual deployment

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm run build
      
      - name: Build backend
        working-directory: ./backend
        run: npm run build
      
      - name: Deploy to Hetzner
        uses: appleboy/ssh-action@v1.0.0
        env:
          DEPLOY_PATH: /var/www/my-meal
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: ${{ secrets.HETZNER_USERNAME }}
          key: ${{ secrets.HETZNER_SSH_KEY }}
          port: 22
          envs: DEPLOY_PATH
          script: |
            # Navigate to project directory
            cd $DEPLOY_PATH
            
            # Pull latest changes
            git pull origin main
            
            # Backup current database
            ./scripts/backup-db.sh
            
            # Install backend dependencies
            cd backend
            npm ci --production
            
            # Run database migrations
            npx prisma migrate deploy
            
            # Build backend
            npm run build
            
            # Install frontend dependencies and build
            cd ../frontend
            npm ci --production
            npm run build
            
            # Copy built frontend to web directory
            sudo cp -r dist/* /var/www/html/my-meal/
            
            # Restart Node.js backend with PM2
            pm2 restart my-meal-backend
            
            # Verify deployment
            pm2 status
      
      - name: Notify deployment status
        if: always()
        run: |
          if [ "${{ job.status }}" == "success" ]; then
            echo "✅ Deployment successful!"
          else
            echo "❌ Deployment failed!"
          fi
```

**3. Dependency Security Scanning** (`.github/workflows/security.yml`)

```yaml
name: Security Scan

on:
  schedule:
    # Run weekly on Monday at 9:00 AM UTC
    - cron: '0 9 * * 1'
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Audit backend dependencies
        working-directory: ./backend
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Audit frontend dependencies
        working-directory: ./frontend
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

**4. Database Backup Workflow** (`.github/workflows/backup.yml`)

```yaml
name: Database Backup

on:
  schedule:
    # Run daily at 2:00 AM UTC
    - cron: '0 2 * * *'
  workflow_dispatch:  # Allow manual backup

jobs:
  backup:
    runs-on: ubuntu-latest
    environment: production
    
    steps:
      - name: Trigger backup on server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: ${{ secrets.HETZNER_USERNAME }}
          key: ${{ secrets.HETZNER_SSH_KEY }}
          port: 22
          script: |
            /var/www/my-meal/scripts/backup-db.sh
            echo "Backup completed at $(date)"
      
      - name: Notify backup status
        if: failure()
        run: echo "❌ Backup failed! Please check manually."
```

#### Setting Up GitHub Actions

**1. Configure Repository Secrets**

Navigate to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `HETZNER_HOST`: Your Hetzner server IP or domain
- `HETZNER_USERNAME`: SSH username
- `HETZNER_SSH_KEY`: Private SSH key for authentication (generate a dedicated deploy key)
- `SNYK_TOKEN`: (Optional) For security scanning

**2. Generate SSH Deploy Key**

On your local machine:

```bash
# Generate a dedicated SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copy public key to Hetzner server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub username@your-server.hetzner.com

# Copy private key content to clipboard
cat ~/.ssh/github_actions_deploy
# Add this as HETZNER_SSH_KEY secret in GitHub
```

**3. Create Workflow Files**

Create `.github/workflows/` directory in your repository and add the workflow files above.

**4. Configure Environment Protection** (Optional but Recommended)

For production deployments:
1. Go to Settings → Environments → New environment
2. Name it "production"
3. Add protection rules:
   - Required reviewers (for manual approval before deploy)
   - Wait timer (e.g., 5 minutes before deployment)
   - Deployment branches (only `main` branch)

#### GitHub Actions Workflow Visualization

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ git push
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Trigger
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Runner                     │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Lint     │  │   Test     │  │   Build    │            │
│  │  Backend   │  │  Backend   │  │  Backend   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Lint     │  │   Test     │  │   Build    │            │
│  │  Frontend  │  │  Frontend  │  │  Frontend  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │         E2E Tests (Playwright)          │                │
│  └─────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ If main branch & tests pass
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Deploy to Hetzner Server                    │
│                                                               │
│  1. SSH into server                                          │
│  2. Pull latest code                                         │
│  3. Run migrations                                           │
│  4. Build & install                                          │
│  5. Restart PM2                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Advantages of Using GitHub Actions

**Development Efficiency:**
- Catch bugs early with automated tests on every PR
- Consistent build environment (no "works on my machine" issues)
- Parallel test execution speeds up CI
- Automated code quality checks (linting, type checking)

**Deployment Safety:**
- Only deploy code that passes all tests
- Database backup before each deployment
- Easy rollback (redeploy previous commit)
- Deployment history and logs in GitHub

**Maintenance:**
- Automated security audits
- Dependency update checks
- Scheduled database backups
- Server health monitoring (can add custom checks)

**Cost:**
- Free for public repositories
- 2,000 minutes/month free for private repos
- This project likely uses < 100 minutes/month

#### Integration with Existing Deployment

GitHub Actions complements the manual deployment strategy:

**Initial Setup**: Manual deployment following the steps above
**Ongoing Deployments**: Automated via GitHub Actions
**Emergency Fixes**: Manual deployment still available via SSH

You can also use a hybrid approach:
- GitHub Actions for CI (testing, linting)
- Manual deployment for production
- Automated deployment for staging environment

#### Additional Useful Workflows

**5. Preview Deployments for Pull Requests**

Deploy each PR to a preview environment:

```yaml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build frontend
        working-directory: ./frontend
        run: |
          npm ci
          npm run build
      
      - name: Deploy to Netlify/Vercel
        # Deploy preview to free hosting service
        # Get preview URL and comment on PR
        run: echo "Preview URL: https://pr-${{ github.event.number }}.preview.com"
```

**6. Automatic Dependency Updates**

Use Dependabot or Renovate to automatically create PRs for dependency updates:

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
  
  - package-ecosystem: "npm"
    directory: "/frontend"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

**7. Performance Monitoring**

Add Lighthouse CI for automated performance testing:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [ main ]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:5173/
            http://localhost:5173/admin
            http://localhost:5173/guest
          uploadArtifacts: true
```

#### Monitoring and Notifications

**Slack/Discord Integration:**

Add notifications to your team chat:

```yaml
- name: Notify on Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Deployment to production ${{ job.status }}'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

**Email Notifications:**

GitHub automatically sends email notifications for workflow failures if enabled in repository settings.

#### Cost Analysis for GitHub Actions

**Free Tier (Private Repository):**
- 2,000 minutes/month
- CI workflow (~5 min per run): ~400 runs/month
- Deploy workflow (~2 min per run): ~1,000 runs/month
- More than enough for this project

**Actual Usage Estimate:**
- CI runs: ~100/month (assuming 25 PRs + commits)
- Deploy runs: ~20/month
- Total: ~520 minutes/month (well under free tier)

#### Alternatives to GitHub Actions

If you prefer other tools:

**GitLab CI/CD**: Similar features, different syntax
**Jenkins**: Self-hosted, more configuration
**CircleCI**: Popular, generous free tier
**Travis CI**: Classic choice, now limited free tier

However, GitHub Actions is recommended because:
- Native integration with GitHub
- No additional setup required
- Free for your use case
- Growing marketplace of actions
- Active community

#### Recommended Approach

**Phase 1 (Initial Implementation):**
1. Set up CI workflow for automated testing
2. Manual deployment to production

**Phase 2 (After Stable Production):**
1. Add automated deployment workflow
2. Set up environment protection rules
3. Add security scanning

**Phase 3 (Optimization):**
1. Add preview deployments
2. Set up automated dependency updates
3. Add performance monitoring

This phased approach lets you gain confidence with GitHub Actions gradually while maintaining control over production deployments.

---

## Development Workflow

### Project Structure

```
my-meal/
├── frontend/                 # PWA application
│   ├── public/
│   │   ├── manifest.json    # PWA manifest
│   │   └── service-worker.js
│   ├── src/
│   │   ├── apps/
│   │   │   ├── admin/       # Admin/restaurant app
│   │   │   └── guest/       # Guest voting app
│   │   ├── components/      # Shared UI components
│   │   ├── lib/            # Utilities and helpers
│   │   ├── types/          # TypeScript types
│   │   └── api/            # API client functions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   │   ├── meals.ts
│   │   │   ├── votes.ts
│   │   │   └── admin.ts
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   │   ├── voting.ts
│   │   │   └── mealPlan.ts
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Helper functions
│   │   └── index.ts        # Main entry point
│   ├── prisma/             # Database schema
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                  # Shared code between frontend/backend
│   ├── types/              # Common TypeScript types
│   └── validation/         # Zod schemas
│
├── uploads/                 # Meal images (gitignored)
├── docker-compose.yml       # Optional: local development
├── .env.example
├── PLANNING.md             # This document
├── SPECIFICATION.md
└── README.md
```

### Development Environment Setup

**Prerequisites:**
- Node.js 20+ or Bun
- PostgreSQL 15+
- Git
- Code editor (VS Code recommended with extensions)

**Local Development:**
```bash
# Clone repository
git clone <repository-url>
cd my-meal

# Install dependencies
npm install

# Set up local database
createdb my_meal_dev
cp .env.example .env
# Edit .env with local configuration

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Start development servers (concurrent)
npm run dev
# This starts:
# - Frontend dev server (Vite) on http://localhost:5173
# - Backend dev server (nodemon) on http://localhost:3000
```

### Development Tools

**Code Quality:**
- **ESLint**: Linting (with functional programming rules)
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks for pre-commit checks

**Testing:**
- **Vitest**: Unit tests (frontend and backend)
- **Playwright**: End-to-end tests
- **Supertest**: API integration tests

**Database:**
- **Prisma**: ORM with migrations and type-safe queries
- **Prisma Studio**: Database GUI

**Functional Programming Tools:**
- **fp-ts**: Functional programming library
- **Effect**: Effect system for TypeScript
- **ts-pattern**: Pattern matching
- **Zod**: Schema validation with functional API

---

## Technical Challenges & Solutions

### Challenge 1: Concurrent Vote Submission

**Problem**: Multiple guests voting simultaneously could cause race conditions.

**Solutions:**

1. **Database Transactions** (Recommended):
   ```typescript
   // Use PostgreSQL transactions to ensure atomicity
   await prisma.$transaction(async (tx) => {
     const existing = await tx.guestVote.findUnique({
       where: { guestName_weekStartDate: { guestName, weekStartDate } }
     });
     
     if (existing) {
       throw new Error('Guest has already voted');
     }
     
     await tx.guestVote.create({ data: voteData });
   });
   ```

2. **Optimistic Locking**: Use version numbers to detect conflicts

3. **Database Constraints**: UNIQUE constraint on `(guest_name, week_start_date)` prevents duplicate votes

### Challenge 2: Image Upload and Storage

**Problem**: Meal images need to be uploaded, stored, and served efficiently.

**Solutions:**

1. **Local File Storage** (Simple, recommended for start):
   - Store images in `uploads/` directory
   - Serve via Express static middleware or Nginx
   - Use multer for handling uploads
   - Generate thumbnails for better performance

2. **Object Storage** (Scalable alternative):
   - Use Hetzner Storage Box or S3-compatible storage
   - Better for scaling and CDN integration
   - Separates storage from application server

**Implementation:**
```typescript
import multer from 'multer';
import path from 'path';
import sharp from 'sharp'; // For image processing

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    cb(null, isValid);
  }
});

// Generate thumbnail
const generateThumbnail = async (imagePath: string) => {
  const thumbnailPath = imagePath.replace(/(\.\w+)$/, '-thumb$1');
  await sharp(imagePath)
    .resize(300, 300, { fit: 'cover' })
    .toFile(thumbnailPath);
  return thumbnailPath;
};
```

### Challenge 3: Real-Time Updates

**Problem**: Admin and restaurant need to see votes in real-time; guests need to see when voting closes.

**Solutions:**

1. **Server-Sent Events (SSE)** (Recommended):
   ```typescript
   // Backend
   app.get('/api/votes/stream', (req, res) => {
     res.setHeader('Content-Type', 'text/event-stream');
     res.setHeader('Cache-Control', 'no-cache');
     res.setHeader('Connection', 'keep-alive');
     
     const sendUpdate = (data: any) => {
       res.write(`data: ${JSON.stringify(data)}\n\n`);
     };
     
     // Subscribe to vote updates
     voteEmitter.on('vote-submitted', sendUpdate);
     
     req.on('close', () => {
       voteEmitter.off('vote-submitted', sendUpdate);
     });
   });
   
   // Frontend
   const eventSource = new EventSource('/api/votes/stream');
   eventSource.onmessage = (event) => {
     const data = JSON.parse(event.data);
     updateVoteCounts(data);
   };
   ```

2. **WebSockets**: More complex but bidirectional
   - Use Socket.IO library
   - Better for chat-like features (not needed here)

3. **Polling**: Simple but inefficient
   - Fetch updates every N seconds
   - Fallback option if SSE not available

### Challenge 4: Meal Plan Generation Algorithm

**Problem**: Aggregating votes fairly while ensuring variety (1 meat, 1 fish, 2 vegetarian).

**Solution - Functional Voting Algorithm:**

```typescript
import { pipe } from 'fp-ts/function';
import * as A from 'fp-ts/Array';
import * as R from 'fp-ts/Record';
import * as O from 'fp-ts/Option';

type Vote = {
  guestName: string;
  meatOption: string;
  fishOption: string;
  vegetarianOptions: [string, string];
};

type VoteCount = Record<string, number>;

// Functional vote counting
const countVotes = (votes: Vote[], category: keyof Vote): VoteCount => {
  return pipe(
    votes,
    A.flatMap(vote => {
      const value = vote[category];
      return Array.isArray(value) ? value : [value];
    }),
    A.reduce({} as VoteCount, (acc, option) => ({
      ...acc,
      [option]: (acc[option] || 0) + 1
    }))
  );
};

// Get top N options
const getTopOptions = (counts: VoteCount, n: number): string[] => {
  return pipe(
    counts,
    R.toEntries,
    A.sort(([, a], [, b]) => b - a),
    A.take(n),
    A.map(([option]) => option)
  );
};

// Generate meal plan ensuring variety
const generateMealPlan = (votes: Vote[]): MealPlan => {
  const meatCounts = countVotes(votes, 'meatOption');
  const fishCounts = countVotes(votes, 'fishOption');
  const vegCounts = countVotes(votes, 'vegetarianOptions');
  
  const topMeat = getTopOptions(meatCounts, 1)[0];
  const topFish = getTopOptions(fishCounts, 1)[0];
  const topVeg = getTopOptions(vegCounts, 2);
  
  // Ensure no duplicates
  const allSelected = new Set([topMeat, topFish, ...topVeg]);
  
  if (allSelected.size < 4) {
    // Handle tie-breaking or insufficient variety
    return handleInsufficientVariety(votes);
  }
  
  return {
    monday: topMeat,
    tuesday: topFish,
    wednesday: topVeg[0],
    thursday: topVeg[1]
  };
};
```

### Challenge 5: Offline Support for PWA

**Problem**: Guests might have unreliable internet; need to handle offline scenarios.

**Solutions:**

1. **Service Worker Caching**:
   - Cache app shell (HTML, CSS, JS)
   - Cache meal images
   - Cache API responses with staleness strategy

2. **Offline Vote Queuing**:
   - Store votes in IndexedDB when offline
   - Sync when connection restored
   - Show clear offline indicator

**Implementation with Workbox:**
```typescript
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache images with stale-while-revalidate
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'meal-images',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.ok ? response : null;
        }
      }
    ]
  })
);

// API calls use network-first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10
  })
);
```

### Challenge 6: Authentication and Authorization

**Problem**: Need to distinguish admin/restaurant users from guests without complex login.

**Solutions:**

1. **Simple Token-Based System** (Recommended for prototype):
   - Admin/restaurant uses a shared secret token
   - Guests identify with name only (no password)
   - Use JWT for stateless authentication

```typescript
// Backend
import jwt from 'jsonwebtoken';

// Admin login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Middleware to check admin
const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Guest "login" (just store name)
app.post('/api/guest/identify', (req, res) => {
  const { name } = req.body;
  const token = jwt.sign(
    { role: 'guest', name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
});
```

2. **Future Enhancement - Proper Authentication**:
   - Integrate with school's existing authentication system
   - OAuth/SAML for single sign-on
   - Email verification for guests

### Challenge 7: Database Migration from JSON Files

**Problem**: Need to migrate existing data from prototype's JSON files to PostgreSQL.

**Solution - Migration Script:**

```typescript
// scripts/migrate-from-json.ts
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateDatabase() {
  // Read JSON files
  const mealsDb = JSON.parse(await fs.readFile('meals_database.json', 'utf-8'));
  
  // Migrate meals
  for (const meal of mealsDb.meals) {
    await prisma.meal.create({
      data: {
        name: meal.name,
        imagePath: meal.image,
        dietaryInfo: meal.dietary_info,
        isVegetarian: meal.vegetarian,
        isVegan: meal.vegan
      }
    });
  }
  
  // Migrate meal combinations
  for (const combo of mealsDb.meal_combinations) {
    const mealIds = await Promise.all(
      combo.meals.map(mealName => 
        prisma.meal.findFirst({ where: { name: mealName } })
      )
    );
    
    await prisma.mealCombination.create({
      data: {
        name: combo.name,
        category: combo.category,
        meals: {
          connect: mealIds.map(meal => ({ id: meal.id }))
        }
      }
    });
  }
  
  console.log('Migration completed successfully');
}

migrateDatabase().catch(console.error);
```

### Challenge 8: Testing Strategy

**Problem**: Ensure reliability across voting, meal selection, and plan generation.

**Solution - Comprehensive Test Suite:**

1. **Unit Tests** (Vitest):
   ```typescript
   // tests/voting.test.ts
   import { describe, it, expect } from 'vitest';
   import { generateMealPlan } from '../src/services/voting';
   
   describe('Vote Counting', () => {
     it('should select most popular options', () => {
       const votes = [
         { guestName: 'Alice', meatOption: 'Burger', fishOption: 'Tuna', vegetarianOptions: ['Salad', 'Pasta'] },
         { guestName: 'Bob', meatOption: 'Burger', fishOption: 'Salmon', vegetarianOptions: ['Salad', 'Pizza'] }
       ];
       
       const plan = generateMealPlan(votes);
       expect(plan.monday).toBe('Burger');
       expect([plan.wednesday, plan.thursday]).toContain('Salad');
     });
   });
   ```

2. **Integration Tests** (Supertest):
   ```typescript
   // tests/api.test.ts
   import request from 'supertest';
   import { app } from '../src/index';
   
   describe('API Endpoints', () => {
     it('should submit a vote', async () => {
       const response = await request(app)
         .post('/api/votes')
         .send({
           guestName: 'Test User',
           meatOption: 'Burger',
           fishOption: 'Tuna',
           vegetarianOptions: ['Salad', 'Pasta']
         })
         .expect(201);
       
       expect(response.body).toHaveProperty('id');
     });
   });
   ```

3. **E2E Tests** (Playwright):
   ```typescript
   // tests/e2e/voting.spec.ts
   import { test, expect } from '@playwright/test';
   
   test('guest can submit vote', async ({ page }) => {
     await page.goto('http://localhost:5173/guest');
     await page.fill('input[name="guestName"]', 'Test Guest');
     await page.click('button:has-text("Burger")');
     await page.click('button:has-text("Tuna")');
     await page.click('button:has-text("Salad")');
     await page.click('button:has-text("Pasta")');
     await page.click('button:has-text("Submit Vote")');
     
     await expect(page.locator('text=Vote submitted successfully')).toBeVisible();
   });
   ```

---

## Recommended Tech Stack

### Summary of Recommendations

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React + TypeScript + Vite | PWA, functional patterns, fast dev |
| **Styling** | Tailwind CSS | Utility-first, rapid development |
| **State Management** | Zustand | Functional, lightweight |
| **Backend** | Node.js + Fastify + TypeScript | Fast, functional, aligned with frontend |
| **Database** | PostgreSQL + Prisma | ACID, JSON support, type-safe ORM |
| **Authentication** | JWT | Stateless, simple |
| **File Upload** | Multer + Sharp | Standard, image processing |
| **Process Manager** | PM2 | Auto-restart, monitoring |
| **CI/CD** | GitHub Actions | Free, integrated, automated testing & deployment |
| **Testing** | Vitest + Playwright | Fast, modern |
| **Functional Libraries** | fp-ts, Effect, Ramda | Comprehensive FP support |
| **Hosting** | Hetzner Webhosting XL | Existing resource |

### Complete Package.json Dependencies

**Frontend:**
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "fp-ts": "^2.16.0",
    "zod": "^3.22.0",
    "date-fns": "^3.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.4.0",
    "vitest": "^1.0.0"
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "fastify": "^4.25.0",
    "@fastify/cors": "^8.5.0",
    "@fastify/jwt": "^7.2.0",
    "@fastify/multipart": "^8.0.0",
    "@fastify/static": "^6.12.0",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.0",
    "fp-ts": "^2.16.0",
    "effect": "^2.0.0",
    "sharp": "^0.33.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "prisma": "^5.7.0",
    "tsx": "^4.7.0",
    "nodemon": "^3.0.0",
    "vitest": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^6.0.0"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

**Goals:**
- Set up development environment
- Initialize project structure
- Set up database schema

**Tasks:**
1. Create monorepo structure
2. Initialize frontend with Vite + React + TypeScript
3. Initialize backend with Fastify + TypeScript
4. Set up Prisma with PostgreSQL
5. Define database schema
6. Create migration scripts from prototype JSON
7. Set up ESLint, Prettier, TypeScript configs
8. Write README with setup instructions

**Deliverables:**
- Working dev environment
- Database schema migrated
- Basic project scaffolding

### Phase 2: Backend API (Week 3-4)

**Goals:**
- Implement core API endpoints
- Business logic for voting and meal planning

**Tasks:**
1. Implement meal database endpoints (CRUD)
2. Implement weekly options endpoints
3. Implement guest voting endpoints with validation
4. Implement meal plan generation algorithm
5. Add JWT authentication
6. Implement file upload for meal images
7. Write unit tests for business logic
8. Write API integration tests

**Deliverables:**
- Fully functional REST API
- 80%+ test coverage
- API documentation (Swagger/OpenAPI)

### Phase 3: Frontend - Admin/Restaurant App (Week 5-6)

**Goals:**
- Build admin and restaurant interfaces

**Tasks:**
1. Create routing structure (React Router)
2. Build meal database upload UI
3. Build meal selection UI for restaurant
4. Build meal plan viewing/generation UI
5. Implement authentication flow
6. Create shared UI components
7. Implement image upload component
8. Add loading states and error handling
9. Write component tests

**Deliverables:**
- Functional admin/restaurant PWA
- Responsive design

### Phase 4: Frontend - Guest App (Week 7-8)

**Goals:**
- Build guest voting interface

**Tasks:**
1. Create guest identification flow
2. Build meal option browsing UI
3. Implement voting selection UI
   - Display meal combinations clearly
   - Show dietary information
   - Visual feedback for selections
4. Add validation (exactly 1 meat, 1 fish, 2 veg)
5. Implement vote submission
6. Add success/error feedback
7. Write E2E tests for voting flow

**Deliverables:**
- Functional guest voting PWA
- Mobile-optimized design

### Phase 5: PWA Features (Week 9)

**Goals:**
- Add Progressive Web App capabilities

**Tasks:**
1. Configure service worker with Workbox
2. Create PWA manifest
3. Implement offline detection
4. Add "install to home screen" prompt
5. Optimize image loading and caching
6. Test offline functionality
7. Test on various devices and browsers

**Deliverables:**
- Installable PWA
- Basic offline support

### Phase 6: Deployment (Week 10)

**Goals:**
- Deploy to Hetzner server
- Set up CI/CD with GitHub Actions

**Tasks:**
1. Set up PostgreSQL on Hetzner
2. Configure SSH access
3. Set up PM2 for process management
4. Configure Nginx/Apache reverse proxy
5. Set up SSL certificate (Let's Encrypt)
6. Create deployment scripts
7. Set up GitHub Actions for CI (automated testing)
8. Configure GitHub Actions for CD (automated deployment)
9. Test production deployment
10. Set up monitoring and logging
11. Create backup strategy

**Deliverables:**
- Live production application
- Automated CI/CD pipeline
- Deployment documentation

### Phase 7: Testing & Refinement (Week 11)

**Goals:**
- User acceptance testing and bug fixes

**Tasks:**
1. Conduct internal testing with real users
2. Fix bugs and edge cases
3. Performance optimization
4. Accessibility improvements (ARIA labels, keyboard navigation)
5. Browser compatibility testing
6. Load testing for concurrent votes
7. Documentation improvements

**Deliverables:**
- Production-ready application
- Bug-free user experience

### Phase 8: Launch & Monitoring (Week 12)

**Goals:**
- Launch to actual users

**Tasks:**
1. Final production deployment
2. User training/documentation
3. Monitor for issues
4. Set up analytics (optional)
5. Gather initial feedback
6. Plan future iterations

**Deliverables:**
- Live application with real users
- Monitoring dashboard

---

## Hetzner Server Configuration

### Access and Setup

**SSH Access:**
```bash
ssh username@your-server.hetzner.com
```

**Initial Server Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js (via nvm for version management)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL (if not already installed)
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE my_meal_db;
CREATE USER my_meal_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE my_meal_db TO my_meal_user;
\q
```

### Web Server Configuration

**Nginx Configuration (if using Nginx):**
```nginx
# /etc/nginx/sites-available/my-meal
server {
    listen 80;
    server_name my-meal.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name my-meal.yourdomain.com;
    
    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/my-meal.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/my-meal.yourdomain.com/privkey.pem;
    
    # Frontend static files
    root /var/www/my-meal/dist;
    index index.html;
    
    # Try to serve static files, fall back to index.html for SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy to Node.js backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long polling/SSE
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Serve uploaded images
    location /uploads {
        alias /var/www/my-meal/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/my-meal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**SSL Certificate (Let's Encrypt):**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d my-meal.yourdomain.com
```

### PM2 Configuration

**Ecosystem file for PM2:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-meal-backend',
    script: 'dist/index.js',
    cwd: '/var/www/my-meal/backend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/my-meal/logs/error.log',
    out_file: '/var/www/my-meal/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
};
```

**PM2 Commands:**
```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup

# Monitor
pm2 monit

# View logs
pm2 logs my-meal-backend

# Restart after code changes
pm2 restart my-meal-backend
```

### Database Backup Strategy

**Automated Daily Backups:**
```bash
#!/bin/bash
# /var/www/my-meal/scripts/backup-db.sh

BACKUP_DIR="/var/www/my-meal/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/my_meal_db_$DATE.sql"

# Create backup
pg_dump -U my_meal_user my_meal_db > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

**Cron job for daily backups:**
```bash
# Add to crontab (crontab -e)
0 2 * * * /var/www/my-meal/scripts/backup-db.sh
```

---

## Cost Estimate

### Development Costs

| Item | Estimated Hours | Notes |
|------|----------------|-------|
| Phase 1: Foundation | 40h | Setup and migration |
| Phase 2: Backend API | 60h | Core business logic |
| Phase 3: Admin/Restaurant UI | 60h | Complex admin interface |
| Phase 4: Guest UI | 40h | Simpler guest interface |
| Phase 5: PWA Features | 20h | Service workers, caching |
| Phase 6: Deployment | 20h | Server setup, configuration |
| Phase 7: Testing & Refinement | 40h | Bug fixes, optimization |
| Phase 8: Launch | 10h | Final deployment, monitoring |
| **Total** | **290h** | ~2-3 months with 1 developer |

### Hosting Costs

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Hetzner Webhosting XL | €16-20 | You already have this |
| Domain | €1-2 | If not already owned |
| SSL Certificate | Free | Let's Encrypt |
| **Total** | **€16-22/month** | No additional costs if using existing hosting |

---

## Future Enhancements

### Post-Launch Features (Priority Order)

1. **Week 13-14: Enhanced Reporting**
   - Vote statistics and analytics
   - Historical meal plan archive
   - Export functionality (PDF, CSV)

2. **Week 15-16: Restaurant Editing**
   - Allow restaurant to modify generated meal plan
   - Drag-and-drop meal rearrangement
   - Manual override functionality

3. **Week 17-18: Advanced Authentication**
   - Integration with school authentication system
   - OAuth/SAML support
   - Role-based access control refinement

4. **Week 19-20: Meal Memory System**
   - Track last 3 weeks of meal plans
   - Prevent meal repetition within 2 weeks
   - Suggest varied options to restaurant

5. **Week 21-22: Multi-language Support**
   - Internationalization (i18n) with react-i18next
   - Support for French, English, German
   - Admin UI for managing translations

6. **Week 23-24: Email Notifications**
   - Notify guests when voting opens
   - Send final meal plan to subscribers
   - Remind restaurant to select options

7. **Week 25+: Advanced Features**
   - Mobile native apps (if PWA insufficient)
   - Push notifications
   - Dietary restriction filtering
   - Allergen warnings and alerts
   - Multiple meals per day
   - Integration with ordering system

---

## Conclusion

This planning document provides a comprehensive roadmap for transforming the my-meal prototype into a production-ready multi-platform application. The recommended tech stack (React PWA + Node.js/TypeScript + PostgreSQL + GitHub Actions) offers:

- ✅ **Single codebase** for all platforms
- ✅ **No app store registration** required
- ✅ **Strong functional programming support** (fp-ts, Effect, Ramda)
- ✅ **Utilizes existing Hetzner hosting**
- ✅ **Automated CI/CD pipeline** with GitHub Actions
- ✅ **Reasonable development timeline** (2-3 months)
- ✅ **Low ongoing costs**
- ✅ **Modern, maintainable architecture**

The phased implementation approach ensures steady progress with testable deliverables at each stage. The functional programming emphasis throughout the stack (React hooks, fp-ts, Ramda, TypeScript) enables high-level abstractions and concise, maintainable code. GitHub Actions provides automated testing and deployment, ensuring code quality and reducing manual deployment overhead.

### Next Steps

1. **Review and approve this plan** - Discuss any concerns or alternatives
2. **Set up development environment** - Follow Phase 1 tasks
3. **Create GitHub repository** - Initialize version control
4. **Begin implementation** - Start with database schema and backend API
5. **Establish regular check-ins** - Weekly progress reviews

Please let me know if you'd like me to:
- Elaborate on any specific section
- Explore alternative technology choices in more detail
- Begin implementation of Phase 1
- Create additional documentation (API specs, component diagrams, etc.)

