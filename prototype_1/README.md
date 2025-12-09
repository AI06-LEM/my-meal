# My-Meal Prototype

A school restaurant meal planning application that allows guests to vote on meal preferences and generates weekly meal plans.

## Features

- **System Admin**: Upload meal database and generate final meal plans
- **Restaurant Staff**: Select weekly meal options from the database
- **Guests**: Vote on their preferred meals (1 meat, 1 fish, 2 vegetarian options)
- **Real-time Persistence**: All data is saved to local JSON files via a Node.js server

## Setup and Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

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

3. Start the server:

Windows
```powershell
npm.cmd start
```

MacOS/Linux:
```bash
npm start
```

The server will display connection information including:
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

Windows
```powershell
npm.cmd run dev
```

MacOS/Linux:
```bash
npm run dev
```

### Stopping the Server

To stop the server, press `Ctrl+C` (or `Cmd+C` on Mac) in the terminal where the server is running. The server will shut down gracefully.

**Note:** If you're running the server in the background or need to stop it from another terminal, you can find the process ID and terminate it.

MacOS/Linux:
```bash
# Find the process running on port 3000
lsof -ti:3000

# Kill the process (replace PID with the actual process ID)
kill PID
```

## Usage

### 1. System Admin Tab
- Upload a meal database JSON file
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

## Data Files

The application automatically creates and manages these JSON files:
- `meals_database.json` - All available meals
- `weekly_options.json` - Restaurant's selected options for the week
- `guest_votes.json` - All guest voting data
- `meal_plan.json` - Final weekly meal plan result

## API Endpoints

The server provides REST API endpoints for data persistence:
- `GET/POST /api/meals-database` - Manage meal database
- `GET/POST /api/weekly-options` - Manage weekly options
- `GET/POST /api/guest-votes` - Manage guest votes
- `GET/POST /api/meal-plan` - Manage meal plan

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

- **Server won't start**: Check if port is already in use, try a different port
- **Can't access from mobile**: Verify both devices on same network, check firewall, try different port
- **Connection timeout**: Likely firewall or client isolation issue
- **"Connection refused"**: Server may not be running or binding to wrong interface
- **IP address changes**: Normal when switching networks; check server output for current IP
- Make sure Node.js is installed and the server is running
- Check the browser console for any error messages
- Ensure all JSON files are properly formatted

## File Structure

```
prototype_1/
├── server.js              # Node.js Express server
├── package.json           # Dependencies and scripts
├── index.html             # Main HTML file
├── script.js              # Frontend JavaScript
├── styles.css             # CSS styling
├── meals_database.json    # Meal data (auto-created)
├── weekly_options.json    # Weekly options (auto-created)
├── guest_votes.json       # Guest votes (auto-created)
├── meal_plan.json         # Final meal plan (auto-created)
└── images/                # Meal images directory
```