/**
 * Cucumber World Configuration for Playwright
 * 
 * This file sets up the Playwright browser context that is shared across all step definitions.
 * The "World" in Cucumber is an isolated context that holds state for each scenario.
 * 
 * Key concepts:
 * - Each scenario gets a fresh World instance
 * - this.page provides the Playwright Page object for browser interactions
 * - this.context provides the BrowserContext for advanced scenarios
 * - this.testData can store shared data between steps within a scenario
 */

const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const config = require('../config');

/**
 * Custom World class that provides Playwright browser access to all step definitions.
 * 
 * Usage in step definitions:
 *   When('I click the button', async function() {
 *     await this.page.getByRole('button').click();
 *   });
 */
class PlaywrightWorld extends World {
  constructor(options) {
    super(options);
    
    // Shared test data storage for passing data between steps
    this.testData = {};
    
    // Base URL for the application (loaded from centralized config)
    this.baseUrl = config.BASE_URL;
  }

  /**
   * Initialize browser and page - called by hooks before each scenario
   */
  async init() {
    // Launch browser
    // headless: false shows the browser window (useful for debugging)
    // Use HEADLESS=false npm run test:features to see the browser
    this.browser = await chromium.launch({ 
      headless: config.HEADLESS,
      slowMo: config.SLOW_MO
    });
    
    // Create a new browser context
    this.context = await this.browser.newContext({
      viewport: config.VIEWPORT,
      // Record video for debugging (optional)
      // recordVideo: { dir: 'tests/videos/' }
    });
    
    // Create a new page
    this.page = await this.context.newPage();
  }

  /**
   * Navigate to the application
   */
  async navigate(path = '/') {
    const url = `${this.baseUrl}${path}`;
    await this.page.goto(url);
    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clean up browser resources - called by hooks after each scenario
   */
  async cleanup() {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  /**
   * Take a screenshot (useful for debugging failed tests)
   */
  async screenshot(name) {
    if (this.page) {
      await this.page.screenshot({ path: `tests/screenshots/${name}.png` });
    }
  }
}

setWorldConstructor(PlaywrightWorld);

module.exports = { PlaywrightWorld };
