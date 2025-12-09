# My-Meal Prototype

A school restaurant meal planning application that allows guests to vote on meal preferences and generates weekly meal plans.

## Features

- **System Admin**: Upload meal database and generate final meal plans
- **Restaurant Staff**: Select weekly meal options from the database
- **Guests**: Vote on their preferred meals (1 meat, 1 fish, 2 vegetarian options)
- **Native SQLite Database**: All data is persisted using Node.js built-in SQLite module (no external dependencies!)
- **Easy Deployment**: No C++ compilation or build tools required

## Setup and Installation

### Prerequisites

- **Node.js v22.5.0 or higher** (v24.x recommended)
  - The app uses the native `node:sqlite` module introduced in Node.js v22.5.0
  - Check your version: `node --version`
- npm (comes with Node.js)

**No C++ build tools or Python required!** Unlike solutions using `better-sqlite3`, this app uses Node.js's built-in SQLite support.

**📖 Documentation:**
- **Installation & Troubleshooting:** [INSTALL.md](INSTALL.md)
- **Deployment Guide:** [NODE_VERSION_GUIDE.md](NODE_VERSION_GUIDE.md)

### Installation

1. Navigate to the prototype directory:
```bash
cd prototype_1
```

2. Install dependencies:

Windows:
```powershell
npm.cmd install
```

MacOS/Linux:
```bash
npm install
```

Optional: run `npm run check:env` first if you want an explicit Node.js version check and guidance.

3. Start the server:

Windows:
```powershell
npm.cmd start
```

MacOS/Linux:
```bash
npm start
```

The server automatically runs with the `--experimental-sqlite` flag. The server will display connection information including:
- Local access URL (localhost)
- Network access URLs (for mobile/other devices on the same network)
- Instructions for changing the port

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Configuring the Port

If port 3000 is blocked or you need to use a different port, you can configure it in several ways:

**Windows PowerShell:**
```powershell
$env:PORT=8080; npm.cmd start
```

**UNIX: Using environment variable:**
```bash
PORT=8080 npm start
```

**UNIX: Using command line argument:**
```bash
npm start 8080
```

**Common alternative ports to try:**
- 8080, 8081, 8082 (commonly used for web development)
- 5000, 5001 (often allowed in institutional networks)
- 3001, 3002 (if 3000 is blocked)

### Development Mode

For development with auto-restart on file changes:

Windows:
```powershell
npm.cmd run dev
```

MacOS/Linux:
```bash
npm run dev
```

### Stopping the Server

To stop the server, press `Ctrl+C` (or `Cmd+C` on Mac) in the terminal where the server is running.

## Usage

### 1. System Admin Tab
- Upload a meal database JSON file (this will reset the entire system: weekly options, guest votes, and meal plan will be cleared)
- Generate weekly meal plans based on votes
- View the final meal plan results

### 2. Restaurant Tab
- Select meal options for the week from the uploaded database
- Choose from meat, fish, and vegetarian options
- Save your selections

### 3. Guests Tab
- Enter your name to vote
- Select 1 meat option, 1 fish option, and 2 vegetarian options
- Submit your vote

## Data Storage

The application uses Node.js native SQLite for persistent storage:
- `data/my-meal.db` - SQLite database containing all application data

The database stores:
- Meals database (meals and meal combinations)
- Weekly options (restaurant's selections)
- Guest votes
- Final meal plan

## API Endpoints

The server provides REST API endpoints for data persistence:
- `GET /api/meals-database` - Retrieve meal database
- `POST /api/meals-database` - Upload meal database (**Note:** This resets the entire system)
- `GET /api/weekly-options` - Retrieve weekly options
- `POST /api/weekly-options` - Save weekly options
- `GET /api/guest-votes` - Retrieve guest votes
- `POST /api/guest-votes` - Save guest votes
- `GET /api/meal-plan` - Retrieve meal plan
- `POST /api/meal-plan` - Save meal plan
- `POST /api/reset` - Reset system (clear weekly options, guest votes, and meal plan)

## Deployment on Hetzner Webhosting

This application is designed to work on Hetzner Webhosting L and similar managed hosting platforms.

### Setting Node.js Version on Hetzner

Set your Node.js version via SSH:
```bash
echo 24 > ~/.nodeversion
```

Or configure it in konsoleH under "Services" > "Node.js Configuration".

See [Hetzner Node.js documentation](https://docs.hetzner.com/konsoleh/account-management/configuration/nodejs/) for more details.

## Accessing from Mobile Devices

The server is configured to accept connections from other devices on the same network. When you start the server, it will display network access URLs like:

```
Network access (for mobile/other devices on same network):
  http://192.168.1.100:3000  (en0)
```

**To access from your mobile device:**
1. Make sure your laptop and mobile device are on the same WiFi network
2. Note the IP address shown when starting the server (e.g., `192.168.1.100`)
3. On your mobile device, open a browser and navigate to: `http://[IP_ADDRESS]:[PORT]`
   - Example: `http://192.168.1.100:3000`

**Important:** The IP address may change if you disconnect/reconnect to WiFi or move between networks. Check the server output for the current IP address.

## Testing and Network Troubleshooting

### Common Issues in Institutional Networks

If the app works at home but not in an institution, the following issues are common:

1. **Port Blocking**: The institution's firewall may block certain ports
2. **Client Isolation**: WiFi networks may prevent devices from communicating with each other
3. **Network Segmentation**: Devices may be on different network segments
4. **Firewall Rules**: The laptop's firewall may block incoming connections

### Diagnostic Steps

**1. Verify Server is Accessible Locally**
```bash
# On your laptop, test if the server responds
curl http://localhost:3000
```
If this fails, the server isn't running properly.

**2. Check if Port is Accessible from Network**
```bash
# On your laptop, find your IP address
# MacOS/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig
```

Then from your mobile device (on the same WiFi), try accessing the IP shown in the server startup message.

**3. Test Port Connectivity**
```bash
# On your laptop, check if the port is listening on all interfaces
# MacOS/Linux:
lsof -i :3000

# Windows:
netstat -ano | findstr :3000
```

**4. Test with Different Ports**
Try common ports that are often allowed:
```bash
PORT=8080 npm start
PORT=5000 npm start
PORT=8081 npm start
```

**5. Check Firewall Settings**

**MacOS:**
- System Settings → Network → Firewall
- Ensure Node.js is allowed to accept incoming connections
- You may need to temporarily disable the firewall for testing

**Windows:**
- Windows Security → Firewall & network protection
- Allow an app through firewall → Node.js
- Or temporarily disable firewall for testing

**6. Verify Same Network**
- Ensure both devices show the same WiFi network name (SSID)
- Some networks have "Guest" networks that are isolated from the main network
- Try connecting both devices to the same network type (e.g., both to "Main" or both to "Guest")

**7. Test Client Isolation**
If devices can't communicate even on the same network, the WiFi may have "Client Isolation" or "AP Isolation" enabled. This is common in:
- Public WiFi networks
- Hotel networks
- Some institutional networks

**Workaround for Client Isolation:**
- Use a mobile hotspot from your phone instead of institutional WiFi
- Connect both devices to the same mobile hotspot
- Use a portable WiFi router/hotspot device

**8. Network Diagnostic Commands**

**Ping test from mobile:**
- Use a network utility app on your mobile to ping your laptop's IP
- If ping fails, devices can't communicate (likely client isolation)

**Check network interface:**
```bash
# MacOS/Linux - see all network interfaces
ifconfig -a

# The server will show which interface it's using
```

### Quick Test Checklist

- [ ] Server starts without errors
- [ ] Can access `http://localhost:PORT` on laptop
- [ ] Server shows network IP addresses on startup
- [ ] Mobile device is on same WiFi network
- [ ] Can ping laptop IP from mobile (if ping is allowed)
- [ ] Tried different ports (8080, 5000, etc.)
- [ ] Checked firewall settings
- [ ] Tried mobile hotspot as alternative

## Troubleshooting

### Installation Issues

**"Node.js version does not support native SQLite" error:**
- Upgrade to Node.js v22.5.0 or higher (v24.x recommended)
- Using Homebrew (macOS): `brew install node`
- Using nvm: `nvm install 24 && nvm use 24`
- Download from: https://nodejs.org/

**Check your requirements:**
```bash
npm run check:env
```

### Runtime Issues

- Make sure Node.js v22.5+ is installed
- Check the browser console for any error messages
- Ensure the database file is writable (check `data/` directory permissions)
- The server runs on port 3000 by default
- Check server logs for detailed error messages

## Database Inspection

As a system admin, you can inspect the database details using the SQLite command-line tool or any SQLite GUI client.

### Using SQLite Command Line

1. Install SQLite (if not already installed):

MacOS:
```bash
brew install sqlite
```

Windows:
Download from https://www.sqlite.org/download.html

2. Open the database:
```bash
sqlite3 data/my-meal.db
```

3. View tables:
```sql
.tables
```

4. Inspect weekly options:
```sql
SELECT * FROM weekly_options;
```

5. Inspect guest votes:
```sql
SELECT guest_name, meat_option_name, fish_option_name, 
       veg_option_1_name, veg_option_2_name, voted_at 
FROM guest_votes;
```

6. Inspect meal plan:
```sql
SELECT * FROM meal_plan;
```

7. Exit SQLite:
```sql
.exit
```

### Using SQLite GUI Tools

You can also use GUI tools for easier database inspection:

- **DB Browser for SQLite** (Free, cross-platform): https://sqlitebrowser.org/  
  Pros: Lightweight, focused on SQLite, easy export/import, no account needed.  
  Cons: Limited advanced features; UI feels dated.
- **TablePlus** (Paid, macOS/Windows): https://tableplus.com/  
  Pros: Polished UI, great table editing, fast filters, multi-DB support.  
  Cons: Paid (free tier limited); macOS/Windows only.
- **DBeaver** (Free, cross-platform): https://dbeaver.io/  
  Pros: Powerful, cross-platform, works with many databases, good ER diagrams.  
  Cons: Heavier footprint; UI can feel busy for simple SQLite tasks.

### Backup and Restore

To backup the database:
```bash
cp data/my-meal.db data/my-meal-backup-$(date +%Y%m%d).db
```

To restore from backup:
```bash
cp data/my-meal-backup-YYYYMMDD.db data/my-meal.db
```

## File Structure

```
prototype_1/
├── server.js                          # Node.js Express server
├── database.js                        # Native SQLite database operations (node:sqlite)
├── package.json                       # Dependencies and scripts
├── index.html                         # Main HTML file
├── script.js                          # Frontend JavaScript
├── styles.css                         # CSS styling
├── .gitignore                         # Ignored files (database, old JSON files)
├── scripts/
│   └── preinstall.js                  # Manual Node.js version check (npm run check:env)
├── data/
│   ├── .gitkeep                       # Keeps data directory in git
│   └── my-meal.db                     # SQLite database (auto-created, gitignored)
├── images/                            # Meal images directory
└── Documentation:
    ├── README.md                      # This file - Quick start guide
    ├── INSTALL.md                     # Detailed installation instructions
    ├── NODE_VERSION_GUIDE.md          # Node.js version & deployment guide
    ├── SPECIFICATION.md               # Application specifications
    └── MIGRATION_SUMMARY.md           # Migration details
```

## Technical Details

### Why Native SQLite?

This application uses the **native `node:sqlite` module** introduced in Node.js v22.5.0:

- ✅ **No native compilation** - Works without C++ build tools
- ✅ **No external dependencies** - Uses built-in Node.js SQLite
- ✅ **Easy deployment** - Just set the Node.js version
- ✅ **Cross-platform** - Works on any platform with Node.js 22.5+
- ✅ **Hetzner compatible** - Works on Webhosting L and managed servers

The module is still marked as experimental but has been stable since its introduction. It requires the `--experimental-sqlite` flag, which is automatically set in the npm scripts.

### Experimental Flag

The application is started with:
```bash
node --experimental-sqlite server.js
```

This flag is automatically included in the npm scripts (`npm start`, `npm run dev`).
