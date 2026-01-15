
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal (i.e. meal combination) preferences (votes) from a set of options offered by the restaurant. The final results are the guest voting results (the kitchen will use these to create the actual meal plan manually).


## [UNFINISHED] Terminology

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

A meal combination is a set (array) of meals. A meal combination contains always one or more meals.

Meals are always grouped in meal combinations for this purpose of this software. For example, the database stores all potentially possible meal combinations, the restaurant pre-selects multiple meal combinations according to certain restrictions (detailed later), from which the guests then can choose meal combinations. Neither the restaurant nor the guests ever select individual meals, they all always can only select meal combinations.

Every meal combination must contain at least one vegetarian meal (a meal with its category set to vegetarian). While this condition should be fulfilled by the system admin who enters data into the database, this condition should additionally be double-checked by the app when the system admin uploads a JSON file with database data, and in case of a violation a warning should be shown (in the area below the Upload Meal Database controls on the system admin tab).

#### Meat meal combination

A meat meal combination contains at least one meat meal. Remember that each meal combination also always must contain at least one vegetarian meal.

### Fish meal combination

A fish meal combination contains at least one fish meal. Remember that each meal combination also always must contain at least one vegetarian meal.

### Vegetarian meal combination

A vegetarian meal combination contains only vegetarian meals.


### [TODO: Confirm with team] Week

The school uses this app to decide on a meal plan for four days of the week (the fifth weekday, leftovers are served). The result of this app will be voting results for these four days. 

The school (e.g., the system admin and restaurant) makes scheduling decisions for this app manually, i.e. they decides when to start the voting process and when to close it to 

 manually decides on 


This app is reset by the system admin manually once the voting process finished (with the corresponding button), but in two other cases the system is partially resets
 1. If the system admin uploads a JSON database file, then 
    - All meals and meal combinations stored in the database are overwritten by the uploaded data
    - All weekly options selected by the restaurant are deleted
    - All guest votes are deleted 
 2. If the restaurant saves selected weekly options, then all guest votes are deleted 


### Data structure: Weekly (meal) options

The weekly meal options are the set of all the meal combinations that have been preselected by the restaurant. 



A meal combination specifies options offered by the restaurant for a day, out of which restaurant guests can choose exactly one. 


Each week, the restaurant selects four meal combinations 


Upon saving in the restaurant tab, the weekly options are stored in the SQLite database.


### Data structure: (Guest) Vote

A guest can vote on meal combinations out of the weekly meal options preselected by the restaurant. A guest vote consists of the following selection:
 - 1 meat meal combination
 - 1 fish meal combination
 - 2 vegetarian meal combinations

In other words, guests can vote on four meals per week (on the fifth weekday, the restaurant serves leftovers, which they call "SEEMPHONIE").

The software validates the above composition of a guest vote and in case of a wrongly entered vote displays an error message without accepting that vote.

Upon saving/submitting a vote successfully in the guest tab, this vote is stored in the SQLite database.


### Voting result

The voting result is the main result of this software. This information is used by the restaurant to manually decide on the final meal plan for the week.

The voting result (vote charts) displays the sum of all the votes per meal combination. The presentation of the result is arranged into three groups corresponding to the three different meal categories (meat, fish and vegetarian).


### Weekly meal plan

TODO


## Features

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
 - Out of these possible meal combinations, the restaurant pre-selects weekly exactly four meal combinations that specify the options out of which restaurant guests can choose their preferences. These four meal combinations contain exactly one meal combination with at least one meal containing meat and exactly one other meal combination with a meal containing fish. The two remaining meal combinations contain only vegetarian meals.
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


### [Partly outdated] *meal* 
 - Name - string
 - Later: a unique ID - string
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

### [Outdated] *meal_plan*
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

