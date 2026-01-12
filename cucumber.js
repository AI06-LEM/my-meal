/**
 * Cucumber.js Configuration
 * 
 * This file configures how Cucumber runs tests.
 * It is automatically detected by cucumber-js.
 * 
 * For more options, see: https://github.com/cucumber/cucumber-js/blob/main/docs/configuration.md
 */

module.exports = {
  default: {
    // Where to find feature files
    paths: ['tests/features/**/*.feature'],
    
    // Where to find step definitions and support files
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    
    // Output format
    format: [
      'progress-bar',                           // Show progress bar during execution
      'html:tests/reports/cucumber-report.html', // Generate HTML report
      'json:tests/reports/cucumber-report.json'  // Generate JSON report for CI
    ],
    
    // Fail fast on first failure (set to true for CI)
    failFast: false,
    
    // Publish reports (disabled by default for privacy)
    publishQuiet: true,
    
    // Default timeout for steps (in milliseconds)
    // Increase this if tests are timing out
    // Can be overridden per-step with setDefaultTimeout()
  },
  
  // Profile for running only smoke tests (quick sanity check)
  smoke: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    tags: '@smoke',
    format: ['progress-bar'],
    publishQuiet: true
  },
  
  // Profile for running only happy-path tests
  happy: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    tags: '@happy-path',
    format: ['progress-bar'],
    publishQuiet: true
  },
  
  // Profile for running tests with visible browser (debugging)
  debug: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    format: ['progress-bar'],
    publishQuiet: true,
    // Note: Set HEADLESS=false when running this profile
  },
  
  // Profile for Work-In-Progress tests
  wip: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    tags: '@wip',
    format: ['progress-bar'],
    publishQuiet: true
  },
  
  // Profile for running guest voting tests only
  guest: {
    paths: ['tests/features/guest-voting.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    format: ['progress-bar'],
    publishQuiet: true
  },
  
  // Profile for running admin tests only
  admin: {
    paths: ['tests/features/admin-upload.feature', 'tests/features/system-reset.feature', 'tests/features/meal-plan.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    format: ['progress-bar'],
    publishQuiet: true
  },
  
  // Profile for CI/CD pipelines
  ci: {
    paths: ['tests/features/**/*.feature'],
    require: [
      'tests/step-definitions/**/*.js',
      'tests/support/**/*.js'
    ],
    format: [
      'progress',
      'json:tests/reports/cucumber-report.json'
    ],
    failFast: true,
    publishQuiet: true
  }
};
