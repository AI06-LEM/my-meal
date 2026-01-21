
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal combination preferences (votes) from a set of options offered by the restaurant. The final results are the guest voting results (the kitchen will use these to create the actual meal plan manually).


## Terminology

### User: system admin

A system administrator belongs to the team who developed this app. They maintain this software, e.g., upload data to the database or manually reset the system if necessary.

### User: restaurant

The restaurant is the (place and) team in the school that is choosing, cooking and serving meals. This team is using the Restaurant tab of this software to preselect meal combinations for the guests to vote on.

#### Seefood

The restaurant is part of an organisation in the school (an enterprise), which is called Seefood.

### User: guest

The guests eat in the school restaurant (e.g., students, teachers...). Within this app, they vote for meal combinations, and later in the restaurant they choose one meal out of the meal combination served on the day (e.g., the meat or vegetarian meal served).

#### Context

Here is some context on how this app will later be used in the school. When the restaurant offers meals in the end, then the restaurant offers all the meals in the selected combination, so that restaurant guests have still some choice on the day (e.g., the freedom to choose a vegetarian or non-vegetarian option).

All meals in a meal combination are usually similar (e.g., a burger or a vegetarian burger). However, this must not be validated by the software.


### Data structure: meal

One of the meals in a meal combination. For each meal, multiple pieces of information are stored including its name and its category (either meat, fish or vegetarian).


#### Meat meal

A meat meal is a meal with its category set to meat. 


#### Fish meal

A fish meal is a meal with its category set to fish. For simplicity, in this software fish is not considered meat.


#### Vegetarian meal

A vegetarian meal is a meal with its category set to vegetarian. 


### Data structure: meal combination

A meal combination is a set (or array) of meals. A meal combination contains always one or more meals (typically 2 meals, sometimes 1 or 3).

Typically, a meal combination represents the same dish in different dietary variations. A meal combination specifies options served by the restaurant on a day out of which restaurant guests can then choose one (in the restaurant, not this app).

Meals are always grouped in meal combinations for the purpose of this software. For example, the database stores all potentially possible meal combinations, the restaurant pre-selects multiple meal combinations according to certain restrictions (detailed later), from which the guests then can choose meal combinations. Neither the restaurant nor the guests ever select individual meals, they all always can only select meal combinations.

Every meal combination must contain at least one vegetarian meal (a meal with its category set to vegetarian). While this condition should be fulfilled by the system admin who enters data into the database, this condition should additionally be double-checked by the app when the system admin uploads a JSON file with database data, and in case of a violation, a warning should be shown (in the area below the Upload Meal Database controls on the system admin tab).

#### Meat meal combination

A meat meal combination contains at least one meat meal. Remember that each meal combination also always must contain at least one vegetarian meal.

#### Fish meal combination

A fish meal combination contains at least one fish meal. Remember that each meal combination also always must contain at least one vegetarian meal.

#### Vegetarian meal combination

A vegetarian meal combination contains only vegetarian meals.


### Weekly procedure

The school uses this app to decide on a meal plan for four days of the week (on the fifth weekday, leftovers are served, these happen to be called "SEEMPHONIE"). The result of this app will be voting results for these four days. 

The school (e.g., the system admin and restaurant) makes scheduling decisions for this app manually, i.e. they decide when to start the voting process and when to close it to new votes. 

This app is reset by the system admin manually once the voting process finished (with the corresponding button), but in two other cases the system is partially reset:
 1. If the system admin uploads a JSON database file, then 
    - All meals and meal combinations stored in the database are overwritten by the uploaded data
    - All weekly options selected by the restaurant are deleted
    - All guest votes are deleted 
 2. If the restaurant saves selected weekly options, then all guest votes are deleted
    - A warning is shown to remind the restaurant that guest votes were deleted


### Data structure: Weekly (meal) options

The weekly meal options are the set of all the meal combinations that have been preselected by the restaurant. 

Each week, the restaurant selects at least:
- 2 meat combos
- 2 fish combos
- 4 vegetarian combos

Upon saving in the restaurant tab, the software validates the above composition of a meal options, and in case of wrongly entered data displays an error message (e.g., "Please select exactly 2 vegetarian options"). Otherwise, the weekly options are stored in the database.


### Data structure: (Guest) Vote

A guest can vote on meal combinations out of the weekly meal options preselected by the restaurant. A guest vote consists of the following selection:
 - 1 meat meal combination
 - 1 fish meal combination
 - 2 vegetarian meal combinations

In other words, guests can vote on four meals per week (remember: on the fifth weekday, the restaurant serves leftovers).

Upon saving in the guests tab, the software validates the above composition of a vote, and in case of a wrongly entered data displays an error message. Otherwise, the vote is stored in the database.


### Voting result

The voting result is the main result of this software. This information is used by the restaurant to manually decide on the final meal plan for the week.

The voting result displays for each voted on meal combination how often it was voted for (as a bar chart with a numeric label). The presentation of the result is arranged into three groups corresponding to the three different meal categories (meat, fish and vegetarian).

All voted-on meal combinations are displayed (including those with zero votes). Results are sorted by vote count (descending) within each category. Tied meal combinations are simply arranged after each other in the order.

This voting result is displayed at both the admin and restaurant tabs.


## User interactions: prototype
 
Prototype: This project defines a single app. There are three UI areas in the app (three tabs), for different types of users to interact with the app: a system admin, the Seefood restaurant, and restaurant guests (students etc.). 

In the prototype, the system admin and the restaurant users do not need to authenticate themselves. Each guest should identify themselves with a name, but there is no actual login process. The guest names are arbitrary in the prototype, but they must be unique, and the system validates their uniqueness.

The application follows a step-by-step process as detailed in the next subsections.


### System admin uploads data in JSON format

A system admin uploads a JSON file detailing all the available meals. This action resets the system, i.e. all persistent data in the internal SQLite database (and the internal data) is either deleted or overwritten. 
 - All meals and meal combinations are overwritten by the information in the uploaded JSON file (data on meal combinations and meals)
 - Weekly options and guest votes deleted
 - The chart of the voting result is removed
   
### Restaurant preselects weekly options

Out of the uploaded range of possible meal combinations, the restaurant pre-selects weekly at least eight meal combinations that specify the options out of which restaurant guests can choose their preferences. These eight meal combinations contain 
 - At least two meat meal combinations 
 - At least two fish meal combinations 
 - Four vegetarian meal combinations

### Guests vote

Each guest is then shown the meal combinations selected by the restaurant for the current week. A guest vote consists of
 - Exactly one meat meal combination
 - Exactly one fish meal combination
 - Exactly two vegetarian meal combinations

### System admin collects voting results

At any time after guests submitted votes (also repeatedly), the system admin can obtain final voting results.

When starting the voting process for a new week, the system admin resets the system (with a reset button), which
 - Clears all weekly options (restaurant pre-selection) in the running software and database
 - Clears all guest votes in the running software and database
 - Clears the shown voting results (vote charts)


## User interactions: later version

In a later version of this software, the three current tabs will be separated into two separate apps: one for the system admin and the Seefood restaurant, and another independent app for the restaurant guests.

The system admin and the restaurant users need to log into their app. Also, each guest must log into the app. 


## Data structure

Prototype: all persistent data is stored in a local SQLite database (`data/my-meal.db`) using Node.js's native `node:sqlite` module (available in Node.js v22.5.0+). 

The system admin can upload meal data via a JSON file (example: `meals_database_en_test.json`), which will be imported into the database.

### Database Structure
The application organizes data in the following SQLite tables:
- `meals` - Individual meals from the meals database
- `meal_combinations` - Meal combinations (e.g., meat and vegetarian versions of same dish)
- `combination_meals` - Links meals to their combinations
- `weekly_options` - Restaurant's selected options for the current week
- `guest_votes` - All guest voting data
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

Note: In past versions, this software also processed individual meals (not only meal combinations) and therefore these were represented also separately. The "meals" feature/attribute in the JSON upload format is meanwhile obsolete and should be always empty. The JSON format will be later simplified, also removing this "meals" feature.

This JSON data is then imported into the database, preserving the same logical structure.

The rest of this section sketches possible internal data structures. These data structures are only a suggestion to help you understand our intentions for this application, but you can make a sensible design decision yourself.


### *meal* 
 - Name: string
 - A unique ID: string (added automatically during JSON file upload)
 - Category: "meat" | "fish" | "vegetarian",
 - Vegan: boolean

In the JSON upload format, there are no unique IDs for meals or meal combinations. These are created automatically by the system when a JSON file is uploaded (e.g., auto-generated UUIDs).

Each meal has exactly one category: meat, fish, or vegetarian. Fish meals are not considered meat.


### *meal_combination* 
 - Name: string 
 - A unique ID: string (added automatically during JSON file upload)
 - Meals: multiple related *meal* data, where one component differs, a JSON array of meal objects


### *guest_vote*
 - Name: string
 - Selected meal options for all three categories:
   - meat_option: string (meal_combination IDs)
   - fish_option: string (meal_combination IDs) 
   - vegetarian_options: array of strings (meal_combinations IDs)


## Edge cases/errors

 - Validate that selected meal combinations exist in the restaurant's weekly options
 - Prevent duplicate guest names from voting multiple times
 - Validate the uploaded JSON file, e.g, 
   - Ensure meal combinations are properly categorized (meat/fish/vegetarian)

 - In case the software crashes, all its data in the database (meals, meal combinations, weekly options and guest votes) are preserved so that the system can be restarted without data loss

 - In case the SQLite database file is missing at software startup, the software automatically creates an empty database with the required structure.

 - There is no maximum number of meals/combinations nor guests votes set by the system. However, the number of meals will usually not exceed hundreds and the number of guest votes will usually stay below 2000. 


## Concurrency (Prototype)

- SQLite handles basic read/write concurrency
- Simultaneous guest votes are both recorded (no conflict)
- Restaurant and admin should avoid concurrent modifications (not enforced)


## Tech stack

Use HTML, CSS, JavaScript and Node.js.

For the prototype, there is no need to optimise for performance.


### Browser Compatibility

The prototype targets modern browsers (e.g., Chrome, Firefox, Safari) on the desktop and mobile devices (iOS and Android). Most guests will use mobile devices, the server on which the software will later deployed is running Linux, while the development and testing of this software largely happens on desktop machines (MacOS and Windows). Multi-platform support is therefore essential.


## Port Configuration

The port on which the server runs on is configurable at the commandline. The default port is 3000.

