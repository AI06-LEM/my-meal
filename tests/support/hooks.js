/**
 * Cucumber Hooks for Test Lifecycle Management
 * 
 * Hooks run at specific points in the test lifecycle:
 * - BeforeAll: Once before all scenarios (browser setup)
 * - Before: Before each scenario (page setup)
 * - After: After each scenario (cleanup, screenshots on failure)
 * - AfterAll: Once after all scenarios (browser teardown)
 * 
 * These hooks ensure clean test isolation and proper resource management.
 */

const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure screenshots directory exists
const screenshotsDir = config.SCREENSHOTS_DIR;
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

/**
 * Before each scenario:
 * - Initialize browser and page
 * - Navigate to the application
 */
Before(async function(scenario) {
  // Initialize Playwright browser and page
  await this.init();
  
  // Navigate to the application's home page
  await this.navigate('/');
  
  // Store scenario info for debugging
  this.currentScenario = {
    name: scenario.pickle.name,
    tags: scenario.pickle.tags.map(tag => tag.name)
  };
});

/**
 * Before scenarios tagged with @reset:
 * - Reset the application state via API
 */
Before({ tags: '@reset' }, async function() {
  // Reset the system before this scenario
  await this.page.request.post(`${this.baseUrl}/api/reset`);
});

/**
 * After each scenario:
 * - Take screenshot on failure (for debugging)
 * - Clean up browser resources
 */
After(async function(scenario) {
  // Take screenshot on failure
  if (scenario.result?.status === Status.FAILED) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const name = scenario.pickle.name.replace(/[^a-zA-Z0-9]/g, '_');
    const screenshotPath = path.join(screenshotsDir, `FAILED_${name}_${timestamp}.png`);
    
    try {
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error('Failed to capture screenshot:', error.message);
    }
  }
  
  // Clean up browser resources
  await this.cleanup();
});

/**
 * Tagged hooks for specific scenarios
 */

// @slow - Add delay between actions for debugging
Before({ tags: '@slow' }, function() {
  this.slowMode = true;
});

// @debug - Keep browser open on failure
Before({ tags: '@debug' }, function() {
  this.debugMode = true;
});
