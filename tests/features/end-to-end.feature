# tests/features/end-to-end.feature
#
# Feature: Complete End-to-End Workflow
# Tests the entire application flow from database upload to meal plan creation.
#
# This feature demonstrates:
# - Full user journey testing
# - Multi-role scenarios
# - Complex workflow orchestration

@e2e @smoke
Feature: End-to-End Workflow
  As the complete system
  I want all components to work together
  So that the weekly meal planning process succeeds

  # ====================
  # Complete Workflow
  # ====================

  @full-workflow
  Scenario: Complete meal planning workflow from start to finish
    # Step 1: Admin uploads database
    Given I am on the home page
    When I go to the "System Admin" tab
    And I upload the meal database
    Then the database should be uploaded successfully
    And the database status should show "Loaded"

    # Step 2: Restaurant selects weekly options
    When I go to the "Restaurant" tab
    Then meal options should be displayed
    When I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Mushroom Risotto" as a vegetarian option
    And I select "Vegetable Risotto" as a vegetarian option
    And I save the weekly options
    Then the weekly options should be saved successfully

    # Step 3: Guests vote for their preferences
    When I go to the "Guests" tab
    And I enter my name as "Student Alice"
    And I select meat option "Burger"
    And I select fish option "Pasta"
    And I select vegetarian option "Vegetarian Burger"
    And I select vegetarian option "Pasta Primavera"
    And I submit my vote
    Then I should see a confirmation message

    # Step 4: Admin views results and creates meal plan
    When I go to the "System Admin" tab
    Then the system status should show 1 vote(s)
    When I click show vote results
    Then I should see vote charts
    When I select "Burger" for Monday
    And I select "Pasta" for Tuesday
    And I select "Mushroom Risotto" for Wednesday
    And I select "Vegetable Risotto" for Thursday
    And I save the final meal plan
    Then the meal plan should be saved successfully
    And the weekly meal plan should be displayed

  # ====================
  # Multiple Voters
  # ====================

  @multiple-voters
  Scenario: Multiple guests can vote and results are aggregated
    # Setup
    Given the restaurant has selected weekly options

    # First voter
    When I go to the "Guests" tab
    And I enter my name as "Voter 1"
    And I select meat option "Burger"
    And I select fish option "Pasta"
    And I select vegetarian option "Vegetarian Burger"
    And I select vegetarian option "Pasta Primavera"
    And I submit my vote
    Then I should see a confirmation message

    # Second voter
    When I refresh the page
    And I go to the "Guests" tab
    And I enter my name as "Voter 2"
    And I select meat option "Burger"
    And I select fish option "Pasta"
    And I select vegetarian option "Mushroom Risotto"
    And I select vegetarian option "Vegetable Risotto"
    And I submit my vote
    Then I should see a confirmation message

    # Verify vote count
    When I go to the "System Admin" tab
    Then the system status should show 2 vote(s)

  # ====================
  # New Week Workflow
  # ====================

  @new-week
  Scenario: Starting a new week by resetting and reconfiguring
    # Setup existing week
    Given the restaurant has selected weekly options
    And "ExistingVoter" has already voted
    And I am on the admin tab

    # Verify current state
    Then the system status should show options as "Set"
    And the system status should show 1 vote(s)

    # Reset for new week
    When I reset the system
    Then the weekly options should be cleared
    And the votes should be cleared
    And the database status should show "Loaded"

    # Configure new week
    When I go to the "Restaurant" tab
    And I select "Grilled Protein" as a meat option
    And I select "Grilled Fillet" as a fish option
    And I select "Quinoa Bowl" as a vegetarian option
    And I select "Tofu Teriyaki Bowl" as a vegetarian option
    And I save the weekly options
    Then the weekly options should be saved successfully

    # Guests can vote for new options
    When I go to the "Guests" tab
    And I enter my name as "NewWeekVoter"
    And I select 1 meat option
    And I select 1 fish option
    And I select 2 vegetarian options
    And I submit my vote
    Then I should see a confirmation message

  # ====================
  # Smoke Test (Quick Sanity Check)
  # ====================

  @smoke @quick
  Scenario: Quick sanity check - all tabs accessible
    Given I am on the home page
    When I go to the "System Admin" tab
    Then I should see the heading "System Administration"
    When I go to the "Restaurant" tab
    Then I should see the heading "Restaurant - Weekly Options"
    When I go to the "Guests" tab
    Then I should see the heading "Guest Voting"
