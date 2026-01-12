/**
 * AdminPage - Page Object for System Admin Tab
 * 
 * Encapsulates all interactions with the System Admin interface:
 * - Database upload
 * - System status display
 * - Vote results and charts
 * - Final meal plan creation
 * - System reset
 * 
 * Selector Strategy: Uses semantic selectors (getByRole, getByLabel) as primary,
 * with fallback to IDs for dynamically generated content.
 */

const { BasePage } = require('./BasePage');
const path = require('path');

class AdminPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ==================== Navigation ====================

  /**
   * Navigate to Admin tab and wait for it to be ready
   */
  async navigate() {
    await this.goToAdminTab();
  }

  // ==================== Database Upload ====================

  /**
   * Upload a meal database JSON file
   * @param {string} filePath - Path to the JSON file to upload
   */
  async uploadDatabase(filePath) {
    // The file input element
    const fileInput = this.page.locator('#databaseFile');
    await fileInput.setInputFiles(filePath);
    
    // Click the upload button
    await this.page.getByRole('button', { name: 'Upload Database' }).click();
    
    // Wait for upload to complete
    await this.waitForNetworkIdle();
  }

  /**
   * Get the upload status message
   */
  async getUploadStatus() {
    return await this.getStatusText('uploadStatus');
  }

  /**
   * Check if upload was successful
   */
  async isUploadSuccessful() {
    const status = await this.getUploadStatus();
    return status.includes('successfully');
  }

  // ==================== System Status ====================

  /**
   * Get the database status text
   */
  async getDatabaseStatus() {
    return await this.page.locator('#dbStatus').textContent();
  }

  /**
   * Get the weekly options status text
   */
  async getOptionsStatus() {
    return await this.page.locator('#optionsStatus').textContent();
  }

  /**
   * Get the votes status text
   */
  async getVotesStatus() {
    return await this.page.locator('#votesStatus').textContent();
  }

  /**
   * Get the meal plan status text
   */
  async getPlanStatus() {
    return await this.page.locator('#planStatus').textContent();
  }

  /**
   * Get all system status as an object
   */
  async getSystemStatus() {
    return {
      database: await this.getDatabaseStatus(),
      options: await this.getOptionsStatus(),
      votes: await this.getVotesStatus(),
      plan: await this.getPlanStatus()
    };
  }

  // ==================== Vote Results ====================

  /**
   * Click the Show Vote Charts button
   */
  async showVoteResults() {
    await this.page.getByRole('button', { name: 'Show Vote Charts' }).click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get the vote results status message
   */
  async getVoteResultsStatus() {
    return await this.getStatusText('voteResultsStatus');
  }

  /**
   * Get chart data for a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async getChartData(category) {
    const chartId = `${category}Chart`;
    const chartBars = this.page.locator(`#${chartId} .chart-bar`);
    const count = await chartBars.count();
    
    const data = [];
    for (let i = 0; i < count; i++) {
      const bar = chartBars.nth(i);
      const label = await bar.locator('.chart-bar-label').textContent();
      const value = await bar.locator('.chart-bar-value').textContent();
      data.push({ label, value: parseInt(value) });
    }
    
    return data;
  }

  // ==================== Final Meal Plan ====================

  /**
   * Select a meal for a specific day
   * @param {string} day - 'monday', 'tuesday', 'wednesday', or 'thursday'
   * @param {string} mealName - The meal name to select
   */
  async selectMealForDay(day, mealName) {
    const selectId = `${day}Select`;
    const select = this.page.getByLabel(new RegExp(day, 'i'));
    await select.selectOption({ label: mealName });
  }

  /**
   * Select Monday (Meat) meal
   */
  async selectMondayMeal(mealName) {
    await this.page.getByLabel('Monday (Meat):').selectOption({ label: mealName });
  }

  /**
   * Select Tuesday (Fish) meal
   */
  async selectTuesdayMeal(mealName) {
    await this.page.getByLabel('Tuesday (Fish):').selectOption({ label: mealName });
  }

  /**
   * Select Wednesday (Vegetarian) meal
   */
  async selectWednesdayMeal(mealName) {
    await this.page.getByLabel('Wednesday (Vegetarian):').selectOption({ label: mealName });
  }

  /**
   * Select Thursday (Vegetarian) meal
   */
  async selectThursdayMeal(mealName) {
    await this.page.getByLabel('Thursday (Vegetarian):').selectOption({ label: mealName });
  }

  /**
   * Save the final meal plan
   */
  async saveFinalPlan() {
    await this.page.getByRole('button', { name: 'Save Final Meal Plan' }).click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get the final plan status message
   */
  async getFinalPlanStatus() {
    return await this.getStatusText('finalPlanStatus');
  }

  /**
   * Get the displayed meal plan
   */
  async getMealPlanDisplay() {
    const result = this.page.locator('#mealPlanResult');
    const days = {};
    
    const dayDivs = result.locator('.meal-plan-day');
    const count = await dayDivs.count();
    
    for (let i = 0; i < count; i++) {
      const dayDiv = dayDivs.nth(i);
      const dayName = await dayDiv.locator('.day-name').textContent();
      const mealName = await dayDiv.locator('.meal-name').textContent();
      days[dayName.toLowerCase()] = mealName;
    }
    
    return days;
  }

  // ==================== System Reset ====================

  /**
   * Click the reset system button (does NOT confirm the dialog)
   */
  async clickResetSystem() {
    await this.page.getByRole('button', { name: 'Reset System' }).click();
  }

  /**
   * Reset the system (confirms the dialog)
   */
  async resetSystem() {
    // Set up dialog handler before clicking
    this.page.once('dialog', async dialog => {
      await dialog.accept();
    });
    
    await this.clickResetSystem();
    await this.waitForNetworkIdle();
  }

  /**
   * Cancel system reset (dismisses the dialog)
   */
  async cancelResetSystem() {
    this.page.once('dialog', async dialog => {
      await dialog.dismiss();
    });
    
    await this.clickResetSystem();
  }

  /**
   * Get the reset status message
   */
  async getResetStatus() {
    return await this.getStatusText('resetStatus');
  }
}

module.exports = { AdminPage };
