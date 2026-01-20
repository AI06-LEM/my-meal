# my-meal Test Suite

This directory contains the Behavior-Driven Development (BDD) test suite for the my-meal application, using **Cucumber.js** with **Playwright** for browser automation.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Test Configuration](#test-configuration)
5. [Writing New Tests](#writing-new-tests)
6. [Best Practices](#best-practices)
7. [Debugging Failed Tests](#debugging-failed-tests)
8. [Available Test Profiles](#available-test-profiles)
9. [Understanding the Architecture](#understanding-the-architecture)

---

## Quick Start

### Prerequisites

1. Node.js v22.5.0 or higher
2. The application server running on port 3000

### Running Your First Test

Windows:
```powershell
# 1. Start the server (in one terminal)
npm.cmd start

# 2. Run all tests (in another terminal)
npm.cmd test

# 3. Or run just the smoke tests (quick sanity check)
npm.cmd run test:smoke
```

MacOS/Linux:
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
├── config.js                    # Centralized test configuration
│
├── features/                    # Gherkin feature files (test specifications) go here
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
| `npm run test:tag -- @tagname` | Run tests with specific tag |
| `npm run test:tagged_debug -- @tagname` | Run tagged tests with visible browser |

### Running Specific Tags

MacOS/Linux:
```bash
# Run tests with a specific tag
npm run test:tag -- @validation

# Run tests with a specific tag in DEBUG MODE (visible browser, slowed down)
npm run test:tagged_debug -- @e2e

# Run tests with multiple tags (AND)
npm run test:tag -- "@guest and @happy-path"

# Run tests with multiple tags (OR)
npm run test:tag -- "@guest or @admin"

# Exclude certain tags
npm run test:tag -- "not @slow"
```

**Debug Mode:** When using `test:tagged_debug`, tests automatically run with a visible browser and slow down by 500ms between actions for easier observation. This is the same behavior as `test:debug` but allows you to filter by tags.

### Running Specific Feature Files

MacOS/Linux:
```bash
# Run a specific feature file
npx cucumber-js tests/features/end-to-end.feature

# Run a specific scenario by line number
# Actually, it seemingly runs all tests in file from that line on?
npx cucumber-js tests/features/end-to-end.feature:21
```

**Important:** To run a single scenario, you **must** use `npx cucumber-js` directly with the file path. Using `npm test -- file:line` will not work as expected because the `cucumber.js` configuration's `paths` setting will cause all tests to run.

**Alternative (Recommended):** Use tags for running individual scenarios (see "Using Multiple Tags" below).


### Using Multiple Tags

You can add multiple tags to a single scenario for better organization and filtering:

```gherkin
# Option 1: On the same line (space-separated)
@happy-path @focus
Scenario: Restaurant can deselect a meal option
  ...

# Option 2: On separate lines (recommended for readability)
@selection
@focus
Scenario: Restaurant can deselect a meal option
  ...
```

**Workflow tip:** Add temporary tags like `@focus` or `@wip` to scenarios you're actively working on, then run just those:

MacOS/Linux:
```bash
npm run test:tag -- "@focus"
```

Remember to remove temporary tags before committing!

---

## Test Configuration

All test configuration settings are centralized in `tests/config.js`. This single file controls:

### Environment Variables

| Variable | Default | Description | Config Property |
|----------|---------|-------------|-----------------|
| `BASE_URL` | `http://localhost:3000` | Application URL | `config.BASE_URL` |
| `HEADLESS` | `true` | Set to `false` to see the browser | `config.HEADLESS` |
| `SLOW_MO` | `0` | Milliseconds to slow down actions (for debugging) | `config.SLOW_MO` |

### Test Data Paths

| Config Property | Default | Description |
|-----------------|---------|-------------|
| `TEST_DATABASE_PATH` | `meals_database_en_test.json` | Path to the test meal database |

### Browser Settings

| Config Property | Default | Description |
|-----------------|---------|-------------|
| `VIEWPORT` | `{ width: 1280, height: 720 }` | Browser viewport size |
| `DEFAULT_TIMEOUT` | `30000` | Default timeout in milliseconds |

### Test Directories

| Config Property | Default | Description |
|-----------------|---------|-------------|
| `SCREENSHOTS_DIR` | `tests/screenshots` | Directory for failure screenshots |
| `REPORTS_DIR` | `tests/reports` | Directory for test reports |

### Using the Configuration

In your step definitions or page objects, import the configuration:

```javascript
const config = require('../config');

// Use environment settings
console.log(`Testing against: ${config.BASE_URL}`);

// Use test data paths
await adminPage.uploadDatabase(config.TEST_DATABASE_PATH);

// Use browser settings
await this.page.setDefaultTimeout(config.DEFAULT_TIMEOUT);
```

### Overriding Configuration

Override settings via environment variables when running tests:

MacOS/Linux:
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

MacOS/Linux:
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

MacOS/Linux:
```bash
# Run all tests with visible browser
npm run test:debug

# Run specific tagged tests with visible browser
npm run test:tagged_debug -- @e2e
```

This opens a visible browser window so you can watch the test run.

### 3. Slow Down the Test

**Automatic slow-down:** When using `npm run test:debug` or `npm run test:tagged_debug` (visible browser), tests automatically slow down by 500ms between actions for easier observation.

**Custom slow-down:** To use a different speed:

MacOS/Linux:
```bash
# Override slow-mo for all tests
SLOW_MO=1000 npm run test:debug

# Override slow-mo for tagged tests
SLOW_MO=1000 npm run test:tagged_debug -- @e2e
```

This adds a 1-second delay between each action, overriding the default 500ms.

**Note:** Headless tests (without `:debug` or `:tagged_debug`) always run at full speed unless you explicitly set SLOW_MO.

### 4. Add Breakpoints with Playwright Inspector

MacOS/Linux:
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

MacOS/Linux:
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

MacOS/Linux:
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
