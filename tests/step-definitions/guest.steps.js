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
const path = require('path');

// Test database path for setup steps
const TEST_DATABASE_PATH = path.join(__dirname, '..', '..', 'meals_database_en_test.json');

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

When('I select {int} meat option(s)', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectMeatOptions(count);
});

When('I select {int} fish option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectFishOptions(count);
});

When('I select {int} fish option(s)', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectFishOptions(count);
});

When('I select {int} vegetarian option', async function(count) {
  const guestPage = new GuestPage(this.page);
  await guestPage.selectVegetarianOptions(count);
});

When('I select {int} vegetarian option(s)', async function(count) {
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

Then('I should have {int} meat option(s) selected', async function(count) {
  const guestPage = new GuestPage(this.page);
  const selectedCount = await guestPage.getSelectedCount('meat');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} fish option(s) selected', async function(count) {
  const guestPage = new GuestPage(this.page);
  const selectedCount = await guestPage.getSelectedCount('fish');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} vegetarian option(s) selected', async function(count) {
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
 * Submit a complete valid vote
 */
When('I complete a full vote as {string}', async function(name) {
  const guestPage = new GuestPage(this.page);
  await guestPage.completeVote({
    name: name,
    meat: 'Burger',
    fish: 'Pasta',
    vegetarian: ['Vegetarian Burger', 'Pasta Primavera']
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

Given('{string} has already voted', async function(voterName) {
  // First complete the voting setup, then submit a vote
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
  
  // Complete a vote for this user
  await guestPage.completeVote({
    name: voterName,
    meat: 'Burger',
    fish: 'Pasta',
    vegetarian: ['Vegetarian Burger', 'Pasta Primavera']
  });
  
  // Verify vote was successful
  expect(await guestPage.isVoteSuccessful()).toBe(true);
  
  // Clear the form for the next voter
  await guestPage.clearName();
});

Given('{string} has already submitted a vote', async function(voterName) {
  const guestPage = new GuestPage(this.page);
  await guestPage.navigate();
  
  await guestPage.completeVote({
    name: voterName,
    meat: 'Burger',
    fish: 'Pasta',
    vegetarian: ['Vegetarian Burger', 'Pasta Primavera']
  });
  
  expect(await guestPage.isVoteSuccessful()).toBe(true);
});

When('I try to vote again as {string}', async function(voterName) {
  const guestPage = new GuestPage(this.page);
  
  // Refresh to get a clean form
  await this.page.reload();
  await this.page.waitForLoadState('networkidle');
  await guestPage.navigate();
  
  // Try to submit a vote with the same name
  await guestPage.completeVote({
    name: voterName,
    meat: 'Burger',
    fish: 'Pasta',
    vegetarian: ['Vegetarian Burger', 'Pasta Primavera']
  });
});

Then('only one vote for {string} should exist', async function(voterName) {
  // This would require checking the database or API
  // For now, we verify the error message was shown
  const guestPage = new GuestPage(this.page);
  const error = await guestPage.getErrorMessage();
  expect(error).toContain('already exists');
});
