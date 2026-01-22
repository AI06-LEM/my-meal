/**
 * RestaurantPage - Page Object for Restaurant Tab
 * 
 * Encapsulates all interactions with the Restaurant interface:
 * - Viewing available meals from the database
 * - Selecting weekly meal options (meat, fish, vegetarian)
 * - Saving weekly options
 * 
 * Selector Strategy: Uses semantic selectors where possible.
 * Falls back to data attributes for dynamically generated meal cards.
 */

const { BasePage } = require('./BasePage');

class RestaurantPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ==================== Navigation ====================

  /**
   * Navigate to Restaurant tab and wait for it to be ready
   */
  async navigate() {
    await this.goToRestaurantTab();
  }

  // ==================== Meal Selection ====================

  /**
   * Get all meal cards in a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  getMealCards(category) {
    const containerId = `${category}Options`;
    return this.page.locator(`#${containerId} .meal-card`);
  }

  /**
   * Get meal card by name
   * @param {string} mealName - The name of the meal
   */
  getMealCardByName(mealName) {
    return this.page.locator('.meal-card').filter({ hasText: mealName });
  }

  /**
   * Select a meal option by clicking on its card
   * @param {string} mealName - The name of the meal to select
   */
  async selectMeal(mealName) {
    const card = this.getMealCardByName(mealName);
    await card.click();
  }

  /**
   * Deselect a meal option
   * @param {string} mealName - The name of the meal to deselect
   */
  async deselectMeal(mealName) {
    const card = this.getMealCardByName(mealName);
    if (await card.locator('.selected').count() > 0 || await card.evaluate(el => el.classList.contains('selected'))) {
      await card.click();
    }
  }

  /**
   * Check if a meal is selected
   * @param {string} mealName - The name of the meal to check
   */
  async isMealSelected(mealName) {
    const card = this.getMealCardByName(mealName);
    return await card.evaluate(el => el.classList.contains('selected'));
  }

  /**
   * Select a meat option by name
   * @param {string} mealName - Meat combo name (e.g., "Burger Combo")
   */
  async selectMeatOption(mealName) {
    // Validate that the option exists
    const available = await this.getMeatOptions();
    const availableNames = available.map(opt => opt.name);
    
    if (!availableNames.some(name => name.includes(mealName))) {
      throw new Error(
        `Cannot select meat option "${mealName}" - not found in database. ` +
        `Available options: ${availableNames.join(', ')}`
      );
    }
    
    const meatSection = this.page.locator('#meatOptions');
    const card = meatSection.locator('.meal-card').filter({ hasText: mealName });
    await card.click();
  }

  /**
   * Select a fish option by name
   * @param {string} mealName - Fish combo name (e.g., "Pasta Combo")
   */
  async selectFishOption(mealName) {
    // Validate that the option exists
    const available = await this.getFishOptions();
    const availableNames = available.map(opt => opt.name);
    
    if (!availableNames.some(name => name.includes(mealName))) {
      throw new Error(
        `Cannot select fish option "${mealName}" - not found in database. ` +
        `Available options: ${availableNames.join(', ')}`
      );
    }
    
    const fishSection = this.page.locator('#fishOptions');
    const card = fishSection.locator('.meal-card').filter({ hasText: mealName });
    await card.click();
  }

  /**
   * Select a vegetarian option by name
   * @param {string} mealName - Vegetarian meal or combo name
   */
  async selectVegetarianOption(mealName) {
    // Validate that the option exists
    const available = await this.getVegetarianOptions();
    const availableNames = available.map(opt => opt.name);
    
    if (!availableNames.some(name => name.includes(mealName))) {
      throw new Error(
        `Cannot select vegetarian option "${mealName}" - not found in database. ` +
        `Available options: ${availableNames.join(', ')}`
      );
    }
    
    const vegSection = this.page.locator('#vegetarianOptions');
    const card = vegSection.locator('.meal-card').filter({ hasText: mealName });
    await card.click();
  }

  /**
   * Get all available meat options
   */
  async getMeatOptions() {
    const cards = this.getMealCards('meat');
    const count = await cards.count();
    const options = [];
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const name = await card.locator('h5').textContent();
      const isSelected = await card.evaluate(el => el.classList.contains('selected'));
      options.push({ name, isSelected });
    }
    
    return options;
  }

  /**
   * Get all available fish options
   */
  async getFishOptions() {
    const cards = this.getMealCards('fish');
    const count = await cards.count();
    const options = [];
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const name = await card.locator('h5').textContent();
      const isSelected = await card.evaluate(el => el.classList.contains('selected'));
      options.push({ name, isSelected });
    }
    
    return options;
  }

  /**
   * Get all available vegetarian options
   */
  async getVegetarianOptions() {
    const cards = this.getMealCards('vegetarian');
    const count = await cards.count();
    const options = [];
    
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const name = await card.locator('h5').textContent();
      const isSelected = await card.evaluate(el => el.classList.contains('selected'));
      options.push({ name, isSelected });
    }
    
    return options;
  }

  /**
   * Get count of selected options in a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async getSelectedCount(category) {
    const containerId = `${category}Options`;
    const selected = this.page.locator(`#${containerId} .meal-card.selected`);
    return await selected.count();
  }

  // ==================== Save Options ====================

  /**
   * Save the weekly options
   */
  async saveWeeklyOptions() {
    await this.page.getByRole('button', { name: 'Save Weekly Options' }).click();
    
    // Wait for the status message to appear with actual content
    await this.page.locator('#saveStatus:not(:empty)').waitFor({ 
      state: 'visible',
      timeout: 10000
    });
  }

  /**
   * Get the save status message
   */
  async getSaveStatus() {
    return await this.getStatusText('saveStatus');
  }

  /**
   * Check if save was successful
   */
  async isSaveSuccessful() {
    const statusElement = this.page.locator('#saveStatus');
    
    // Wait for the element to be visible
    await statusElement.waitFor({ state: 'visible', timeout: 5000 });
    
    const status = await statusElement.textContent();
    return status.includes('successfully');
  }

  // ==================== Helper Methods ====================

  /**
   * Select a complete set of weekly options
   * @param {Object} options - { meat: string, fish: string, vegetarian: string[] }
   */
  async selectWeeklyOptions(options) {
    if (options.meat) {
      await this.selectMeatOption(options.meat);
    }
    
    if (options.fish) {
      await this.selectFishOption(options.fish);
    }
    
    if (options.vegetarian && Array.isArray(options.vegetarian)) {
      for (const veg of options.vegetarian) {
        await this.selectVegetarianOption(veg);
      }
    }
  }
}

module.exports = { RestaurantPage };
