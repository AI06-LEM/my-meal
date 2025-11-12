
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal preferences from a set of options offered by the restaurant. The final result is a weekly meal plan proposal with a meal (or a meal combination) per day. 

Terminology: The restaurant is part of a school enterprise called Seefood.


## Features

 - The result of this software will be a meal plan for the week (one meal per day, 4 weekdays)
 - Four meals per week are chosen in the end: one meat meal per week, one fish meal per week, and two vegetarian meals (the fifth day uses leftovers)
 - Voting mechanics translate the student preferences into a proposed meal plan for the week
   - The system counts votes for each meal option and selects the most popular choices
   - The final plan must include exactly 1 meat meal, 1 fish meal, and 2 vegetarian meals
   - Later: The restaurant can further edit the resulting plan


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

Prototype: all persistent data is stored locally as text files. Additionally, there will be a folder with graphic files (with the corresponding ID and meal name as file name). Later, for the actual implementation, the data is stored in a database on a remote server.

These text files use some format that is easily readable by both machines and humans, e.g., YAML or JSON format. For example, the top-level hierarchic layer might use YAML (that way, comments are allowed), but the main internal nested data could be stored in JSON format within a YAML file. However, this is only a suggestion, you can make a sensible design decision yourself.

### File Structure
The application should organize data files as follows:
- `meals_database.json` - Contains all available meals
- `weekly_options.json` - Restaurant's selected options for the current week
- `guest_votes.json` - All guest voting data
- `meal_plan.json` - Final weekly meal plan result
- `images/` - Folder containing meal images (named with meal ID and name)

The rest of this section sketches possible internal data structures. Again, these data structures are only a suggestion to help you understand our intentions for this application, but you can make a sensible design decision yourself.


### *meal* 
 - Name - string
 - Later: a unique ID - string
 - Image (path to a file) - string
 - Information on dietary ingredients (gluten, milk, nuts...) - JSON array of strings
   - Prototype: This information is not further used for now
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
 - Prevent duplicate guest names from voting multiple times
 - Handle invalid or corrupted data files gracefully
 - Ensure meal combinations are properly categorized (meat/fish/vegetarian)


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
   

## [TODO] Bugs

 - Please carefully proofread the file `meals_database.json`, there are several issues including the following:
   * [OPEN] *Every* meat and fish dish should be part of a `meal_combinations` complemented by a vegetarian or vegan counterpart dish. In other words, there can be no exclusively non-vegetarian meals. In the end, all votes for a meat and fish dish must also include a vote for a vegetarian or vegan counterpart dish, so that vegetarians are always served as well (by contrast, we do *not* always need a vegan dish).
   * [OPEN] In a `meal_combinations` with meat of fish, the two options should be similar and only differ by one main ingredient (e.g., a meat burger and a vegetarian burger are correct, while combining Tuna Pasta and Pasta Primavera is not correct).
   * [RESOLVED] Dietary options should be only `gluten`, `gluten-free` is redundant as a possible value. If `gluten` is not set as a flag, this implies `gluten-free`. 
   * [RESOLVED]  `vegan` is redundant as a dietary option under `dietary_info`, as this option is already set as the separate `vegan` property.
   * [RESOLVED] Add another 10 meals to the database

 - [OPEN] When generating the final plan, we get the following error: `Not enough unique options selected. Please ensure variety in weekly options.` This happens also after 12 guest votes have been submitted (see value of current `guest_votes.json`). It is not clear for the user, why this error happens. If there is a problem with the guest votes themselves, then this should be reported immediately when a submits their vote and the guest should be asked to resubmit. Otherwise, if there is at least one guest vote, any combination of votes should result in a final meal plan consistent with the given votes. If this is not possible with the current voting mechanism, then feel free to come back to discuss that voting mechanism and how it can be revised.

 - [RESOLVED] It appears that several files with persistent data are not updated when the program is running, e.g., 
   * `meal_plan.json` is not containing the final result after the system admin clicked on the button [Generate Weekly Meal Plan]
   * `guest_votes.json` remains empty after votes are submitted
   * `weekly_options.json` remains empty after Seefood entered options




## [Ignore] Possible extensions later, after the initial prototype

 - Multiple meals per day
 - Allow for different language (fr, en, de)
 - Tutorial showing how to use the software
 - Ask seefood: option for two fish or two meat options per week?

 - The software keeps a memory of the last three weeks of meal plans, and no meal repeats within two weeks

