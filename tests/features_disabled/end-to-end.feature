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
  # Multiple Voters
  # ====================

  @multiple-voters
  Scenario: Multiple guests can vote and results are aggregated
    # Setup
    # TODO: fix BUG: In step definition, restaurant does not select correct options (only four meal combinations chosen)
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
    Then the system status should show 2 votes

  # ====================
  # New Week Workflow
  # ====================

  @new-week
  Scenario: Starting a new week by resetting and reconfiguring
    # Setup existing week
    # TODO: fix BUG: In step definition, restaurant does not select correct options (only four meal combinations chosen)
    Given the restaurant has selected weekly options
    And "ExistingVoter" has already voted
    And I am on the admin tab

    # Verify current state
    Then the system status should show options as "Set"
    And the system status should show 1 votes

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

