# tests/features/guest-voting.feature
#
# Feature: Guest Voting
# Tests for the guest voting workflow.
#
# This feature demonstrates:
# - Complex multi-step workflows
# - Validation error scenarios
# - Duplicate prevention
# - Tags for organizing tests (@happy-path, @validation, @regression)

@guest
Feature: Guest Voting
  As a restaurant guest
  I want to vote for my preferred meals
  So that my preferences influence the weekly meal plan

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
    And I am on the guests tab

  # ====================
  # Happy Path Scenarios
  # ====================

  @happy-path
  Scenario: Guest submits a valid vote
    When I enter my name as "Test Student"
    And I select 1 meat options
    And I select 1 fish options
    And I select 2 vegetarian options
    And I submit my vote
    Then my vote should be recorded
    And my vote should be recorded

  @happy-path
  Scenario: Guest votes for specific meal options
    When I enter my name as "Alice"
    And I select meat option "Burger"
    And I select fish option "Pasta"
    And I select vegetarian option "Lasagna"
    And I select vegetarian option "Curry"
    And I submit my vote
    Then my vote should be recorded

  @happy-path
  Scenario: Form clears after successful vote
    When I complete a full vote as "FormClearTest" with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
    Then my vote should be recorded
    And the name field should be empty

  # ====================
  # Validation Scenarios
  # ====================

  @validation
  Scenario: Guest cannot submit without entering name
    When I select 1 meat options
    And I select 1 fish options
    And I select 2 vegetarian options
    And I submit my vote
    Then I should see an error about missing name

  @validation
  Scenario: Guest cannot submit without selecting meat option
    When I enter my name as "NoMeat"
    And I select 1 fish options
    And I select 2 vegetarian options
    And I submit my vote
    Then I should see an error about missing meat option

  @validation
  Scenario: Guest cannot submit without selecting fish option
    When I enter my name as "NoFish"
    And I select 1 meat options
    And I select 2 vegetarian options
    And I submit my vote
    Then I should see an error about missing fish option

  @validation
  Scenario: Guest cannot submit with only one vegetarian option
    When I enter my name as "OnlyOneVeg"
    And I select 1 meat options
    And I select 1 fish options
    And I select 1 vegetarian options
    And I submit my vote
    Then I should see an error message containing "vegetarian"
    And no vote should be recorded

  @validation
  Scenario: Guest cannot submit with zero vegetarian options
    When I enter my name as "NoVeg"
    And I select 1 meat options
    And I select 1 fish options
    And I submit my vote
    Then I should see an error message containing "vegetarian"

  # ====================
  # Duplicate Prevention
  # ====================

  @duplicate-prevention
  Scenario: Same guest cannot vote twice
    Given "Alice" has already voted with:
      | category    | meal                |
      | meat        | Meatballs           |
      | fish        | Pasta               |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    When I try to vote again as "Alice" with:
      | category    | meal                |
      | meat        | Meatballs           |
      | fish        | Pasta               |
      | vegetarian  | Salad               |
      | vegetarian  | Curry               |
    Then I should see an error about duplicate voting
    And only one vote for "Alice" should exist

  @duplicate-prevention
  Scenario: Different guests can vote with different names
    When I complete a full vote as "FirstVoter" with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Fish and Chips      |
      | vegetarian  | Lasagna             |
      | vegetarian  | Stir Fry            |
    Then my vote should be recorded
    # Now vote as a different person
    When I refresh the page
    And I go to the "Guests" tab
    And I enter my name as "SecondVoter"
    And I select meat option "Meatballs"
    And I select fish option "Pasta"
    And I select vegetarian option "Salad"
    And I select vegetarian option "Curry"
    And I submit my vote
    Then my vote should be recorded

  # ====================
  # Selection Behavior
  # ====================

  @selection
  Scenario: Meat options use radio buttons (only one selectable)
    When I select meat option "Burger"
    Then I should have 1 meat options selected
    And the meat option "Burger" should be selected

  @selection
  Scenario: Fish options use radio buttons (only one selectable)
    When I select fish option "Pasta"
    Then I should have 1 fish options selected
    And the fish option "Pasta" should be selected

  @selection
  Scenario: Vegetarian options use checkboxes (multiple selectable)
    When I select vegetarian option "Vegetarian Burger"
    And I select vegetarian option "Pasta Primavera"
    Then I should have 2 vegetarian options selected

  @selection
  Scenario: Guest can change vegetarian selection before submitting
    When I select vegetarian option "Stir Fry"
    And I select vegetarian option "Lasagna"
    And I deselect vegetarian option "Lasagna"
    And I select vegetarian option "Curry"
    Then I should have 2 vegetarian options selected
    And the vegetarian option "Stir Fry" should be selected
    And the vegetarian option "Curry" should be selected

  # ====================
  # UI and Display
  # ====================

  @ui
  Scenario: Voting form displays available options
    Then I should see voting options for meat
    And I should see voting options for fish
    And I should see voting options for vegetarian
    And the "Submit Vote" button should be visible

  @ui
  Scenario: Guest sees helpful category instructions
    Then I should see "Select 1 Meat Option"
    And I should see "Select 1 Fish Option"
    And I should see "Select 2 Vegetarian Options"

  # ====================
  # Regression Tests (from BUGS.md)
  # ====================

  @regression @bug-fix
  Scenario: Selecting two valid vegetarian options works correctly
    # Regression test for: "Please select two different vegetarian options" error
    When I enter my name as "VeggieVoter"
    And I select vegetarian option "Lasagna"              
    And I select vegetarian option "Curry"
    And I select 1 meat options
    And I select 1 fish options
    And I submit my vote
    Then I should not see "Please select two different vegetarian options"
    And I should see "successfully"
