
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal preferences from a set of options offered by the restaurant. The final result is a weekly meal plan proposal with a meal (or a meal combination) per day. 

Terminology: The restaurant is part of a school enterprise called Seefood.


## Features

 - The results of this software will be:
    -  a chart of the voted meals that includes the number of votes visible only to the restaurant
    - after manual input from the restaurant: a meal plan visible to both the restaurant and guests
 - Voting mechanics translate the student preferences into comparison charts (e.g. pie charts, column charts) that show the votes, one per category 
   - The system counts votes for each meal option and shows it on its respective chart
   - Later: The restaurant can further edit the resulting plan
 - Manually: the restaurant chooses four meals for the week to make a final menu: one meat meal per week, one fish meal per week, and two vegetarian meals (the fifth day uses leftovers, it's called "SEEMPHONIE")
 - The vote results and meal choice interface are to be shown on the restaurant page as well as on the admin page
 - Once the meal plan is selected by the restaurant, the guest page is to be cleared (except last two weeks' meal plans) for the next round of voting, open on the following week
 - Always show the last two weeks' meal plans decided by the restaurant on the guest page separate from the voting interface (above, below, or on either side)

## User interactions
 
Prototype: There are three UI areas in the app (e.g., three tabs), for different types of users to interact with the app: a system admin, the Seefood restaurant, and restaurant guests (students etc.). In later versions, these areas might be separated into separate apps (e.g., a separate app for the restaurant guests).

 - Prototype: A system admin (together with Seefood) uploads a database of all possible meals
   - Later: We will add support for updating an existing database
 - The restaurant provides a set of meat, fish and vegetarian meal or meal_combination options for the week (out of the total from the database)
 - A guest selects one meat option, one fish option, and two vegetarian options out of the meal and meal_combination options provided by the kitchen
 - The system admin obtains the final weekly meal plan at the end after the voting is finished

Prototype: The system admin and the restaurant users do not need to authenticate themselves. Each guest should identify themselves with a unique name, but there is no actual login process and these names are not double-checked. This is refined later.


## Workflow

The application follows this step-by-step process:

1. **Setup Phase**: System admin uploads the meal database containing all possible meals
2. **Restaurant Selection Phase**: Restaurant staff selects available meal options for the week from the database
3. **Guest Voting Phase**: Guests vote for their preferences (1 meat, 1 fish, 2 vegetarian options)
4. **Results Phase**: System admin retrieves the final weekly meal plan based on vote aggregation
5. **Later: Optional Editing Phase**: Restaurant can modify the final plan if needed

## Data structure

Prototype: all persistent data is stored in a local SQLite database (`data/my-meal.db`) using Node.js's native `node:sqlite` module (available in Node.js v22.5.0+). Additionally, there is a folder with graphic files (with the corresponding ID and meal name as file name). Later, for the actual implementation, the data is stored in a database on a remote server.

The system admin can upload meal data via a JSON file (`meals_database.json` format), which will be imported into the database. When new meal data is uploaded, the system automatically resets by clearing weekly options, guest votes, and the meal plan.

### Database Structure
The application organizes data in the following SQLite tables:
- `meals` - Individual meals from the meals database
- `meal_combinations` - Meal combinations (e.g., meat and vegetarian versions of same dish)
- `combination_meals` - Links meals to their combinations
- `weekly_options` - Restaurant's selected options for the current week
- `guest_votes` - All guest voting data
- `meal_plan` - Final weekly meal plan result
- `metadata` - System metadata (timestamps, etc.)

Additionally:
- `images/` - Folder containing meal images (named with meal ID and name)
- `data/` - Folder containing the SQLite database file

### JSON Upload Format
The system admin uploads meal data as JSON with this structure:
```json
{
  "meals": [...],
  "meal_combinations": [...]
}
```

This data is then imported into the database, preserving the same logical structure.

The rest of this section sketches possible internal data structures. Again, these data structures are only a suggestion to help you understand our intentions for this application, but you can make a sensible design decision yourself.


### *meal* 
 - Name - string
 - Later: a unique ID - string
 - Image (path to a file) - string
 - Vegetarian? - boolean 
 - Vegan? - boolean


### *meal_combination* 
This data represents alternative versions of the same dish (e.g., vegetarian vs. non-vegetarian)
Examples:
   - A vegetarian and non-vegetarian combination: burger and vegetarian_burger
   - Multiple vegetarian options: some dish with either mushrooms or vegetables

Data structure:
 - Name - string
 - Multiple related *meal* data, where one component differs - JSON array of meal objects

### *meal_plan*
Mapping of 4 weekdays to a *meal* or *meal_combination* per day. The final result. - JSON object


### *guest_vote*
 - Prototype: free form name of a guest - string
 - Selected meal options - JSON object with categories:
   - meat_option: string (one meat meal or meal_combination)
   - fish_option: string (one fish meal or meal_combination) 
   - vegetarian_options: JSON array of strings (exactly two vegetarian meals or meal_combinations)


## Edge cases/errors
 - All meals in a week should differ, no repetitions
 - Ensure that guests can only select 1 meat (or a meal combination with a meat option), 1 fish (or a meal combination), and 2 vegetarian options
 - Ensure that the final result includes 1 meat (or a meal combination with a meat option), 1 fish (or a meal combination), and 2 vegetarian options
 - Handle cases where insufficient votes are cast for any category
 - Validate that selected meals exist in the restaurant's weekly options
 - Prevent duplicate guest names from voting multiple times (enforced by database UNIQUE constraint)
 - Handle invalid or corrupted data gracefully
 - Ensure meal combinations are properly categorized (meat/fish/vegetarian)
 - When uploading a new meals database, automatically reset the system (clear weekly options, votes, and meal plan)


# Tech stack
  Prototype: use HTML, CSS and JavaScript, implementation as a server with Node.js.


## What to test?

   - A system admin can enter the initial database
     - Create a test meal database text file with a range of options
     - Write a regression test uploading this test database to the software
   - The kitchen can see the full set of meal options and choose possible meal options for the week
     - Write suitable regression test
   - The guests can see the possible meal options and choose their preferences
     - Write suitable regression test
   - The system admin can retrieve the final weekly meal plan result
     - Write suitable regression test
   

## [Ignore] Possible extensions later, after the initial prototype

 - Multiple meals per day
 - Allow for different language (fr, en, de)
 - Tutorial showing how to use the software
 - Ask seefood: option for two fish or two meat options per week?

 - The software keeps a memory of the last three weeks of meal plans, and no meal repeats within two weeks

