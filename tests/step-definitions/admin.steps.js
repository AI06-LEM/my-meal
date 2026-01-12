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
const path = require('path');

// Path to the test database file
const TEST_DATABASE_PATH = path.join(__dirname, '..', '..', 'meals_database_en_test.json');

// ==================== Navigation ====================

Given('I am on the admin tab', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
});

Given('I navigate to the admin page', async function() {
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
});

// ==================== Database Upload ====================

/**
 * Upload the test meal database
 * This is a common setup step for many test scenarios
 */
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

Then('the system status should show {int} vote(s)', async function(count) {
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

When('I view the vote results', async function() {
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
