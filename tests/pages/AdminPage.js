/**
 * AdminPage - Page Object for System Admin Tab (within Admin App)
 * 
 * Encapsulates all interactions with the System Admin interface:
 * - Database upload
 * - System status display
 * - Vote results and charts
 * - System reset
 * 
 * Located at: /admin/ (System Admin tab)
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
   * Navigate to Admin app and System Admin tab
   */
  async navigate() {
    await this.goToAdminApp();
    // System Admin tab is active by default, but ensure it
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
    
    // Wait for the status message to appear with actual content
    // FileReader is async but not a network operation, so networkidle won't catch it
    // Wait for either success or error message to appear
    await this.page.locator('#uploadStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
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
    const statusElement = this.page.locator('#uploadStatus');
    
    // Wait for the element to be visible
    await statusElement.waitFor({ state: 'visible', timeout: 5000 });
    
    const status = await statusElement.textContent();
    return status.includes('successfully');
  }

  /**
   * Upload an invalid JSON file (for validation testing)
   */
  async uploadInvalidJson() {
    // Create a temporary invalid JSON file using a data URL approach
    const invalidJson = 'this is not valid json {{{';
    const buffer = Buffer.from(invalidJson);
    
    const fileInput = this.page.locator('#databaseFile');
    await fileInput.setInputFiles({
      name: 'invalid.json',
      mimeType: 'application/json',
      buffer: buffer
    });
    
    await this.page.getByRole('button', { name: 'Upload Database' }).click();
    
    // Wait for error message
    await this.page.locator('#uploadStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Upload a JSON file missing meal_combinations (for validation testing)
   */
  async uploadJsonMissingMealCombinations() {
    const jsonWithoutCombinations = JSON.stringify({
      meals: []
    });
    const buffer = Buffer.from(jsonWithoutCombinations);
    
    const fileInput = this.page.locator('#databaseFile');
    await fileInput.setInputFiles({
      name: 'missing_combinations.json',
      mimeType: 'application/json',
      buffer: buffer
    });
    
    await this.page.getByRole('button', { name: 'Upload Database' }).click();
    
    await this.page.locator('#uploadStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Upload a JSON file with a combination lacking vegetarian meal (for warning testing)
   */
  async uploadJsonWithoutVegetarianMeal() {
    const jsonWithNoVeg = JSON.stringify({
      meals: [],
      meal_combinations: [
        {
          name: "Test Combo",
          meals: [
            { name: "Beef Steak", category: "meat", vegan: false }
          ]
        }
      ]
    });
    const buffer = Buffer.from(jsonWithNoVeg);
    
    const fileInput = this.page.locator('#databaseFile');
    await fileInput.setInputFiles({
      name: 'no_veg.json',
      mimeType: 'application/json',
      buffer: buffer
    });
    
    await this.page.getByRole('button', { name: 'Upload Database' }).click();
    
    await this.page.locator('#uploadStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Get upload error message
   */
  async getUploadError() {
    const statusElement = this.page.locator('#uploadStatus');
    await statusElement.waitFor({ state: 'visible', timeout: 5000 });
    return await statusElement.textContent();
  }

  /**
   * Get upload warning message
   */
  async getUploadWarning() {
    // Check for warning class or text in status
    const statusElement = this.page.locator('#uploadStatus');
    await statusElement.waitFor({ state: 'visible', timeout: 5000 });
    return await statusElement.textContent();
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
   * Get all system status as an object
   */
  async getSystemStatus() {
    return {
      database: await this.getDatabaseStatus(),
      options: await this.getOptionsStatus(),
      votes: await this.getVotesStatus()
    };
  }

  // ==================== Vote Results ====================

  /**
   * Click the Show Vote Charts button
   */
  async showVoteResults() {
    await this.page.getByRole('button', { name: 'Show Vote Charts' }).click();
    
    // Wait for the status message to appear (synchronous operation but good practice)
    await this.page.locator('#voteResultsStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
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

  /**
   * Check if vote results have a category section
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async hasVoteResultCategory(category) {
    const chartContainer = this.page.locator('#voteCharts');
    // Check for category heading or chart section
    const categorySection = chartContainer.locator(`text=${category}`, { exact: false });
    return await categorySection.count() > 0;
  }

  /**
   * Check if a category shows no votes
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async categoryShowsNoVotes(category) {
    const chartContainer = this.page.locator('#voteCharts');
    // Check for "no votes" or "0 votes" text in the category section
    const noVotesText = chartContainer.locator(`text=/no votes|0 votes/i`);
    if (await noVotesText.count() > 0) {
      return true;
    }
    // Alternative: check if chart data shows all zeros
    const chartData = await this.getChartData(category);
    return chartData.length === 0 || chartData.every(item => item.value === 0);
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
    await this.page.evaluate(() => { window.confirm = () => true; });
    
    await this.clickResetSystem();
    
    // Wait for the status message to appear with actual content
    await this.page.locator('#resetStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Cancel system reset (dismisses the dialog)
   */
  async cancelResetSystem() {
    // Clear any existing status messages first (e.g., from Before hook reset)
    await this.page.locator('#resetStatus').evaluate(el => el.textContent = '');
    
    await this.page.evaluate(() => { window.confirm = () => false; });
    
    await this.clickResetSystem();
    
    // Give a brief moment to ensure no UI updates occur after cancel
    await this.page.waitForTimeout(500);
  }

  /**
   * Get the reset status message
   */
  async getResetStatus() {
    return await this.getStatusText('resetStatus');
  }
}

module.exports = { AdminPage };
