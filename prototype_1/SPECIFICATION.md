
# Project my-meal

For a school restaurant, restaurant guests (students, teachers, ...) can choose meal options from a set of preselected options provided by the restaurant. The restaurant is part of an internal entreprise called Seefood.


## Features

 - The result of this software will be a meal plan for the week (one meal per day, 5 days)
 - One meat meal per week, one fish meal per week, and two vegetarian meals (the fifths day uses left overs)
 - Custom interfaces for students on the one hand, and the kitchen (Seefood) on the other hand

## User interactions
 
 - An admin (together with Seefood) uploads a database of all possible meals
 - The kitchen provides a set of meat, fish and vegetarian meal or meal_combination options for the week (out of the total from the database)
 - The students select one meat option, one fish option, and two vegetarian options out of the meal and meal_combination options provided by the kitchen

## Data structure

### *Meal* 
 - Name
 - Image (path to a file)
 - Information on dietary ingredients (gluten, milk, nuts...)
 - Vegetarian?
 - Vegan?

### *Meal_combination* 
 - Name
 - Multiple related meals, where one component differs (e.g., burger and vegetarian burger)

### *Vote*
 - Prototype: free form name of student
 - List of names of selected meal and meal_combination options

## Edge cases/errors

 - All meals in a week should differ, no repetitions
 - The software keeps a memory of the last three weeks of meal plans, and no meal repeats within two weeks
 - Ensure that students can only select 1 meat (or a meal combination with a meat option), 1 fish (or a meal combination), and 2 vegetarian options


## What to test?
 
 


## Possible extensions later, after the initial prototype

 - Multiple meals per day
 - Allow for different language (fr, en, de)
 - Tutorial showing how to use the software
 - Ask seefood: option for two fish or two meat options per week?

