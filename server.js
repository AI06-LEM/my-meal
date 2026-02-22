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

// ============================================================================
// Static File Serving - Path-based routing for two apps
// ============================================================================

// Serve common assets
app.use('/common', express.static(path.join(__dirname, 'public/common')));

// Serve admin app at /admin/
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Serve guest app at /guest/
app.use('/guest', express.static(path.join(__dirname, 'public/guest')));

// Serve landing page at root
app.use(express.static(path.join(__dirname, 'public')));

// ============================================================================
// Admin API Routes (/api/admin/*)
// These endpoints are for admin and restaurant users only
// ============================================================================

// Get meals database
app.get('/api/admin/meals-database', async (req, res) => {
  try {
    const data = db.getMealsDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading meals database:', error);
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});

// Save meals database (also resets weekly options, guest votes)
app.post('/api/admin/meals-database', async (req, res) => {
  try {
    db.saveMealsDatabase(req.body);
    res.json({ success: true, message: 'Meals database saved successfully (system reset)' });
  } catch (error) {
    console.error('Error saving meals database:', error);
    res.status(500).json({ error: 'Failed to save meals database' });
  }
});

// Get weekly options (admin view)
app.get('/api/admin/weekly-options', async (req, res) => {
  try {
    const data = db.getWeeklyOptions();
    res.json(data);
  } catch (error) {
    console.error('Error reading weekly options:', error);
    res.status(500).json({ error: 'Failed to read weekly options' });
  }
});

// Save weekly options
app.post('/api/admin/weekly-options', async (req, res) => {
  try {
    db.saveWeeklyOptions(req.body);
    res.json({ success: true, message: 'Weekly options saved successfully' });
  } catch (error) {
    console.error('Error saving weekly options:', error);
    res.status(500).json({ error: 'Failed to save weekly options' });
  }
});

// Get guest votes (admin can view all votes)
app.get('/api/admin/guest-votes', async (req, res) => {
  try {
    const data = db.getGuestVotes();
    res.json(data);
  } catch (error) {
    console.error('Error reading guest votes:', error);
    res.status(500).json({ error: 'Failed to read guest votes' });
  }
});

// Save guest votes (admin can overwrite all votes - used during upload)
app.post('/api/admin/guest-votes', async (req, res) => {
  try {
    db.saveGuestVotes(req.body);
    res.json({ success: true, message: 'Guest votes saved successfully' });
  } catch (error) {
    console.error('Error saving guest votes:', error);
    res.status(500).json({ error: 'Failed to save guest votes' });
  }
});

// Reset system - delete weekly options and guest votes
app.post('/api/admin/reset', async (req, res) => {
  try {
    db.resetSystem();
    res.json({ success: true, message: 'System reset successfully' });
  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// ============================================================================
// Guest API Routes (/api/guest/*)
// These endpoints are for guests only - limited access
// ============================================================================

// Get weekly options (read-only for guests)
app.get('/api/guest/weekly-options', async (req, res) => {
  try {
    const data = db.getWeeklyOptions();
    res.json(data);
  } catch (error) {
    console.error('Error reading weekly options:', error);
    res.status(500).json({ error: 'Failed to read weekly options' });
  }
});

// Get meals database (read-only for guests - needed for display)
app.get('/api/guest/meals', async (req, res) => {
  try {
    const data = db.getMealsDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading meals database:', error);
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});

// Get existing votes (for duplicate name checking)
app.get('/api/guest/votes', async (req, res) => {
  try {
    const data = db.getGuestVotes();
    res.json(data);
  } catch (error) {
    console.error('Error reading guest votes:', error);
    res.status(500).json({ error: 'Failed to read guest votes' });
  }
});

// Submit a single vote
app.post('/api/guest/vote', async (req, res) => {
  try {
    const vote = req.body;
    
    // Validate vote structure
    if (!vote.guest_name || !vote.meat_option || !vote.fish_option || !vote.vegetarian_options) {
      return res.status(400).json({ error: 'Invalid vote structure' });
    }
    
    // Check for duplicate guest name
    const existingVotes = db.getGuestVotes();
    if (existingVotes.votes && existingVotes.votes.some(v => v.guest_name === vote.guest_name)) {
      return res.status(400).json({ error: 'A vote with this name already exists' });
    }
    
    // Add vote to existing votes
    const votes = existingVotes.votes || [];
    votes.push(vote);
    
    db.saveGuestVotes({
      votes: votes,
      last_updated: new Date().toISOString()
    });
    
    res.json({ success: true, message: 'Vote submitted successfully' });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

// ============================================================================
// Legacy API Routes (for backward compatibility during transition)
// These can be removed after tests are updated
// ============================================================================

// Get meals database (legacy)
app.get('/api/meals-database', async (req, res) => {
  try {
    const data = db.getMealsDatabase();
    res.json(data);
  } catch (error) {
    console.error('Error reading meals database:', error);
    res.status(500).json({ error: 'Failed to read meals database' });
  }
});

// Save meals database (legacy)
app.post('/api/meals-database', async (req, res) => {
  try {
    db.saveMealsDatabase(req.body);
    res.json({ success: true, message: 'Meals database saved successfully (system reset)' });
  } catch (error) {
    console.error('Error saving meals database:', error);
    res.status(500).json({ error: 'Failed to save meals database' });
  }
});

// Get weekly options (legacy)
app.get('/api/weekly-options', async (req, res) => {
  try {
    const data = db.getWeeklyOptions();
    res.json(data);
  } catch (error) {
    console.error('Error reading weekly options:', error);
    res.status(500).json({ error: 'Failed to read weekly options' });
  }
});

// Save weekly options (legacy)
app.post('/api/weekly-options', async (req, res) => {
  try {
    db.saveWeeklyOptions(req.body);
    res.json({ success: true, message: 'Weekly options saved successfully' });
  } catch (error) {
    console.error('Error saving weekly options:', error);
    res.status(500).json({ error: 'Failed to save weekly options' });
  }
});

// Get guest votes (legacy)
app.get('/api/guest-votes', async (req, res) => {
  try {
    const data = db.getGuestVotes();
    res.json(data);
  } catch (error) {
    console.error('Error reading guest votes:', error);
    res.status(500).json({ error: 'Failed to read guest votes' });
  }
});

// Save guest votes (legacy)
app.post('/api/guest-votes', async (req, res) => {
  try {
    db.saveGuestVotes(req.body);
    res.json({ success: true, message: 'Guest votes saved successfully' });
  } catch (error) {
    console.error('Error saving guest votes:', error);
    res.status(500).json({ error: 'Failed to save guest votes' });
  }
});

// Reset system (legacy)
app.post('/api/reset', async (req, res) => {
  try {
    db.resetSystem();
    res.json({ success: true, message: 'System reset successfully' });
  } catch (error) {
    console.error('Error resetting system:', error);
    res.status(500).json({ error: 'Failed to reset system' });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

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
  console.log(`\nApplication URLs:`);
  console.log(`  Landing Page:    http://localhost:${PORT}/`);
  console.log(`  Admin App:       http://localhost:${PORT}/admin/`);
  console.log(`  Guest App:       http://localhost:${PORT}/guest/`);
  
  const networkIPs = getNetworkIPs();
  if (networkIPs.length > 0) {
    console.log(`\nNetwork access (for mobile/other devices on same network):`);
    networkIPs.forEach(({ interface: name, address }) => {
      console.log(`  http://${address}:${PORT}/  (${name})`);
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
