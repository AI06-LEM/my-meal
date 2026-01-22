# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal combination preferences (votes) from a set of options offered by the restaurant. The final results are the guest voting results (the kitchen will use these to manually create the actual meal plan).

---

## 1. Users

### System Admin
A system administrator belongs to the team who developed this app. They maintain this software, e.g., upload data to the database or manually reset the system if necessary.

### Restaurant (Seefood)
The restaurant is the (place and) team in the school that is choosing, cooking and serving meals. This team uses the Restaurant tab to preselect meal combinations for guests to vote on. The restaurant is part of an organisation in the school (an enterprise), which is called Seefood.

### Guest
The guests eat in the school restaurant (e.g., students, teachers...). Within this app, they vote for meal combinations. Later in the restaurant, they choose one meal out of the meal combination served on the day (e.g., the meat or vegetarian meal served).

When the restaurant offers meals, it offers all the meals in the selected combination, so that guests have some choice on the day (e.g., the freedom to choose a vegetarian or non-vegetarian option). All meals in a meal combination are usually similar (e.g., a burger or a vegetarian burger). However, this must not be validated by the software.

---

## 2. Data Structures

### Meal
A single meal item with the following properties:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (auto-generated during JSON upload) |
| name | string | Display name |
| category | enum | One of: `"meat"`, `"fish"`, `"vegetarian"` |
| vegan | boolean | Whether meal is vegan |

**Note:** Each meal has exactly one category. Fish meals are not considered meat.

### Meal Combination
A set of meals (typically 2, sometimes 1 or 3) representing the same dish in different dietary variations. Guests and the restaurant always select meal combinations, never individual meals.

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier (auto-generated during JSON upload) |
| name | string | Display name |
| meals | array | Array of meal objects (1–3 items) |

**Categorization of meal combinations:**
- **Meat meal combination**: Contains at least one meat meal
- **Fish meal combination**: Contains at least one fish meal  
- **Vegetarian meal combination**: Contains only vegetarian meals

**Important:** Every meal combination must contain at least one vegetarian meal.

### Weekly Options
The set of meal combinations preselected by the restaurant for guests to vote on.

### Guest Vote
A guest's selection consisting of:
- 1 meat meal combination
- 1 fish meal combination
- 2 vegetarian meal combinations

| Field | Type | Description |
|-------|------|-------------|
| name | string | Guest's name (must be unique) |
| meat_option | string | Meal combination ID |
| fish_option | string | Meal combination ID |
| vegetarian_options | array | Array of 2 meal combination IDs |

### Voting Result
Displays how often each meal combination was voted for (as a bar chart with numeric labels). Results are:
- Grouped into three categories (meat, fish, vegetarian)
- Sorted by vote count (descending) within each category
- All voted-on meal combinations shown
- In case of 0 votes in a category, then this fact is shown

The voting result is displayed on both the Admin and Restaurant tabs.

---

## 3. Workflow

The school uses this app to decide on a meal plan for four days of the week. On the fifth weekday, leftovers are served (called "SEEMPHONIE").

### Step 1: System Admin Initialises System for New Week

Either *one of the following two initialisation actions* is performed to initialise system for next week.

#### Option 1: JSON database file upload
- **Input:** JSON file with meal data uploaded
- **Effect:** In SQLite database and in memory
  - All meals and meal combinations are overwritten
  - Weekly options and guest votes are deleted
  - Voting result chart is cleared
- **UI Feedback:** Success message or validation warnings

#### Option 2: Manual system reset
- **Input:** Reset System button pressed
- **Effect:** In SQLite database and in memory
  - Weekly options and guest votes are deleted
  - Voting result chart is cleared
  - (Meals and meal combinations existing in the SQLite database from previous JSON file upload are preserved)
- **UI Feedback:**
  - Reset warning asking to confirm
  - After confirmation: success message or warning that no meals exist in database (if database was empty initially)

**Note:** The school manually decides when to start (and close) the voting process.

### Step 2: Restaurant Selects Weekly Options
- **Prerequisite:** Meals and meal combinations must exist in SQLite database
- **Input:** Select meal combinations and then save weekly options:
  - At least 2 meat combinations
  - At least 2 fish combinations
  - At least 4 vegetarian combinations
- **Effect:** 
  - Selected weekly options are stored in SQLite database
  - Previous guest votes are deleted
- **UI Feedback:** Warning about previous vote deletion (if previous votes in database), then success or validation error

**Note:** Restaurant can change and re-save new weekly options, and therefore for internal consistency guest votes are deleted upon saving, but the restaurant is therefore also warned.

### Step 3: Guests Vote
- **Prerequisite:** Weekly options must be selected
- **Input:** Guest name + selections + vote submission:
  - Exactly 1 meat combination
  - Exactly 1 fish combination
  - Exactly 2 vegetarian combinations
- **Effect:** Vote stored in database
- **UI Feedback:** Confirmation or validation error

### Step 4: View Results
- **Who:** Admin and Restaurant can view results at any time (upon pressing button to show vote charts).
- **Display:** Bar chart grouped by category, updates after each vote

---

## 4. User Interface

### System Admin Tab
Multiple areas with different settings and information displayed.

#### Upload Meal Database
Form for uploading JSON file and feedback messages.

#### Current Status
Status messages on
 - Database: Empty or Loaded
 - Weekly Options: Unset or Set
 - Votes: Number of votes submitted

#### Vote Results (Charts)
Area for displaying vote results upon button press.

#### Reset System
Area for reset button and messages.

### Restaurant Tab

#### Weekly Options Selection
Area to select weekly options (sorted by category), saving and feedback messages.

#### Vote Results (Charts)
Area for displaying vote results upon button press.

### Guests Tab

#### Guest Voting
Area for voting on meal combinations (sorted by category), saving and feedback messages.


## 5. System States

### State 1: Empty (No Database)

- **Admin tab:** Shows in Current Status area that database is empty (plus status of weekly options and votes)
- **Restaurant tab:** Shows message "Please upload a meal database first"
- **Guest tab:** Shows message "Voting is not yet available"

Note: This state is only possible, if no SQLite database file exists at system startup. Otherwise, at least the database of meals and meal combinations is never empty.

### State 2: Database Loaded, No Options Selected

- **Admin tab:** Shows in Current Status area that database is loaded (plus status of weekly options and votes)
- **Restaurant tab:** Allows meal selection
- **Guest tab:** Shows "The restaurant has not selected options yet"

### TODO: FIX State 3: Options Selected (Voting Open)

- **Admin tab:** Shows chart (updates with votes)
- **Restaurant tab:** Shows selected options and chart
- **Guest tab:** Shows voting form

---

## 6. NEW Validation Rules

### JSON Upload Validation
1. JSON must be valid and parseable
2. Must contain `meal_combinations` array
3. Each meal must have: name (string), category (enum), vegan (boolean)
4. Each combination must have at least one meal
5. Each combination should have at least one vegetarian meal → **warning** if violated (upload still proceeds)

### Restaurant Selection Validation
1. Must select at least 2 meat combinations
2. Must select at least 2 fish combinations
3. Must select exactly 4 vegetarian combinations
4. Show error message if requirements not met

### Guest Vote Validation
1. Guest name required and must be unique
2. Must select exactly 1 meat combination
3. Must select exactly 1 fish combination
4. Must select exactly 2 vegetarian combinations
5. Show error message if requirements not met

---

## 7. Data Reset Behavior

| Action | Meals/Combinations | Weekly Options | Guest Votes | Chart |
|--------|-------------------|----------------|-------------|-------|
| Upload JSON database | Overwritten | Deleted | Deleted | Cleared |
| Restaurant saves options | Unchanged | Updated | Deleted | Cleared |
| Admin resets system | Unchanged | Deleted | Deleted | Cleared |

---

## 8. Technical Requirements

### Tech Stack
- HTML, CSS, JavaScript, Node.js
- SQLite database using Node.js native `node:sqlite` module (requires Node.js v22.5.0+)
- No performance optimization needed for prototype

### Database Structure
Data is stored in a local SQLite database (`data/my-meal.db`):
- `meals` - Individual meals from the meals database
- `meal_combinations` - Meal combinations
- `combination_meals` - Links meals to their combinations
- `weekly_options` - Restaurant's selected options for the current week
- `guest_votes` - All guest voting data
- `metadata` - System metadata (timestamps, etc.)

### JSON Upload Format
```json
{
  "meals": [],
  "meal_combinations": [...]
}
```
**Note:** The `meals` array is obsolete and should always be empty. Meals are defined within `meal_combinations`. This format will be simplified in a future version.

Example file: `meals_database_en_test.json`

### Browser Compatibility
The prototype targets modern browsers (Chrome, Firefox, Safari) on desktop and mobile devices (iOS and Android). Most guests will use mobile devices. The server runs on Linux, while development/testing happens on MacOS and Windows.

### Port Configuration
The server port is configurable via command line. Default port: 3000.

---

## 9. Edge Cases and Error Handling

### Error Handling
- **User errors:** Show inline error messages near the relevant form field
- **Validation errors:** Prevent form submission until fixed
- **System errors:** Display user-friendly message and log to console

### Database Resilience
- If the database file is missing at startup, create an empty database with the required structure
- If the software crashes, all data is preserved for restart without data loss

### Concurrency (Prototype)
- SQLite handles basic read/write concurrency
- Simultaneous guest votes are both recorded (no conflict)
- Restaurant and admin should avoid concurrent modifications (not enforced)

### Limits
- No maximum number of meals/combinations or guest votes set by the system
- Expected usage: hundreds of meals, under 2000 guest votes

---

## 10. Prototype vs. Later Version

### Prototype (Current)
- Single app with three tabs (Admin, Restaurant, Guest)
- No authentication for admin or restaurant
- Guests identify with a name (must be unique, but no login process)

### Later Version
- Two separate apps: one for admin/restaurant, one for guests
- All users must log in

---
