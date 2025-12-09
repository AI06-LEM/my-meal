# Installation Guide

## Quick Start

```bash
npm install
npm start
```
If you want a quick environment check first, run `npm run check:env`.

---

## System Requirements

### Required

**Node.js v22.5.0 or higher** (v24.x recommended)
- The app uses the native `node:sqlite` module
- Check your version: `node --version`

### NOT Required (Simplified!)

Unlike previous versions using `better-sqlite3`, you **do NOT need**:
- ❌ C++ build tools (Xcode, Visual Studio, gcc)
- ❌ Python
- ❌ node-gyp

This is because we use Node.js's built-in SQLite support!

---

## Checking Requirements

### Manual Check (Optional)

You can run the requirements check manually:

```bash
npm run check:env
```

---

## Installing Node.js

### macOS

**Using Homebrew (Recommended):**
```bash
brew install node
# or for a specific version:
brew install node@24
```

**Using nvm:**
```bash
nvm install 24
nvm use 24
nvm alias default 24
```

### Windows

**Download from nodejs.org:**
- Visit https://nodejs.org/
- Download the latest LTS or Current version (v22.5.0+)

**Using nvm-windows:**
```powershell
nvm install 24
nvm use 24
```

### Linux

**Using nvm (Recommended):**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Install Node.js
nvm install 24
nvm use 24
nvm alias default 24
```

**Using NodeSource repository:**
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Deployment on Hetzner Webhosting

Hetzner Webhosting L and managed servers support Node.js applications.

### Setting the Node.js Version

**Via SSH:**
```bash
# Connect to your server
ssh your-username@your-server.hetzner.com

# Set Node.js version
echo 24 > ~/.nodeversion

# Verify
node -v
```

**Via konsoleH:**
1. Log into konsoleH
2. Go to "Services" > "Node.js Configuration"
3. Select Node.js v24 (or highest available version ≥ 22.5)
4. Save settings

### Uploading Your Application

```bash
# Upload your files (from the parent directory of my-meal)
scp -r my-meal/ your-username@your-server.hetzner.com:/var/www/html/

# Or use SFTP/FTP via your preferred client
```

### Starting the Application

Configure your start script in konsoleH or via `.htaccess`/nginx configuration to run:
```bash
node --experimental-sqlite server.js
```

### References

- [Hetzner Node.js Configuration](https://docs.hetzner.com/konsoleh/account-management/configuration/nodejs/)
- [Hetzner Webhosting](https://www.hetzner.com/webhosting/)
- [Deploy Next.js on Hetzner Managed Server](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server) (similar process)

---

## Troubleshooting

### "Node.js version does not support native SQLite"

**Problem:** Your Node.js version is below v22.5.0.

**Solution:** Upgrade Node.js:

```bash
# Using nvm
nvm install 24
nvm use 24

# Using Homebrew (macOS)
brew install node

# Verify
node --version  # Should show v22.5.0 or higher
```

### "Cannot find module 'node:sqlite'"

**Problem:** Node.js can't find the native SQLite module.

**Possible causes:**
1. Node.js version is too old
2. The `--experimental-sqlite` flag is missing

**Solution:**
1. Verify Node.js version: `node --version` (must be ≥ 22.5.0)
2. Make sure to use `npm start` which includes the flag automatically
3. If running manually: `node --experimental-sqlite server.js`

### Installation succeeds but server won't start

**Check the error message.** Common issues:

1. **Port 3000 in use:**
   ```bash
   # Find and kill the process
   lsof -ti:3000 | xargs kill -9
   ```

2. **Data directory not writable:**
   ```bash
   # Ensure data directory exists and is writable
   mkdir -p data
   chmod 755 data
   ```

3. **Database corruption:**
   ```bash
   # Remove and recreate the database
   rm data/my-meal.db
   npm start
   ```

---

## Verification

After successful installation, verify everything works:

1. Start the server:
```bash
npm start
```

2. Open browser to: http://localhost:3000

3. Test the app:
   - Upload a meals database (use the existing `meals_database.json` if available)
   - Select weekly options
   - Submit a vote
   - Generate meal plan

4. Check database was created:
```bash
ls -la data/my-meal.db
```

5. Inspect database (optional):
```bash
sqlite3 data/my-meal.db ".tables"
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run check:env` | Check installation requirements |
| `npm install` | Install dependencies |
| `npm start` | Start the server |
| `npm run dev` | Start with auto-reload |
| `node --version` | Check Node.js version |

---

## Comparison: Native SQLite vs better-sqlite3

| Feature | Native node:sqlite | better-sqlite3 |
|---------|-------------------|----------------|
| **Node.js Version** | ≥ 22.5.0 | 18.x, 20.x |
| **C++ Build Tools** | Not needed | Required |
| **Python** | Not needed | Required |
| **Installation** | Simple | Complex (native compilation) |
| **Hetzner Deployment** | Easy | Requires build tools |
| **Status** | Experimental | Stable |

For a school project where easy deployment is important, the native SQLite approach is recommended despite its experimental status.
