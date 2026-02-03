# Specification Analysis (January 2026)

This document analyzes `SPECIFICATION.md` for contradictions, ambiguities, and missing information, compares it against the earlier analysis in `SPECIFICATION_AMBIGUITIES.md`, and provides improvement recommendations.

---

## Table of Contents

1. [Current Specification Analysis](#1-current-specification-analysis)
   - [Contradictions](#contradictions)
   - [Ambiguities](#ambiguities)
   - [Missing Information](#missing-information)
2. [Resolution Status of Earlier Issues](#2-resolution-status-of-earlier-issues)
3. [Recommendations for Improvement](#3-recommendations-for-improvement)

---

## 1. Current Specification Analysis

### Contradictions

**No major contradictions found.** The current specification is internally consistent. The earlier contradiction about duplicate guest names (previously both "not double-checked" and "enforced by UNIQUE constraint") has been resolved.

### Ambiguities

#### A1. Meal Combination Size

**Location:** Line 54

**Issue:** "A meal combination is a set (or array) of meals" — but what is the expected size?

The context implies 2 meals (e.g., "burger" and "vegetarian burger"), but this is never explicitly stated. Can a combination have 1 meal? 3 meals? 10 meals?

**Impact:** Implementation and test data creation could vary significantly.

**Suggested fix:** Add: "A meal combination typically contains 1–3 meals representing the same dish in different dietary variations."

TA: Agreed

---

#### A2. `meal_plan` Table Purpose

**Location:** Line 183

**Issue:** The database structure lists a `meal_plan` table, but this is never referenced anywhere else in the specification. 

**Questions:**
- What data goes into this table?
- Who populates it?
- Is it even used in the prototype?

**Impact:** Developers may implement unused functionality or miss required functionality.

**Suggested fix:** Either remove from the spec or add a section explaining how/when the meal_plan table is populated and used.

TA: Move every discussion related to meal_plan to file FUTURE_IDEAS.md

---

#### A3. "Meals Feature is Redundant" Statement

**Location:** Line 199

**Issue:** "Note: the meals feature is meanwhile redundant, and this format will soon be simplified."

This is confusing. The JSON format shows both `meals` and `meal_combinations` arrays:
- Are meals embedded directly in combinations?
- Is the separate `meals` array deprecated?
- What should the system do with the `meals` array?

**Impact:** Uncertainty about data model direction.

**Suggested fix:** Either clarify what "redundant" means or remove this statement until the simplification is complete.

TA: TODO

---

#### A4. Voting Result Display for Zero Votes

**Location:** Lines 114–120

**Issue:** The specification describes bar charts with numeric labels but doesn't specify:
- How are meal combinations with zero votes displayed?
- How are ties handled in the visualization?
- Is there any ranking or sorting of results?

**Impact:** Inconsistent UI implementations.

**Suggested fix:** Add: "All voted-on meal combinations are displayed, including those with zero votes. Results are sorted by vote count (descending) within each category."

TA: Agreed

---

#### A5. Error Message Content

**Location:** Lines 99, 111

**Issue:** "displays an error message" — but what should the message say?

For example, if a guest selects only 1 vegetarian option instead of 2, what exact message appears?

**Impact:** Inconsistent error handling and testing difficulties.

**Suggested fix:** Add example error messages:
- "Please select exactly 2 vegetarian options (currently selected: 1)"
- "Weekly options must include at least 2 meat combinations"

TA: Error message text can be decided by AI model.

---

#### A6. ID Generation

**Location:** Lines 208, 217

**Issue:** "A unique ID: string (added automatically during JSON file upload)"

But the JSON format example (lines 192–197) doesn't show IDs. Are they:
- Auto-generated UUIDs?
- Sequential integers?
- Based on meal/combination names?

**Impact:** Unclear data model and potential ID conflicts.

**Suggested fix:** Specify the ID format, e.g., "IDs are auto-generated as `meal_[index]` and `combo_[index]` during upload, or use UUIDs."

TA: Clarify

---

#### A7. TODO in Specification

**Location:** Lines 220, 248

**Issue:** The specification contains unresolved TODOs:
- "TODO: Do we really need a name for a meal combination?"
- "TODO: Check regression tests cover all the clauses below."

**Impact:** Indicates the specification itself is incomplete.

**Suggested fix:** Resolve or remove TODOs before using as AI instructions.

---

### Missing Information

#### M1. Concurrent Access Handling

**Issue:** No specification of what happens when multiple users access the system simultaneously.

**Questions:**
- Can multiple guests vote at the same time?
- What if the restaurant and admin modify data concurrently?
- Is there any locking or conflict resolution?

**Suggested addition:**
```markdown
### Concurrency (Prototype)
- SQLite handles basic read/write concurrency
- Simultaneous guest votes are both recorded (no conflict)
- Restaurant and admin should avoid concurrent modifications (not enforced)
```

---

#### M2. Empty/Missing Database Behavior

**Issue:** No specification of system behavior when:
- The database file doesn't exist
- The database exists but has no data
- Weekly options haven't been selected yet

**Questions:**
- What do guests see if no weekly options are set?
- What message appears on the restaurant tab if no meals are uploaded?

**Suggested addition:** Describe empty states for each tab.

---

#### M3. Browser Compatibility

**Issue:** No specification of supported browsers.

**Questions:**
- Modern browsers only?
- Mobile responsive?
- Offline capability?

**Suggested addition:** "Prototype targets modern browsers (Chrome, Firefox, Safari, Edge) on desktop. Mobile responsiveness is not required for MVP."

---

#### M4. File Size and Data Limits

**Issue:** No specification of limits for:
- JSON file upload size
- Maximum number of meals/combinations
- Maximum number of guests/votes

**Impact:** Could cause performance issues or unexpected failures at scale.

**Suggested addition:** Specify reasonable prototype limits or explicitly state "no limits for prototype."

---

#### M5. Port Configuration

**Issue:** The specification doesn't mention which port the server runs on. The `.cursorrules` references port 3000, but this should be in the main specification.

**Suggested addition:** "The development server runs on `http://localhost:3000`."

---

## 2. Resolution Status of Earlier Issues

Comparison with `planning/SPECIFICATION_AMBIGUITIES.md`:

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Voting Unit: Meals vs. Meal Combinations | ✅ **RESOLVED** | Lines 54–58 and 104–111 now clearly explain that guests vote on meal combinations, not individual meals. |
| 2 | Duplicate Guest Names | ✅ **RESOLVED** | Line 127 now explicitly states names "must be unique, and the system validates their uniqueness." |
| 3 | Fish vs. Meat vs. Vegetarian Definitions | ✅ **RESOLVED** | Lines 34–49 define categories. Line 212 confirms "Each meal has exactly one category." |
| 4 | When Does Voting Reset? | ✅ **RESOLVED** | Lines 75–87 now explain three reset scenarios: manual reset, JSON upload reset, and restaurant save reset. |
| 5 | Meal Combinations Must Contain Vegetarian | ✅ **RESOLVED** | Lines 60–73 clearly define meat/fish/vegetarian combinations and the vegetarian requirement. |
| 6 | Week Definition and Timeline | ✅ **RESOLVED** | Lines 75–79 explain manual scheduling. Four days are served (fifth is leftovers). |
| 7 | Restaurant Selection vs. Final Meal Plan | ✅ **RESOLVED** | Lines 114–120 clarify that voting results inform the restaurant's manual decision. |
| 8 | Image File Requirements | ✅ **REMOVED** | Images are no longer part of the specification—apparently descoped from MVP. |
| 9 | Success Criteria for Voting | ⚠️ **PARTIAL** | No minimum vote requirements specified. This may be intentional (prototype accepts any number of votes). |
| 10 | JSON Upload Validation Rules | ⚠️ **PARTIAL** | Line 60–61 mentions vegetarian validation. Lines 235–236 list some validations. Still missing: complete field requirements, error message examples. |
| 11 | Concurrent Access Handling | ❌ **NOT RESOLVED** | Still not addressed. See [M1](#m1-concurrent-access-handling). |
| 12 | Error Recovery | ⚠️ **PARTIAL** | Line 238 mentions crash recovery briefly. Could use more detail on error handling strategy. |

**Summary:** 8 of 12 issues fully resolved, 3 partially resolved, 1 not resolved.

---

## Conclusion

The specification has improved significantly since the earlier analysis. Most critical ambiguities have been resolved, particularly around:
- The distinction between meals and meal combinations
- Guest name uniqueness enforcement  
- Reset timing and triggers
- Category definitions

The remaining issues are mostly about **detail and precision** rather than fundamental contradictions. For AI instruction purposes, the main improvements needed are:
1. Structured acceptance criteria instead of prose
2. Complete data structure definitions in one place
3. Explicit empty-state behaviors
4. Resolution of remaining TODOs
