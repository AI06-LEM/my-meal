# tests/features/system-reset.feature
#
# Feature: System Reset
# Tests for the system reset functionality.
#
# This feature demonstrates:
# - Dialog handling (confirm/cancel)
# - State cleanup verification
# - Potentially destructive operations

@reset @admin
Feature: System Reset
  As a system admin
  I want to reset the system
  So that I can start fresh with new weekly options

  Background:
    Given the restaurant has selected weekly options
    And "ResetTestVoter" has already voted
    And I am on the admin tab

  # ====================
  # Happy Path
  # ====================

  @happy-path
  Scenario: Admin confirms system reset
    When I reset the system
    Then the system should be reset
    And the weekly options should be cleared
    And the votes should be cleared
    And the meal plan should be cleared

  # ====================
  # Cancel Behavior
  # ====================

  @cancel
  Scenario: Admin cancels system reset
    When I click reset system but cancel
    Then I should not see "reset successfully"
    # Data should be preserved
    And the system status should show options as "Set"

  # ====================
  # State After Reset
  # ====================

  @state
  Scenario: Database remains after reset
    When I reset the system
    Then the database status should show "Loaded"
    # Only the database is preserved; weekly options, votes, and plan are cleared
    And the system status should show options as "Not set"

  @state
  Scenario: Restaurant can set new weekly options after reset
    When I reset the system
    And I go to the "Restaurant" tab
    And I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I save the weekly options
    Then the weekly options should be saved successfully

  # ====================
  # Vote Count Reset
  # ====================

  @votes
  Scenario: Vote count shows zero after reset
    Given the system status should show 1 vote(s)
    When I reset the system
    Then the system status should show votes as "No votes"

  @votes
  Scenario: Guest can vote again after reset
    When I reset the system
    # Set up weekly options again
    And I go to the "Restaurant" tab
    And I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Mushroom Risotto" as a vegetarian option
    And I select "Vegetable Risotto" as a vegetarian option
    And I save the weekly options
    And I go to the "Guests" tab
    And I enter my name as "ResetTestVoter"
    And I select 1 meat option
    And I select 1 fish option
    And I select 2 vegetarian options
    And I submit my vote
    Then my vote should be recorded
