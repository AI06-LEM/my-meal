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

4. Open your browser and navigate to:
```
http://localhost:3000
```

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

## Troubleshooting

- Make sure Node.js is installed and the server is running
- Check the browser console for any error messages
- Ensure all JSON files are properly formatted
- The server runs on port 3000 by default

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