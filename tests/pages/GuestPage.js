/**
 * GuestPage - Page Object for Guest Voting Tab
 * 
 * Encapsulates all interactions with the Guest voting interface:
 * - Entering guest name
 * - Selecting meal preferences (meat, fish, vegetarian)
 * - Submitting votes
 * - Viewing vote status
 * 
 * Selector Strategy: Uses semantic selectors (getByLabel, getByRole) as primary.
 * Falls back to locators for dynamically generated voting options.
 */

const { BasePage } = require('./BasePage');

class GuestPage extends BasePage {
  constructor(page) {
    super(page);
  }

  // ==================== Navigation ====================

  /**
   * Navigate to Guests tab and wait for it to be ready
   */
  async navigate() {
    await this.goToGuestsTab();
  }

  // ==================== Name Entry ====================

  /**
   * Get the name input field
   */
  get nameInput() {
    return this.page.getByLabel('Your Name:');
  }

  /**
   * Enter the guest's name
   * @param {string} name - The guest's name
   */
  async enterName(name) {
    await this.nameInput.fill(name);
  }

  /**
   * Get the current value in the name field
   */
  async getName() {
    return await this.nameInput.inputValue();
  }

  /**
   * Clear the name field
   */
  async clearName() {
    await this.nameInput.clear();
  }

  // ==================== Meal Selection ====================

  /**
   * Get all voting options in a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  getVotingOptions(category) {
    const containerId = `${category}Voting`;
    return this.page.locator(`#${containerId} .vote-option`);
  }

  /**
   * Select a meat option by name (radio button)
   * @param {string} optionName - The meat option to select
   */
  async selectMeatOption(optionName) {
    const meatSection = this.page.locator('#meatVoting');
    const option = meatSection.locator('.vote-option').filter({ hasText: optionName });
    await option.click();
  }

  /**
   * Select a fish option by name (radio button)
   * @param {string} optionName - The fish option to select
   */
  async selectFishOption(optionName) {
    const fishSection = this.page.locator('#fishVoting');
    const option = fishSection.locator('.vote-option').filter({ hasText: optionName });
    await option.click();
  }

  /**
   * Select a vegetarian option by name (checkbox)
   * @param {string} optionName - The vegetarian option to select
   */
  async selectVegetarianOption(optionName) {
    const vegSection = this.page.locator('#vegetarianVoting');
    const option = vegSection.locator('.vote-option').filter({ hasText: optionName });
    
    // Check if already selected to avoid toggling off
    const isSelected = await option.evaluate(el => el.classList.contains('selected'));
    if (!isSelected) {
      await option.click();
    }
  }

  /**
   * Deselect a vegetarian option by name
   * @param {string} optionName - The vegetarian option to deselect
   */
  async deselectVegetarianOption(optionName) {
    const vegSection = this.page.locator('#vegetarianVoting');
    const option = vegSection.locator('.vote-option').filter({ hasText: optionName });
    
    const isSelected = await option.evaluate(el => el.classList.contains('selected'));
    if (isSelected) {
      await option.click();
    }
  }

  /**
   * Check if a voting option is selected
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   * @param {string} optionName - The option name to check
   */
  async isOptionSelected(category, optionName) {
    const containerId = `${category}Voting`;
    const option = this.page.locator(`#${containerId} .vote-option`)
      .filter({ hasText: optionName });
    return await option.evaluate(el => el.classList.contains('selected'));
  }

  /**
   * Select meat options by count (first N available)
   * @param {number} count - Number of meat options to select (should be 1)
   */
  async selectMeatOptions(count) {
    const options = this.getVotingOptions('meat');
    const available = await options.count();
    const toSelect = Math.min(count, available);
    
    for (let i = 0; i < toSelect; i++) {
      await options.nth(i).click();
    }
  }

  /**
   * Select fish options by count (first N available)
   * @param {number} count - Number of fish options to select (should be 1)
   */
  async selectFishOptions(count) {
    const options = this.getVotingOptions('fish');
    const available = await options.count();
    const toSelect = Math.min(count, available);
    
    for (let i = 0; i < toSelect; i++) {
      await options.nth(i).click();
    }
  }

  /**
   * Select vegetarian options by count (first N available)
   * @param {number} count - Number of vegetarian options to select (should be 2)
   */
  async selectVegetarianOptions(count) {
    const options = this.getVotingOptions('vegetarian');
    const available = await options.count();
    const toSelect = Math.min(count, available);
    
    for (let i = 0; i < toSelect; i++) {
      const option = options.nth(i);
      const isSelected = await option.evaluate(el => el.classList.contains('selected'));
      if (!isSelected) {
        await option.click();
      }
    }
  }

  /**
   * Get count of selected options in a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async getSelectedCount(category) {
    const containerId = `${category}Voting`;
    const selected = this.page.locator(`#${containerId} .vote-option.selected`);
    return await selected.count();
  }

  /**
   * Get all available options in a category
   * @param {string} category - 'meat', 'fish', or 'vegetarian'
   */
  async getAvailableOptions(category) {
    const options = this.getVotingOptions(category);
    const count = await options.count();
    const result = [];
    
    for (let i = 0; i < count; i++) {
      const option = options.nth(i);
      const text = await option.locator('label').textContent();
      const isSelected = await option.evaluate(el => el.classList.contains('selected'));
      result.push({ text: text.trim(), isSelected });
    }
    
    return result;
  }

  // ==================== Vote Submission ====================

  /**
   * Get the submit button
   */
  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit Vote' });
  }

  /**
   * Submit the vote
   */
  async submitVote() {
    await this.submitButton.click();
    await this.waitForNetworkIdle();
  }

  /**
   * Get the vote status message
   */
  async getVoteStatus() {
    return await this.getStatusText('voteStatus');
  }

  /**
   * Check if vote was successful
   */
  async isVoteSuccessful() {
    const status = await this.getVoteStatus();
    return status.includes('successfully');
  }

  /**
   * Check if an error message is displayed
   */
  async hasErrorMessage() {
    const status = this.page.locator('#voteStatus .error');
    return await status.isVisible();
  }

  /**
   * Get the error message text
   */
  async getErrorMessage() {
    const status = this.page.locator('#voteStatus .error');
    if (await status.isVisible()) {
      return await status.textContent();
    }
    return null;
  }

  // ==================== Complete Vote Workflow ====================

  /**
   * Complete a full vote with all required selections
   * @param {Object} vote - { name, meat, fish, vegetarian: [veg1, veg2] }
   */
  async completeVote(vote) {
    await this.enterName(vote.name);
    
    if (vote.meat) {
      await this.selectMeatOption(vote.meat);
    }
    
    if (vote.fish) {
      await this.selectFishOption(vote.fish);
    }
    
    if (vote.vegetarian && Array.isArray(vote.vegetarian)) {
      for (const veg of vote.vegetarian) {
        await this.selectVegetarianOption(veg);
      }
    }
    
    await this.submitVote();
  }

  /**
   * Check if the voting form is available (weekly options have been set)
   */
  async isVotingFormAvailable() {
    const meatOptions = await this.getVotingOptions('meat').count();
    return meatOptions > 0;
  }
}

module.exports = { GuestPage };
