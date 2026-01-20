/**
 * BasePage - Foundation for all Page Objects
 * 
 * This class provides:
 * - Common navigation methods (tab switching)
 * - Shared utilities (waiting, status messages)
 * - Base selectors used across all pages
 * 
 * All page objects inherit from this class to share common functionality.
 * 
 * Selector Strategy:
 * - Primary: Semantic selectors (getByRole, getByLabel)
 * - Fallback: data-testid for non-semantic elements
 * - Avoid: CSS classes, DOM hierarchy selectors
 */

class BasePage {
  constructor(page) {
    this.page = page;
  }

  // ==================== Tab Navigation ====================
  
  /**
   * Navigate to the System Admin tab
   */
  async goToAdminTab() {
    await this.page.getByRole('button', { name: 'System Admin' }).click();
    // Wait for tab content to be visible
    await this.page.locator('#admin.active').waitFor({ state: 'visible' });
  }

  /**
   * Navigate to the Restaurant tab
   */
  async goToRestaurantTab() {
    await this.page.getByRole('button', { name: 'Restaurant' }).click();
    await this.page.locator('#restaurant.active').waitFor({ state: 'visible' });
  }

  /**
   * Navigate to the Guests tab
   */
  async goToGuestsTab() {
    await this.page.getByRole('button', { name: 'Guests' }).click();
    await this.page.locator('#guests.active').waitFor({ state: 'visible' });
  }

  /**
   * Generic tab navigation by name
   * @param {string} tabName - 'System Admin', 'Restaurant', or 'Guests'
   */
  async goToTab(tabName) {
    await this.page.getByRole('button', { name: tabName }).click();
    // Wait for the page to stabilize
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== Common Utilities ====================

  /**
   * Wait for a status message to appear
   * @param {string} expectedText - Text to wait for in status message
   * @param {string} type - 'success' or 'error'
   */
  async waitForStatus(expectedText, type = 'success') {
    const statusLocator = this.page.locator(`[role="alert"] .${type}`);
    await statusLocator.filter({ hasText: expectedText }).waitFor({ state: 'visible' });
  }

  /**
   * Get the text content of a status message
   * @param {string} statusElementId - ID of the status element (e.g., 'uploadStatus')
   */
  async getStatusText(statusElementId) {
    const element = this.page.locator(`#${statusElementId}`);
    return await element.textContent();
  }

  /**
   * Check if an element is visible
   * @param {string} text - Text content to look for
   */
  async isTextVisible(text) {
    return await this.page.getByText(text).isVisible();
  }

  /**
   * Wait for network requests to complete
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== Header/Footer Elements ====================

  /**
   * Get the main page title
   */
  get pageTitle() {
    return this.page.getByRole('heading', { level: 1 });
  }

  /**
   * Get the current tab heading
   */
  async getCurrentTabHeading() {
    const activeTab = this.page.locator('.tab-content.active h2');
    return await activeTab.textContent();
  }
}

module.exports = { BasePage };
