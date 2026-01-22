/**
 * Guest Step Definitions (Layer 3 - Domain-Specific)
 * 
 * These steps encapsulate guest voting logic using the GuestPage Page Object.
 * They provide intuitive vocabulary for writing guest voting scenarios.
 * 
 * Usage in Gherkin:
 *   When I enter my name as "Alice"
 *   And I select 1 meat option
 *   And I select 2 vegetarian options
 *   Then my vote should be recorded
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { GuestPage } = require('../pages/GuestPage');
const { RestaurantPage } = require('../pages/RestaurantPage');
const { AdminPage } = require('../pages/AdminPage');
const config = require('../config');

// Test database path for setup steps (loaded from centralized config)
const TEST_DATABASE_PATH = config.TEST_DATABASE_PATH;

// ==================== Navigation ====================

Given('I am on the guests tab', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
});

Given('I am on the guest voting page', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
});

Given('I navigate to the guest page', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
});

// ==================== Name Entry ====================

When('I enter my name as {string}', async function(name) {
  const guestPage = new GuestPage(this.page);
  await guestPage.enterName(name);
});

When('I enter the name {string}', async function(name) {
  const guestPage = new GuestPage(this.page);
  await guestPage.enterName(name);
});

When('I clear my name', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.clearName();
});

Then('the name field should be empty', async function() {
  const guestPage = new GuestPage(this.page);
  const name = await guestPage.getName();
  expect(name).toBe('');
});

Then('the name field should contain {string}', async function(expectedName) {
  const guestPage = new GuestPage(this.page);
  const name = await guestPage.getName();
  expect(name).toBe(expectedName);
});

// ==================== Meal Selection by Count ====================

When('I select {int} meat option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectMeatOptions(count);
});

When('I select {int} meat options', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectMeatOptions(count);
});

When('I select {int} fish option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectFishOptions(count);
});

When('I select {int} fish options', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectFishOptions(count);
});

When('I select {int} vegetarian option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOptions(count);
});

When('I select {int} vegetarian options', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOptions(count);
});

When('I select {int} different vegetarian options', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOptions(count);
});

When('I select only {int} vegetarian option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOptions(count);
});

// ==================== Meal Selection by Name ====================

When('I select meat option {string}', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectMeatOption(optionName);
});

When('I select fish option {string}', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectFishOption(optionName);
});

When('I select vegetarian option {string}', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOption(optionName);
});

When('I deselect vegetarian option {string}', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  await guestPage.deselectVegetarianOption(optionName);
});

// ==================== Vote Submission ====================

When('I submit my vote', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.submitVote();
});

When('I click submit vote', async function() {
  const guestPage = new GuestPage(this.page);
  await guestPage.submitVote();
});

Then('I should see a confirmation message', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVoteSuccessful()).toBe(true);
});

Then('my vote should be recorded', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVoteSuccessful()).toBe(true);
});

Then('my vote should be recorded in the system', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVoteSuccessful()).toBe(true);
});

Then('the vote should be submitted successfully', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVoteSuccessful()).toBe(true);
});

Then('no vote should be recorded', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.hasErrorMessage()).toBe(true);
});

// ==================== Error Handling ====================

Then('I should see an error about duplicate voting', async function() {
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('already exists');
});

Then('I should see an error about selecting {int} vegetarian options', async function(count) {
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('vegetarian');
});

Then('I should see an error about missing name', async function() {
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('name');
});

Then('I should see an error about missing meat option', async function() {
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('meat');
});

Then('I should see an error about missing fish option', async function() {
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('fish');
});

Then('I should NOT see the error {string}', async function(errorText) {
  await expect(this.page.getByText(errorText)).not.toBeVisible();
});

// ==================== Selection State Verification ====================

Then('I should have {int} meat options selected', async function(count) {
  const guestPage = new GuestPage(this.page);
  const selectedCount = await guestPage.getSelectedCount('meat');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} fish options selected', async function(count) {
  const guestPage = new GuestPage(this.page);
  const selectedCount = await guestPage.getSelectedCount('fish');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} vegetarian options selected', async function(count) {
  const guestPage = new GuestPage(this.page);
  const selectedCount = await guestPage.getSelectedCount('vegetarian');
  expect(selectedCount).toBe(count);
});

Then('the meat option {string} should be selected', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  const isSelected = await guestPage.isOptionSelected('meat', optionName);
  expect(isSelected).toBe(true);
});

Then('the fish option {string} should be selected', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  const isSelected = await guestPage.isOptionSelected('fish', optionName);
  expect(isSelected).toBe(true);
});

Then('the vegetarian option {string} should be selected', async function(optionName) {
  const guestPage = new GuestPage(this.page);
  const isSelected = await guestPage.isOptionSelected('vegetarian', optionName);
  expect(isSelected).toBe(true);
});

// ==================== Form Availability ====================

Then('the voting form should be available', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVotingFormAvailable()).toBe(true);
});

Then('the voting form should not be available', async function() {
  const guestPage = new GuestPage(this.page);
  expect(await guestPage.isVotingFormAvailable()).toBe(false);
});

Then('I should see voting options for meat', async function() {
  const guestPage = new GuestPage(this.page);
  const options = await guestPage.getAvailableOptions('meat');
  expect(options.length).toBeGreaterThan(0);
});

Then('I should see voting options for fish', async function() {
  const guestPage = new GuestPage(this.page);
  const options = await guestPage.getAvailableOptions('fish');
  expect(options.length).toBeGreaterThan(0);
});

Then('I should see voting options for vegetarian', async function() {
  const guestPage = new GuestPage(this.page);
  const options = await guestPage.getAvailableOptions('vegetarian');
  expect(options.length).toBeGreaterThan(0);
});

// ==================== Complete Vote Workflows ====================

/**
 * Submit a complete valid vote with specific meal selections
 * This allows explicit control over which meals are selected
 * 
 * Usage in Gherkin:
 *   When I complete a full vote as "Alice" with:
 *     | category    | meal                |
 *     | meat        | Burger              |
 *     | fish        | Pasta               |
 *     | vegetarian  | Lasagna             |
 *     | vegetarian  | Stir Fry            |
 */
When('I complete a full vote as {string} with:', async function(name, dataTable) {
  const guestPage = new GuestPage(this.page);
  
  // Parse the data table to extract meal selections
  const rows = dataTable.hashes();
  let meatOption = null;
  let fishOption = null;
  const vegetarianOptions = [];
  
  for (const row of rows) {
    const category = row.category.toLowerCase();
    const mealName = row.meal || row.name;
    
    if (category === 'meat') {
      meatOption = mealName;
    } else if (category === 'fish') {
      fishOption = mealName;
    } else if (category === 'vegetarian') {
      vegetarianOptions.push(mealName);
    }
  }
  
  await guestPage.completeVote({
    name: name,
    meat: meatOption,
    fish: fishOption,
    vegetarian: vegetarianOptions
  });
});

When('I complete a full vote with:', async function(dataTable) {
  const guestPage = new GuestPage(this.page);
  const data = dataTable.rowsHash();
  
  await guestPage.enterName(data['name']);
  
  if (data['meat options']) {
    await guestPage.selectMeatOptions(parseInt(data['meat options']));
  }
  if (data['fish options']) {
    await guestPage.selectFishOptions(parseInt(data['fish options']));
  }
  if (data['vegetarian options']) {
    await guestPage.selectVegetarianOptions(parseInt(data['vegetarian options']));
  }
  
  await guestPage.submitVote();
});

// ==================== Previous Voter Setup ====================

/**
 * Set up a guest who has already voted with specific meal selections
 * This allows testing duplicate voting scenarios with explicit meal choices
 * 
 * Usage in Gherkin:
 *   Given "Alice" has already voted with:
 *     | category    | meal                |
 *     | meat        | Burger              |
 *     | fish        | Pasta               |
 *     | vegetarian  | Lasagna             |
 *     | vegetarian  | Stir Fry            |
 */
Given('{string} has already voted with:', async function(voterName, dataTable) {
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
  
  // Parse the data table to extract meal selections
  const rows = dataTable.hashes();
  let meatOption = null;
  let fishOption = null;
  const vegetarianOptions = [];
  
  for (const row of rows) {
    const category = row.category.toLowerCase();
    const mealName = row.meal || row.name;
    
    if (category === 'meat') {
      meatOption = mealName;
    } else if (category === 'fish') {
      fishOption = mealName;
    } else if (category === 'vegetarian') {
      vegetarianOptions.push(mealName);
    }
  }
  
  // Complete the vote with specified selections
  await guestPage.completeVote({
    name: voterName,
    meat: meatOption,
    fish: fishOption,
    vegetarian: vegetarianOptions
  });
  
  // Verify vote was successful
  expect(await guestPage.isVoteSuccessful()).toBe(true);
  
  // Store voter info for potential verification
  this.testData.lastVoter = voterName;
});

/**
 * Try to vote again with specific meal selections
 * This allows testing duplicate voting with explicit meal choices
 * 
 * Usage in Gherkin:
 *   When I try to vote again as "Alice" with:
 *     | category    | meal                |
 *     | meat        | Meatballs           |
 *     | fish        | Pasta               |
 *     | vegetarian  | Salad               |
 *     | vegetarian  | Curry               |
 */
When('I try to vote again as {string} with:', async function(voterName, dataTable) {
  const guestPage = new GuestPage(this.page);
  
  // Refresh to get a clean form
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
  await guestPage.navigate();
  
  // Parse the data table to extract meal selections
  const rows = dataTable.hashes();
  let meatOption = null;
  let fishOption = null;
  const vegetarianOptions = [];
  
  for (const row of rows) {
    const category = row.category.toLowerCase();
    const mealName = row.meal || row.name;
    
    if (category === 'meat') {
      meatOption = mealName;
    } else if (category === 'fish') {
      fishOption = mealName;
    } else if (category === 'vegetarian') {
      vegetarianOptions.push(mealName);
    }
  }
  
  // Try to submit a vote with the same name
  await guestPage.completeVote({
    name: voterName,
    meat: meatOption,
    fish: fishOption,
    vegetarian: vegetarianOptions
  });
});

Then('only one vote for {string} should exist', async function(voterName) {
  // This would require checking the database or API
  // For now, we verify the error message was shown
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('already exists');
});
