const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const db = require('./database');

const app = express();
// Allow port to be configured via environment variable or command line argument
// Default to 3000 if not specified
const PORT = process.env.PORT || process.argv[2] || 3000;

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

// Helper function to get network IP addresses
function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address
        });
      }
    }
  }
  
  return addresses;
}

// Start server - bind to all network interfaces (0.0.0.0) to allow external access
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(60));
  console.log(`Server running on port ${PORT}`);
  console.log('='.repeat(60));
  console.log(`\nLocal access:`);
  console.log(`  http://localhost:${PORT}`);
  
  const networkIPs = getNetworkIPs();
  if (networkIPs.length > 0) {
    console.log(`\nNetwork access (for mobile/other devices on same network):`);
    networkIPs.forEach(({ interface: name, address }) => {
      console.log(`  http://${address}:${PORT}  (${name})`);
    });
  } else {
    console.log(`\n⚠️  No network interfaces found. Server may only be accessible via localhost.`);
  }
  
  console.log(`\nTo change the port, use:`);
  console.log(`  PORT=8080 npm start  (or npm start 8080)`);
  console.log(`\nPress Ctrl+C (or Cmd+C on Mac) to stop the server`);
  console.log('='.repeat(60) + '\n');
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
