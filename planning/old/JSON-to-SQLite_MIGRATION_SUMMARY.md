   # Migration Summary: JSON to SQLite Database

## Changes Made

This document summarizes the migration from JSON file storage to SQLite database using **Node.js native SQLite** (`node:sqlite`).

### Files Created

1. **`database.js`** - Native SQLite database operations module
   - Uses Node.js built-in `node:sqlite` module
   - No external SQLite dependencies required
   - Handles all database interactions
   - Preserves the same data structure as JSON files
   - Provides functions: `saveMealsDatabase()`, `getMealsDatabase()`, `saveWeeklyOptions()`, `getWeeklyOptions()`, `saveGuestVotes()`, `getGuestVotes()`, `saveMealPlan()`, `getMealPlan()`, `resetSystem()`

2. **`scripts/preinstall.js`** - Optional validation script
   - Run manually (`npm run check:env`) to check Node.js version (≥ 22.5.0)
   - No C++ build tools or Python checks needed (simplified!)
   - Provides clear error messages and upgrade instructions

4. **`data/`** - Directory for database storage
   - Contains `my-meal.db` (auto-created)
   - Includes `.gitkeep` to track directory in git

5. **`.gitignore`** - Ignore file
   - Excludes database files from git
   - Excludes old JSON data files
   - Excludes node_modules and other standard items

### Files Modified

1. **`server.js`**
   - Removed JSON file operations (fs.readFile, fs.writeFile)
   - Integrated database module
   - Updated all API endpoints to use database functions
   - Added better error logging

2. **`package.json`**
   - **Removed** `better-sqlite3` dependency (no longer needed!)
   - Updated scripts to use `--experimental-sqlite` flag
   - Updated `engines` field: Node.js ≥ 22.5.0 required

3. **`SPECIFICATION.md`**
   - Updated "Data structure" section to reflect native SQLite
   - Added note about JSON upload format
   - Updated edge cases to mention database constraints

4. **`README.md`**
   - Simplified prerequisites (just Node.js v22.5+)
   - No C++ build tools or Python required
   - Added deployment guide for Hetzner
   - Updated file structure diagram

### Database Schema

The SQLite database has the following tables:

- **`meals`** - Individual meals
- **`meal_combinations`** - Meal combinations
- **`combination_meals`** - Links meals to combinations
- **`weekly_options`** - Restaurant's weekly selections
- **`guest_votes`** - Guest voting data
- **`meal_plan`** - Generated weekly meal plan
- **`metadata`** - System metadata and timestamps

### Behavioral Changes

1. **Uploading Meals Database Now Resets System**
   - When a new meals database is uploaded via the admin interface
   - The system automatically clears:
     - Weekly options
     - Guest votes
     - Meal plan
   - This ensures data consistency

2. **Duplicate Vote Prevention**
   - Guest names are enforced as UNIQUE at the database level
   - No duplicate votes possible

3. **Data Persistence**
   - Data is stored in a single SQLite database file
   - More robust than individual JSON files
   - Better transaction support

### Migration Path

For users with existing `meals_database.json`:

1) (Optional) Check requirements: `npm run check:env`  
2) Install dependencies (Node.js v22.5.0+): `npm install`  
3) Upload `meals_database.json` via the System Admin tab in the app (this imports meals and resets weekly options, votes, and meal plan)  
4) Start the server: `npm start`

### Installation Requirements

**Simplified Requirements:**

| Requirement | Status |
|-------------|--------|
| Node.js ≥ 22.5.0 | ✅ Required |
| C++ Build Tools | ❌ NOT needed |
| Python | ❌ NOT needed |

**Why so simple?**
- Uses Node.js native SQLite module (`node:sqlite`)
- No native compilation required
- No external dependencies for SQLite

**Run validation (optional):**
```bash
npm run check:env
```

### Testing

To verify the migration:

1. Check database exists: `ls -la data/my-meal.db`
2. Inspect database: `sqlite3 data/my-meal.db ".tables"`
3. Start server: `npm start`
4. Test all three interfaces (Admin, Restaurant, Guest)
5. Verify data persistence across server restarts

### Benefits of Native SQLite

- **No compilation** - No C++ build tools needed
- **No external dependencies** - Uses built-in Node.js module
- **Easy deployment** - Just set Node.js version
- **Single file database** - Easy to backup and move
- **Cross-platform** - Works everywhere Node.js 22.5+ runs
- **ACID transactions** - Data integrity guarantees
- **Standard SQL** - Easy to query and inspect

### Backwards Compatibility

The application maintains the same:
- API endpoints
- Request/response formats
- Frontend interface
- User workflows

Only the storage mechanism has changed. The JSON format for uploading meals database is still supported.

## Technical Notes

### The --experimental-sqlite Flag

The native SQLite module requires running Node.js with:

```bash
node --experimental-sqlite server.js
```

This is automatically handled by npm scripts:
- `npm start` → includes the flag
- `npm run dev` → includes the flag

### Experimental Status

The `node:sqlite` module is experimental in Node.js v22.5+. This means:
- API may change between Node.js versions
- Requires the `--experimental-sqlite` flag
- Has been stable in practice since introduction

### Database File Location

The database is stored at:
```
data/my-meal.db
```

## Next Steps

As part of the transition to MVP (see `planning/PLANNING_MVP.md`):

1. ✅ Replace JSON files with SQLite
2. ✅ Simplify installation (no build tools)
3. 🔄 Test the application thoroughly
4. 🔄 Deploy to Hetzner Webhosting
5. 🔄 Add database backup strategy

## Support

If you encounter issues:

1. **Node.js version:** Upgrade to v22.5.0 or higher (v24.x recommended)
2. **Database errors:** Check that `data/` directory is writable
3. **Migration issues:** Run migration script with verbose logging

For more details, see:
- `README.md` - Setup and usage instructions
- `INSTALL.md` - Detailed installation guide
- `NODE_VERSION_GUIDE.md` - Node.js version & deployment guide
- `SPECIFICATION.md` - Application specifications
