/**
 * Admin Step Definitions (Layer 3 - Domain-Specific)
 * 
 * These steps encapsulate complex admin-specific logic using the AdminPage Page Object.
 * They provide higher-level abstractions for admin workflows.
 * 
 * Usage in Gherkin:
 *   Given I upload the test meal database
 *   When I save the final meal plan
 *   Then the database should be loaded
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { AdminPage } = require('../pages/AdminPage');
const config = require('../config');
const path = require('path');

// Path to the test database file (loaded from centralized config)
const TEST_DATABASE_PATH = config.TEST_DATABASE_PATH;

// ==================== Navigation ====================

Given('I am on the admin tab', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
});

// ==================== Database Upload ====================

/**
 * Upload the test meal database
 * This is a common setup step for many test scenarios
 */
// !? Redundant step definition, see 'I upload the meal database'
Given('I upload the test meal database', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
});

Given('the meal database has been uploaded', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
  
  // Verify upload was successful
  const status = await adminPage.getDatabaseStatus();
  expect(status).toBe('Loaded');
});

Given('the system admin has uploaded a meal database', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
  
  // Verify and store the result
  expect(await adminPage.isUploadSuccessful()).toBe(true);
});

When('I upload the meal database', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
});

When('I upload the database file {string}', async function(filename) {
  const adminPage = new AdminPage(this.page);
  const filePath = path.join(__dirname, '..', '..', filename);
  await adminPage.uploadDatabase(filePath);
});

Then('the database should be uploaded successfully', async function() {
  const adminPage = new AdminPage(this.page);
  expect(await adminPage.isUploadSuccessful()).toBe(true);
});

Then('the database status should show {string}', async function(expectedStatus) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getDatabaseStatus();
  expect(status).toBe(expectedStatus);
});

// ==================== System Status ====================

Then('the system status should show database as {string}', async function(expectedStatus) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getDatabaseStatus();
  expect(status).toBe(expectedStatus);
});

Then('the system status should show options as {string}', async function(expectedStatus) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getOptionsStatus();
  expect(status).toBe(expectedStatus);
});

Then('the system status should show votes as {string}', async function(expectedStatus) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getVotesStatus();
  expect(status).toBe(expectedStatus);
});

Then('the system status should show {int} votes', async function(count) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getVotesStatus();
  expect(status).toContain(count.toString());
});

Then('the system status should show meal plan as {string}', async function(expectedStatus) {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getPlanStatus();
  expect(status).toBe(expectedStatus);
});

// ==================== Vote Results ====================

When('I click show vote results', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.showVoteResults();
});

Then('I should see vote charts', async function() {
  await expect(this.page.locator('#voteCharts')).toBeVisible();
});

Then('the {string} chart should show {string} with {int} votes', async function(category, mealName, voteCount) {
  const adminPage = new AdminPage(this.page);
  const chartData = await adminPage.getChartData(category);
  
  const entry = chartData.find(item => item.label.includes(mealName));
  expect(entry).toBeDefined();
  expect(entry.value).toBe(voteCount);
});

// ==================== Final Meal Plan ====================

When('I select {string} for Monday', async function(mealName) {
  const adminPage = new AdminPage(this.page);
  await adminPage.selectMondayMeal(mealName);
});

When('I select {string} for Tuesday', async function(mealName) {
  const adminPage = new AdminPage(this.page);
  await adminPage.selectTuesdayMeal(mealName);
});

When('I select {string} for Wednesday', async function(mealName) {
  const adminPage = new AdminPage(this.page);
  await adminPage.selectWednesdayMeal(mealName);
});

When('I select {string} for Thursday', async function(mealName) {
  const adminPage = new AdminPage(this.page);
  await adminPage.selectThursdayMeal(mealName);
});

When('I save the final meal plan', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.saveFinalPlan();
});

Then('the meal plan should be saved successfully', async function() {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getFinalPlanStatus();
  expect(status).toContain('successfully');
});

Then('the meal plan should show {string} for {string}', async function(mealName, day) {
  const adminPage = new AdminPage(this.page);
  const plan = await adminPage.getMealPlanDisplay();
  expect(plan[day.toLowerCase()]).toContain(mealName);
});

Then('the weekly meal plan should be displayed', async function() {
  await expect(this.page.locator('#mealPlanResult')).toBeVisible();
  await expect(this.page.locator('#mealPlanResult').getByText('Weekly Meal Plan')).toBeVisible();
});

// ==================== System Reset ====================

When('I reset the system', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.resetSystem();
});

When('I click reset system but cancel', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.cancelResetSystem();
});

Then('the system should be reset', async function() {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getResetStatus();
  expect(status).toContain('reset successfully');
});

Then('the weekly options should be cleared', async function() {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getOptionsStatus();
  expect(status).toBe('Not set');
});

Then('the votes should be cleared', async function() {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getVotesStatus();
  expect(status).toBe('No votes');
});

Then('the meal plan should be cleared', async function() {
  const adminPage = new AdminPage(this.page);
  const status = await adminPage.getPlanStatus();
  expect(status).toBe('Not set');
});

// ==================== Combined Setup Steps ====================

/**
 * Complete system setup with database and weekly options
 * This is useful as a Background step for guest voting tests
 */
Given('the system is fully configured with weekly options', async function() {
  // Upload database
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
  
  // Store that database was uploaded for use in restaurant step
  this.testData.databaseUploaded = true;
});

// ==================== JSON Validation ====================

When('I upload an invalid JSON file', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.uploadInvalidJson();
});

When('I upload a JSON file missing meal_combinations', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.uploadJsonMissingMealCombinations();
});

When('I upload a JSON file with combination lacking vegetarian meal', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.uploadJsonWithoutVegetarianMeal();
});

Then('I should see an error about invalid JSON', async function() {
  const adminPage = new AdminPage(this.page);
  const error = await adminPage.getUploadError();
  expect(error.toLowerCase()).toContain('json');
});

Then('I should see an error about missing meal_combinations', async function() {
  const adminPage = new AdminPage(this.page);
  const error = await adminPage.getUploadError();
  expect(error.toLowerCase()).toContain('meal_combinations');
});

Then('I should see a warning about missing vegetarian meal', async function() {
  const adminPage = new AdminPage(this.page);
  const warning = await adminPage.getUploadWarning();
  expect(warning.toLowerCase()).toContain('vegetarian');
});

// ==================== Vote Result Details ====================

Then('I should see vote results grouped by {string}', async function(category) {
  const adminPage = new AdminPage(this.page);
  const hasCategory = await adminPage.hasVoteResultCategory(category);
  expect(hasCategory).toBe(true);
});

Then('I should see that no votes exist for {string}', async function(category) {
  const adminPage = new AdminPage(this.page);
  const noVotes = await adminPage.categoryShowsNoVotes(category);
  expect(noVotes).toBe(true);
});

// ==================== Duplicate Meal Combination Names ====================

Then('the database should contain a meal combination with id {string}', async function(expectedId) {
  // Fetch the meals database via API
  const response = await this.page.request.get('http://localhost:3000/api/meals-database');
  expect(response.ok()).toBe(true);
  
  const data = await response.json();
  const combination = data.meal_combinations.find(combo => combo.id === expectedId);
  
  expect(combination).toBeDefined();
  expect(combination.id).toBe(expectedId);
  
  // Store the combination for later comparisons
  if (!this.mealCombinations) {
    this.mealCombinations = {};
  }
  this.mealCombinations[expectedId] = combination;
});

Then('both combinations should have different meals', async function() {
  // This step assumes we have stored two combinations (pasta and pasta_2)
  const pasta1 = this.mealCombinations['pasta'];
  const pasta2 = this.mealCombinations['pasta_2'];
  
  expect(pasta1).toBeDefined();
  expect(pasta2).toBeDefined();
  
  // Both should have the same name but different IDs
  expect(pasta1.name).toBe(pasta2.name);
  expect(pasta1.id).not.toBe(pasta2.id);
  
  // Extract meal names from both combinations
  const meals1 = pasta1.meals.map(m => m.name).sort();
  const meals2 = pasta2.meals.map(m => m.name).sort();
  
  // The combinations should have different meals (not identical)
  expect(meals1).not.toEqual(meals2);
});
