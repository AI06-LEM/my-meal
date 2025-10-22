
# Project my-meal

For a school restaurant serving lunch, restaurant guests (students, teachers, ...) can indicate meal preferences from a set of options offered by the restaurant. The final result is a weekly meal plan proposal with a meal (or a meal combination) per day. 

Terminology: The restaurant is part of a school entreprise called Seefood.


## Features

 - The result of this software will be a meal plan for the week (one meal per day, 5 days)
 - Four meals per week are chosen in the end: one meat meal per week, one fish meal per week, and two vegetarian meals (the fifths day uses left overs)
 - Some voting mechanics translates the student preferences into a proposed meal plan for the week 
   - Later: The restaurant can further edit the resulting plan


## User interactions
 
Prototype: There are three UI areas in the app (e.g., three tabs), for different types of users to interact with the app: a system admin, the Seefood restaurant, and restaurant guests (students etc.). In later versions, these areas might be separated into separate apps (e.g., a separate app for the restaurant guests).

 - Prototype: A system admin (together with Seefood) uploads a database of all possible meals
   - Later: We will add support for updating an existing database
 - The restaurant provides a set of meat, fish and vegetarian meal or meal_combination options for the week (out of the total from the database)
 - A guest selects one meat option, one fish option, and two vegetarian options out of the meal and meal_combination options provided by the kitchen
 - The system operator obtains the finale weekly meal plan at the end after the voting finished

Prototype: The system admin and the restaurant users do not need to authenticate themselves. Each guest should identify themselves with a unique name, but there is no actual login process and these names are not double-checked. This is refined later.


## Data structure

Prototype: all persistent data is stored locally as text files. Additionally, there will be a folder with graphic files (with the corresponding ID and meal name as file name). Later, for the actual implementation, the data is stored in a database on a remote server.

These text files use some format that is easily readable by both machines and humans, e.g., YAML or JSON format. For example, the top-level hierarchic layer might use YAML (that way, comments are allowed), but the main internal nested data could be stored in JSON format within a YAML file. However, this is only a suggestion, you can make a sensible design decision yourself.

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
 - Name - string
 - Multiple related Meal data, where one component differs. - JSON array of meal objects
   Examples:
   - A vegetarian and non-vegetarian combination: burger and vegetarian_burger
   - Multiple vegetarian options: some dish with either mushrooms or some vegetable instead


### *meal_plan*
Mapping of 4 weekdays to a Meal or Meal_combination per day. The final result. - JSON object


### *guest_vote*
 - Prototype: free form name of a guest - string
 - Multiple selected meal and/or meal_combination options - JSON array of strings


## Edge cases/errors
 - All meals in a week should differ, no repetitionsobject
 - Ensure that guests can only select 1 meat (or a meal combination with a meat option), 1 fish (or a meal combination), and 2 vegetarian options
 - Ensure that the final result includes 1 meat (or a meal combination with a meat option), 1 fish (or a meal combination), and 2 vegetarian options


# Tech stack
  Prototype: use HTML, CSS and JavaScript.


## What to test?

   - A system admin can enter the initial database
     - Create a test meal database text file with a range options
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

