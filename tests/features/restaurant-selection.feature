# Feature: Restaurant - Weekly Options Selection
# Tests for the restaurant's ability to select weekly meal options.

@restaurant
Feature: Restaurant Weekly Options Selection
  As a restaurant staff member
  I want to select meal options for the week
  So that guests can vote on their preferences

  Background:
    Given I reset the system
    And I upload the meal database
    And I am on the restaurant tab

  # ====================
  # Happy Path Scenarios
  # ====================

  @happy-path
  Scenario: Restaurant can view available meal options
    Then meal options should be displayed
    # TODO: Fix step definition
    # And I should see meal options from the database

  @happy-path
  Scenario: Restaurant selects a complete set of weekly options
    When I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Risotto" as a vegetarian option
    And I save the weekly options
    Then the weekly options should be saved successfully

  # ====================
  # Selection Behavior
  # ====================

  @selection
  Scenario: Restaurant can select multiple vegetarian options
    When I select "Risotto" as a vegetarian option
    And I select "Curry" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    Then the restaurant should have 3 vegetarian options selected

  @selection
  Scenario: Restaurant can deselect a meal option
    When I select "Burger" as a meat option
    And I deselect "Burger"
    Then "Burger" should not be selected
    And the restaurant should have 0 meat options selected

  @selection
  Scenario: Selected options persist after saving
    When I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Risotto" as a vegetarian option
    And I save the weekly options
    Then "Burger" should be selected
    And "Pasta" should be selected

  @incomplete_selection
  Scenario: Restaurant cannot save incomplete weekly options
    # Required: at least 2 meat, 2 fish, and 4 vegetarian combinations
    When I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I save the weekly options
    Then I should see an error message


  # ====================
  # Persistence
  # ====================

  @persistence
  Scenario: Weekly options persist across page refresh
    Given I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Risotto" as a vegetarian option
    And I save the weekly options
    When I refresh the page
    And I go to the "Restaurant" tab
    Then "Burger" should be selected
    And "Pasta" should be selected
