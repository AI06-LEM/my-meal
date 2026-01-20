# BDD Testing Best Practices Guide

This guide provides detailed best practices for writing and maintaining tests in the my-meal project using Cucumber.js and Playwright.

---

## Table of Contents

1. [Writing Good Gherkin](#writing-good-gherkin)
2. [Selector Strategy](#selector-strategy)
3. [Step Definition Guidelines](#step-definition-guidelines)
4. [Page Object Model](#page-object-model)
5. [Test Organization](#test-organization)
6. [Handling Asynchronous Operations](#handling-asynchronous-operations)
7. [Error Handling and Assertions](#error-handling-and-assertions)
8. [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)

---

## Writing Good Gherkin

### Use Declarative Style (What, Not How)

```gherkin
# ✅ Good - describes the intent
Scenario: Guest submits a valid vote
  Given I have entered my voting preferences
  When I submit my vote
  Then my vote should be recorded

# ❌ Avoid - too implementation-focused
Scenario: Guest submits a valid vote
  Given I click the name input field
  And I type "Alice" using keyboard
  And I move mouse to meat checkbox
  And I click the checkbox
  ...
```

### Use Consistent Language

Define a project vocabulary and stick to it:

| Preferred Term | Avoid |
|---------------|-------|
| "submit my vote" | "click submit", "press button" |
| "enter my name as" | "type name", "fill name field" |
| "select meat option" | "check meat checkbox", "click meat" |

### Background vs. Given in Scenarios

Use **Background** for steps that apply to ALL scenarios in a feature:

```gherkin
# ✅ Good - Background for common setup
Background:
  Given the meal database has been uploaded
  And the restaurant has selected weekly options
  And I am on the guests tab

Scenario: Guest submits valid vote
  When I enter my name as "Alice"
  ...

Scenario: Guest cannot submit without name
  When I select 1 meat option
  ...
```

Use **Given** in the scenario for setup specific to that scenario:

```gherkin
Scenario: Same guest cannot vote twice
  Given "Alice" has already voted    # Specific to this scenario
  When I try to vote again as "Alice"
  Then I should see an error
```

### Scenario Outline for Data-Driven Tests

Use Scenario Outline when testing similar logic with different data:

```gherkin
Scenario Outline: Validation messages for missing selections
  Given I am on the guests tab
  When I enter my name as "<name>"
  And I select <meat> meat option
  And I select <fish> fish option
  And I select <veg> vegetarian options
  And I submit my vote
  Then I should see an error message containing "<error>"

  Examples:
    | name  | meat | fish | veg | error       |
    | Test1 | 0    | 1    | 2   | meat        |
    | Test2 | 1    | 0    | 2   | fish        |
    | Test3 | 1    | 1    | 1   | vegetarian  |
    | Test4 | 1    | 1    | 0   | vegetarian  |
```

---

## Selector Strategy

### Priority Order

1. **Role + Name** (highest priority, most resilient)
   ```javascript
   await page.getByRole('button', { name: 'Submit Vote' }).click();
   ```

2. **Label** (for form fields)
   ```javascript
   await page.getByLabel('Your Name').fill('Alice');
   ```

3. **Text** (for visible text content)
   ```javascript
   await page.getByText('Vote submitted successfully');
   ```

4. **data-testid** (fallback for non-semantic elements)
   ```javascript
   await page.getByTestId('vote-chart');
   ```

5. **CSS/ID** (avoid - fragile)
   ```javascript
   // Only as last resort
   await page.locator('#legacyElement');
   ```

### Why Semantic Selectors?

| Benefit | How |
|---------|-----|
| **Resilience** | Survives CSS refactoring, DOM restructuring |
| **Accessibility** | Tests verify screen reader compatibility |
| **User-centric** | Tests interact like real users do |
| **Maintainability** | Less likely to break on UI updates |

### Handling Dynamic Content

For dynamically generated content, combine selectors:

```javascript
// Find a specific meal card by name
const card = page.locator('.meal-card').filter({ hasText: 'Burger' });

// Find a checkbox within a specific section
const veggieCheckbox = page
  .getByRole('heading', { name: /vegetarian/i })
  .locator('..')
  .getByRole('checkbox')
  .first();
```

---

## Step Definition Guidelines

### Layer 1: Generic Steps

Keep these truly generic and reusable:

```javascript
// ✅ Good - works for any button
When('I click the {string} button', async function(buttonName) {
  await this.page.getByRole('button', { name: buttonName }).click();
});

// ❌ Avoid - too specific for generic steps
When('I click the submit vote button', async function() {
  await this.page.getByRole('button', { name: 'Submit Vote' }).click();
});
```

### Layer 3: Domain Steps

Encapsulate complex domain logic:

```javascript
// ✅ Good - encapsulates the complexity
When('I complete a full vote as {string}', async function(name) {
  const guestPage = new GuestPage(this.page);
  await guestPage.completeVote({
    name: name,
    meat: 'Burger',
    fish: 'Pasta',
    vegetarian: ['Vegetarian Burger', 'Pasta Primavera']
  });
});
```

### Step Parameter Types

Use appropriate parameter types:

```javascript
// {string} - quoted strings
When('I enter my name as {string}', ...)  // matches: "Alice"

// {int} - integers
When('I select {int} meat options', ...)  // matches: 1, 2, 3

// {float} - decimal numbers
When('I wait {float} seconds', ...)  // matches: 0.5, 1.5

// Custom regex for flexibility
When(/^I select (\d+) vegetarian options?$/, ...)  // matches: "1 option" or "2 options"
```

### Optional Pluralization

Handle singular/plural gracefully:

```javascript
// This pattern matches both "1 meat option" and "2 meat options"
When('I select {int} meat option(s)', async function(count) {
  // ...
});
```

---

## Page Object Model

### Structure

Each Page Object should:
1. Extend BasePage for shared functionality
2. Provide getter methods for elements
3. Provide action methods for interactions

```javascript
class GuestPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // Element getters
  get nameInput() {
    return this.page.getByLabel('Your Name');
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit Vote' });
  }

  // Action methods
  async enterName(name) {
    await this.nameInput.fill(name);
  }

  async submitVote() {
    await this.submitButton.click();
    await this.waitForNetworkIdle();
  }

  // Complex workflows
  async completeVote(voteData) {
    await this.enterName(voteData.name);
    await this.selectMeatOption(voteData.meat);
    await this.selectFishOption(voteData.fish);
    for (const veg of voteData.vegetarian) {
      await this.selectVegetarianOption(veg);
    }
    await this.submitVote();
  }
}
```

### When to Use Page Objects vs. Direct Selectors

| Situation | Use |
|-----------|-----|
| Simple, one-time interaction | Direct selector in generic step |
| Repeated selector across steps | Page Object |
| Complex multi-step workflow | Page Object method |
| Assertions on page state | Page Object method |

---

## Test Organization

### Tag Strategy

```gherkin
@guest @happy-path
Scenario: Guest submits valid vote
  ...

@guest @validation @regression
Scenario: Fix for duplicate name bug
  ...
```

| Tag Type | Examples | Purpose |
|----------|----------|---------|
| **Feature area** | @guest, @admin, @restaurant | Group by functionality |
| **Test type** | @happy-path, @validation, @e2e | Group by purpose |
| **Priority** | @smoke, @critical, @low-priority | Control CI execution |
| **Status** | @wip, @skip, @flaky | Track test health |
| **Traceability** | @regression, @bug-fix, @JIRA-123 | Link to issues |

### File Organization

- **One feature per feature file** (usually)
- **Group related scenarios together**
- **Order scenarios logically**: happy-path first, then edge cases, then errors

---

## Handling Asynchronous Operations

### Always Wait for Network

```javascript
// In Page Object methods
async submitVote() {
  await this.submitButton.click();
  await this.page.waitForLoadState('networkidle');
}
```

### Wait for Specific Elements

```javascript
// Wait for element to be visible
await expect(this.page.getByText('Success')).toBeVisible();

// Wait for element to disappear
await expect(this.page.locator('.loading')).not.toBeVisible();

// Wait for specific count
await expect(this.page.locator('.vote-option')).toHaveCount(4);
```

### Handling Dialogs

```javascript
// Set up handler BEFORE triggering the dialog
this.page.once('dialog', async dialog => {
  await dialog.accept();
});
await this.page.getByRole('button', { name: 'Reset' }).click();
```

---

## Error Handling and Assertions

### Use Playwright's expect

```javascript
const { expect } = require('@playwright/test');

// Visibility
await expect(page.getByText('Success')).toBeVisible();
await expect(page.getByText('Error')).not.toBeVisible();

// Text content
await expect(page.locator('#status')).toHaveText('Loaded');
await expect(page.locator('#status')).toContainText('success');

// Input values
await expect(page.getByLabel('Name')).toHaveValue('Alice');

// Element state
await expect(page.getByRole('button')).toBeEnabled();
await expect(page.getByRole('button')).toBeDisabled();

// CSS class
await expect(page.locator('.tab-button')).toHaveClass(/active/);

// Count
await expect(page.locator('.meal-card')).toHaveCount(5);
```

### Custom Error Messages

```javascript
const isVisible = await page.getByText('Success').isVisible();
expect(isVisible, 'Success message should be visible after voting').toBe(true);
```

---

## Common Anti-Patterns to Avoid

### ❌ Hardcoded Waits

```javascript
// Bad - arbitrary wait
await this.page.waitForTimeout(5000);

// Good - wait for specific condition
await this.page.waitForLoadState('networkidle');
await expect(this.page.getByText('Loaded')).toBeVisible();
```

### ❌ Test Interdependence

```javascript
// Bad - scenario 2 depends on scenario 1
Scenario: Create user
  When I create user "Alice"

Scenario: Login as user
  # Fails if "Create user" didn't run first!
  When I login as "Alice"
```

```javascript
// Good - each scenario is independent
Scenario: Login as user
  Given user "Alice" exists    # Sets up its own data
  When I login as "Alice"
```

### ❌ Too Many Assertions in One Step

```javascript
// Bad - hard to debug failures
Then('everything should work', async function() {
  expect(await this.page.title()).toBe('My Meal');
  await expect(this.page.getByText('Success')).toBeVisible();
  await expect(this.page.locator('.votes')).toHaveCount(5);
  // Which one failed?
});
```

```gherkin
# Good - one assertion per step
Then the page title should be "My Meal"
And I should see "Success"
And there should be 5 votes displayed
```

### ❌ Overly Specific Selectors

```javascript
// Bad - breaks if any part of hierarchy changes
await page.locator('#main > div.container > section:first-child > button.primary').click();

// Good - resilient to structure changes
await page.getByRole('button', { name: 'Submit' }).click();
```

### ❌ Not Using Page Objects for Repeated Logic

```javascript
// Bad - duplicated selector logic
When('I select a meat option', async function() {
  await this.page.locator('#meatVoting .vote-option').first().click();
});

When('I verify meat options exist', async function() {
  const options = await this.page.locator('#meatVoting .vote-option').count();
  expect(options).toBeGreaterThan(0);
});
```

```javascript
// Good - centralized in Page Object
class GuestPage {
  getVotingOptions(category) {
    return this.page.locator(`#${category}Voting .vote-option`);
  }
}

// In steps
When('I select a meat option', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.getVotingOptions('meat').first().click();
});
```

---

## Summary Checklist

Before committing tests, verify:

- [ ] Scenarios have descriptive names
- [ ] Background is used for common setup
- [ ] Each scenario is independent
- [ ] Semantic selectors are used (getByRole, getByLabel)
- [ ] Page Objects are used for repeated selectors
- [ ] Assertions use Playwright's expect
- [ ] Appropriate tags are applied
- [ ] Tests pass locally with `npm test`
- [ ] No hardcoded waits (use network/element waits)
