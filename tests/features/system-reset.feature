# Feature: System Reset
# Tests for the system reset functionality.

@reset @admin
Feature: System Reset
  As a system admin
  I want to reset the system
  So that I can start fresh with new weekly options

  Background:
    Given the restaurant has selected weekly options with:
      | category    | meal                |
      | meat        | Burger              |
      | meat        | Meatballs           |
      | fish        | Fish and Chips      |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    And "ResetTestVoter" has already voted with:
      | category    | meal                |
      | meat        | Meatballs           |
      | fish        | Pasta               |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
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
    # Meal plan is obsolete for now
    # And the meal plan should be cleared

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
    # TODO: Ensure first that a SQLite DB file exists
    Then the database status should show "Loaded"
    # Only the database is preserved; weekly options are cleared (vote count reset tested separately)
    And the system status should show options as "Not set"

  # ====================
  # Vote Count Reset
  # ====================

  @votes
  Scenario: Vote count shows zero after reset
    Given the system status should show 1 votes
    When I reset the system
    Then the system status should show votes as "No votes"

  @votes
  # Redundant test?
  Scenario: Guest can vote again after reset
    When I reset the system
    # Set up weekly options again
    And I go to the "Restaurant" tab
    And I select "Burger" as a meat option
    And I select "Pasta" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Lasagna" as a vegetarian option
    And I save the weekly options
    And I go to the "Guests" tab
    And I enter my name as "ResetTestVoter"
    And I select 1 meat options
    And I select 1 fish options
    And I select 2 vegetarian options
    And I submit my vote
    Then my vote should be recorded
