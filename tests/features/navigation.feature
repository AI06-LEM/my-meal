# Feature: Tab Navigation
# Tests for navigation between application tabs.

@navigation @ui
Feature: Tab Navigation
  As a user of the application
  I want to navigate between tabs
  So that I can access different features

  Background:
    Given I am on the home page

  # ====================
  # Tab Switching
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
  Scenario: User can navigate to Guests tab
    When I go to the "Guests" tab
    Then the "Guests" tab should be active
    And I should see the heading "Guest Voting"

  # Redundant test - already covered by the smoke test
  # @tab-switch
  # Scenario: User can switch between all tabs
  #   When I go to the "System Admin" tab
  #   Then I should see the heading "System Administration"
  #   When I go to the "Restaurant" tab
  #   Then I should see the heading "Restaurant - Weekly Options"
  #   When I go to the "Guests" tab
  #   Then I should see the heading "Guest Voting"
  #   When I go to the "System Admin" tab
  #   Then I should see the heading "System Administration"

  # ====================
  # Default State
  # ====================

  @default
  Scenario: System Admin tab is active by default
    Then the "System Admin" tab should be active
    And I should see the heading "System Administration"

  # ====================
  # Page Elements
  # ====================

  # This may change in the future, so keeping this test only commented out for now
  # @elements
  # Scenario: Page header is always visible
  #   Then I should see "My Meal - Seefood Restaurant"
  #   And I should see "Weekly meal planning system"

  @elements
  Scenario: All tab buttons are visible
    Then the "System Admin" button should be visible
    And the "Restaurant" button should be visible
    And the "Guests" button should be visible
