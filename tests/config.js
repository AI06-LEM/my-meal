/**
 * Test Configuration
 * 
 * This file centralizes all test configuration settings including:
 * - Environment variables (BASE_URL, HEADLESS, SLOW_MO)
 * - Test data paths (TEST_DATABASE_PATH)
 * - Browser settings
 * - Test timeouts
 * 
 * Usage:
 *   const config = require('../config');
 *   console.log(config.BASE_URL);
 *   await adminPage.uploadDatabase(config.TEST_DATABASE_PATH);
 */

const path = require('path');

// ==================== Environment Configuration ====================

/**
 * Base URL for the application under test
 * Override with: BASE_URL=http://localhost:8080 npm test
 */
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Browser headless mode
 * Set to false to see the browser window during tests
 * Override with: HEADLESS=false npm test
 */
const HEADLESS = process.env.HEADLESS !== 'false';

/**
 * Slow down Playwright operations by specified milliseconds
 * Useful for debugging and watching tests execute
 * Override with: SLOW_MO=1000 npm test
 */
const SLOW_MO = process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0;

// ==================== Test Data Configuration ====================

/**
 * Path to the test meal database JSON file
 * This is the standard test database used for setting up test scenarios
 */
const TEST_DATABASE_PATH = path.join(__dirname, '..', 'meals_database_en_test.json');

// ==================== Browser Configuration ====================

/**
 * Browser viewport size for consistent test execution
 */
const VIEWPORT = {
  width: 1280,
  height: 720
};

/**
 * Default timeout for Playwright operations (in milliseconds)
 * Can be overridden per-operation as needed
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

// ==================== Test Directories ====================

/**
 * Directory paths for test artifacts
 */
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORTS_DIR = path.join(__dirname, 'reports');

// ==================== Export Configuration ====================

module.exports = {
  // Environment
  BASE_URL,
  HEADLESS,
  SLOW_MO,
  
  // Test Data
  TEST_DATABASE_PATH,
  
  // Browser
  VIEWPORT,
  DEFAULT_TIMEOUT,
  
  // Directories
  SCREENSHOTS_DIR,
  REPORTS_DIR,
};
