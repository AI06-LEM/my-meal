# Natural Language-Based Testing Approaches for my-meal

This document explores testing strategies that leverage natural language specifications (like `SPECIFICATION.md` and `BUGS.md`) to generate, execute, and maintain regression tests. It is written with our student development team in mind—prioritizing accessibility, observable behavior testing, and integration with AI-assisted development workflows.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Question 1: Existing Tools and Practices](#question-1-existing-tools-and-practices)
3. [Question 2: Balancing Efficiency and Automatic Updates](#question-2-balancing-efficiency-and-automatic-updates)
4. [Question 3: Detecting Ambiguities in Specifications](#question-3-detecting-ambiguities-in-specifications)
5. [Recommended Approach for my-meal](#recommended-approach-for-my-meal)
6. [Practical Next Steps](#practical-next-steps)

---

## Executive Summary

There are several established approaches for translating natural language specifications into executable tests:

| Approach | Accessibility | Maintenance | Token Efficiency | Best For |
|----------|--------------|-------------|------------------|----------|
| **BDD with Cucumber/Gherkin** | ⭐⭐⭐⭐⭐ High | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent | Teams writing structured English specs |
| **AI-Generated Playwright Tests** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good | One-time generation from docs |
| **Direct AI Agent Testing (Browser MCP)** | ⭐⭐⭐⭐⭐ High | ⭐⭐ Low | ⭐⭐ Poor | Ad-hoc exploratory testing |
| **Gauge (Markdown specs)** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent | Teams already using Markdown |

**Our recommendation for my-meal:** A hybrid approach combining:
1. **Cucumber.js with Gherkin** for structured, maintainable feature tests
2. **AI-assisted test generation** triggered by specification changes
3. **Browser MCP tools** for exploratory testing and verification during development

---

## Question 1: Existing Tools and Practices

### 1.1 Behavior-Driven Development (BDD) — The Industry Standard

**Cucumber** with **Gherkin** syntax is the most established approach for writing tests in natural language. It's been used in the industry for over 15 years and has excellent JavaScript/Node.js support.

**How it works:**
- Write specifications in a structured English format (Given/When/Then)
- These "feature files" serve as both documentation AND executable tests
- Step definitions translate the English into actual test code

**Example for my-meal (from SPECIFICATION.md):**

```gherkin
Feature: Guest Voting
  Guests can vote for their preferred meals

  Background:
    Given the system admin has uploaded a meal database
    And the restaurant has selected weekly options

  Scenario: Guest submits a valid vote
    Given I am on the guest tab
    When I enter my name as "Alice"
    And I select 1 meat option
    And I select 1 fish option  
    And I select 2 vegetarian options
    And I submit my vote
    Then I should see a confirmation message
    And my vote should be recorded in the system

  Scenario: Guest cannot vote twice with the same name
    Given "Bob" has already voted
    When I try to vote again as "Bob"
    Then I should see an error message about duplicate voting
```

**Why this works well for student teams:**
- ✅ Tests read like plain English
- ✅ Non-programmers can write and review tests
- ✅ The Gherkin syntax provides just enough structure to avoid ambiguity
- ✅ Tests double as living documentation
- ✅ Extensive tooling and tutorials available

**JavaScript ecosystem tools:**
- **Cucumber.js**: https://cucumber.io/docs/installation/javascript/
- **Playwright + Cucumber**: Can be combined for browser testing
- **Cypress + Cucumber**: Via `@badeball/cypress-cucumber-preprocessor`

### 1.2 Gauge — Markdown-Based Testing (ThoughtWorks)

**Gauge** is particularly interesting for my-meal because it uses **Markdown** for specifications—very similar to our existing `SPECIFICATION.md` format.

**How it works:**
- Write specifications in Markdown with special "step" syntax
- Steps are linked to JavaScript/TypeScript implementations
- Supports tags for organizing tests by feature or priority

**Example:**

```markdown
# Guest Voting Workflow

## A guest can submit a valid vote

* Open the guest tab
* Enter name "Alice"
* Select one meat option from available choices
* Select one fish option from available choices
* Select two vegetarian options from available choices
* Submit the vote
* Verify confirmation message is displayed
```

**Why consider Gauge:**
- ✅ Uses Markdown (familiar format)
- ✅ Less rigid than Gherkin syntax
- ✅ Good for teams transitioning from pure documentation
- ⚠️ Smaller community than Cucumber
- ⚠️ JavaScript support exists but TypeScript is primary

**Website:** https://gauge.org/

### 1.3 AI-Powered Test Generation Tools

Several newer tools use AI/LLMs to generate tests from specifications:

| Tool | Type | Accessibility | Notes |
|------|------|---------------|-------|
| **Playwright Codegen** | Recording-based | ⭐⭐⭐⭐⭐ Very High | Records browser interactions, AI can refine |
| **LambdaTest KaneAI** | AI agent | ⭐⭐⭐⭐ High | Natural language → test scripts (commercial) |
| **CiRA** | Open source Python | ⭐⭐⭐ Medium | Generates test case descriptions from requirements |
| **UMTG** | Academic/Research | ⭐⭐ Lower | Use case → test cases, more formal |

**LambdaTest KaneAI** is particularly notable—it's a commercial tool that:
- Accepts natural language descriptions ("Test that a guest can vote")
- Generates executable test scripts
- Supports multiple browsers and platforms
- Has a free tier for exploration

**CiRA** (Conditional Requirements Analyzer) is an open-source Python tool that:
- Analyzes conditional natural language requirements
- Generates minimal test case descriptions for full coverage
- Good for understanding what SHOULD be tested, even if not generating executable code
- Repository: https://github.com/Sousa99/cira

### 1.4 Direct AI Agent Testing (Browser MCP in Cursor)

The Browser MCP tools available in Cursor allow an AI model to directly interact with a web application—navigating, clicking, typing, and verifying results.

**How it works for testing:**
1. Start the application (`npm start`)
2. Give the AI instructions based on SPECIFICATION.md
3. AI uses Browser MCP to execute the test
4. AI reports pass/fail and any issues found

**Example prompt:**
```
Using the browser tools, test the guest voting workflow described in 
SPECIFICATION.md. Navigate to http://localhost:3000, go to the guest 
tab, and verify that a guest can submit a vote for 1 meat, 1 fish, 
and 2 vegetarian options.
```

**Pros:**
- ✅ Zero test code to write or maintain
- ✅ Uses specifications directly as prompts
- ✅ Great for exploratory testing
- ✅ Adapts automatically to UI changes

**Cons:**
- ⚠️ Consumes tokens for every test run (expensive at scale)
- ⚠️ Non-deterministic (AI might interact differently each time)
- ⚠️ Slower than traditional automated tests
- ⚠️ No persistent test artifacts for CI/CD

**Best use:** Exploratory testing during development, verifying fixes, and one-off validation—NOT for regular regression suites.

---

## Question 2: Balancing Efficiency and Automatic Updates

The core challenge is:
- **Efficiency:** Traditional integration tests (Playwright, Cypress) run fast and cheap
- **Flexibility:** AI-based tests adapt to changes but consume tokens
- **Maintenance:** Tests should update when specifications change

### 2.1 Recommended Hybrid Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPECIFICATION CHANGES                         │
│   (SPECIFICATION.md, BUGS.md updated via git commit)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              AI-ASSISTED TEST GENERATION (one-time)              │
│   • Cursor/Claude reviews changes                                │
│   • Generates/updates Cucumber feature files                     │
│   • Generates/updates Playwright step definitions                │
│   • Human reviews and commits generated tests                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               TRADITIONAL TEST EXECUTION (fast, cheap)           │
│   • npm test runs Playwright + Cucumber                          │
│   • Sub-second execution per test                                │
│   • Can run in CI/CD on every commit                            │
│   • Zero token cost                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               AI EXPLORATORY VERIFICATION (occasional)           │
│   • After major changes, use Browser MCP for validation         │
│   • Catches issues automated tests might miss                   │
│   • Token cost, but infrequent                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Triggering Test Updates from Spec Changes

**Option A: Manual AI-Assisted Regeneration**
When `SPECIFICATION.md` or `BUGS.md` changes:
1. Create a git commit with the documentation changes
2. Ask Cursor/Claude: "Based on the changes in this commit to SPECIFICATION.md, update the Cucumber feature files in `tests/features/`"
3. Review and commit the generated test changes

This is practical for student teams because:
- No complex automation setup required
- Human review catches AI mistakes
- Builds understanding of the test code

**Option B: Semi-Automated with Git Hooks**
Set up a simple script that:
1. Detects changes to `*.md` specification files
2. Prompts the developer to regenerate affected tests
3. Optionally runs the AI generation automatically

Example `.git/hooks/post-commit` (simplified):
```bash
#!/bin/bash
if git diff-tree --no-commit-id --name-only -r HEAD | grep -E "(SPECIFICATION|BUGS)\.md$"; then
  echo "📋 Specification files changed!"
  echo "Consider regenerating tests: npm run generate-tests"
fi
```

**Option C: AI-Powered Diff Analysis**
A more sophisticated approach:
1. On each spec change, AI analyzes the diff
2. AI identifies which existing tests are affected
3. AI proposes updates only to affected tests
4. Human approves changes

This minimizes both manual work and unnecessary regeneration.

### 2.3 Token Efficiency Strategies

| Strategy | Token Savings | Implementation Effort |
|----------|--------------|----------------------|
| Generate tests once, run traditionally | 95%+ | Low |
| Cache AI responses for unchanged specs | 60-80% | Medium |
| Incremental updates (diff-based) | 70-90% | Medium |
| Use smaller models for test generation | 50-70% | Low |

**Key insight:** The tokens are spent on *generating* tests, not running them. Once generated, Playwright/Cucumber tests cost nothing to execute repeatedly.

---

## Question 3: Detecting Ambiguities in Specifications

Ambiguous specifications cause problems for both:
- AI models implementing features (they guess wrong)
- AI models generating tests (they test the wrong thing)

### 3.1 Automated Ambiguity Detection Tools

| Tool | Type | Accessibility | Focus |
|------|------|---------------|-------|
| **AmbiDetect** | Research prototype | ⭐⭐ Low | Machine learning on requirements text |
| **VIBE** | Research tool | ⭐⭐ Low | Variability indicators in requirements |
| **CiRA** | Open source | ⭐⭐⭐ Medium | Conditional requirements analysis |
| **AI/LLM Review** | Prompt-based | ⭐⭐⭐⭐⭐ High | Ask Claude/GPT to review specs |

### 3.2 Practical AI-Based Ambiguity Review

The most accessible approach for student teams: **ask the AI to review specifications**.

**Example prompt for Cursor/Claude:**

```
Review SPECIFICATION.md for potential ambiguities or missing details. 
For each issue found, explain:
1. What is ambiguous or unclear
2. Why this could cause problems for implementation or testing
3. Suggested clarification

Focus on:
- Vague terms without clear definitions
- Missing edge cases or error handling
- Implicit assumptions not stated explicitly
- Conflicting statements
- Missing success/failure criteria
```

**Example issues the AI might find in my-meal's SPECIFICATION.md:**

| Issue | Current Text | Problem | Suggested Clarification |
|-------|-------------|---------|------------------------|
| Vague timing | "open on the following week" | Which day? Monday? | "Voting opens Monday at 00:00" |
| Undefined behavior | "insufficient votes" | How many is insufficient? | "If fewer than 3 guests vote..." |
| Implicit assumption | "unique name" | Case-sensitive? Whitespace? | "Names are case-insensitive, trimmed" |
| Missing error case | Meal plan generation | What if tie votes? | "In case of tie, prefer alphabetical" |

### 3.3 Specification Quality Checklist

A simple checklist students can use when writing specifications:

**Clarity Checks:**
- [ ] Are all key terms defined? (e.g., what exactly is a "meal combination"?)
- [ ] Are quantities explicit? (not "some" or "few", but "exactly 4")
- [ ] Are triggers clear? (what causes this to happen?)
- [ ] Are success criteria defined? (how do we know it worked?)

**Completeness Checks:**
- [ ] What happens if the user makes a mistake?
- [ ] What happens if data is missing or invalid?
- [ ] What happens if two users act simultaneously?
- [ ] Are there any time-based behaviors? (deadlines, timeouts)

**Consistency Checks:**
- [ ] Does this contradict anything else in the spec?
- [ ] Are the same terms used consistently?
- [ ] Do all referenced items exist in the system?

### 3.4 Two-Way Specification Validation

A powerful practice: after AI generates code from specs, ask it to regenerate specs from the code. Differences reveal ambiguities.

```
1. AI reads SPECIFICATION.md → generates code
2. AI reads generated code → writes "inferred specification"  
3. Compare original spec with inferred spec
4. Differences = potential ambiguities or missing details
```

---

## Recommended Approach for my-meal

Given the student development context, here's a phased approach:

### Phase 1: Quick Win with Browser MCP (Now)

Use Cursor's Browser MCP tools for immediate testing:

1. Start the server: `npm start`
2. Ask Cursor to test scenarios from SPECIFICATION.md
3. Document any issues found
4. Use this for bug verification after fixes

**Cost:** Tokens only, no setup required
**Benefit:** Immediate testing capability, catches regressions during development

### Phase 2: Cucumber.js for Core Workflows (Short-term)

Set up Cucumber with Playwright for the main user journeys:

**File structure:**
```
tests/
├── features/
│   ├── admin-upload.feature     # Gherkin specs
│   ├── restaurant-selection.feature
│   └── guest-voting.feature
├── step-definitions/
│   ├── admin.steps.js           # Playwright automation
│   ├── restaurant.steps.js
│   └── guest.steps.js
└── support/
    └── world.js                  # Shared Playwright setup
```

**Why Cucumber for students:**
- Feature files look like English (accessible)
- Strong separation between "what" (features) and "how" (steps)
- Extensive documentation and tutorials
- Industry-standard skill to learn

### Phase 3: AI-Assisted Test Generation (Medium-term)

Once Phase 2 is established:

1. Create a prompt template for test generation
2. When SPECIFICATION.md changes, run the prompt
3. AI generates/updates Cucumber feature files
4. Human reviews and commits

**Example workflow:**
```bash
# After updating SPECIFICATION.md
git add SPECIFICATION.md
git commit -m "Spec: Added tie-breaking rules for votes"

# Ask AI to update tests
cursor "Based on the latest changes to SPECIFICATION.md, 
        update tests/features/guest-voting.feature to cover 
        the new tie-breaking rules"

# Review, then commit
git add tests/features/guest-voting.feature
git commit -m "Test: Added tie-breaking scenarios"
```

### Phase 4: Specification Quality Gates (Longer-term)

Add a pre-commit check that reviews specification changes:

```bash
# In CI or as a git hook
cursor "Review the changes to SPECIFICATION.md in this commit 
        for ambiguities. List any issues that should be 
        clarified before merging."
```

---

## Practical Next Steps

### Immediate Actions (This Week)

1. **Try Browser MCP Testing**
   - Start the app with `npm start`
   - Use Cursor to test one workflow from SPECIFICATION.md
   - Note any issues or gaps discovered

2. **Review Existing Documentation**
   - Ask AI to review SPECIFICATION.md for ambiguities
   - Add clarifications to the document
   - Consider adding a "Definitions" section

### Short-term Setup (Next 2 Weeks)

3. **Install Cucumber + Playwright**
   ```bash
   npm install --save-dev @cucumber/cucumber playwright @playwright/test
   npx playwright install
   ```

4. **Create First Feature File**
   - Start with the guest voting workflow
   - Write 2-3 scenarios based on SPECIFICATION.md
   - Have AI help generate step definitions

5. **Add Test Script**
   ```json
   // package.json
   "scripts": {
     "test:features": "cucumber-js tests/features"
   }
   ```

### Medium-term Goals (Next Month)

6. **Cover Core Workflows**
   - Admin database upload
   - Restaurant meal selection
   - Guest voting
   - Meal plan generation

7. **Document the Process**
   - Add instructions to README.md
   - Create template for new feature files

8. **Integrate with Development Flow**
   - Run tests before merging changes
   - Use Browser MCP for exploratory testing of new features

---

## Tool Reference

| Tool | URL | Purpose |
|------|-----|---------|
| Cucumber.js | https://cucumber.io/docs/installation/javascript/ | BDD test framework |
| Playwright | https://playwright.dev/ | Browser automation |
| Gauge | https://gauge.org/ | Markdown-based testing (alternative to Cucumber) |
| CiRA | https://github.com/Sousa99/cira | Requirements analysis |
| LambdaTest KaneAI | https://www.lambdatest.com/kane-ai | Commercial AI testing |
| Cursor Browser MCP | Built into Cursor | AI-driven browser testing |

---

## Appendix: Sample Cucumber Feature for my-meal

Here's a complete example based on SPECIFICATION.md:

```gherkin
# tests/features/guest-voting.feature

Feature: Guest Voting
  As a restaurant guest
  I want to vote for my preferred meals
  So that my preferences influence the weekly meal plan

  Background:
    Given the meal database has been uploaded
    And the restaurant has selected weekly options with:
      | category    | count |
      | meat        | 3     |
      | fish        | 3     |
      | vegetarian  | 4     |

  @happy-path
  Scenario: Guest submits a valid vote
    Given I am on the guests tab
    When I enter my name as "Test Student"
    And I select 1 meat option
    And I select 1 fish option
    And I select 2 different vegetarian options
    And I click "Submit Vote"
    Then I should see "Vote submitted successfully"
    And my vote should be recorded

  @validation  
  Scenario: Guest cannot submit incomplete vote
    Given I am on the guests tab
    When I enter my name as "Incomplete Voter"
    And I select only 1 vegetarian option
    And I click "Submit Vote"
    Then I should see an error about selecting 2 vegetarian options
    And no vote should be recorded

  @duplicate-prevention
  Scenario: Same guest cannot vote twice
    Given "Alice" has already submitted a vote
    When I try to vote again as "Alice"
    Then I should see an error about duplicate voting
    And only one vote for "Alice" should exist

  @bug-fix @BUGS-line-6
  Scenario: Selecting two valid vegetarian options works correctly
    # Regression test for: "Please select two different vegetarian options" error
    Given I am on the guests tab
    When I enter my name as "Veggie Voter"
    And I select vegetarian option "Mushroom Risotto"
    And I select vegetarian option "Vegetable Lasagna"
    And I select 1 meat option
    And I select 1 fish option
    And I click "Submit Vote"
    Then I should NOT see the error "Please select two different vegetarian options"
    And I should see "Vote submitted successfully"
```

This file:
- Is readable by non-programmers
- Maps directly to SPECIFICATION.md requirements
- Includes a regression test for a bug from BUGS.md
- Uses tags for organization (@happy-path, @bug-fix)
- Can be run by Cucumber.js with Playwright step definitions

