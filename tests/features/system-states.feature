# Feature: System States
# Tests for system state messages across different tabs based on database and options state.

@system-states
Feature: System State Messages
  As a user
  I want to see appropriate messages based on the system state
  So that I know what actions are available or needed

  # ====================
  # State 1: Empty Database
  # ====================

  @state @empty-database
  Scenario: Restaurant tab shows message when database is empty
    Given I am on the home page
    And I go to the "System Admin" tab
    And I reset the system
    When I go to the "Restaurant" tab
    Then I should see "Please upload a meal database first"

  @state @empty-database
  Scenario: Guest tab shows message when database is empty
    Given I am on the home page
    And I go to the "System Admin" tab
    And I reset the system
    When I go to the "Guests" tab
    Then I should see "Voting is not yet available. Please wait for restaurant to select options."

  # ====================
  # State 2: Database Loaded, No Options
  # ====================

  @state @no-options
  Scenario: Restaurant tab allows meal selection when database is loaded
    Given I am on the home page
    And I go to the "System Admin" tab
    And I reset the system
    And I upload the meal database
    When I go to the "Restaurant" tab
    Then meal options should be displayed

  @state @no-options
  Scenario: Guest tab shows waiting message when options not yet selected
    Given I am on the home page
    And I go to the "System Admin" tab
    And I reset the system
    And I upload the meal database
    When I go to the "Guests" tab
    Then I should see "Voting is not yet available. Please wait for restaurant to select options."

  # ====================
  # State 3: Options Selected (Voting Open)
  # ====================

  @state @voting-open
  Scenario: Guest tab shows voting form when options are selected
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
    When I go to the "Guests" tab
    Then I should see voting options for meat
    And I should see voting options for fish
    And I should see voting options for vegetarian
