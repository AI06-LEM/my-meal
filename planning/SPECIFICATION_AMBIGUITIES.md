# Specification Review: Ambiguities and Missing Details

I'll analyze the SPECIFICATION.md file for ambiguities and missing details that could cause implementation or testing issues.

## Table of Contents

- [Critical Ambiguities](#critical-ambiguities)
  - [1. Voting Unit: Meals vs. Meal Combinations](#1-voting-unit-meals-vs-meal-combinations)
  - [2. [AI05] Duplicate Guest Names: Contradictory Statements](#2-duplicate-guest-names-contradictory-statements)
  - [3. Fish vs. Meat vs. Vegetarian: Missing Definitions](#3-fish-vs-meat-vs-vegetarian-missing-definitions)
  - [4. [AI01] When Does Voting Reset?](#4-when-does-voting-reset)
  - [5. [DONE] Meal Combinations Must Contain Vegetarian Option](#5-meal-combinations-must-contain-vegetarian-option)
  - [6. Missing: Week Definition and Timeline](#6-missing-week-definition-and-timeline)
  - [7. Restaurant Selection vs. Final Meal Plan](#7-restaurant-selection-vs-final-meal-plan)
  - [8. [DONE] Missing: Image File Requirements](#8-missing-image-file-requirements)
  - [9. Missing: Success Criteria for Voting](#9-missing-success-criteria-for-voting)
  - [10. JSON Upload: Missing Validation Rules](#10-json-upload-missing-validation-rules)
  - [11. Missing: Concurrent Access Handling](#11-missing-concurrent-access-handling)
  - [12. Missing: Error Recovery](#12-missing-error-recovery)
- [Summary](#summary)

## Critical Ambiguities

### 1. **Voting Unit: Meals vs. Meal Combinations**

**What's ambiguous:**
- Line 12: "Restaurant guests can vote on exactly four meals per week"
- Line 30: "the guest can select exactly one meal of their choice" from each combination
- Line 110-113: guest_vote structure references both "meals" and "meal_combinations"

**Why problematic:**
The specification alternates between saying guests vote on "meals" versus selecting from "meal combinations." This creates confusion about:
- Does a guest vote on 4 individual meals, or on 4 meal combinations (choosing one meal from each)?
- When aggregating results, do you count votes per individual meal or per combination?

**AI: Suggested clarification:**
Explicitly state: "Guests are shown 4 meal combinations for the week. From each combination, they select exactly one meal. The system counts votes for each individual meal within its combination."

**Correct clarification:**

Explicitly state: "Guests are shown the full set of meal combinations (options) the restaurant chose for the week: at least 2 meat meal combinations (meat option), at least 2 fish meal combinations and at least 4 vegetarian meal combinations. Guest can choose 1 meat option (still a meal combination), 1 fish option and 2 vegetarian options. The system counts votes for each individual meal combination."


---

### 2. **Duplicate Guest Names: Contradictory Statements**

**What's ambiguous:**
- Line 33: "these names are not double-checked"
- Line 122: "Prevent duplicate guest names from voting multiple times (enforced by database UNIQUE constraint)"

**Why problematic:**
These statements directly contradict each other. If names aren't double-checked, guests can vote multiple times. If there's a UNIQUE constraint, the second vote will fail (but how? Error message? Silent rejection?).

**Suggested clarification:**
Choose one approach:
- Option A: "Guest names must be unique (enforced by database). If a name already voted, show error: 'This name has already voted this week.'"
- Option B: "Names are not validated. The system relies on guest honesty (prototype only)."

---

### 3. **Fish vs. Meat vs. Vegetarian: Missing Definitions**

**What's ambiguous:**
- No explicit definition of what makes a meal "meat" vs. "fish"
- Implied that fish ≠ meat, but this isn't stated
- No indication if meals can have multiple categories (e.g., "surf and turf")

**Why problematic:**
- How does the system categorize meals? Is there a `category` field?
- Can a meal be tagged as both meat AND fish?
- The meal data structure (lines 86-91) shows vegetarian/vegan booleans but no meat/fish indicators

**Suggested clarification:**
Add to meal data structure:
```json
{
  "category": "meat" | "fish" | "vegetarian", // mutually exclusive
  "vegetarian": boolean,
  "vegan": boolean
}
```
And state: "Each meal has exactly one category: meat, fish, or vegetarian. Fish meals are not considered meat."

---

### 4. **When Does Voting Reset?**

**What's ambiguous:**
- Line 21: "cleared...for the next round of voting, open on the following week"
- No specification of WHO triggers this or WHEN exactly it happens

**Why problematic:**
- Does it auto-reset on a schedule (Sunday midnight)?
- Does the restaurant manually trigger it after selecting the meal plan?
- Does the system admin trigger it?
- What if guests try to vote during reset?

**Suggested clarification:**
"After the restaurant confirms the weekly meal plan, the system admin must click 'Start New Week' which:
1. Archives current week's data
2. Clears all guest votes
3. Clears weekly options
4. Opens the system for new restaurant selections"

---

### 5. **Meal Combinations Must Contain Vegetarian Option**

**What's ambiguous:**
- Line 11: "Every meal combination contains at least one vegetarian meal"
- But line 29: Restaurant selects "one meal combination with at least one meal containing meat"

**Why problematic:**
If EVERY combination must have a vegetarian option, then the "meat combination" also has a vegetarian alternative. This means:
- Is the purpose of combinations to always offer veg alternatives?
- Or can there be meat-only combinations?

**Suggested clarification:**
Either:
- "Every meal combination MUST contain at least one vegetarian option (to ensure all guests can vote on all categories)"
- OR: "Meal combinations may contain only vegetarian meals, or may mix categories"

---

### 6. **Missing: Week Definition and Timeline**

**What's ambiguous:**
- No definition of when a "week" starts/ends
- No specification of voting deadlines
- "Four meals per week" but "the fifth day...serves leftovers" - are there 4 or 5 days?

**Why problematic:**
- When can guests vote? Any time during the week?
- When must the restaurant select options?
- If the restaurant serves lunch Mon-Fri, and 4 days have menus (5th is leftovers), which 4 days?

**Suggested clarification:**
"The restaurant operates Monday through Friday. Meals are served Monday-Thursday with specific menus. Friday serves leftovers ('SEEMPHONIE'). 
- Weekend: System admin uploads database (if needed)
- Monday: Restaurant selects 4 meal combinations for the week
- Monday-Wednesday: Guests can vote
- Thursday: Voting closes, restaurant reviews results and confirms meal plan"

---

### 7. **Restaurant Selection vs. Final Meal Plan**

**What's ambiguous:**
- Line 29: "restaurant pre-selects weekly exactly four meal combinations"
- Line 19: "the restaurant chooses four meals for the week to make a final menu"
- Line 31: "system admin can obtain final voting results"

**Why problematic:**
The workflow is unclear:
1. Does restaurant select combinations first, THEN guests vote, THEN restaurant picks final meals?
2. Or does restaurant select combinations, guests vote, and the highest votes automatically win?
3. What is the system admin's role in "obtaining" results?

**Suggested clarification:**
"Workflow:
1. Restaurant selects 4 meal combinations for weekly voting
2. Guests vote on their preferred meals from these combinations
3. System aggregates votes and displays results to restaurant
4. Restaurant confirms the final meal plan (typically the most-voted meal from each combination, but can override)
5. System admin can export/view the final confirmed plan"

---

### 8. **Missing: Image File Requirements**

**What's ambiguous:**
- Line 89: "Image (path to a file) - string"
- Line 69: "`images/` - Folder containing meal images (named with meal ID and name)"

**Why problematic:**
- What image formats are supported? (JPG, PNG, SVG?)
- What happens if an image file is missing?
- What's the naming convention exactly? "ID_name.jpg" or "ID-name.png"?
- Are there size/dimension requirements?
- How are images uploaded - via JSON or separately?

**Suggested clarification:**
"Images must be:
- Format: JPEG or PNG
- Naming: `{meal_id}_{meal_name}.jpg` (e.g., `m001_burger.jpg`)
- Max size: 5MB
- Recommended dimensions: 800x600px
- Stored in: `images/` folder
- If missing: display placeholder image
- Upload: Separately from JSON (manual file copy for prototype)"

---

### 9. **Missing: Success Criteria for Voting**

**What's ambiguous:**
- Line 120: "Handle cases where insufficient votes are cast"
- No definition of "insufficient"

**Why problematic:**
- What's the minimum number of votes needed?
- What if only 1 person votes?
- What if no one votes for the fish option?
- Does the system need a quorum?

**Suggested clarification:**
"Minimum voting requirements:
- At least 1 vote must be cast for the week to be valid
- If any meal combination receives 0 votes, the restaurant must manually select a meal from that combination
- The system warns (but doesn't block) if total votes < 10"

---

### 10. **JSON Upload: Missing Validation Rules**

**What's ambiguous:**
- Lines 74-79 show basic JSON structure but no validation rules
- No example of actual meal/combination data

**Why problematic:**
- What fields are required vs. optional?
- What happens if JSON is malformed?
- What happens if combinations reference non-existent meal IDs?
- Can meals exist without being in any combination?

**Suggested clarification:**
Provide complete JSON schema example and state:
"JSON validation rules:
- All meal IDs must be unique
- All meals referenced in combinations must exist in meals array
- Each combination must contain 1-5 meals
- Required fields: [list them]
- On validation error: reject upload and display specific error message"

---

### 11. **Missing: Concurrent Access Handling**

**What's ambiguous:**
- No mention of what happens if multiple users access simultaneously

**Why problematic:**
- Can multiple guests vote at the same time?
- What if restaurant and admin both modify data?
- Database locking strategy?

**Suggested clarification:**
"Prototype limitations:
- No transaction locking (SQLite handles basic concurrency)
- If two guests vote simultaneously, both votes are recorded
- Restaurant and admin should not modify data concurrently (no enforcement in prototype)"

---

### 12. **Missing: Error Recovery**

**What's ambiguous:**
- Line 123: "Handle invalid or corrupted data gracefully" - but how?

**Why problematic:**
- What constitutes "graceful" handling?
- Should errors be logged?
- Should the system attempt auto-recovery?

**Suggested clarification:**
"Error handling approach:
- Display user-friendly error messages (never show stack traces)
- Log errors to console for debugging
- Invalid votes: reject and show specific error
- Database errors: show 'System error, please try again' and log details
- Corrupted data: system admin must re-upload clean database"

---

## Summary

The specification has good overall structure but needs clarification in:
1. **Core mechanics** (meals vs. combinations voting)
2. **Data constraints** (uniqueness, categories, validation)
3. **Timing and workflow** (when things happen, who triggers what)
4. **Error scenarios** (missing data, insufficient votes, conflicts)
5. **Technical details** (image formats, concurrent access, validation rules)

These ambiguities would likely cause multiple rounds of clarification during development and could lead to incorrect test implementations.
