# tests/features/meal-plan.feature
#
# Feature: Final Meal Plan Creation
# Tests for the admin's ability to create the final weekly meal plan.
#
# This feature demonstrates:
# - Multi-tab workflows
# - Data aggregation (votes to plan)
# - Complete end-to-end scenario

@meal-plan @admin
Feature: Final Meal Plan Creation
  As a system admin
  I want to create the final weekly meal plan
  So that guests know what meals will be served

  Background:
    Given the restaurant has selected weekly options

  # ====================
  # Happy Path Scenarios
  # ====================

  @happy-path
  Scenario: Admin creates and saves a complete meal plan
    Given I am on the admin tab
    When I select "Burger" for Monday
    And I select "Pasta" for Tuesday
    And I select "Vegetarian Burger" for Wednesday
    And I select "Pasta Primavera" for Thursday
    And I save the final meal plan
    Then the meal plan should be saved successfully
    And the weekly meal plan should be displayed

  @happy-path
  Scenario: Saved meal plan shows correct assignments
    Given I am on the admin tab
    When I select "Burger" for Monday
    And I select "Pasta" for Tuesday
    And I select "Mushroom Risotto" for Wednesday
    And I select "Vegetable Risotto" for Thursday
    And I save the final meal plan
    Then the meal plan should show "Burger" for "Monday"
    And the meal plan should show "Pasta" for "Tuesday"
    And the meal plan should show "Mushroom Risotto" for "Wednesday"
    And the meal plan should show "Vegetable Risotto" for "Thursday"
    And the meal plan should show "Leftovers" for "Friday"

  # ====================
  # Vote Charts
  # ====================

  @charts
  Scenario: Admin can view vote results
    # First, add some votes
    Given "Voter1" has already voted
    And I am on the admin tab
    When I click show vote results
    Then I should see vote charts

  @charts
  Scenario: Vote charts show vote counts
    Given "ChartVoter" has already voted
    And I am on the admin tab
    When I view the vote results
    Then I should see vote charts

  # ====================
  # Validation
  # ====================

  @validation
  Scenario: Admin cannot save incomplete meal plan
    Given I am on the admin tab
    When I select "Burger" for Monday
    # Missing Tuesday, Wednesday, Thursday
    And I save the final meal plan
    Then I should see an error message containing "select"

  @validation
  Scenario: Admin must select different meals for each day
    Given I am on the admin tab
    When I select "Burger" for Monday
    And I select "Pasta" for Tuesday
    And I select "Mushroom Risotto" for Wednesday
    And I select "Mushroom Risotto" for Thursday
    And I save the final meal plan
    Then I should see an error message containing "different"

  # ====================
  # Persistence
  # ====================

  @persistence
  Scenario: Meal plan persists across page refresh
    Given I am on the admin tab
    When I select "Burger" for Monday
    And I select "Pasta" for Tuesday
    And I select "Mushroom Risotto" for Wednesday
    And I select "Vegetable Risotto" for Thursday
    And I save the final meal plan
    And I refresh the page
    And I go to the "System Admin" tab
    Then the weekly meal plan should be displayed
