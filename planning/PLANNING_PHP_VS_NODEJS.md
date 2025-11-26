# PHP vs Node.js: Technology Decision for my-meal Application

**Document Version:** 1.0  
**Date:** November 25, 2025  
**Context:** Hetzner Web hosting Level 19 with existing PHP services

---

## Executive Summary

**Recommendation:** Continue with Node.js on a dedicated subdomain

**Key Rationale:**
- Existing prototype is 80% complete in Node.js (183 lines server + 1041 lines frontend)
- Subdomain isolation completely resolves PHP/Node.js conflicts
- Saves 2-3 weeks of development time vs PHP rewrite
- Aligns with long-term PWA architecture in PLANNING.md
- Cost savings: $1,500-2,000 compared to PHP rewrite

**Critical Decision Factor:** The Hetzner Level 19 package supports unlimited subdomains, enabling complete isolation between PHP (main domain) and Node.js (subdomain) services without conflicts.

---

## 1. Technology Comparison: Node.js vs PHP

### 1.1 For MVP Development

| Criterion | Node.js (Current) | PHP (Alternative) |
|-----------|-------------------|-------------------|
| **Development Speed** | ⭐⭐⭐ 2-3 weeks (80% done) | ⭐ 4 weeks (complete rewrite) |
| **Code Reusability** | ⭐⭐⭐ 95% of prototype | ❌ 0% of backend code |
| **Simplicity** | ⭐⭐ Requires PM2, reverse proxy | ⭐⭐⭐ Standard PHP hosting |
| **JSON Handling** | ⭐⭐⭐ Native support | ⭐⭐ `json_encode/decode` |
| **Session Management** | ⭐⭐ express-session | ⭐⭐⭐ Built-in $_SESSION |
| **File Operations** | ⭐⭐⭐ fs promises (async) | ⭐⭐ file_get_contents/put_contents |
| **Deployment** | ⭐⭐ PM2 + reverse proxy | ⭐⭐⭐ Upload files via FTP |

**MVP Winner:** Node.js (due to existing prototype completion)

### 1.2 For Full Application (Future)

| Criterion | Node.js | PHP |
|-----------|---------|-----|
| **Framework Options** | Express, Fastify, NestJS | Laravel, Symfony, Slim |
| **Database ORM** | Prisma, TypeORM, Sequelize | Eloquent, Doctrine |
| **Functional Programming** | ⭐⭐⭐ fp-ts, Ramda, Effect | ⭐⭐ Limited (functional-php) |
| **TypeScript Support** | ⭐⭐⭐ Native with ts-node | ⭐⭐ Via transpilation only |
| **PWA Capabilities** | ⭐⭐⭐ Excellent (Workbox) | ⭐⭐ Requires separate approach |
| **WebSocket/SSE** | ⭐⭐⭐ Native support | ⭐⭐ Requires extensions |
| **Concurrency** | ⭐⭐⭐ Event loop, async/await | ⭐⭐ Traditional multi-process |
| **Package Ecosystem** | npm (2.5M packages) | Composer (400K packages) |
| **Performance** | ⭐⭐⭐ I/O bound operations | ⭐⭐ Request-response cycle |

**Full App Winner:** Node.js (better PWA support, modern features, FP ecosystem)

### 1.3 Prototype Analysis

**Current Node.js Implementation:**
```javascript
// server.js - 183 lines
- Express server with CORS
- 8 REST API endpoints
- JSON file read/write operations
- Graceful shutdown handling
```

**Effort to Port to PHP:**
```php
// Equivalent PHP implementation would require:
- ~200-250 lines of PHP code
- Setup of routing (manual or framework)
- JSON file handling with proper locking
- Session management setup
- Error handling
- Estimated time: 12-16 hours
```

**Frontend (script.js - 1041 lines):** Remains unchanged regardless of backend choice.

---

## 2. Hetzner Level 19 Hosting Analysis

### 2.1 Available Resources

| Feature | Specification | Relevance |
|---------|--------------|-----------|
| **Storage** | 300 GB NVMe SSD | ✅ Ample for both apps |
| **Databases** | Unlimited MariaDB | ✅ Can share database |
| **PHP** | Pre-installed | ✅ Current services use this |
| **Node.js** | Not pre-installed | ⚠️ Requires installation via SSH |
| **SSH Access** | ✅ Available | ✅ Can install Node.js |
| **Subdomains** | Unlimited | ✅ **Key enabling feature** |
| **Memory Limit** | 512 MB per script | ✅ Sufficient for MVP |
| **Execution Time** | 360 seconds | ✅ Adequate |
| **Cron Jobs** | Unlimited | ✅ For backups/maintenance |

### 2.2 Current Configuration

**Existing Setup:**
- Main domain runs multiple PHP applications
- Sysadmin has expertise in PHP deployment
- Apache configured with PHP module
- No Node.js currently installed

**Constraints:**
- Hetzner documentation recommends: "Disable PHP when enabling Node.js for a domain"
- Sysadmin preference: Keep PHP for main domain
- Concern: Will Node.js interfere with existing services?

**Answer:** Not if using a subdomain (see Section 3)

---

## 3. Why Node.js and PHP Conflict on Same Domain

### 3.1 Technical Conflict Points

#### Port Competition
- **Apache with PHP module** occupies port 80/443 directly
- **Node.js application** also wants to listen on port 80/443
- **Conflict:** Only one process can bind to a port

#### Web Server Configuration
```
Apache with PHP module:
- Handles PHP execution internally via mod_php
- Routes all .php requests to PHP interpreter
- Serves static files directly

Apache with Node.js reverse proxy:
- Must proxy ALL requests to Node.js (port 3000)
- Cannot simultaneously route to PHP module AND proxy
- Configuration is mutually exclusive
```

#### .htaccess Conflicts
- **PHP setup:** Uses mod_rewrite for URL routing
- **Node.js setup:** Requires ProxyPass directives
- **Problem:** Cannot have both configurations active for same path

#### Process Management
- **PHP:** Managed by Apache (mod_php) or PHP-FPM
- **Node.js:** Separate process requiring PM2 or systemd
- **Issue:** Different lifecycle management approaches

### 3.2 Hetzner-Specific Issues

**Shared Hosting Environment:**
- konsoleH control panel manages Apache configuration
- Enabling Node.js via konsoleH disables PHP module
- Manual Apache configuration may be overwritten by control panel
- Limited control over server-wide settings

**Why Hetzner Says "Disable PHP":**
1. Simplifies configuration for typical users
2. Reduces support burden
3. Prevents configuration conflicts
4. Ensures reliable operation of chosen stack

### 3.3 Real-World Example

**Attempting both on same domain:**
```apache
# This configuration is PROBLEMATIC:
<VirtualHost *:80>
    ServerName example.com
    
    # PHP setup
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
    
    # Node.js proxy (CONFLICTS with above)
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

**Result:** All requests go to Node.js OR all go to PHP. Cannot mix on same domain without complex path-based routing.

---

## 4. Subdomain Solution: Complete Isolation

### 4.1 How Subdomains Resolve Conflicts

**Domain Isolation:**
```
example.com (VirtualHost 1)
├── PHP applications
├── Apache with mod_php
├── Port 80/443 external
└── Direct PHP execution

meals.example.com (VirtualHost 2)
├── Node.js application
├── Apache with reverse proxy
├── Port 80/443 external → Port 3000 internal
└── PM2 manages Node.js process
```

**Key Insight:** Each subdomain gets its own Apache VirtualHost configuration, allowing completely different setups.

### 4.2 Technical Implementation

#### Apache Configuration

**Main Domain (example.com):**
```apache
<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example
    
    # Standard PHP configuration
    <FilesMatch \.php$>
        SetHandler application/x-httpd-php
    </FilesMatch>
    
    # Existing PHP apps work normally
</VirtualHost>
```

**Subdomain (meals.example.com):**
```apache
<VirtualHost *:80>
    ServerName meals.example.com
    
    # Reverse proxy to Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Static files can be served directly (optional optimization)
    ProxyPass /images !
    Alias /images /var/www/meals/public/images
    
    ErrorLog ${APACHE_LOG_DIR}/meals-error.log
    CustomLog ${APACHE_LOG_DIR}/meals-access.log combined
</VirtualHost>
```

#### Process Isolation

**PHP Process:**
- Managed by Apache or PHP-FPM
- Memory limit: 512 MB per request
- Restarts with Apache

**Node.js Process:**
- Managed by PM2
- Independent memory allocation
- Auto-restart on failure
- Survives Apache restarts

```bash
# PM2 configuration
pm2 start server.js --name my-meal --max-memory-restart 500M
pm2 save
pm2 startup
```

### 4.3 Database Sharing (No Conflict)

Both PHP and Node.js can safely share the same MariaDB instance:

```javascript
// Node.js connection
const mysql = require('mysql2/promise');
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'my_meal_user',
  password: 'secure_password',
  database: 'my_meal_db'
});
```

```php
// PHP connection (if needed for admin tools)
$mysqli = new mysqli('localhost', 'my_meal_user', 'secure_password', 'my_meal_db');
```

**Why This Works:** Different database connections, no conflict.

### 4.4 SSL/TLS Certificates

**Option 1: Separate Certificates**
```bash
certbot --apache -d example.com -d www.example.com
certbot --apache -d meals.example.com
```

**Option 2: Wildcard Certificate**
```bash
certbot certonly --dns-provider -d example.com -d *.example.com
```

Both subdomains can have HTTPS independently.

### 4.5 Advantages Summary

✅ **Complete Independence:** No configuration conflicts  
✅ **Independent Deployment:** Update Node.js app without touching PHP  
✅ **Isolated Failures:** If Node.js crashes, PHP services unaffected  
✅ **Separate Logs:** Easy debugging and monitoring  
✅ **Different Update Schedules:** Can update Node.js version independently  
✅ **Resource Monitoring:** Track resource usage separately  
✅ **Security Isolation:** Different security contexts  

### 4.6 Potential Challenges

⚠️ **Initial Setup Complexity:**
- Requires SSH access
- Manual VirtualHost configuration
- Node.js installation via nvm
- PM2 setup for process management

**Mitigation:** One-time setup, then works like any hosted application

⚠️ **Sysadmin Coordination:**
- May need assistance with VirtualHost configuration
- Requires understanding of reverse proxy setup

**Mitigation:** Provide detailed documentation (see Section 7)

⚠️ **Resource Sharing:**
- Both apps share server CPU/memory

**Mitigation:** 300 GB storage and Level 19 resources are sufficient for both

---

## 5. Decision Matrix

### Option A: Node.js on Subdomain ⭐ RECOMMENDED

**Pros:**
- ✅ Reuse 95% of existing prototype code
- ✅ Fastest time to MVP (2-3 weeks vs 4 weeks)
- ✅ Modern JavaScript everywhere (frontend + backend)
- ✅ Superior PWA capabilities for future expansion
- ✅ Strong functional programming ecosystem (fp-ts, Ramda)
- ✅ TypeScript migration path
- ✅ Aligns with PLANNING.md architecture
- ✅ Subdomain isolation eliminates PHP conflicts
- ✅ No interference with existing services

**Cons:**
- ⚠️ Requires subdomain and reverse proxy setup
- ⚠️ Need PM2 for process management
- ⚠️ Initial sysadmin coordination
- ⚠️ Less familiar to PHP-focused teams
- ⚠️ Must monitor Node.js process health

**Development Time:** 2-3 weeks (prototype nearly complete)  
**Setup Time:** 1-2 days for subdomain configuration  
**Maintenance:** Medium (PM2 monitoring)  
**Future-Proof:** Excellent (aligned with full PLANNING.md)

### Option B: Migrate to PHP

**Pros:**
- ✅ Uses existing PHP infrastructure
- ✅ Sysadmin comfort and expertise
- ✅ No process management needed
- ✅ Simple deployment (FTP upload)
- ✅ Traditional hosting model

**Cons:**
- ❌ Complete backend rewrite required (183+ lines)
- ❌ Throws away Node.js prototype work
- ❌ Different language from frontend JavaScript
- ❌ Weaker functional programming support
- ❌ More complex PWA integration later
- ❌ Misaligned with PLANNING.md full architecture
- ❌ May need rewrite again for full version

**Development Time:** 4 weeks (full backend rewrite)  
**Setup Time:** 1 day  
**Maintenance:** Low (standard PHP hosting)  
**Future-Proof:** Poor (likely need migration later)

### Option C: Hybrid (PHP MVP → Node.js Later)

**Pros:**
- ✅ Minimal initial server configuration
- ✅ Appease sysadmin initially

**Cons:**
- ❌ Requires TWO complete rewrites
- ❌ Most expensive development path
- ❌ Wastes prototype work
- ❌ Technical debt from start
- ❌ Inefficient use of resources

**Development Time:** 4 weeks + 3 weeks (7 weeks total)  
**Not Recommended**

---

## 6. Cost-Benefit Analysis

### Node.js Path (Recommended)

**Development Costs:**
- Complete MVP: 2-3 weeks × $40/hour × 40 hours = **$960-1,200**
- Initial server setup: 8-16 hours × $40/hour = **$320-640**
- **Total:** ~$1,280-1,840

**Benefits:**
- Reuses 95% of prototype
- Aligned with long-term architecture
- Modern technology stack
- Better PWA support
- Lower future migration costs

### PHP Path

**Development Costs:**
- Backend rewrite: 4 weeks × $40/hour × 40 hours = **$1,600**
- Simple deployment: 4 hours × $40/hour = **$160**
- **Total:** ~$1,760

**Future Migration Costs (if moving to Node.js later):**
- Re-rewrite to Node.js: 3 weeks × $40/hour × 40 hours = **$1,200**
- **Total Project Cost:** ~$2,960

**Savings with Node.js Approach:** $2,960 - $1,840 = **$1,120**

### Time Comparison

| Approach | MVP Time | Future Migration | Total Time |
|----------|----------|------------------|------------|
| Node.js (subdomain) | 2-3 weeks | 0 (already aligned) | 2-3 weeks |
| PHP → PHP | 4 weeks | 0 | 4 weeks |
| PHP → Node.js | 4 weeks | 3 weeks | 7 weeks |

**Time Saved with Node.js:** 1-4 weeks depending on future needs

---

## 7. Implementation Roadmap

### Phase 1: Subdomain Setup and Testing (Day 1-2)

**Day 1 Morning: Subdomain Creation**
```bash
# In konsoleH control panel:
1. Navigate to Domains → Subdomains
2. Create subdomain: meals.yourdomain.com
3. Point to directory: /var/www/meals
4. Verify DNS propagation (may take 1-24 hours)
```

**Day 1 Afternoon: Node.js Installation**
```bash
# SSH into server
ssh username@yourdomain.com

# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

**Day 2 Morning: Apache Reverse Proxy**
```bash
# Enable required Apache modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite

# Create VirtualHost configuration
sudo nano /etc/apache2/sites-available/meals.conf
```

```apache
<VirtualHost *:80>
    ServerName meals.yourdomain.com
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/meals-error.log
    CustomLog ${APACHE_LOG_DIR}/meals-access.log combined
    
    # Reverse proxy to Node.js
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Timeout settings
    ProxyTimeout 300
</VirtualHost>
```

```bash
# Enable site and reload Apache
sudo a2ensite meals.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

**Day 2 Afternoon: PM2 Setup**
```bash
# Install PM2 globally
npm install -g pm2

# Test with simple Node.js app
echo "console.log('Hello World'); require('http').createServer((req, res) => res.end('Node.js works!')).listen(3000);" > test.js
node test.js &

# Test reverse proxy
curl http://localhost:3000  # Direct
curl http://meals.yourdomain.com  # Through Apache

# If successful, kill test
pkill node
```

### Phase 2: Deploy Prototype (Day 3)

**Morning: Upload Code**
```bash
# Create application directory
mkdir -p /var/www/meals
cd /var/www/meals

# Option A: Git clone
git clone <your-repo-url> .

# Option B: SFTP upload
# Use FileZilla or similar to upload prototype_1 contents
```

**Afternoon: Configure and Start**
```bash
# Install dependencies
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
ADMIN_PASSWORD=$(openssl rand -base64 12)
SESSION_SECRET=$(openssl rand -base64 32)
EOF

# Start with PM2
pm2 start server.js --name my-meal
pm2 save
pm2 startup  # Follow instructions to enable auto-start

# Check status
pm2 status
pm2 logs my-meal
```

### Phase 3: SSL and Testing (Day 4)

**Morning: SSL Certificate**
```bash
# Install Certbot if not already available
sudo apt install certbot python3-certbot-apache

# Generate certificate
sudo certbot --apache -d meals.yourdomain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

**Afternoon: Comprehensive Testing**
```
Test Checklist:
□ Admin tab: Upload meals database
□ Restaurant tab: Select weekly options
□ Guest tab: Submit votes
□ Admin tab: Generate meal plan
□ Verify data persistence (reload page)
□ Test on mobile browser
□ Check HTTPS works
□ Verify logs: pm2 logs my-meal
□ Test PM2 auto-restart: pm2 restart my-meal
□ Check resource usage: pm2 monit
```

### Phase 4: Migrate to SQLite (Day 5, Optional)

As per PLANNING_MVP.md, consider migrating from JSON files to SQLite:

```bash
# Install better-sqlite3
npm install better-sqlite3

# Create migration script
# (Implementation details in PLANNING_MVP.md Section "Database Schema")
```

---

## 8. Technical Specifications

### 8.1 Complete Apache VirtualHost (with SSL)

```apache
# /etc/apache2/sites-available/meals-ssl.conf
<VirtualHost *:443>
    ServerName meals.yourdomain.com
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/meals.yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/meals.yourdomain.com/privkey.pem
    Include /etc/letsencrypt/options-ssl-apache.conf
    
    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Reverse Proxy
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # WebSocket support (for future use)
    RewriteEngine on
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) "ws://localhost:3000/$1" [P,L]
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/meals-ssl-error.log
    CustomLog ${APACHE_LOG_DIR}/meals-ssl-access.log combined
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName meals.yourdomain.com
    Redirect permanent / https://meals.yourdomain.com/
</VirtualHost>
```

### 8.2 PM2 Ecosystem File

```javascript
// /var/www/meals/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-meal',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Restart policy
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',
    
    // Logging
    error_file: '/var/www/meals/logs/error.log',
    out_file: '/var/www/meals/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Monitoring
    watch: false,
    ignore_watch: ['node_modules', 'logs', '*.json'],
  }]
};
```

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js
pm2 save
```

### 8.3 Monitoring and Maintenance

**Daily Monitoring:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs my-meal --lines 50

# Check resource usage
pm2 monit
```

**Weekly Maintenance:**
```bash
# Rotate logs
pm2 flush

# Check for updates
nvm list-remote
npm outdated
```

**Backup Strategy:**
```bash
# Create backup script
cat > /var/www/meals/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/www/meals/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/my-meal-$DATE.tar.gz \
  --exclude='node_modules' \
  --exclude='logs' \
  /var/www/meals

# Keep only last 30 days
find $BACKUP_DIR -name "my-meal-*.tar.gz" -mtime +30 -delete
EOF

chmod +x /var/www/meals/backup.sh

# Add to crontab (daily backup at 2 AM)
crontab -e
0 2 * * * /var/www/meals/backup.sh
```

---

## 9. Risk Assessment and Mitigation

### 9.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Subdomain DNS issues** | Low | Medium | Test DNS propagation before deployment |
| **Node.js process crashes** | Medium | High | PM2 auto-restart, monitoring, error logging |
| **Apache reverse proxy misconfiguration** | Low | High | Test thoroughly, keep backup config |
| **Resource exhaustion** | Low | Medium | PM2 memory limits, monitoring |
| **Security vulnerabilities** | Medium | High | Regular updates, HTTPS, security headers |
| **Database connection issues** | Low | Medium | Connection pooling, error handling |

### 9.2 Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Sysadmin unavailable** | Low | Medium | Document all configurations thoroughly |
| **Conflicts with existing services** | Very Low | High | Subdomain isolation prevents this |
| **Backup failures** | Low | High | Automated backups, test restoration |
| **Update breaking changes** | Medium | Medium | Pin versions, test updates in development |

### 9.3 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Users can't access subdomain** | Low | High | Clear communication of new URL |
| **Performance degradation** | Low | Medium | Monitor with PM2, optimize if needed |
| **Data loss** | Very Low | Very High | Daily backups, JSON file persistence |

---

## 10. Conclusion and Recommendation

### Primary Recommendation: Node.js on Subdomain

**The subdomain approach with Node.js is the optimal solution for these reasons:**

#### 1. Technical Feasibility ✅
- Hetzner Level 19 supports unlimited subdomains
- Apache VirtualHosts enable complete isolation
- No conflict between PHP (main domain) and Node.js (subdomain)
- Both can coexist safely on the same server

#### 2. Development Efficiency ✅
- Existing prototype is 80% complete (Node.js)
- Saves 2-3 weeks vs PHP rewrite
- Immediate value from prior work
- Faster time to MVP

#### 3. Future Alignment ✅
- Consistent with PLANNING.md full architecture
- PWA capabilities for offline support
- Modern JavaScript ecosystem
- Strong functional programming support (fp-ts, Ramda)
- TypeScript migration path

#### 4. Cost Effectiveness ✅
- Development savings: ~$1,120
- Time savings: 1-4 weeks
- No future migration costs
- Better return on investment

#### 5. Risk Management ✅
- Low technical risk (proven approach)
- Isolation prevents conflicts with existing services
- PM2 provides reliability and monitoring
- Can rollback to prototype if needed

### Why Subdomain Isolation Works

**The key insight:** Hetzner's recommendation to "disable PHP when enabling Node.js" applies **only to the same domain**. Using a subdomain creates a completely separate Apache VirtualHost configuration, enabling:

- **Independent configurations:** PHP on main domain, Node.js reverse proxy on subdomain
- **No port conflicts:** Both use 80/443 externally, routed to different services internally  
- **Process isolation:** PHP-FPM and Node.js (PM2) run independently
- **Separate SSL certificates:** Each can have its own HTTPS setup
- **Zero interference:** Changes to one don't affect the other

This is a standard, well-established hosting pattern used by millions of websites worldwide.

### Implementation Confidence

The proposed implementation is:
- **Technically sound:** Based on proven Apache reverse proxy patterns
- **Well-documented:** Clear step-by-step instructions provided
- **Testable:** Can verify each step before proceeding
- **Reversible:** Can switch back to prototype if issues arise
- **Maintainable:** Standard PM2 + Apache setup

---

## 11. Next Steps

### Immediate Actions (This Week)

1. **Confirm with Sysadmin** ✅
   - Share this document
   - Verify subdomain creation capability in konsoleH
   - Confirm SSH access and Node.js installation permission
   - Discuss Apache VirtualHost configuration

2. **Create Test Subdomain** ✅
   - Set up: test.yourdomain.com
   - Install Node.js via nvm
   - Configure simple reverse proxy
   - Verify PHP on main domain unaffected

3. **Document Findings** ✅
   - Record any Hetzner-specific limitations
   - Note configuration steps required
   - Update this document if needed

### Short-Term Actions (Next 2 Weeks)

4. **Production Subdomain Setup**
   - Create: meals.yourdomain.com
   - Full Apache VirtualHost configuration
   - SSL certificate installation
   - PM2 setup and testing

5. **Deploy MVP**
   - Upload prototype code
   - Configure environment
   - Migrate to SQLite (optional, as per PLANNING_MVP.md)
   - Comprehensive testing

6. **Launch**
   - User acceptance testing
   - Documentation for restaurant staff and guests
   - Monitoring setup
   - Backup verification

### Long-Term Actions (Following Months)

7. **Monitor and Optimize**
   - Track resource usage
   - Gather user feedback
   - Address any issues

8. **Iterate Toward Full Application**
   - Follow PLANNING.md phases
   - Add PWA features
   - Implement advanced features
   - Consider migration to PostgreSQL if needed

---

## 12. Alternative: PHP Implementation (Reference)

**If Node.js subdomain approach is rejected**, here's a PHP migration guide:

### PHP Backend Structure

```php
// index.php - Main router
<?php
session_start();

$request_uri = $_SERVER['REQUEST_URI'];

if (strpos($request_uri, '/api/') === 0) {
    require 'api.php';
} else {
    require 'views/index.html';
}
?>
```

```php
// api.php - API endpoints
<?php
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route handling
switch ($path) {
    case '/api/meals-database':
        if ($method === 'GET') {
            echo file_get_contents('data/meals_database.json');
        } elseif ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            file_put_contents('data/meals_database.json', json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        }
        break;
    
    // Additional endpoints...
}
?>
```

### Comparison: Node.js vs PHP Code

**Node.js (Current):**
```javascript
app.get('/api/meals-database', async (req, res) => {
  try {
    const data = await readJsonFile(FILES.mealsDatabase);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});
```

**PHP (Equivalent):**
```php
if ($path === '/api/meals-database' && $method === 'GET') {
    $data = json_decode(file_get_contents('data/meals_database.json'), true);
    if ($data === null) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to read meals database']);
    } else {
        echo json_encode($data);
    }
}
```

**Verdict:** Similar complexity, but Node.js prototype already exists.

---

## 13. References and Resources

### Documentation
- [Hetzner Web hosting Level 19 Specs](https://docs.hetzner.com/konsoleh/general/webhosting/old-webhosting-packages/)
- [Apache Reverse Proxy Guide](https://httpd.apache.org/docs/2.4/howto/reverse_proxy.html)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Node Version Manager (nvm)](https://github.com/nvm-sh/nvm)

### Related Planning Documents
- `PLANNING.md` - Full application architecture
- `PLANNING_MVP.md` - Simplified MVP approach
- `prototype_1/README.md` - Current prototype documentation

### Configuration Examples
- Apache VirtualHost configurations (Section 8.1)
- PM2 ecosystem file (Section 8.2)
- Monitoring scripts (Section 8.3)

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-25 | Initial comprehensive analysis |

**Prepared for:** my-meal MVP Decision  
**Technical Lead:** [To be assigned]  
**Review Status:** Pending sysadmin review

