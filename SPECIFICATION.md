
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal preferences (votes) from a set of options offered by the restaurant. The final results are the guest voting results (the kitchen will use these to create the actual meal plan manually).

Terminology: The restaurant is part of a school enterprise called Seefood.


## Features

 - All meals are arranged in collections of 1 or more meals, called meal combinations. A meal combination specifies options offered by the restaurant for a day, out of which restaurant guests can choose exactly one. Every meal combination contains at least one vegetarian meal. All meals in a meal combination are usually similar (e.g., a burger or a vegetarian burger).
 - The voting results of this app will be used to create a meal plan for one week. Restaurant guests can vote on exactly four meals per week (the fifths and last day the school kitchen serves leftovers).
 - The results of this software will be:
    - A chart of the voted meals that includes the number of votes visible only to the restaurant
    - After manual input from the restaurant: a meal plan visible to both the restaurant and guests
 - Voting mechanics translate the student preferences into comparison charts (column charts) that show the votes, one per category 
   - The system counts votes for each meal option and shows it on its respective chart
   - Later: The restaurant can further edit the resulting plan
 - Manually: the restaurant chooses four meals for the week to make a final menu: one meat meal per week, one fish meal per week, and two vegetarian meals (the fifth day uses leftovers, it's called "SEEMPHONIE")
 - The vote results and meal choice interface are to be shown on the restaurant page as well as on the admin page
 - Once the meal plan is selected by the restaurant, the guest page is to be cleared (except last two weeks' meal plans) for the next round of voting, open on the following week
 - Later: Always show the last two weeks' meal plans decided by the restaurant on the guest page separate from the voting interface (above, below, or on either side)

## User interactions: prototype
 
Prototype: This project defines a single app. There are three UI areas in the app (three tabs), for different types of users to interact with the app: a system admin, the Seefood restaurant, and restaurant guests (students etc.). In later versions, these areas will be separated into separate apps.

 - A system admin can upload a JSON file detailing all the available meals. This action resets the system (all persistent data in the internal SQLite database is overwritten) and overwrites the list of all possible meal combinations.
 - Out of these possible meal combinations, the restaurant pre-selects weekly at least eight meal combinations that specify the options out of which restaurant guests can choose their preferences.
 - These eight meal combinations contain at least two meat combination, at least two other fish combination and at least four  vegetarian meal combinations.
 - Each guest is then shown the meal combinations selected by the restaurant for the current week, again one meal combinations with meat, one with fish and two purely vegetarian meal combinations. Out of each meal combination, the guest can select exactly one meal of their choice.
 - The system admin can obtain final voting results 

The system admin and the restaurant users do not need to authenticate themselves. Each guest should identify themselves with a unique name, but there is no actual login process and these names are not double-checked. 

## User interactions: later version

This project defines multiple apps, one for the system admin and the Seefood restaurant, and another independent app for the restaurant guests.

The system admin and the restaurant users need to log into their app. Also, each guest must log into the app. 


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
 - Category: "meat" | "fish" | "vegetarian",
 - Vegan? - boolean

 Each meal has exactly one category: meat, fish, or vegetarian. Fish meals are not considered meat.


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
 - All meal combinations in a week should differ, no repetitions
 - Ensure that guests can only select 1 meat meal combination, 1 fish meal combination, and 2 vegetarian options
 - Ensure that the final result includes 1 meatvmeal combination, 1 fish meal combination, and 2 vegetarian options
 - Handle cases where insufficient votes are cast for any category
 - Validate that selected meal combinations exist in the restaurant's weekly options
 - Prevent duplicate guest names from voting multiple times (enforced by database UNIQUE constraint)
 - Handle invalid or corrupted data gracefully
 - Ensure meal combinations are properly categorized (meat/fish/vegetarian)
 - When uploading a new meals database, automatically reset the system (clear weekly options, votes, and meal plan)

 "Minimum voting requirements:
- At least 1 vote must be cast for the week to be valid
- The system warns (but doesn't block) if total votes < 10"


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

