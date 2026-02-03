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
    # Minimum required: 2 meat, 2 fish, 4 vegetarian
    When I select "Burger" as a meat option
    And I select "Meatballs" as a meat option
    And I select "Pasta" as a fish option
    And I select "Fish and Chips" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    And I select "Curry" as a vegetarian option
    And I select "Salad" as a vegetarian option
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
    # Minimum required: 2 meat, 2 fish, 4 vegetarian
    When I select "Burger" as a meat option
    And I select "Meatballs" as a meat option
    And I select "Pasta" as a fish option
    And I select "Fish and Chips" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    And I select "Curry" as a vegetarian option
    And I select "Salad" as a vegetarian option
    And I save the weekly options
    Then "Burger" should be selected
    And "Pasta" should be selected
    And "Risotto" should be selected

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
    # Minimum required: 2 meat, 2 fish, 4 vegetarian
    Given I select "Burger" as a meat option
    And I select "Meatballs" as a meat option
    And I select "Pasta" as a fish option
    And I select "Fish and Chips" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    And I select "Curry" as a vegetarian option
    And I select "Salad" as a vegetarian option
    And I save the weekly options
    When I refresh the page
    And I go to the "Restaurant" tab
    Then "Burger" should be selected
    And "Pasta" should be selected
    And "Risotto" should be selected

  # ====================
  # Vote Results
  # ====================

  @vote-results
  Scenario: Restaurant can view vote results
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
    And "TestVoter" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Curry               |
    When I go to the "Restaurant" tab
    And I click show vote results
    Then I should see vote charts

  # ====================
  # Vote Deletion on Save
  # ====================

  @vote-deletion
  Scenario: Saving weekly options deletes previous votes
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
    And "Voter1" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Curry               |
    When I go to the "Restaurant" tab
    And I select "Schnitzel" as a meat option
    And I select "Grilled Protein" as a meat option
    And I select "Grilled Fillet" as a fish option
    And I select "Baked Protein" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    And I select "Paella" as a vegetarian option
    And I select "Stuffed Vegetables" as a vegetarian option
    And I save the weekly options
    And I go to the "System Admin" tab
    Then the system status should show votes as "No votes"

  @vote-warning
  Scenario: Warning shown when saving options with existing votes
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
    And "Voter1" has already voted with:
      | category    | meal                |
      | meat        | Burger              |
      | fish        | Pasta               |
      | vegetarian  | Lasagna             |
      | vegetarian  | Curry               |
    When I go to the "Restaurant" tab
    And I select "Schnitzel" as a meat option
    And I select "Grilled Protein" as a meat option
    And I select "Grilled Fillet" as a fish option
    And I select "Baked Protein" as a fish option
    And I select "Risotto" as a vegetarian option
    And I select "Bowl" as a vegetarian option
    And I select "Paella" as a vegetarian option
    And I select "Stuffed Vegetables" as a vegetarian option
    And I try to save the weekly options
    Then I should see a warning about vote deletion
