# Node.js Version & Deployment Guide

## Overview

This application uses **Node.js native SQLite** (`node:sqlite`), which was introduced in Node.js v22.5.0. This approach eliminates the need for C++ build tools and simplifies deployment significantly.

---

## Requirements

### Node.js Version

| Version | Support |
|---------|---------|
| **v24.x** | ✅ Recommended |
| **v22.5.0+** | ✅ Supported (minimum) |
| v22.0 - v22.4 | ❌ Not supported (no node:sqlite) |
| v20.x and below | ❌ Not supported |

### Checking Your Version

```bash
node --version
```

If your version is below v22.5.0, you need to upgrade.

---

## Installing Node.js v24

### macOS

**Using Homebrew (Recommended):**
```bash
brew install node
# or specifically:
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
- Download the "Current" version (v24.x)

**Using nvm-windows:**
```powershell
nvm install 24
nvm use 24
```

### Linux

**Using nvm:**
```bash
nvm install 24
nvm use 24
nvm alias default 24
```

**Using NodeSource:**
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Deployment on Hetzner Webhosting

Hetzner Webhosting L and managed servers fully support Node.js applications with configurable versions.

### Setting the Node.js Version

**Method 1: Via SSH**
```bash
# Set Node.js v24
echo 24 > ~/.nodeversion

# Verify
node -v
```

**Method 2: Via konsoleH**
1. Log into konsoleH control panel
2. Navigate to "Services" > "Node.js Configuration"
3. Select Node.js v24 (or highest available ≥ 22.5)
4. Apply and save

### Deploying the Application

1. **Upload files** via SFTP/SCP:
```bash
scp -r prototype_1/ user@your-server:/var/www/html/my-meal/
```

2. **Install dependencies** on the server:
```bash
cd /var/www/html/my-meal
npm install
```

3. **Configure the start command** in konsoleH:
```bash
node --experimental-sqlite server.js
```

4. **Use PM2** for production (optional but recommended):
```bash
npm install -g pm2
pm2 start "node --experimental-sqlite server.js" --name my-meal
pm2 save
pm2 startup
```

### Hetzner Documentation

- [Node.js Configuration](https://docs.hetzner.com/konsoleh/account-management/configuration/nodejs/)
- [Webhosting Overview](https://www.hetzner.com/webhosting/)
- [Deploy Next.js Tutorial](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server) (similar process)

---

## Why Native SQLite?

### Comparison with better-sqlite3

| Aspect | Native node:sqlite | better-sqlite3 |
|--------|-------------------|----------------|
| **Dependencies** | Built-in | External package |
| **C++ Build Tools** | ❌ Not needed | ✅ Required |
| **Python** | ❌ Not needed | ✅ Required |
| **Compilation** | None | Native addon |
| **Installation** | `npm install` | Complex |
| **Deployment** | Set Node version only | Build tools on server |
| **Node.js Version** | ≥ 22.5.0 | 18.x, 20.x |
| **Stability** | Experimental | Mature |

### Benefits for This Project

1. **Simple Deployment** - Just set Node.js version on Hetzner, no build tools
2. **Cross-Platform** - Same behavior everywhere
3. **No Compilation Errors** - Eliminates "node-gyp" issues
4. **Fast Installation** - No native compilation step
5. **School-Friendly** - Easy setup for students/teachers

### Trade-offs

1. **Experimental Status** - API may change between Node.js versions
2. **Requires Node 22.5+** - Older systems need upgrading
3. **--experimental-sqlite Flag** - Must be specified when running

---

## The Experimental Flag

The native SQLite module requires running Node.js with:

```bash
node --experimental-sqlite server.js
```

This is automatically handled by the npm scripts:
- `npm start` → includes the flag
- `npm run dev` → includes the flag  

If running manually, always include `--experimental-sqlite`.

---

## Migrating from better-sqlite3

If you previously used better-sqlite3 (v9.2.0), the migration is seamless:

1. **Update Node.js** to v22.5.0 or higher
2. **Pull the latest code** (database.js has been rewritten)
3. **Run `npm install`** (better-sqlite3 is removed)
4. **Your existing database file works unchanged** (same SQLite format)

The database file (`data/my-meal.db`) is compatible - SQLite is SQLite regardless of which library accesses it.

---

## Future Considerations

### When node:sqlite Becomes Stable

Currently, the `node:sqlite` module is experimental. When it becomes stable (likely in Node.js v26 or later):

1. The `--experimental-sqlite` flag will no longer be needed
2. The API will be frozen and stable
3. This documentation will be updated

### Fallback Option

If you ever need to switch back to `better-sqlite3`:

1. Install: `npm install better-sqlite3`
2. Revert `database.js` to the better-sqlite3 version
3. Remove `--experimental-sqlite` from scripts
4. Use Node.js v20.x

---

## Quick Reference

```bash
# Check Node.js version
node --version

# Install Node.js v24 (nvm)
nvm install 24 && nvm use 24

# Install Node.js v24 (Homebrew)
brew install node

# Check requirements
npm run check:env

# Install dependencies
npm install

# Start the server
npm start

# Development mode
npm run dev

# Set version on Hetzner
echo 24 > ~/.nodeversion
```
