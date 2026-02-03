# Specification Analysis (January 2026)

## 3. Recommendations for Improvement

### For Clarity When Instructing an AI Coding Model


#### R2. Add Explicit State Descriptions

AI models benefit from clear state descriptions. Add a section like:

```markdown
### System States

1. **Empty State**: No meal database uploaded
   - Admin tab: Shows upload form only
   - Restaurant tab: Shows "Please upload a meal database first"
   - Guest tab: Shows "Voting is not yet available"

2. **Database Loaded, No Options Selected**
   - Admin tab: Shows upload form and empty chart
   - Restaurant tab: Shows meal selection form
   - Guest tab: Shows "The restaurant has not selected options yet"

3. **Options Selected, No Votes**
   - Admin tab: Shows empty chart
   - Restaurant tab: Shows selected options
   - Guest tab: Shows voting form

4. **Active Voting**
   - All tabs show current state, chart updates with each vote
```

---

#### R3. Add Acceptance Criteria for Each Feature

Convert prose to structured acceptance criteria:

**Current (line 60–61):**
> Every meal combination must contain at least one vegetarian meal...a warning should be shown

**Better:**
```markdown
### Acceptance Criteria: Meal Combination Validation

**Given** a system admin uploads a JSON file
**When** a meal combination contains no vegetarian meal
**Then** the system displays warning: "Combination '[name]' has no vegetarian option"
**And** the upload still proceeds (warning, not error)
```

---

#### R4. Consolidate Data Structure Information

The specification has data structure information scattered across multiple sections (lines 32–73, 170–228). Consolidate into one authoritative section with complete field definitions:

```markdown
### Data Structures (Complete Reference)

#### Meal
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto-generated | Unique identifier (format: UUID) |
| name | string | yes | Display name |
| category | enum | yes | One of: "meat", "fish", "vegetarian" |
| vegan | boolean | yes | Whether meal is vegan |

#### Meal Combination
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | auto-generated | Unique identifier |
| name | string | yes | Display name |
| meals | array | yes | Array of meal objects (1–3 items) |
```

---

#### R5. Add Explicit Validation Rules Section

Create a dedicated section for all validations:

```markdown
### Validation Rules

#### JSON Upload Validation
1. JSON must be valid and parseable
2. Must contain `meal_combinations` array (non-empty)
3. Each meal must have: name (string), category (enum), vegan (boolean)
4. Each combination must have at least one meal
5. Each combination must have at least one vegetarian meal (warning if violated)

#### Restaurant Selection Validation
1. Must select at least 2 meat combinations
2. Must select at least 2 fish combinations  
3. Must select exactly 4 vegetarian combinations
4. Error message format: "[Requirement] - you have selected [count]"

#### Guest Vote Validation
1. Guest name required and must be unique (case-insensitive)
2. Must select exactly 1 meat combination
3. Must select exactly 1 fish combination
4. Must select exactly 2 vegetarian combinations
5. Error message format: "[Requirement] - you have selected [count]"
```

---

#### R6. Add a Workflow Diagram or Step List

A clear numbered workflow helps AI understand the sequence:

```markdown
### Workflow Steps

1. **System Admin: Upload Database**
   - Input: JSON file
   - Effect: Resets all data, loads meals/combinations
   - UI Feedback: Success message or validation errors

2. **Restaurant: Select Weekly Options**
   - Prerequisite: Database uploaded
   - Input: Select meal combinations (2+ meat, 2+ fish, 4 vegetarian)
   - Effect: Clears previous votes, stores selections
   - UI Feedback: Warning about vote deletion, then success

3. **Guests: Cast Votes**
   - Prerequisite: Weekly options selected
   - Input: Name + selections (1 meat, 1 fish, 2 vegetarian)
   - Effect: Vote stored in database
   - UI Feedback: Confirmation or duplicate name error

4. **All Users: View Results**
   - Display: Bar chart grouped by category
   - Updates: Real-time after each vote

5. **System Admin: Reset for New Week**
   - Effect: Clears weekly options and votes, keeps database
   - UI Feedback: Confirmation
```

---

#### R7. Specify Error Handling Strategy

```markdown
### Error Handling

- **User Errors**: Show inline error messages near the relevant form field
- **Validation Errors**: Prevent form submission until fixed
- **System Errors**: Display "An error occurred. Please try again." and log to console
- **Database Errors**: On startup failure, create fresh database
```

---

## Conclusion

The remaining issues are mostly about **detail and precision** rather than fundamental contradictions. For AI instruction purposes, the main improvements needed are:
1. Structured acceptance criteria instead of prose
2. Complete data structure definitions in one place
3. Explicit empty-state behaviors
4. Resolution of remaining TODOs
