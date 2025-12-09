# Requirements Validation System

## Overview

The my-meal prototype keeps validation simple: the `engines` field declares the required Node.js version, and you can run a manual check script when you want explicit guidance. There is no automatic preinstall hook blocking installs anymore.

---

## What Gets Validated

### Node.js Version Only

| Version | Status |
|---------|--------|
| **v24.x** | ✅ Recommended |
| **v22.5.0+** | ✅ Supported |
| < v22.5.0 | ❌ Blocked |

**That's it!** No other requirements to validate.

### NOT Required (Simplified!)

Thanks to using native `node:sqlite`, we **no longer need**:
- ❌ C++ build tools (Xcode, Visual Studio, gcc)
- ❌ Python
- ❌ node-gyp

---

## How It Works

### Manual Validation

You can check requirements manually:

```bash
npm run check:env
```

---

## Example Outputs

### ✅ All Requirements Met (Node.js v24)

```
╔════════════════════════════════════════════════════════════╗
║     my-meal Installation Requirements Check (Native SQLite) ║
╚════════════════════════════════════════════════════════════╝

============================================================
Checking Node.js version for native SQLite support...
============================================================
ℹ️  Current Node.js version: v24.3.0
✅ Node.js v24 has native SQLite support.
✅ This is the recommended version. ✨

============================================================
Verifying native SQLite module availability...
============================================================
ℹ️  Native SQLite module (node:sqlite) requires --experimental-sqlite flag.
ℹ️  The application will use this flag automatically when started.
✅ Your Node.js version supports the native SQLite module.

============================================================
Installation Requirements Summary
============================================================

✅ All requirements met! ✨
✅ You can proceed with: npm install

============================================================
Deployment Information
============================================================
ℹ️  This application uses Node.js native SQLite (node:sqlite).

  Benefits:
    • No native compilation required
    • No C++ build tools needed
    • No Python dependency
    • Works on Hetzner Webhosting L and similar platforms
    • Simple deployment - just set Node.js version

ℹ️  On Hetzner Webhosting, set your Node version with:
    echo 24 > ~/.nodeversion
```

**Result:** Installation proceeds normally.

---

### ❌ Node.js Version Too Old

```
╔════════════════════════════════════════════════════════════╗
║     my-meal Installation Requirements Check (Native SQLite) ║
╚════════════════════════════════════════════════════════════╝

============================================================
Checking Node.js version for native SQLite support...
============================================================
ℹ️  Current Node.js version: v20.11.0
❌ ERROR: Node.js v20.11.0 does not support native SQLite.
❌ ERROR: Minimum required version: v22.5.0

ℹ️  The native node:sqlite module was introduced in Node.js v22.5.0.
ℹ️  Please upgrade your Node.js installation.

ℹ️  To install Node.js v24 (recommended):
  Using Homebrew: brew install node
  Or download from: https://nodejs.org/

============================================================
Installation Requirements Summary
============================================================

❌ ERROR: Installation requirements not met!

⚠️  WARNING: Please upgrade Node.js to version 22.5.0 or higher.
⚠️  WARNING: Recommended: Node.js v24.x

ℹ️  For more help, see README.md
```

**Result:** Installation is blocked with exit code 1.

---

## Technical Details

### Script Location
```
scripts/preinstall.js
```

### When It Runs
- Manually: `npm run check:env`

### Exit Codes
- **0** - Requirements met (installation proceeds)
- **1** - Requirements not met (installation blocked)

### Package.json Configuration
```json
{
  "scripts": {
    "check:env": "node scripts/preinstall.js"
  },
  "engines": {
    "node": ">=22.5.0",
    "npm": ">=8.0.0"
  }
}
```

---

## Benefits of Simplified Validation

### For Users

1. **Simple Requirements:** Just need modern Node.js
2. **Clear Feedback:** Know immediately if upgrade needed
3. **Specific Guidance:** Platform-specific upgrade instructions
4. **No Build Errors:** Eliminates compilation issues

### For Deployment

1. **Hetzner Compatible:** Works on Webhosting L
2. **No Build Tools:** No server-side compilation
3. **Cross-Platform:** Same requirements everywhere
4. **Fast Installation:** No native module compilation

---

## Comparison: Old vs New Validation

### Old Validation (with better-sqlite3)

```
Checks required:
✓ Node.js version (v18 or v20 only)
✓ C++ build tools (platform-specific)
✓ Python 3
✓ node-gyp configuration

Installation time: 30-60 seconds (compilation)
Failure rate: ~20% (build tool issues)
```

### New Validation (with native SQLite)

```
Checks required:
✓ Node.js version (≥22.5.0)

Installation time: 5-10 seconds
Failure rate: ~0% (no compilation)
```

---

## Bypassing Validation (Not Recommended)

If you absolutely need to skip validation:

```bash
npm install --ignore-scripts
```

**Warning:** This will skip the preinstall check. If your Node.js version is too old, the application will fail at runtime.

---

## Maintenance

### Updating Node.js Version Requirements

Edit `scripts/preinstall.js`:

```javascript
// Minimum required version for node:sqlite
const minRequired = { major: 22, minor: 5, patch: 0 };
// Recommended version
const recommended = { major: 24, minor: 0, patch: 0 };
```

Update `package.json`:

```json
"engines": {
  "node": ">=22.5.0"
}
```

### When Native SQLite Becomes Stable

When `node:sqlite` graduates from experimental status:
1. Remove `--experimental-sqlite` flag from scripts
2. Update documentation
3. Consider lowering version requirements

---

## References

- Node.js Downloads: https://nodejs.org/
- Native SQLite Documentation: https://nodejs.org/api/sqlite.html
- nvm (Node Version Manager): https://github.com/nvm-sh/nvm
- Hetzner Node.js Configuration: https://docs.hetzner.com/konsoleh/account-management/configuration/nodejs/
