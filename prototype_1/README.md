# My Meal - Seefood Restaurant Prototype

A web application for managing weekly meal planning in a school restaurant system.

## Features

- **System Admin Interface**: Upload meal database and generate final meal plans
- **Restaurant Interface**: Select weekly meal options from the database
- **Guest Voting Interface**: Students and teachers vote for their meal preferences
- **Automated Meal Planning**: Vote aggregation to create weekly meal plans

## How to Use

### 1. System Admin Setup
1. Open the application in a web browser
2. Go to the "System Admin" tab
3. Upload the `meals_database.json` file using the file upload
4. Monitor the system status to ensure all components are ready

### 2. Restaurant Selection
1. Switch to the "Restaurant" tab
2. Select meal options for the week from each category:
   - 1+ meat options
   - 1+ fish options  
   - 2+ vegetarian options
3. Click "Save Weekly Options"

### 3. Guest Voting
1. Switch to the "Guests" tab
2. Enter your name
3. Select your preferences:
   - 1 meat option
   - 1 fish option
   - 2 vegetarian options
4. Click "Submit Vote"

### 4. Generate Meal Plan
1. Return to the "System Admin" tab
2. Click "Generate Weekly Meal Plan" to create the final plan
3. View the generated meal plan with vote counts

## Data Structure

The application uses the following JSON files:

- `meals_database.json`: Contains all available meals and meal combinations
- `weekly_options.json`: Restaurant's selected options for the current week
- `guest_votes.json`: All guest voting data
- `meal_plan.json`: Final weekly meal plan result

## Technical Details

- Built with HTML, CSS, and JavaScript
- Data persistence using localStorage
- Responsive design for mobile and desktop
- Modern UI with tabbed interface

## Testing

The application includes comprehensive validation for:
- Duplicate guest names
- Required meal selections
- Vote aggregation logic
- Edge cases and error handling

## Future Enhancements

- Database integration
- User authentication
- Multi-language support
- Meal history tracking
- Advanced dietary filtering

