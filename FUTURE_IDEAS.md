# Data structure

The application organizes data in the following SQLite tables:
 ... (see specification)

To add: 
- `meal_plan` - Final weekly meal plan result


# Ideas for potential future features

 - ! Anonymise names of guest votes with some unique IDs

 - Handle cases where insufficient votes are cast for any category

 "Minimum voting requirements:
- At least 1 vote must be cast for the week to be valid
- The system warns (but doesn't block) if total votes < 10"


 - ? Handle invalid or corrupted data gracefully


 - Multiple meals per day
 - Allow for different language (fr, en, de)
 - Tutorial showing how to use the software
 - Ask Seefood: option for two fish or two meat options per week?

 - Later: Always show the last two weeks' meal plans decided by the restaurant on the guest page separate from the voting interface (above, below, or on either side)

 - Once the meal plan is selected by the restaurant, the guest page is to be cleared (except last two weeks' meal plans) for the next round of voting, open on the following week

 - All meal combinations in a week should differ, no repetitions

  **Later: Optional Editing Phase**: Restaurant can modify the final plan if needed

Later, for the actual implementation, the data is stored in a database on a remote server.

### Weekly meal plan

 - Manually: the restaurant chooses four meals for the week to make a final menu: one meat meal combination, one fish meal combination, and two vegetarian meal combinations

 - After manual input from the restaurant: a meal plan visible to both the restaurant and guests


Once voting results are collected, then within this app the Restaurant can manually create a weekly meal plan.

### Archiving
- After the restaurant confirms the weekly meal plan, the system admin must click on a new button 'Start New Week' which:
  - Archives current week's data
  - Clears all guest votes (background data) and vote charts (admin/restaurant)
  - Clears weekly options (guest page)
  - Displays the meal plan selected by the restaurant on the guest page
- The software keeps a memory of the last three weeks of meal plans, and no meal repeats within two weeks


## Tests

   - The system admin can retrieve the final weekly meal plan result
     - Write suitable regression test
