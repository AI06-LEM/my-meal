/**
 * Common/Reusable Step Definitions (Layer 1)
 * 
 * These generic steps use semantic selectors directly and work across all features.
 * They provide a "vocabulary" for writing tests without needing page-specific knowledge.
 * 
 * Key principles:
 * - Use getByRole(), getByLabel(), getByText() - semantic selectors
 * - Accept parameters for flexibility
 * - Keep steps generic and reusable
 * 
 * Usage in Gherkin:
 *   When I click the "Submit Vote" button
 *   And I type "Alice" into the "Your Name" field
 *   Then I should see "Vote submitted successfully"
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');

// ==================== Navigation Steps ====================

/**
 * Navigate to a specific tab by name
 * Uses appropriate Page Object for proper waiting logic
 * 
 * Examples:
 *   When I go to the "Guests" tab
 *   When I go to the "System Admin" tab
 *   When I go to the "Restaurant" tab
 */
When('I go to the {string} tab', async function(tabName) {
  const { AdminPage, RestaurantPage, GuestPage } = require('../pages');
  
  // Use appropriate Page Object for proper waiting logic
  if (tabName === 'Guests') {
    const guestPage = new GuestPage(this.page);
    await guestPage.navigate();
  } else if (tabName === 'Restaurant') {
    const restaurantPage = new RestaurantPage(this.page);
    await restaurantPage.navigate();
  } else if (tabName === 'System Admin') {
    const adminPage = new AdminPage(this.page);
    await adminPage.navigate();
  } else {
    // Fallback for unknown tabs
    const tab = this.page.getByRole('button', { name: tabName });
    await expect(tab).toBeVisible({ timeout: 2000 });
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }
});

Given('I am on the {string} tab', async function(tabName) {
  const { AdminPage, RestaurantPage, GuestPage } = require('../pages');
  
  // Use appropriate Page Object for proper waiting logic
  if (tabName === 'Guests') {
    const guestPage = new GuestPage(this.page);
    await guestPage.navigate();
  } else if (tabName === 'Restaurant') {
    const restaurantPage = new RestaurantPage(this.page);
    await restaurantPage.navigate();
  } else if (tabName === 'System Admin') {
    const adminPage = new AdminPage(this.page);
    await adminPage.navigate();
  } else {
    // Fallback for unknown tabs
    const tab = this.page.getByRole('button', { name: tabName });
    await expect(tab).toBeVisible({ timeout: 2000 });
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }
});

Given('I am on the home page', async function() {
  await this.navigate('/');
});

When('I refresh the page', async function() {
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
});

// ==================== Button Interaction Steps ====================

/**
 * Click a button by its visible text
 * 
 * Examples:
 *   When I click the "Submit Vote" button
 *   When I click the "Upload Database" button
 *   When I click the "Save Weekly Options" button
 */
When('I click the {string} button', async function(buttonName) {
  const button = this.page.getByRole('button', { name: buttonName });
  await expect(button).toBeVisible({ timeout: 2000 });
  await button.click();
});

When('I click {string}', async function(buttonName) {
  const button = this.page.getByRole('button', { name: buttonName });
  await expect(button).toBeVisible({ timeout: 2000 });
  await button.click();
});

/**
 * Click a link by its visible text
 */
When('I click the {string} link', async function(linkText) {
  const link = this.page.getByRole('link', { name: linkText });
  await expect(link).toBeVisible({ timeout: 2000 });
  await link.click();
});

// ==================== Form Input Steps ====================

/**
 * Type text into a labeled input field
 * 
 * Examples:
 *   When I type "Alice" into the "Your Name" field
 *   When I type "test@example.com" into the "Email" field
 */
When('I type {string} into the {string} field', async function(value, label) {
  const field = this.page.getByLabel(label);
  await expect(field).toBeVisible({ timeout: 2000 });
  await field.fill(value);
});

When('I enter {string} in the {string} field', async function(value, label) {
  const field = this.page.getByLabel(label);
  await expect(field).toBeVisible({ timeout: 2000 });
  await field.fill(value);
});

When('I clear the {string} field', async function(label) {
  const field = this.page.getByLabel(label);
  await expect(field).toBeVisible({ timeout: 2000 });
  await field.clear();
});

/**
 * Select an option from a dropdown by its label
 * 
 * Examples:
 *   When I select "Burger" from the "Monday (Meat)" dropdown
 */
When('I select {string} from the {string} dropdown', async function(option, label) {
  const dropdown = this.page.getByLabel(label);
  await expect(dropdown).toBeVisible({ timeout: 2000 });
  await dropdown.selectOption({ label: option });
});

When('I select option {string} from {string}', async function(option, label) {
  const dropdown = this.page.getByLabel(label);
  await expect(dropdown).toBeVisible({ timeout: 2000 });
  await dropdown.selectOption({ label: option });
});

/**
 * Check a checkbox by its label
 * 
 * Examples:
 *   When I check the "I agree to terms" checkbox
 */
When('I check the {string} checkbox', async function(label) {
  const checkbox = this.page.getByLabel(label);
  await expect(checkbox).toBeVisible({ timeout: 2000 });
  await checkbox.check();
});

When('I uncheck the {string} checkbox', async function(label) {
  const checkbox = this.page.getByLabel(label);
  await expect(checkbox).toBeVisible({ timeout: 2000 });
  await checkbox.uncheck();
});

// ==================== Assertion Steps ====================

/**
 * Assert that text is visible on the page
 * 
 * Examples:
 *   Then I should see "Vote submitted successfully"
 *   Then I should see "Error: Invalid input"
 */
Then('I should see {string}', async function(expectedText) {
  await expect(this.page.getByText(expectedText).first()).toBeVisible();
});

Then('I should see the text {string}', async function(expectedText) {
  await expect(this.page.getByText(expectedText).first()).toBeVisible();
});

/**
 * Assert that text is NOT visible on the page
 * 
 * Examples:
 *   Then I should not see "Error"
 */
Then('I should not see {string}', async function(text) {
  await expect(this.page.getByText(text)).not.toBeVisible();
});

Then('I should NOT see {string}', async function(text) {
  await expect(this.page.getByText(text)).not.toBeVisible();
});

/**
 * Assert heading text
 * 
 * Examples:
 *   Then I should see the heading "Guest Voting"
 */
Then('I should see the heading {string}', async function(headingText) {
  await expect(this.page.getByRole('heading', { name: headingText })).toBeVisible();
});

/**
 * Assert button state
 * 
 * Examples:
 *   Then the "Submit Vote" button should be disabled
 *   Then the "Submit Vote" button should be enabled
 */
Then('the {string} button should be disabled', async function(buttonName) {
  await expect(this.page.getByRole('button', { name: buttonName })).toBeDisabled();
});

Then('the {string} button should be enabled', async function(buttonName) {
  await expect(this.page.getByRole('button', { name: buttonName })).toBeEnabled();
});

Then('the {string} button should be visible', async function(buttonName) {
  await expect(this.page.getByRole('button', { name: buttonName })).toBeVisible();
});

/**
 * Assert input field value
 * 
 * Examples:
 *   Then the "Your Name" field should contain "Alice"
 *   Then the "Your Name" field should be empty
 */
Then('the {string} field should contain {string}', async function(label, expectedValue) {
  await expect(this.page.getByLabel(label)).toHaveValue(expectedValue);
});

Then('the {string} field should be empty', async function(label) {
  await expect(this.page.getByLabel(label)).toHaveValue('');
});

// ==================== Status Message Steps ====================

/**
 * Assert success message
 * 
 * Examples:
 *   Then I should see a success message
 *   Then I should see a success message containing "saved"
 */
Then('I should see a success message', async function() {
  await expect(this.page.locator('.success')).toBeVisible();
});

Then('I should see a success message containing {string}', async function(text) {
  await expect(this.page.locator('.success').filter({ hasText: text })).toBeVisible();
});

/**
 * Assert error message
 * 
 * Examples:
 *   Then I should see an error message
 *   Then I should see an error message containing "required"
 */
Then('I should see an error message', async function() {
  await expect(this.page.locator('.error')).toBeVisible();
});

Then('I should see an error message containing {string}', async function(text) {
  await expect(this.page.locator('.error').filter({ hasText: text })).toBeVisible();
});

Then('I should see an error about {string}', async function(errorTopic) {
  await expect(this.page.locator('.error').filter({ hasText: errorTopic })).toBeVisible();
});

// ==================== Wait Steps ====================

/**
 * Wait for page to fully load
 */
When('I wait for the page to load', async function() {
  await this.page.waitForLoadState('networkidle');
});

When('I wait {int} seconds', async function(seconds) {
  await this.page.waitForTimeout(seconds * 1000);
});

// ==================== Element Count Steps ====================

/**
 * Assert number of elements
 * 
 * Examples:
 *   Then I should see 3 buttons
 */
Then('I should see {int} {string}', async function(count, elementType) {
  const elements = this.page.getByRole(elementType);
  await expect(elements).toHaveCount(count);
});

// ==================== Tab Active State ====================

/**
 * Assert which tab is active
 */
Then('the {string} tab should be active', async function(tabName) {
  const tabButton = this.page.getByRole('button', { name: tabName });
  await expect(tabButton).toHaveClass(/active/);
});

// ==================== Dialog Handling ====================

/**
 * Handle confirmation dialogs
 */
When('I accept the confirmation dialog', async function() {
  this.page.once('dialog', async dialog => {
    await dialog.accept();
  });
});

When('I dismiss the confirmation dialog', async function() {
  this.page.once('dialog', async dialog => {
    await dialog.dismiss();
  });
});

// ==================== Screenshot Steps (for debugging) ====================

Then('I take a screenshot named {string}', async function(name) {
  await this.page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
});
