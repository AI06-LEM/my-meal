const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API Routes

// Get meals database
app.get('/api/meals-database', async (req, res) => {
  try {
    const data = db.getMealsDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading meals database:', error);
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});

// Save meals database (also resets weekly options, guest votes, and meal plan)
app.post('/api/meals-database', async (req, res) => {
  try {
    db.saveMealsDatabase(req.body);
    res.json({ success: true, message: 'Meals database saved successfully (system reset)' });
  } catch (error) {
    console.error('Error saving meals database:', error);
    res.status(500).json({ error: 'Failed to save meals database' });
  }
});

// Get weekly options
app.get('/api/weekly-options', async (req, res) => {
  try {
    const data = db.getWeeklyOptions();
    res.json(data);
  } catch (error) {
    console.error('Error reading weekly options:', error);
    res.status(500).json({ error: 'Failed to read weekly options' });
  }
});

// Save weekly options
app.post('/api/weekly-options', async (req, res) => {
  try {
    db.saveWeeklyOptions(req.body);
    res.json({ success: true, message: 'Weekly options saved successfully' });
  } catch (error) {
    console.error('Error saving weekly options:', error);
    res.status(500).json({ error: 'Failed to save weekly options' });
  }
});

// Get guest votes
app.get('/api/guest-votes', async (req, res) => {
  try {
    const data = db.getGuestVotes();
    res.json(data);
  } catch (error) {
    console.error('Error reading guest votes:', error);
    res.status(500).json({ error: 'Failed to read guest votes' });
  }
});

// Save guest votes
app.post('/api/guest-votes', async (req, res) => {
  try {
    db.saveGuestVotes(req.body);
    res.json({ success: true, message: 'Guest votes saved successfully' });
  } catch (error) {
    console.error('Error saving guest votes:', error);
    res.status(500).json({ error: 'Failed to save guest votes' });
  }
});

// Get meal plan
app.get('/api/meal-plan', async (req, res) => {
  try {
    const data = db.getMealPlan();
    res.json(data);
  } catch (error) {
    console.error('Error reading meal plan:', error);
    res.status(500).json({ error: 'Failed to read meal plan' });
  }
});

// Save meal plan
app.post('/api/meal-plan', async (req, res) => {
  try {
    db.saveMealPlan(req.body);
    res.json({ success: true, message: 'Meal plan saved successfully' });
  } catch (error) {
    console.error('Error saving meal plan:', error);
    res.status(500).json({ error: 'Failed to save meal plan' });
  }
});

// Reset system - delete weekly options, guest votes, and meal plan
app.post('/api/reset', async (req, res) => {
  try {
    db.resetSystem();
    res.json({ success: true, message: 'System reset successfully' });
  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
  console.log('Open your browser and navigate to the URL above to use the application');
  console.log('Press Ctrl+C (or Cmd+C on Mac) to stop the server');
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server gracefully...');
  server.close(() => {
    console.log('Server closed successfully');
    process.exit(0);
  });
});
