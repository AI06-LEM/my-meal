const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data file paths
const DATA_DIR = __dirname;
const FILES = {
  mealsDatabase: path.join(DATA_DIR, 'meals_database.json'),
  weeklyOptions: path.join(DATA_DIR, 'weekly_options.json'),
  guestVotes: path.join(DATA_DIR, 'guest_votes.json'),
  mealPlan: path.join(DATA_DIR, 'meal_plan.json')
};

// Helper function to read JSON file
async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return default structure
      if (filePath === FILES.weeklyOptions) {
        return { meat_options: [], fish_options: [], vegetarian_options: [], last_updated: null };
      } else if (filePath === FILES.guestVotes) {
        return { votes: [], last_updated: null };
      } else if (filePath === FILES.mealPlan) {
        return { monday: null, tuesday: null, wednesday: null, thursday: null, friday: null, generated_at: null };
      }
    }
    throw error;
  }
}

// Helper function to write JSON file
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// API Routes

// Get meals database
app.get('/api/meals-database', async (req, res) => {
  try {
    const data = await readJsonFile(FILES.mealsDatabase);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});

// Save meals database
app.post('/api/meals-database', async (req, res) => {
  try {
    await writeJsonFile(FILES.mealsDatabase, req.body);
    res.json({ success: true, message: 'Meals database saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save meals database' });
  }
});

// Get weekly options
app.get('/api/weekly-options', async (req, res) => {
  try {
    const data = await readJsonFile(FILES.weeklyOptions);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read weekly options' });
  }
});

// Save weekly options
app.post('/api/weekly-options', async (req, res) => {
  try {
    const data = { ...req.body, last_updated: new Date().toISOString() };
    await writeJsonFile(FILES.weeklyOptions, data);
    res.json({ success: true, message: 'Weekly options saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save weekly options' });
  }
});

// Get guest votes
app.get('/api/guest-votes', async (req, res) => {
  try {
    const data = await readJsonFile(FILES.guestVotes);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read guest votes' });
  }
});

// Save guest votes
app.post('/api/guest-votes', async (req, res) => {
  try {
    const data = { ...req.body, last_updated: new Date().toISOString() };
    await writeJsonFile(FILES.guestVotes, data);
    res.json({ success: true, message: 'Guest votes saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save guest votes' });
  }
});

// Get meal plan
app.get('/api/meal-plan', async (req, res) => {
  try {
    const data = await readJsonFile(FILES.mealPlan);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read meal plan' });
  }
});

// Save meal plan
app.post('/api/meal-plan', async (req, res) => {
  try {
    const data = { ...req.body, generated_at: new Date().toISOString() };
    await writeJsonFile(FILES.mealPlan, data);
    res.json({ success: true, message: 'Meal plan saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Open your browser and navigate to the URL above to use the application');
});
