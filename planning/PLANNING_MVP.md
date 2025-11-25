# my-meal MVP: Simplified Planning Document

## Executive Summary

This document outlines a **Minimum Viable Product (MVP)** approach for the my-meal application. The focus is on **simplicity and speed of implementation** while delivering core functionality. The MVP will be a plain web application accessible from any device browser (Android, iOS, Windows, macOS) without app store registration.

**MVP Approach**: Simple web application with server-side rendering, Node.js backend, and SQLite database, manually deployed to Hetzner server.

**Key Principle**: Get working software in users' hands as quickly as possible, then iterate based on feedback.

---

## Table of Contents

1. [MVP Scope](#mvp-scope)
2. [Simplified Architecture](#simplified-architecture)
3. [MVP Tech Stack](#mvp-tech-stack)
4. [Implementation Plan](#implementation-plan)
5. [Deployment Strategy](#deployment-strategy)
6. [What We're Deferring](#what-were-deferring)
7. [Migration Path to Full Version](#migration-path-to-full-version)

---

## MVP Scope

### What's Included in MVP

**Core Functionality:**
- ✅ Admin can upload meal database (JSON file upload)
- ✅ Restaurant can select weekly meal options
- ✅ Guests can vote for their meal preferences
- ✅ System generates weekly meal plan based on votes
- ✅ Display meal images
- ✅ Basic authentication (simple password for admin, names for guests)

**Multi-Platform Support:**
- ✅ Works in any modern web browser
- ✅ Responsive design (works on mobile and desktop)
- ✅ No app installation required
- ✅ Accessible via URL from any device

### What's NOT in MVP

**Deferred Features:**
- ❌ Progressive Web App (PWA) features (offline, install to home screen)
- ❌ Advanced authentication (OAuth, JWT)
- ❌ Real-time updates (polling is fine for MVP)
- ❌ Automated testing suite
- ❌ CI/CD pipeline
- ❌ Sophisticated error handling
- ❌ Advanced image processing (thumbnails, compression)
- ❌ Performance optimizations
- ❌ Accessibility enhancements
- ❌ Multi-language support
- ❌ Analytics and monitoring

**UI/UX Simplifications:**
- ❌ No fancy animations or transitions
- ❌ Basic CSS styling (clean but minimal)
- ❌ Simple forms (HTML forms with basic validation)
- ❌ Basic feedback messages (no toast notifications)

---

## Simplified Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│          Client Devices (Any Browser)           │
│     Android, iOS, Windows, macOS, Linux         │
│                                                  │
│  ┌──────────────┐        ┌──────────────┐     │
│  │   Admin/     │        │    Guest     │     │
│  │  Restaurant  │        │    Pages     │     │
│  │    Pages     │        │              │     │
│  └──────────────┘        └──────────────┘     │
└─────────────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────┐
│         Hetzner Webhosting XL Server            │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │    Node.js + Express Server              │  │
│  │                                           │  │
│  │  • Serves HTML pages (server-rendered)   │  │
│  │  • Handles form submissions              │  │
│  │  • Business logic (voting, meal plan)    │  │
│  │  • File serving (images, CSS, JS)        │  │
│  └──────────────────────────────────────────┘  │
│                     │                            │
│                     ▼                            │
│  ┌──────────────────────────────────────────┐  │
│  │      SQLite Database (single file)       │  │
│  │                                           │  │
│  │  • All tables in one database file       │  │
│  │  • No separate server needed             │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │    File Storage (uploads/)               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Server-Side Rendering**: Traditional HTML pages generated on the server (like the prototype)
2. **SQLite Database**: Single file database, no separate server needed
3. **Minimal JavaScript**: Only where necessary (form validation, interactive elements)
4. **Express.js**: Lightweight, well-understood Node.js framework
5. **Session-based Auth**: Simple session cookies (no JWT complexity)
6. **Manual Deployment**: Direct SSH, no CI/CD overhead

---

## MVP Tech Stack

### Summary of Choices

| Layer | Technology | Why This Choice |
|-------|-----------|-----------------|
| **Frontend** | Plain HTML + Vanilla JS + Basic CSS | Simplest possible, no build step |
| **Templating** | EJS (Embedded JavaScript) | Simple, works with Express, server-side rendering |
| **Backend** | Node.js + Express | Familiar from prototype, simple setup |
| **Database** | SQLite + better-sqlite3 | Single file, no server, perfect for MVP |
| **Authentication** | express-session + simple passwords | No complexity, works immediately |
| **File Upload** | Multer | Standard, simple library |
| **CSS Framework** | PicoCSS or Water.css | Classless CSS, no learning curve |
| **Deployment** | Manual SSH + Node | Simple, direct, fast |

### Complete Dependencies

**Single package.json for entire app:**
```json
{
  "name": "my-meal-mvp",
  "version": "1.0.0",
  "description": "My-meal MVP - Simple meal voting system",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "better-sqlite3": "^9.2.0",
    "multer": "^1.4.5-lts.1",
    "ejs": "^3.1.9",
    "express-fileupload": "^1.4.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Why These Choices?

**SQLite over PostgreSQL:**
- No separate database server to set up
- Single file for entire database
- Perfect for MVP scale (hundreds of users, not thousands)
- Easy to backup (just copy the file)
- Can migrate to PostgreSQL later if needed
- Zero configuration required

**EJS over React:**
- Server-side rendering (faster initial load)
- No build step needed
- No complex state management
- Easy to understand for backend developers
- Progressive enhancement ready

**Vanilla JS over Framework:**
- No build tools (Webpack, Vite, etc.)
- No transpilation needed
- Smaller payload to browser
- Can add framework later if needed

**Session Auth over JWT:**
- Built into Express
- No token management complexity
- Simpler to implement
- Good enough for MVP

**Classless CSS Framework:**
- Semantic HTML automatically styled
- No need to learn utility classes
- Clean, professional look with zero effort
- Can replace with custom CSS later

---

## Implementation Plan

### Phase 1: Core Setup (2-3 days)

**Goal**: Basic server running with database

**Tasks:**
1. Initialize Node.js project
2. Set up Express server
3. Create SQLite database with schema
4. Create migration script from prototype's JSON files
5. Set up folder structure
6. Basic EJS template layout

**Project Structure:**
```
my-meal-mvp/
├── server.js                # Main application file
├── database.js              # SQLite setup and queries
├── schema.sql              # Database schema
├── package.json
├── .env                     # Configuration (gitignored)
├── .gitignore
│
├── views/                   # EJS templates
│   ├── layout.ejs          # Main layout template
│   ├── admin/
│   │   ├── index.ejs       # Admin dashboard
│   │   ├── upload.ejs      # Upload meal database
│   │   └── results.ejs     # View meal plan
│   ├── restaurant/
│   │   └── select.ejs      # Select weekly options
│   └── guest/
│       ├── vote.ejs        # Vote for meals
│       └── success.ejs     # Vote confirmation
│
├── public/                  # Static files
│   ├── css/
│   │   └── style.css       # Minimal custom styles
│   ├── js/
│   │   └── app.js          # Minimal client-side JS
│   └── images/             # Meal images
│
├── uploads/                 # Uploaded files (gitignored)
├── data/
│   └── database.sqlite     # SQLite database file (gitignored)
│
└── scripts/
    ├── migrate-from-json.js # One-time migration from prototype
    └── reset-db.js          # Reset database for testing
```

**Deliverable**: Server responds to HTTP requests, database is queryable

---

### Phase 2: Admin Interface (2-3 days)

**Goal**: Admin can upload meal database and view results

**Pages:**
1. Admin login (`/admin/login`)
2. Admin dashboard (`/admin`)
3. Upload database (`/admin/upload`)
4. View meal plan (`/admin/results`)
5. Reset system (`/admin/reset`)

**Implementation:**
```javascript
// server.js - simplified example
const express = require('express');
const session = require('express-session');
const db = require('./database');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Simple auth middleware
function requireAdmin(req, res, next) {
  if (req.session.isAdmin) {
    next();
  } else {
    res.redirect('/admin/login');
  }
}

// Admin routes
app.get('/admin/login', (req, res) => {
  res.render('admin/login');
});

app.post('/admin/login', (req, res) => {
  if (req.body.password === process.env.ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.render('admin/login', { error: 'Invalid password' });
  }
});

app.get('/admin', requireAdmin, (req, res) => {
  const stats = db.getStats();
  res.render('admin/index', { stats });
});

// ... more routes
```

**Deliverable**: Admin can log in, upload data, view results

---

### Phase 3: Restaurant Interface (2 days)

**Goal**: Restaurant can select weekly meal options

**Pages:**
1. Restaurant login (same as admin, or same interface)
2. Select meal options (`/restaurant/select`)
3. Confirmation

**Implementation:**
- Display all meal combinations from database
- Checkboxes to select options for the week
- Form submission saves to `weekly_options` table
- Simple validation (ensure enough meat/fish/veg options)

**Deliverable**: Restaurant can choose weekly options

---

### Phase 4: Guest Interface (2-3 days)

**Goal**: Guests can vote for meals

**Pages:**
1. Guest identification (`/guest`)
2. Vote for meals (`/guest/vote`)
3. Success confirmation (`/guest/success`)

**Implementation:**
```javascript
// Guest voting (simplified)
app.get('/guest', (req, res) => {
  res.render('guest/vote', { 
    guestName: req.session.guestName 
  });
});

app.post('/guest/identify', (req, res) => {
  req.session.guestName = req.body.name;
  const options = db.getWeeklyOptions();
  res.render('guest/vote', { 
    guestName: req.body.name,
    options 
  });
});

app.post('/guest/vote', (req, res) => {
  const vote = {
    guestName: req.session.guestName,
    meatOption: req.body.meat,
    fishOption: req.body.fish,
    vegOption1: req.body.veg1,
    vegOption2: req.body.veg2
  };
  
  // Validate vote
  if (db.hasVoted(vote.guestName)) {
    return res.render('guest/vote', { 
      error: 'You have already voted' 
    });
  }
  
  db.saveVote(vote);
  res.render('guest/success');
});
```

**Deliverable**: Guests can vote, duplicate votes prevented

---

### Phase 5: Meal Plan Generation (2 days)

**Goal**: Generate weekly meal plan from votes

**Implementation:**
```javascript
// Simplified voting algorithm
function generateMealPlan() {
  const votes = db.getAllVotes();
  
  // Count votes by category
  const meatCounts = {};
  const fishCounts = {};
  const vegCounts = {};
  
  votes.forEach(vote => {
    meatCounts[vote.meatOption] = (meatCounts[vote.meatOption] || 0) + 1;
    fishCounts[vote.fishOption] = (fishCounts[vote.fishOption] || 0) + 1;
    vegCounts[vote.vegOption1] = (vegCounts[vote.vegOption1] || 0) + 1;
    vegCounts[vote.vegOption2] = (vegCounts[vote.vegOption2] || 0) + 1;
  });
  
  // Get top choices
  const topMeat = getTopChoice(meatCounts);
  const topFish = getTopChoice(fishCounts);
  const topVeg = getTopChoices(vegCounts, 2);
  
  // Ensure variety (no duplicates)
  const plan = ensureVariety([topMeat, topFish, ...topVeg]);
  
  // Save to database
  db.saveMealPlan({
    monday: plan[0],
    tuesday: plan[1],
    wednesday: plan[2],
    thursday: plan[3]
  });
  
  return plan;
}

function getTopChoice(counts) {
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)[0][0];
}
```

**Deliverable**: Meal plan generated and displayed

---

### Phase 6: Polish & Testing (2-3 days)

**Goal**: Clean up, manual testing, basic error handling

**Tasks:**
1. Add basic error handling (try-catch, error pages)
2. Add form validation (client and server side)
3. Add loading indicators where needed
4. Manual testing on different devices/browsers
5. Fix bugs
6. Add basic CSS styling with PicoCSS
7. Create simple README

**Deliverable**: Working, tested MVP ready for deployment

---

## Deployment Strategy

### Manual Deployment to Hetzner

**One-Time Setup:**

```bash
# 1. SSH into Hetzner server
ssh username@your-server.hetzner.com

# 2. Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Create application directory
mkdir -p /var/www/my-meal-mvp
cd /var/www/my-meal-mvp

# 4. Clone or upload your code
git clone <your-repo> .
# OR
scp -r ./my-meal-mvp/* username@server:/var/www/my-meal-mvp/

# 5. Install dependencies
npm install

# 6. Create .env file
cat > .env << EOF
PORT=3000
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
NODE_ENV=production
EOF

# 7. Initialize database
node scripts/migrate-from-json.js

# 8. Start the server (simple way)
nohup node server.js > logs.txt 2>&1 &

# OR use a simple process manager
npm install -g pm2
pm2 start server.js --name my-meal
pm2 save
pm2 startup
```

**Configure Web Server (Nginx or Apache):**

```nginx
# /etc/nginx/sites-available/my-meal
server {
    listen 80;
    server_name meals.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/my-meal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Deployment Process (After Changes):**

```bash
# 1. SSH into server
ssh username@your-server.hetzner.com

# 2. Navigate to app directory
cd /var/www/my-meal-mvp

# 3. Pull latest changes
git pull

# 4. Install any new dependencies
npm install

# 5. Restart server
pm2 restart my-meal

# Done!
```

**Total deployment time**: ~5 minutes

---

## Database Schema (Simplified)

```sql
-- schema.sql

-- Meals table
CREATE TABLE meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image_path TEXT,
    dietary_info TEXT, -- JSON string
    is_vegetarian INTEGER DEFAULT 0,
    is_vegan INTEGER DEFAULT 0
);

-- Meal combinations
CREATE TABLE meal_combinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL -- 'meat', 'fish', 'vegetarian'
);

-- Combination to meals mapping
CREATE TABLE combination_meals (
    combination_id INTEGER,
    meal_id INTEGER,
    FOREIGN KEY (combination_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (meal_id) REFERENCES meals(id),
    PRIMARY KEY (combination_id, meal_id)
);

-- Weekly options
CREATE TABLE weekly_options (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    combination_id INTEGER,
    category TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (combination_id) REFERENCES meal_combinations(id)
);

-- Guest votes
CREATE TABLE guest_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guest_name TEXT NOT NULL,
    meat_option_id INTEGER,
    fish_option_id INTEGER,
    veg_option_1_id INTEGER,
    veg_option_2_id INTEGER,
    voted_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (meat_option_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (fish_option_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (veg_option_1_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (veg_option_2_id) REFERENCES meal_combinations(id),
    UNIQUE(guest_name)
);

-- Meal plan
CREATE TABLE meal_plan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monday_id INTEGER,
    tuesday_id INTEGER,
    wednesday_id INTEGER,
    thursday_id INTEGER,
    generated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monday_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (tuesday_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (wednesday_id) REFERENCES meal_combinations(id),
    FOREIGN KEY (thursday_id) REFERENCES meal_combinations(id)
);
```

---

## What We're Deferring

### Features to Add After MVP

**Short-term (After Initial User Feedback):**
1. Better error messages and validation
2. Ability to edit votes
3. View voting statistics
4. Basic styling improvements
5. Mobile-responsive tweaks

**Medium-term (Version 2):**
1. Real-time vote updates
2. Email notifications
3. Export meal plan to PDF
4. Admin ability to edit meal plan
5. Historical meal plan archive

**Long-term (Future Versions):**
1. Progressive Web App features
2. Offline support
3. Advanced authentication
4. Multiple languages
5. Integration with full PLANNING.md vision

### Technical Debt Acceptable for MVP

**Database:**
- Using SQLite (will migrate to PostgreSQL if scale requires)
- No connection pooling needed
- Simple queries (can optimize later)

**Frontend:**
- No client-side framework (can add React later)
- Basic CSS (can improve design later)
- Minimal JavaScript (can add interactivity later)
- No automated tests (will add if MVP succeeds)

**Backend:**
- No sophisticated error handling
- No logging system
- No monitoring
- No rate limiting
- No caching

**DevOps:**
- Manual deployment
- No CI/CD
- No automated backups (manual for now)
- No staging environment

---

## Migration Path to Full Version

### When to Migrate

Migrate to the full version (original PLANNING.md) when:
- ✅ MVP is working and users are satisfied
- ✅ User base grows beyond ~100 concurrent users
- ✅ Users request PWA features (offline, install to home screen)
- ✅ Manual deployment becomes a bottleneck
- ✅ Performance issues arise

### How to Migrate

**Step-by-step migration path:**

1. **Database Migration** (1 day):
   - Export SQLite data to CSV/JSON
   - Set up PostgreSQL on Hetzner
   - Import data with migration script
   - Test thoroughly

2. **Add TypeScript** (2-3 days):
   - Convert JavaScript files to TypeScript incrementally
   - Add type definitions
   - Set up build process

3. **Add Frontend Framework** (1 week):
   - Create React app alongside EJS templates
   - Migrate one page at a time
   - Eventually remove EJS

4. **Add PWA Features** (3-5 days):
   - Add service worker
   - Create manifest file
   - Test offline functionality

5. **Add CI/CD** (2-3 days):
   - Set up GitHub Actions
   - Configure automated tests
   - Set up automated deployment

6. **Add Monitoring & Analytics** (2-3 days):
   - Set up error tracking
   - Add performance monitoring
   - Configure alerts

**Total migration time**: 3-4 weeks

---

## Comparison: MVP vs Full Version

| Aspect | MVP | Full Version (PLANNING.md) |
|--------|-----|---------------------------|
| **Development Time** | 2-3 weeks | 2-3 months |
| **Lines of Code** | ~2,000 | ~15,000+ |
| **Dependencies** | 8 packages | 40+ packages |
| **Build Complexity** | None (plain JS) | Webpack/Vite, TypeScript |
| **Database** | SQLite (file) | PostgreSQL (server) |
| **Frontend** | Server-rendered HTML | React PWA |
| **Authentication** | Simple sessions | JWT + OAuth |
| **Testing** | Manual | Automated (unit, E2E) |
| **Deployment** | Manual SSH | Automated CI/CD |
| **Offline Support** | No | Yes (PWA) |
| **Performance** | Good enough | Optimized |
| **Maintainability** | Simple, easy to understand | More complex, professional |
| **Scalability** | 100s of users | 1000s of users |

---

## Implementation Timeline

### Conservative Estimate (Single Developer)

**Week 1:**
- Days 1-3: Setup, database, basic server
- Days 4-5: Admin interface (upload, view)

**Week 2:**
- Days 1-2: Restaurant interface
- Days 3-4: Guest interface
- Day 5: Meal plan generation

**Week 3:**
- Days 1-2: Polish and testing
- Days 3-4: Deployment and bug fixes
- Day 5: Documentation and handoff

**Total**: 3 weeks for working MVP

### Aggressive Timeline (If Needed)

With focused work, MVP could be completed in **1-2 weeks**.

---

## Cost Analysis

### Development Costs

| Task | Hours | Notes |
|------|-------|-------|
| Setup & Database | 16h | Schema, migration |
| Admin Interface | 16h | 3-4 pages |
| Restaurant Interface | 12h | 2 pages |
| Guest Interface | 16h | Vote flow |
| Meal Plan Generation | 12h | Algorithm |
| Polish & Testing | 16h | Manual testing |
| Deployment | 8h | First-time setup |
| **Total** | **96h** | ~2-3 weeks |

**Comparison with full version**: 96h vs 290h (3x faster)

### Hosting Costs

| Item | Monthly Cost | Notes |
|------|-------------|-------|
| Hetzner Webhosting XL | €16-20 | Already owned |
| Domain | €1-2 | If not owned |
| SSL Certificate | Free | Let's Encrypt |
| **Total** | **€16-22/month** | Same as full version |

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SQLite performance issues | Low | Medium | Can migrate to PostgreSQL |
| Session management issues | Low | Low | Well-understood technology |
| Concurrent vote conflicts | Medium | Medium | Database UNIQUE constraint |
| Server crashes | Low | High | Use PM2 for auto-restart |
| Security vulnerabilities | Medium | High | Basic input validation, HTTPS |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Users want PWA features | Medium | Low | Can add later |
| Performance not sufficient | Low | Medium | Upgrade to full stack |
| Need more features | High | Low | Iterative development |
| MVP doesn't meet needs | Low | High | Early user feedback |

---

## Success Criteria

### MVP is Successful If:

1. **Functional**:
   - ✅ Admin can upload meal database
   - ✅ Restaurant can select weekly options
   - ✅ Guests can vote
   - ✅ System generates meal plan
   - ✅ Works on mobile and desktop browsers

2. **Usable**:
   - ✅ Users can complete tasks without help
   - ✅ No critical bugs
   - ✅ Reasonable performance (pages load < 2 seconds)

3. **Valuable**:
   - ✅ Users prefer it to current process
   - ✅ Saves time for restaurant staff
   - ✅ Students engage with voting

**Not Required for MVP Success**:
- ❌ Beautiful design
- ❌ Perfect code quality
- ❌ 100% test coverage
- ❌ Advanced features
- ❌ Offline support

---

## Functional Programming in MVP

### Where FP Still Fits

Even in simplified MVP, functional programming concepts can be applied:

**1. Pure Functions for Business Logic:**
```javascript
// Pure function for vote counting
function countVotesByCategory(votes, category) {
  return votes.reduce((counts, vote) => {
    const option = vote[category];
    return { ...counts, [option]: (counts[option] || 0) + 1 };
  }, {});
}

// Pure function for finding top N choices
function getTopChoices(counts, n) {
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([option]) => option);
}
```

**2. Functional Array Operations:**
```javascript
// Instead of imperative loops, use map/filter/reduce
const meatOptions = allCombinations
  .filter(combo => combo.category === 'meat')
  .map(combo => ({
    id: combo.id,
    name: combo.name,
    meals: combo.meals
  }));
```

**3. Function Composition:**
```javascript
// Compose validation functions
const validateVote = compose(
  ensureAllCategoriesPresent,
  ensureNoDuplicates,
  ensureOptionsExist
);
```

**Libraries to Consider:**
- **Ramda** (if you want utilities): Still useful even in simple apps
- **date-fns**: Functional date operations
- Avoid heavy FP libraries for MVP to keep it simple

---

## Conclusion

This MVP approach prioritizes **speed and simplicity** while maintaining core functionality. By using proven, simple technologies (Express, SQLite, EJS) and skipping advanced features (PWA, TypeScript, React, CI/CD), we can deliver a working application in **2-3 weeks instead of 2-3 months**.

### Key Advantages of MVP Approach:

- ✅ **Fast delivery**: 2-3 weeks vs 2-3 months
- ✅ **Lower complexity**: Easier to understand and maintain
- ✅ **Lower risk**: Less can go wrong
- ✅ **Early feedback**: Get user input before investing heavily
- ✅ **Iterative**: Can add features based on actual user needs
- ✅ **Works everywhere**: Plain web app works on all devices
- ✅ **No app stores**: Still avoids app store registration

### When to Use Full Version (PLANNING.md):

- ✅ MVP validates the concept
- ✅ Users request PWA features
- ✅ Scale requires it (1000+ concurrent users)
- ✅ Team has time for 2-3 month project

### Next Steps:

1. **Review and approve this simplified approach**
2. **Start with Phase 1** (Core setup)
3. **Build iteratively** (one phase at a time)
4. **Deploy early** (even if incomplete)
5. **Get user feedback**
6. **Iterate based on real needs**

Remember: **A working simple solution beats a perfect complex solution that never ships.** Let's get the MVP in users' hands, then improve based on their actual needs rather than assumptions.

