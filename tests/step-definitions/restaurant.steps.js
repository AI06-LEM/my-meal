/**
 * Restaurant Step Definitions (Layer 3 - Domain-Specific)
 * 
 * These steps encapsulate restaurant-specific logic using the RestaurantPage Page Object.
 * They handle meal selection and weekly options management.
 * 
 * Usage in Gherkin:
 *   Given the restaurant has selected weekly options
 *   When I select "Burger" as a meat option
 *   Then the weekly options should be saved
 */

const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { RestaurantPage } = require('../pages/RestaurantPage');
const { AdminPage } = require('../pages/AdminPage');
const config = require('../config');

// Test database path for setup steps (loaded from centralized config)
const TEST_DATABASE_PATH = config.TEST_DATABASE_PATH;

// ==================== Navigation ====================

Given('I am on the restaurant tab', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.navigate();
});

Given('I navigate to the restaurant page', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.navigate();
});

// ==================== Meal Selection ====================

/**
 * Select a specific meat option by name
 */
When('I select {string} as a meat option', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectMeatOption(mealName);
});

When('I select the meat option {string}', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectMeatOption(mealName);
});

/**
 * Select a specific fish option by name
 */
When('I select {string} as a fish option', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectFishOption(mealName);
});

When('I select the fish option {string}', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectFishOption(mealName);
});

/**
 * Select a specific vegetarian option by name
 */
When('I select {string} as a vegetarian option', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectVegetarianOption(mealName);
});

When('I select the vegetarian option {string}', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.selectVegetarianOption(mealName);
});

/**
 * Deselect an option by name
 */
When('I deselect {string}', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.deselectMeal(mealName);
});

// ==================== Selection Verification ====================

Then('{string} should be selected', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  const isSelected = await restaurantPage.isMealSelected(mealName);
  expect(isSelected).toBe(true);
});

Then('{string} should not be selected', async function(mealName) {
  const restaurantPage = new RestaurantPage(this.page);
  const isSelected = await restaurantPage.isMealSelected(mealName);
  expect(isSelected).toBe(false);
});

Then('I should see {int} meat options available', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const options = await restaurantPage.getMeatOptions();
  expect(options.length).toBe(count);
});

Then('I should see {int} fish options available', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const options = await restaurantPage.getFishOptions();
  expect(options.length).toBe(count);
});

Then('I should see {int} vegetarian options available', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const options = await restaurantPage.getVegetarianOptions();
  expect(options.length).toBe(count);
});

Then('I should have {int} meat options selected', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const selectedCount = await restaurantPage.getSelectedCount('meat');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} fish options selected', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const selectedCount = await restaurantPage.getSelectedCount('fish');
  expect(selectedCount).toBe(count);
});

Then('I should have {int} vegetarian options selected', async function(count) {
  const restaurantPage = new RestaurantPage(this.page);
  const selectedCount = await restaurantPage.getSelectedCount('vegetarian');
  expect(selectedCount).toBe(count);
});

// ==================== Save Weekly Options ====================

When('I save the weekly options', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.saveWeeklyOptions();
});

Then('the weekly options should be saved successfully', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  expect(await restaurantPage.isSaveSuccessful()).toBe(true);
});

Then('I should see a message that weekly options are saved', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  const status = await restaurantPage.getSaveStatus();
  expect(status).toContain('successfully');
});

// ==================== Combined Setup Steps ====================

// /**
//  * Complete restaurant setup - select a standard set of weekly options
//  * This is commonly used as a Background step
//  */
// Given('the restaurant has selected weekly options', async function() {
//   // First, ensure database is uploaded
//   const adminPage = new AdminPage(this.page);
//   await adminPage.navigate();
//   await adminPage.uploadDatabase(TEST_DATABASE_PATH);
  
//   // Then select weekly options
//   const restaurantPage = new RestaurantPage(this.page);
//   await restaurantPage.navigate();
  
//   // Select one meat combo
//   await restaurantPage.selectMeatOption('Burger');
  
//   // Select one fish combo
//   await restaurantPage.selectFishOption('Pasta');
  
//   // Note: The combos automatically add their vegetarian counterparts
//   // We need two additional vegetarian options for guests to choose from
//   await restaurantPage.selectVegetarianOption('Mushroom Risotto');
//   await restaurantPage.selectVegetarianOption('Vegetable Risotto');
  
//   // Save the options
//   await restaurantPage.saveWeeklyOptions();
  
//   // Store in test data for verification
//   this.testData.weeklyOptionsSet = true;
// });

/**
 * Complete restaurant setup with custom meal selections specified in a data table
 * This allows explicit control over which meals are selected in Gherkin syntax
 * Includes system reset to ensure clean state
 * 
 * Usage in Gherkin:
 *   Given the restaurant has selected weekly options with:
 *     | category    | meal                |
 *     | meat        | Burger              |
 *     | meat        | Meatballs           |
 *     | fish        | Fish and Chips      |
 *     | fish        | Pasta               |
 *     | vegetarian  | Lasagna             |
 *     | vegetarian  | Stir Fry            |
 *     | vegetarian  | Salad               |
 *     | vegetarian  | Curry               |
 */
Given('the restaurant has selected weekly options with:', { timeout: 30000 }, async function(dataTable) {
  // First, reset system and upload database
  const adminPage = new AdminPage(this.page);
  await adminPage.navigate();
  await adminPage.resetSystem();
  await adminPage.uploadDatabase(TEST_DATABASE_PATH);
  
  // Navigate to restaurant page
  const restaurantPage = new RestaurantPage(this.page);
  await restaurantPage.navigate();
  
  // Parse the data table rows
  const rows = dataTable.hashes();
  
  // Select meals based on data table
  for (const row of rows) {
    const category = row.category.toLowerCase();
    const mealName = row.meal || row.name;
    
    if (category === 'meat') {
      await restaurantPage.selectMeatOption(mealName);
    } else if (category === 'fish') {
      await restaurantPage.selectFishOption(mealName);
    } else if (category === 'vegetarian') {
      await restaurantPage.selectVegetarianOption(mealName);
    }
  }
  
  // Save the options
  await restaurantPage.saveWeeklyOptions();
  
  // Store in test data for verification
  this.testData.weeklyOptionsSet = true;
});

/**
 * Select specific weekly options from a data table (without upload/save)
 * Use this in the middle of a scenario when you're already on the restaurant page
 * For complete setup, use: Given('the restaurant has selected weekly options with:')
 * 
 * Usage in Gherkin:
 *   When I select the following weekly options:
 *     | category    | meal      |
 *     | meat        | Burger    |
 *     | fish        | Pasta     |
 */
When('I select the following weekly options:', async function(dataTable) {
  const restaurantPage = new RestaurantPage(this.page);
  const rows = dataTable.hashes();
  
  for (const row of rows) {
    const category = row.category.toLowerCase();
    const mealName = row.meal || row.name;
    
    if (category === 'meat') {
      await restaurantPage.selectMeatOption(mealName);
    } else if (category === 'fish') {
      await restaurantPage.selectFishOption(mealName);
    } else if (category === 'vegetarian') {
      await restaurantPage.selectVegetarianOption(mealName);
    }
  }
});

// ==================== Availability Checks ====================

Then('meal options should be displayed', async function() {
  const restaurantPage = new RestaurantPage(this.page);
  const meatOptions = await restaurantPage.getMeatOptions();
  const fishOptions = await restaurantPage.getFishOptions();
  const vegOptions = await restaurantPage.getVegetarianOptions();
  
  expect(meatOptions.length + fishOptions.length + vegOptions.length).toBeGreaterThan(0);
});

Then('I should see meal options from the database', async function() {
  await expect(this.page.locator('#meatOptions .meal-card')).toHaveCount(expect.any(Number));
});
