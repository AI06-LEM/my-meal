# Quick Answers to Your Questions

## Overview

This document provides quick answers about Node.js versions, Hetzner hosting, and SQLite compatibility. **Good news: the implementation has been simplified!**

---

## 1. Node.js Version Requirements

### Current Requirements

| Version | Support |
|---------|---------|
| **v24.x** | ✅ Recommended |
| **v22.5.0+** | ✅ Supported (minimum) |
| v22.0 - v22.4 | ❌ Not supported |
| v20.x and below | ❌ Not supported |

### Why These Requirements?

The application uses **Node.js native SQLite** (`node:sqlite`), which:
- Was introduced in Node.js v22.5.0
- Requires the `--experimental-sqlite` flag
- Eliminates the need for external dependencies

### Installing Node.js v24

**Using Homebrew (macOS):**
```bash
brew install node
```

**Using nvm:**
```bash
nvm install 24
nvm use 24
nvm alias default 24
```

**Direct download:**
Visit https://nodejs.org/ and download v24.x

---

## 2. Hetzner Webhosting Compatibility

### ✅ Good News: Hetzner Webhosting L Works!

Hetzner Webhosting L supports Node.js applications with configurable versions.

### Setting Node.js Version on Hetzner

**Via SSH:**
```bash
# Connect to your server
ssh your-username@your-server.hetzner.com

# Set Node.js v24
echo 24 > ~/.nodeversion

# Verify
node -v
```

**Via konsoleH:**
1. Log into konsoleH
2. Go to "Services" > "Node.js Configuration"
3. Select highest available version (≥ 22.5)

### Why This Works Now

- **Native SQLite** - No compilation needed on server
- **No build tools** - No C++ compiler or Python required
- **Simple deployment** - Just set Node.js version and deploy

### References

- [Hetzner Node.js Configuration](https://docs.hetzner.com/konsoleh/account-management/configuration/nodejs/)
- [Deploy Next.js on Hetzner](https://community.hetzner.com/tutorials/deploy-nextjs-on-a-managed-server) (similar process)

---

## 3. SQLite with Modern Node.js

### Current Implementation: Native SQLite

We now use **Node.js native SQLite** (`node:sqlite`):

```javascript
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('data/my-meal.db');
```

**Benefits:**
- ✅ No external dependencies
- ✅ No C++ compilation
- ✅ No build tools needed
- ✅ Works on any platform with Node.js 22.5+
- ✅ Perfect for Hetzner Webhosting

### Status: Experimental but Stable

- 🏷️ Labeled "experimental" by Node.js
- ✅ Stable in practice since v22.5.0
- ⚠️ Requires `--experimental-sqlite` flag
- 🔮 Expected to become stable in future Node.js versions

### Alternative: better-sqlite3

If you ever need to switch back:

| better-sqlite3 Version | Node.js Support |
|------------------------|-----------------|
| v9.2.0 | v18, v20 |
| v12.0.0+ | v20, v22, v24 |

---

## Summary Table

| Question | Answer |
|----------|--------|
| **Node.js Version** | Use v24.x (recommended) or v22.5.0+ |
| **Hetzner Webhosting** | ✅ Works! Set version via `~/.nodeversion` |
| **SQLite Method** | Native `node:sqlite` module |
| **Build Tools** | NOT needed |
| **Python** | NOT needed |

---

## Quick Start

### Local Development

```bash
# Check Node.js version
node --version  # Must be ≥ 22.5.0

# Install Node.js v24 if needed
brew install node  # macOS
# or
nvm install 24     # using nvm

# Install and run
cd prototype_1
npm install
npm start
```

---

## Migration from Previous Setup

If you previously had `better-sqlite3` set up:

1. **Delete node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Upgrade Node.js:**
   ```bash
   brew install node
   # or
   nvm install 24 && nvm use 24
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Your database file works unchanged** - SQLite format is the same regardless of which library accesses it.

---

## Still Have Questions?

See these documents for more details:

- **Installation:** [INSTALL.md](INSTALL.md)
- **Node.js Guide:** [NODE_VERSION_GUIDE.md](NODE_VERSION_GUIDE.md)
- **Migration Details:** [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
- **General Usage:** [README.md](README.md)
