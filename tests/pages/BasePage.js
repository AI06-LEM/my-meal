/**
 * BasePage - Foundation for all Page Objects
 * 
 * This class provides:
 * - Common navigation methods (between apps and tabs)
 * - Shared utilities (waiting, status messages)
 * - Base selectors used across all pages
 * 
 * All page objects inherit from this class to share common functionality.
 * 
 * Application Structure:
 * - Landing page at /
 * - Admin app at /admin/ (with System Admin and Restaurant tabs)
 * - Guest app at /guest/
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

  // ==================== App Navigation ====================

  /**
   * Navigate to the landing page
   */
  async goToLandingPage() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to the Admin app
   */
  async goToAdminApp() {
    await this.page.goto('/admin/');
    await this.page.waitForLoadState('networkidle');
    // Wait for admin tab to be visible
    await this.page.locator('#admin.active').waitFor({ state: 'visible' });
  }

  /**
   * Navigate to the Guest app
   */
  async goToGuestApp() {
    await this.page.goto('/guest/');
    await this.page.waitForLoadState('networkidle');
  }

  // ==================== Tab Navigation (Admin App Only) ====================
  
  /**
   * Navigate to the System Admin tab (within Admin app)
   */
  async goToAdminTab() {
    // If not on admin app, navigate there first
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/')) {
      await this.goToAdminApp();
    }
    await this.page.getByRole('button', { name: 'System Admin' }).click();
    // Wait for tab content to be visible
    await this.page.locator('#admin.active').waitFor({ state: 'visible' });
  }

  /**
   * Navigate to the Restaurant tab (within Admin app)
   */
  async goToRestaurantTab() {
    // If not on admin app, navigate there first
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/admin/')) {
      await this.goToAdminApp();
    }
    await this.page.getByRole('button', { name: 'Restaurant' }).click();
    await this.page.locator('#restaurant.active').waitFor({ state: 'visible' });
  }

  /**
   * Navigate to the Guests app (separate app, not a tab)
   * @deprecated Use goToGuestApp() instead - keeping for backward compatibility
   */
  async goToGuestsTab() {
    await this.goToGuestApp();
  }

  /**
   * Generic tab/app navigation by name
   * Handles both legacy tab names and new app structure
   * @param {string} tabName - 'System Admin', 'Restaurant', or 'Guests'
   */
  async goToTab(tabName) {
    if (tabName === 'Guests') {
      // Guests is now a separate app
      await this.goToGuestApp();
    } else if (tabName === 'System Admin' || tabName === 'Restaurant') {
      // These are tabs within the Admin app
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/admin/')) {
        await this.goToAdminApp();
      }
      await this.page.getByRole('button', { name: tabName }).click();
      // Wait for the page to stabilize
      await this.page.waitForLoadState('networkidle');
    } else {
      throw new Error(`Unknown tab/app name: ${tabName}`);
    }
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
   * Get the current tab heading (for Admin app)
   */
  async getCurrentTabHeading() {
    const activeTab = this.page.locator('.tab-content.active h2');
    return await activeTab.textContent();
  }

  /**
   * Get the current page heading (works for both apps)
   */
  async getCurrentHeading() {
    // First try active tab content (Admin app)
    const activeTab = this.page.locator('.tab-content.active h2');
    if (await activeTab.count() > 0) {
      return await activeTab.textContent();
    }
    // Otherwise get main heading (Guest app or landing page)
    const mainHeading = this.page.locator('main h2, header h1').first();
    return await mainHeading.textContent();
  }
}

module.exports = { BasePage };
