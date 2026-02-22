# Feature: Application Navigation
# Tests for navigation between the landing page and separate apps.
#
# Application Structure:
# - Landing page at /
# - Admin app at /admin/ (with System Admin and Restaurant tabs)
# - Guest app at /guest/

@navigation @ui
Feature: Application Navigation
  As a user of the application
  I want to navigate between apps and tabs
  So that I can access different features

  # ====================
  # Landing Page
  # ====================

  @landing-page
  Scenario: Landing page displays app selection options
    Given I am on the home page
    Then I should see "My Meal"
    And I should see "Restaurant Staff"
    And I should see "Guest Voting"

  @landing-page
  Scenario: User can navigate to Admin app from landing page
    Given I am on the home page
    When I click the "Restaurant Staff" link
    Then I should see the heading "System Administration"

  @landing-page
  Scenario: User can navigate to Guest app from landing page
    Given I am on the home page
    When I click the "Guest Voting" link
    Then I should see the heading "Guest Voting"

  # ====================
  # Admin App Tab Switching
  # ====================

  @tab-switch
  Scenario: User can navigate to System Admin tab
    When I go to the "System Admin" tab
    Then the "System Admin" tab should be active
    And I should see the heading "System Administration"

  @tab-switch
  Scenario: User can navigate to Restaurant tab
    When I go to the "Restaurant" tab
    Then the "Restaurant" tab should be active
    And I should see the heading "Restaurant - Weekly Options"

  @tab-switch
  Scenario: User can navigate to Guests app
    When I go to the "Guests" tab
    Then I should see the heading "Guest Voting"

  # ====================
  # Default State
  # ====================

  @default
  Scenario: System Admin tab is active by default in Admin app
    When I go to the "System Admin" tab
    Then the "System Admin" tab should be active
    And I should see the heading "System Administration"

  # ====================
  # Admin App Elements
  # ====================

  @elements
  Scenario: Admin app tab buttons are visible
    When I go to the "System Admin" tab
    Then the "System Admin" button should be visible
    And the "Restaurant" button should be visible

  # ====================
  # Cross-App Navigation
  # ====================

  @cross-app
  Scenario: User can navigate back to landing page from Admin app
    When I go to the "System Admin" tab
    And I click the "Back to Home" link
    Then I should see "Restaurant Staff"
    And I should see "Guest Voting"

  @cross-app
  Scenario: User can navigate back to landing page from Guest app
    When I go to the "Guests" tab
    And I click the "Back to Home" link
    Then I should see "Restaurant Staff"
    And I should see "Guest Voting"
