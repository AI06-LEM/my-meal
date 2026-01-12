# my-meal Test Suite

This directory contains the Behavior-Driven Development (BDD) test suite for the my-meal application, using **Cucumber.js** with **Playwright** for browser automation.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Writing New Tests](#writing-new-tests)
5. [Best Practices](#best-practices)
6. [Debugging Failed Tests](#debugging-failed-tests)
7. [Available Test Profiles](#available-test-profiles)
8. [Understanding the Architecture](#understanding-the-architecture)

---

## Quick Start

### Prerequisites

1. Node.js v22.5.0 or higher
2. The application server running on port 3000

### Running Your First Test

```bash
# 1. Start the server (in one terminal)
npm start

# 2. Run all tests (in another terminal)
npm test

# 3. Or run just the smoke tests (quick sanity check)
npm run test:smoke
```

---

## Test Structure

```
tests/
├── features/                    # Gherkin feature files (test specifications)
│   ├── admin-upload.feature     # Admin database upload tests
│   ├── restaurant-selection.feature  # Restaurant weekly options tests
│   ├── guest-voting.feature     # Guest voting workflow tests
│   ├── meal-plan.feature        # Final meal plan creation tests
│   ├── system-reset.feature     # System reset functionality tests
│   ├── navigation.feature       # Tab navigation tests
│   └── end-to-end.feature       # Complete workflow tests
│
├── step-definitions/            # Step implementation code
│   ├── common.steps.js          # Generic reusable steps (Layer 1)
│   ├── admin.steps.js           # Admin-specific steps (Layer 3)
│   ├── restaurant.steps.js      # Restaurant-specific steps (Layer 3)
│   └── guest.steps.js           # Guest-specific steps (Layer 3)
│
├── pages/                       # Page Object Model classes
│   ├── BasePage.js              # Base class with common functionality
│   ├── AdminPage.js             # System Admin page object
│   ├── RestaurantPage.js        # Restaurant page object
│   └── GuestPage.js             # Guest voting page object
│
├── support/                     # Test infrastructure
│   ├── world.js                 # Playwright World configuration
│   └── hooks.js                 # Before/After hooks
│
├── reports/                     # Generated test reports (gitignored)
│   ├── cucumber-report.html     # HTML report
│   └── cucumber-report.json     # JSON report for CI
│
├── screenshots/                 # Failure screenshots (gitignored)
│
└── README.md                    # This file
```

---

## Running Tests

### Basic Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:smoke` | Run quick smoke tests |
| `npm run test:happy` | Run happy-path scenarios only |
| `npm run test:guest` | Run guest voting tests only |
| `npm run test:admin` | Run admin-related tests only |
| `npm run test:wip` | Run tests tagged @wip |
| `npm run test:debug` | Run with visible browser (for debugging) |

### Running Specific Tags

```bash
# Run tests with a specific tag
npm run test:tag -- @validation

# Run tests with multiple tags (AND)
npm run test:tag -- "@guest and @happy-path"

# Run tests with multiple tags (OR)
npm run test:tag -- "@guest or @admin"

# Exclude certain tags
npm run test:tag -- "not @slow"
```

### Running Specific Feature Files

```bash
# Run a specific feature file
npx cucumber-js tests/features/guest-voting.feature

# Run a specific scenario by line number
npx cucumber-js tests/features/guest-voting.feature:25
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | Application URL |
| `HEADLESS` | `true` | Set to `false` to see the browser |
| `SLOW_MO` | `0` | Milliseconds to slow down actions (for debugging) |

```bash
# Examples
BASE_URL=http://localhost:8080 npm test
HEADLESS=false npm test
SLOW_MO=500 npm run test:debug
```

---

## Writing New Tests

### Step 1: Write the Gherkin Scenario

Create or edit a `.feature` file in `tests/features/`:

```gherkin
@new-feature
Feature: My New Feature
  As a user
  I want to do something
  So that I get some benefit

  Scenario: A simple test case
    Given I am on the home page
    When I go to the "Guests" tab
    And I enter my name as "Test User"
    Then I should see "Guest Voting"
```

### Step 2: Check for Existing Steps

Many common steps already exist! Check `step-definitions/common.steps.js` first:

- `I go to the {string} tab`
- `I click the {string} button`
- `I type {string} into the {string} field`
- `I should see {string}`
- `I should not see {string}`
- And many more...

### Step 3: Create New Steps (if needed)

If you need a new step, add it to the appropriate file:

```javascript
// For generic/reusable steps → common.steps.js
When('I hover over {string}', async function(elementText) {
  await this.page.getByText(elementText).hover();
});

// For domain-specific steps → guest.steps.js / admin.steps.js / restaurant.steps.js
When('I select my favorite meal', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectMeatOption('Burger');
});
```

### Step 4: Run Your Test

```bash
# Run just your new test (using the tag)
npm run test:tag -- @new-feature
```

---

## Best Practices

### 1. Use Existing Steps When Possible

Check `common.steps.js` before writing new steps. The more we reuse, the less we maintain.

### 2. Use Semantic Selectors

Prefer selectors that reflect how users and screen readers interact:

```javascript
// ✅ Good - semantic selectors
await page.getByRole('button', { name: 'Submit Vote' }).click();
await page.getByLabel('Your Name').fill('Alice');
await page.getByText('Vote submitted').isVisible();

// ❌ Avoid - fragile selectors
await page.locator('.btn-primary').click();
await page.locator('#name-input').fill('Alice');
await page.locator('.message.success').isVisible();
```

### 3. Use Descriptive Scenario Names

```gherkin
# ✅ Good - describes the behavior
Scenario: Guest cannot vote twice with the same name

# ❌ Avoid - too vague
Scenario: Test duplicate
```

### 4. Use Tags Effectively

| Tag | Purpose |
|-----|---------|
| `@happy-path` | Core functionality, should always pass |
| `@validation` | Input validation / error handling |
| `@regression` | Tests for fixed bugs |
| `@wip` | Work in progress (not ready for CI) |
| `@slow` | Tests that take a long time |
| `@smoke` | Quick sanity checks |
| `@e2e` | End-to-end workflow tests |

### 5. Keep Scenarios Independent

Each scenario should:
- Set up its own preconditions (using Background or Given steps)
- Not depend on other scenarios running first
- Clean up after itself (handled by hooks)

### 6. Use Background for Common Setup

```gherkin
Feature: Guest Voting

  Background:
    Given the restaurant has selected weekly options
    And I am on the guests tab

  Scenario: Guest submits a valid vote
    # No need to repeat setup steps here
    When I enter my name as "Alice"
    ...
```

### 7. One Assertion per Then Step

Keep Then steps focused:

```gherkin
# ✅ Good - focused assertions
Then I should see a confirmation message
And my vote should be recorded
And the form should be cleared

# ❌ Avoid - too many things in one step
Then the vote should be submitted and form cleared and message shown
```

---

## Debugging Failed Tests

### 1. View the Screenshot

When a test fails, a screenshot is automatically saved to `tests/screenshots/`:

```
tests/screenshots/FAILED_Guest_submits_a_valid_vote_2024-01-15T10-30-00.png
```

### 2. Run with Visible Browser

```bash
npm run test:debug
```

This opens a visible browser window so you can watch the test run.

### 3. Slow Down the Test

```bash
SLOW_MO=1000 npm run test:debug
```

This adds a 1-second delay between each action.

### 4. Add Breakpoints with Playwright Inspector

```bash
PWDEBUG=1 npm test
```

This opens the Playwright Inspector where you can step through actions.

### 5. Use @wip Tag for Development

Tag your in-progress scenario:

```gherkin
@wip
Scenario: My new test
  ...
```

Then run only that test:

```bash
npm run test:wip
```

### 6. Check the HTML Report

After running tests, open `tests/reports/cucumber-report.html` in a browser to see detailed results.

---

## Available Test Profiles

Profiles are defined in `cucumber.js` at the project root:

| Profile | Command | Description |
|---------|---------|-------------|
| `default` | `npm test` | All tests, full reporting |
| `smoke` | `npm run test:smoke` | Quick sanity check (@smoke tag) |
| `happy` | `npm run test:happy` | Happy-path scenarios only |
| `guest` | `npm run test:guest` | Guest voting tests |
| `admin` | `npm run test:admin` | Admin-related tests |
| `wip` | `npm run test:wip` | Work-in-progress tests |
| `debug` | `npm run test:debug` | Visible browser, for debugging |
| `ci` | `npm run test:ci` | Optimized for CI/CD pipelines |

---

## Understanding the Architecture

### Three-Layer Step Definition Strategy

Following the recommendations in `planning/NL_TESTING_APPROACHES.md`, we use a layered approach:

#### Layer 1: Generic Reusable Steps (`common.steps.js`)

These work across all features using semantic selectors directly:

```gherkin
When I click the "Submit" button
And I type "Alice" into the "Name" field
Then I should see "Success"
```

#### Layer 2: Page Objects (`pages/*.js`)

Centralize selectors and page-specific logic:

```javascript
class GuestPage {
  async selectMeatOption(name) { ... }
  async submitVote() { ... }
}
```

#### Layer 3: Domain-Specific Steps (`guest.steps.js`, etc.)

Use Page Objects for complex domain logic:

```gherkin
When I select 2 vegetarian options
And I submit my vote
Then my vote should be recorded
```

### Why This Architecture?

| Benefit | How We Achieve It |
|---------|------------------|
| **Readable tests** | Gherkin feature files read like English |
| **Easy maintenance** | UI changes only affect Page Objects |
| **Reusability** | Generic steps work across all features |
| **Accessibility testing** | Semantic selectors verify a11y for free |
| **Student-friendly** | Clear separation of concerns |

---

## Quick Reference: Common Steps

### Navigation
```gherkin
Given I am on the home page
When I go to the "Guests" tab
When I refresh the page
```

### Buttons
```gherkin
When I click the "Submit Vote" button
Then the "Submit" button should be visible
Then the "Submit" button should be disabled
```

### Form Input
```gherkin
When I type "Alice" into the "Your Name" field
When I select "Burger" from the "Monday" dropdown
When I check the "Agree" checkbox
```

### Assertions
```gherkin
Then I should see "Vote submitted"
Then I should not see "Error"
Then I should see the heading "Guest Voting"
Then I should see an error message
Then I should see a success message
```

### Waiting
```gherkin
When I wait for the page to load
When I wait 2 seconds
```

---

## Troubleshooting

### "Server not running" Errors

Make sure the application is running:
```bash
npm start
```

### Tests Timeout

Increase the timeout in `cucumber.js` or add explicit waits:
```javascript
await this.page.waitForLoadState('networkidle');
```

### Element Not Found

1. Check if the element exists with Playwright Inspector (`PWDEBUG=1`)
2. Verify your selector matches the actual HTML
3. Add a wait for the element to appear

### Tests Pass Locally but Fail in CI

1. CI might be slower - add explicit waits
2. Check for race conditions
3. Make sure tests are independent

---

## Next Steps

1. Run `npm test` to verify everything works
2. Read through the feature files to understand test coverage
3. Try writing a new scenario using existing steps
4. Consult `planning/NL_TESTING_APPROACHES.md` for more context on the testing strategy
