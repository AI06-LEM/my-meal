/**
 * Database module using Node.js native SQLite (node:sqlite)
 * 
 * Requires Node.js >= 22.5.0 with --experimental-sqlite flag
 * No external dependencies needed - uses built-in SQLite support
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const dbPath = path.join(dataDir, 'my-meal.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  // Create tables
  db.exec(`
    -- Meals table (stores individual meals from meals_database.json)
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vegetarian INTEGER NOT NULL,
      vegan INTEGER NOT NULL,
      category TEXT NOT NULL
    );

    -- Meal combinations table (stores meal combinations from meals_database.json)
    CREATE TABLE IF NOT EXISTS meal_combinations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    -- Combination meals mapping (links combinations to their constituent meals)
    CREATE TABLE IF NOT EXISTS combination_meals (
      combination_id TEXT NOT NULL,
      meal_id TEXT NOT NULL,
      FOREIGN KEY (combination_id) REFERENCES meal_combinations(id) ON DELETE CASCADE,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
      PRIMARY KEY (combination_id, meal_id)
    );

    -- Weekly options table (stores the restaurant's selected options)
    CREATE TABLE IF NOT EXISTS weekly_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      item_name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Guest votes table (stores guest voting data)
    CREATE TABLE IF NOT EXISTS guest_votes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guest_name TEXT NOT NULL UNIQUE,
      meat_option_id TEXT,
      meat_option_name TEXT,
      fish_option_id TEXT,
      fish_option_name TEXT,
      veg_option_1_id TEXT,
      veg_option_1_name TEXT,
      veg_option_2_id TEXT,
      veg_option_2_name TEXT,
      voted_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Meal plan table (stores the generated weekly meal plan)
    CREATE TABLE IF NOT EXISTS meal_plan (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      monday TEXT,
      tuesday TEXT,
      wednesday TEXT,
      thursday TEXT,
      friday TEXT,
      generated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Metadata table (stores last update timestamps)
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Initialize database on module load
initializeDatabase();

// ==================== HELPER FUNCTIONS ====================

/**
 * Reset AUTOINCREMENT sequences for the given tables
 */
function resetSequences(tableNames = []) {
  if (!tableNames.length) return;
  const placeholders = tableNames.map(() => '?').join(', ');
  const stmt = db.prepare(`DELETE FROM sqlite_sequence WHERE name IN (${placeholders})`);
  stmt.run(...tableNames);
}

/**
 * Run operations in a transaction
 * node:sqlite doesn't have built-in transaction() wrapper, so we implement it manually
 */
function runTransaction(fn) {
  db.exec('BEGIN TRANSACTION');
  try {
    fn();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

// ==================== MEALS DATABASE OPERATIONS ====================

/**
 * Generate a unique ID from a name if ID is missing
 * Converts name to lowercase, replaces spaces/special chars with underscores
 */
function generateIdFromName(name) {
  if (!name) return 'unknown';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')  // Replace non-alphanumeric with underscore
    .replace(/^_+|_+$/g, '')       // Remove leading/trailing underscores
    .replace(/_+/g, '_');          // Replace multiple underscores with single
}

/**
 * Save meals database (replaces all existing meals and combinations)
 * Also resets weekly options, guest votes, and meal plan
 */
function saveMealsDatabase(data) {
  runTransaction(() => {
    // Clear all tables (cascading will handle combination_meals)
    db.exec('DELETE FROM combination_meals');
    db.exec('DELETE FROM meals');
    db.exec('DELETE FROM meal_combinations');
    db.exec('DELETE FROM weekly_options');
    db.exec('DELETE FROM guest_votes');
    db.exec('DELETE FROM meal_plan WHERE id = 1');
    resetSequences(['weekly_options', 'guest_votes']);

    // Prepare insert statements
    const insertMeal = db.prepare(`
      INSERT OR IGNORE INTO meals (id, name, vegetarian, vegan, category)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertCombination = db.prepare(`
      INSERT INTO meal_combinations (id, name)
      VALUES (?, ?)
    `);

    const insertCombinationMeal = db.prepare(`
      INSERT INTO combination_meals (combination_id, meal_id)
      VALUES (?, ?)
    `);

    // Track meal IDs by name to ensure consistency across combinations
    const mealIdMap = new Map();

    // Insert individual meals
    if (data.meals && Array.isArray(data.meals)) {
      for (const meal of data.meals) {
        // Generate ID if missing
        if (!meal.id) {
          meal.id = generateIdFromName(meal.name);
        }
        mealIdMap.set(meal.name, meal.id);

        insertMeal.run(
          meal.id,
          meal.name,
          meal.vegetarian ? 1 : 0,
          meal.vegan ? 1 : 0,
          meal.category || 'vegetarian'
        );
      }
    }

    // Insert meal combinations and their constituent meals
    if (data.meal_combinations && Array.isArray(data.meal_combinations)) {
      for (const combo of data.meal_combinations) {
        // Generate ID for combination if missing
        if (!combo.id) {
          combo.id = generateIdFromName(combo.name);
        }

        insertCombination.run(combo.id, combo.name);

        // Insert the constituent meals if they don't exist, then link them
        if (combo.meals && Array.isArray(combo.meals)) {
          for (const meal of combo.meals) {
            // Generate ID for meal if missing, or reuse existing ID for same meal name
            if (!meal.id) {
              if (mealIdMap.has(meal.name)) {
                meal.id = mealIdMap.get(meal.name);
              } else {
                meal.id = generateIdFromName(meal.name);
                mealIdMap.set(meal.name, meal.id);
              }
            } else {
              mealIdMap.set(meal.name, meal.id);
            }

            // Insert the meal (OR IGNORE handles duplicates)
            insertMeal.run(
              meal.id,
              meal.name,
              meal.vegetarian ? 1 : 0,
              meal.vegan ? 1 : 0,
              meal.category || 'vegetarian'
            );

            // Link the meal to the combination
            insertCombinationMeal.run(combo.id, meal.id);
          }
        }
      }
    }

    // Update metadata
    const updateMetadata = db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value, updated_at)
      VALUES ('meals_database_updated', ?, CURRENT_TIMESTAMP)
    `);
    updateMetadata.run(new Date().toISOString());
  });
}

/**
 * Get meals database (returns the same structure as the JSON file)
 */
function getMealsDatabase() {
  // Get all individual meals (not part of combinations)
  const mealsStmt = db.prepare(`
    SELECT id, name, vegetarian, vegan, category
    FROM meals
    WHERE id NOT IN (SELECT meal_id FROM combination_meals)
    ORDER BY name
  `);
  const meals = mealsStmt.all();

  // Get all meal combinations
  const combosStmt = db.prepare(`
    SELECT id, name
    FROM meal_combinations
    ORDER BY name
  `);
  const combinations = combosStmt.all();

  // Get meals for each combination
  const comboMealsStmt = db.prepare(`
    SELECT m.id, m.name, m.vegetarian, m.vegan, m.category
    FROM meals m
    INNER JOIN combination_meals cm ON m.id = cm.meal_id
    WHERE cm.combination_id = ?
  `);

  const mealCombinations = combinations.map(combo => {
    const comboMeals = comboMealsStmt.all(combo.id);
    return {
      id: combo.id,
      name: combo.name,
      meals: comboMeals.map(m => ({
        id: m.id,
        name: m.name,
        vegetarian: m.vegetarian === 1,
        vegan: m.vegan === 1,
        category: m.category
      }))
    };
  });

  return {
    meals: meals.map(m => ({
      id: m.id,
      name: m.name,
      vegetarian: m.vegetarian === 1,
      vegan: m.vegan === 1,
      category: m.category
    })),
    meal_combinations: mealCombinations
  };
}

// ==================== WEEKLY OPTIONS OPERATIONS ====================

/**
 * Save weekly options
 */
function saveWeeklyOptions(data) {
  runTransaction(() => {
    // Clear existing weekly options
    db.exec('DELETE FROM weekly_options');
    resetSequences(['weekly_options']);

    // Prepare insert statement
    const insert = db.prepare(`
      INSERT INTO weekly_options (item_id, item_name, category)
      VALUES (?, ?, ?)
    `);

    if (data.meat_options && Array.isArray(data.meat_options)) {
      for (const option of data.meat_options) {
        insert.run(option.id, option.name, 'meat');
      }
    }

    if (data.fish_options && Array.isArray(data.fish_options)) {
      for (const option of data.fish_options) {
        insert.run(option.id, option.name, 'fish');
      }
    }

    if (data.vegetarian_options && Array.isArray(data.vegetarian_options)) {
      for (const option of data.vegetarian_options) {
        insert.run(option.id, option.name, 'vegetarian');
      }
    }

    // Update metadata
    const updateMetadata = db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value, updated_at)
      VALUES ('weekly_options_updated', ?, CURRENT_TIMESTAMP)
    `);
    updateMetadata.run(new Date().toISOString());
  });
}

/**
 * Get weekly options (returns the same structure as the JSON file)
 */
function getWeeklyOptions() {
  const meatStmt = db.prepare(`
    SELECT item_id as id, item_name as name
    FROM weekly_options
    WHERE category = 'meat'
    ORDER BY created_at
  `);
  const meatOptions = meatStmt.all();

  const fishStmt = db.prepare(`
    SELECT item_id as id, item_name as name
    FROM weekly_options
    WHERE category = 'fish'
    ORDER BY created_at
  `);
  const fishOptions = fishStmt.all();

  const vegStmt = db.prepare(`
    SELECT item_id as id, item_name as name
    FROM weekly_options
    WHERE category = 'vegetarian'
    ORDER BY created_at
  `);
  const vegetarianOptions = vegStmt.all();

  const metaStmt = db.prepare(`
    SELECT value FROM metadata WHERE key = 'weekly_options_updated'
  `);
  const lastUpdated = metaStmt.get();

  return {
    meat_options: meatOptions,
    fish_options: fishOptions,
    vegetarian_options: vegetarianOptions,
    last_updated: lastUpdated ? lastUpdated.value : null
  };
}

// ==================== GUEST VOTES OPERATIONS ====================

/**
 * Save guest votes (appends/updates individual votes, does not delete existing votes)
 * Uses INSERT OR REPLACE to handle duplicate guest names via UNIQUE constraint
 */
function saveGuestVotes(data) {
  runTransaction(() => {
    // Build a lookup of weekly options to backfill names when only IDs are provided
    const weeklyOptionsLookup = {};
    const optionsRows = db.prepare(`
      SELECT item_id, item_name FROM weekly_options
    `).all();
    for (const row of optionsRows) {
      weeklyOptionsLookup[row.item_id] = row.item_name;
    }

    // Normalize option payloads (accepts string IDs or {id,name})
    const normalizeOption = (option) => {
      if (!option) return { id: null, name: null };
      if (typeof option === 'string') {
        return { id: option, name: weeklyOptionsLookup[option] || null };
      }
      if (typeof option === 'object') {
        const id = option.id || null;
        const name = option.name || (id ? weeklyOptionsLookup[id] : null) || null;
        return { id, name };
      }
      return { id: null, name: null };
    };

    // Prepare insert/replace statement
    // INSERT OR REPLACE will update existing votes for the same guest_name (UNIQUE constraint)
    // and insert new votes for new guest names
    const insert = db.prepare(`
      INSERT OR REPLACE INTO guest_votes (
        guest_name, meat_option_id, meat_option_name,
        fish_option_id, fish_option_name,
        veg_option_1_id, veg_option_1_name,
        veg_option_2_id, veg_option_2_name,
        voted_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    if (data.votes && Array.isArray(data.votes)) {
      for (const vote of data.votes) {
        const meat = normalizeOption(vote.meat_option);
        const fish = normalizeOption(vote.fish_option);
        const veg1 = normalizeOption(vote.vegetarian_options?.[0]);
        const veg2 = normalizeOption(vote.vegetarian_options?.[1]);

        insert.run(
          vote.guest_name,
          meat.id,
          meat.name,
          fish.id,
          fish.name,
          veg1.id,
          veg1.name,
          veg2.id,
          veg2.name
        );
      }
    }

    // Update metadata
    const updateMetadata = db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value, updated_at)
      VALUES ('guest_votes_updated', ?, CURRENT_TIMESTAMP)
    `);
    updateMetadata.run(new Date().toISOString());
  });
}

/**
 * Get guest votes (returns the same structure as the JSON file)
 */
function getGuestVotes() {
  const votesStmt = db.prepare(`
    SELECT
      guest_name,
      meat_option_id, meat_option_name,
      fish_option_id, fish_option_name,
      veg_option_1_id, veg_option_1_name,
      veg_option_2_id, veg_option_2_name,
      voted_at
    FROM guest_votes
    ORDER BY voted_at
  `);
  const votes = votesStmt.all();

  const metaStmt = db.prepare(`
    SELECT value FROM metadata WHERE key = 'guest_votes_updated'
  `);
  const lastUpdated = metaStmt.get();

  return {
    votes: votes.map(v => ({
      guest_name: v.guest_name,
      meat_option: v.meat_option_id ? { id: v.meat_option_id, name: v.meat_option_name } : null,
      fish_option: v.fish_option_id ? { id: v.fish_option_id, name: v.fish_option_name } : null,
      vegetarian_options: [
        v.veg_option_1_id ? { id: v.veg_option_1_id, name: v.veg_option_1_name } : null,
        v.veg_option_2_id ? { id: v.veg_option_2_id, name: v.veg_option_2_name } : null
      ].filter(opt => opt !== null)
    })),
    last_updated: lastUpdated ? lastUpdated.value : null
  };
}

// ==================== MEAL PLAN OPERATIONS ====================

/**
 * Save meal plan
 */
function saveMealPlan(data) {
  runTransaction(() => {
    // Insert or replace the meal plan (there's only ever one row with id=1)
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO meal_plan (id, monday, tuesday, wednesday, thursday, friday, generated_at)
      VALUES (1, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      JSON.stringify(data.monday),
      JSON.stringify(data.tuesday),
      JSON.stringify(data.wednesday),
      JSON.stringify(data.thursday),
      JSON.stringify(data.friday),
      new Date().toISOString()
    );

    // Update metadata
    const updateMetadata = db.prepare(`
      INSERT OR REPLACE INTO metadata (key, value, updated_at)
      VALUES ('meal_plan_updated', ?, CURRENT_TIMESTAMP)
    `);
    updateMetadata.run(new Date().toISOString());
  });
}

/**
 * Get meal plan (returns the same structure as the JSON file)
 */
function getMealPlan() {
  const stmt = db.prepare(`
    SELECT monday, tuesday, wednesday, thursday, friday, generated_at
    FROM meal_plan
    WHERE id = 1
  `);
  const row = stmt.get();

  if (!row) {
    return {
      monday: null,
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      generated_at: null
    };
  }

  return {
    monday: row.monday ? JSON.parse(row.monday) : null,
    tuesday: row.tuesday ? JSON.parse(row.tuesday) : null,
    wednesday: row.wednesday ? JSON.parse(row.wednesday) : null,
    thursday: row.thursday ? JSON.parse(row.thursday) : null,
    friday: row.friday ? JSON.parse(row.friday) : null,
    generated_at: row.generated_at
  };
}

// ==================== SYSTEM OPERATIONS ====================

/**
 * Reset system (clear weekly options, guest votes, and meal plan)
 */
function resetSystem() {
  runTransaction(() => {
    db.exec('DELETE FROM weekly_options');
    db.exec('DELETE FROM guest_votes');
    db.exec('DELETE FROM meal_plan WHERE id = 1');
    resetSequences(['weekly_options', 'guest_votes']);
  });
}

// Export functions
module.exports = {
  db,
  saveMealsDatabase,
  getMealsDatabase,
  saveWeeklyOptions,
  getWeeklyOptions,
  saveGuestVotes,
  getGuestVotes,
  saveMealPlan,
  getMealPlan,
  resetSystem
};
